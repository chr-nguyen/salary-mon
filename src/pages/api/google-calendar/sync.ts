import type { APIRoute } from 'astro';
import {
  getGoogleCalendarFeatureState,
  syncGoogleCalendarForUser,
  verifyUserFromIdToken,
} from '../../../lib/google-calendar';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
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
    const result = await syncGoogleCalendarForUser({
      userId: decodedToken.uid,
      request,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sync Google Calendar.';

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
