import type { APIContext, APIRoute } from 'astro';
import {
  buildErrorRedirectUrl,
  buildSuccessRedirectUrl,
  exchangeAuthorizationCode,
  getGoogleCalendarFeatureState,
  setCalendarError,
  storeCalendarTokens,
  syncGoogleCalendarForUser,
} from '../../../lib/google-calendar';

export const prerender = false;

function clearCookies(cookies: APIContext['cookies']) {
  cookies.delete('gc_oauth_state', { path: '/' });
  cookies.delete('gc_oauth_verifier', { path: '/' });
  cookies.delete('gc_oauth_uid', { path: '/' });
}

export const GET: APIRoute = async ({ cookies, redirect, request, url }) => {
  const featureState = getGoogleCalendarFeatureState();
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');
  const googleError = url.searchParams.get('error');
  const storedState = cookies.get('gc_oauth_state')?.value;
  const codeVerifier = cookies.get('gc_oauth_verifier')?.value;
  const userId = cookies.get('gc_oauth_uid')?.value;

  if (!featureState.enabled) {
    clearCookies(cookies);
    return redirect(
      buildErrorRedirectUrl(
        request,
        featureState.reason || 'Google Calendar sync is disabled for this environment.',
      ),
    );
  }

  if (googleError) {
    clearCookies(cookies);

    if (userId) {
      await setCalendarError(userId, googleError);
    }

    return redirect(buildErrorRedirectUrl(request, 'Google Calendar access was cancelled.'));
  }

  if (!state || !storedState || state !== storedState || !code || !codeVerifier || !userId) {
    clearCookies(cookies);

    if (userId) {
      await setCalendarError(userId, 'The Google Calendar connection state expired.');
    }

    return redirect(buildErrorRedirectUrl(request, 'The calendar connection expired. Please try again.'));
  }

  try {
    const tokenPayload = await exchangeAuthorizationCode({
      code,
      codeVerifier,
      request,
    });

    await storeCalendarTokens({
      userId,
      refreshToken: tokenPayload.refreshToken,
      accessToken: tokenPayload.accessToken,
      grantedScope: tokenPayload.grantedScope,
      expiresInSeconds: tokenPayload.expiresInSeconds,
    });

    await syncGoogleCalendarForUser({
      userId,
      request,
    });

    clearCookies(cookies);
    return redirect(buildSuccessRedirectUrl(request));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to connect Google Calendar.';
    clearCookies(cookies);
    await setCalendarError(userId, message);
    return redirect(buildErrorRedirectUrl(request, message));
  }
};
