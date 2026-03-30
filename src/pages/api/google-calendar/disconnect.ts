import type { APIRoute } from 'astro';
import {
  disconnectGoogleCalendarForUser,
  getGoogleCalendarFeatureState,
  verifyUserFromIdToken,
} from '../../../lib/google-calendar';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const featureState = getGoogleCalendarFeatureState();

    if (!featureState.enabled) {
      return new Response(
        JSON.stringify({
          ok: true,
          skipped: true,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const decodedToken = await verifyUserFromIdToken(request);
    await disconnectGoogleCalendarForUser(decodedToken.uid);

    return new Response(
      JSON.stringify({
        ok: true,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to disconnect Google Calendar.';

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
