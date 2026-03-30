import type { APIRoute } from 'astro';
import {
  createCodeChallenge,
  createCodeVerifier,
  createGoogleCalendarAuthUrl,
  createOAuthState,
  getGoogleCalendarFeatureState,
  verifyUserFromIdToken,
} from '../../../lib/google-calendar';

export const prerender = false;

function useSecureCookie(request: Request) {
  return new URL(request.url).protocol === 'https:';
}

export const GET: APIRoute = async ({ cookies, request }) => {
  try {
    const featureState = getGoogleCalendarFeatureState();

    if (!featureState.enabled) {
      return new Response(
        JSON.stringify({
          error: featureState.reason,
          unavailable: true,
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const decodedToken = await verifyUserFromIdToken(request);
    const state = createOAuthState();
    const codeVerifier = createCodeVerifier();
    const authUrl = createGoogleCalendarAuthUrl({
      request,
      state,
      codeChallenge: createCodeChallenge(codeVerifier),
    });
    const secure = useSecureCookie(request);

    cookies.set('gc_oauth_state', state, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: 60 * 10,
    });
    cookies.set('gc_oauth_verifier', codeVerifier, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: 60 * 10,
    });
    cookies.set('gc_oauth_uid', decodedToken.uid, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: 60 * 10,
    });

    return new Response(
      JSON.stringify({
        authUrl,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start Google Calendar OAuth.';

    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
};
