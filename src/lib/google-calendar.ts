import { createHash, randomBytes } from 'node:crypto';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb, hasFirebaseAdminConfig } from './firebase-admin';

const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const CALENDAR_CONNECTIONS_COLLECTION = 'calendarConnections';
const CALENDAR_SECRETS_COLLECTION = 'calendarConnectionSecrets';
const CALENDAR_EVENTS_SUBCOLLECTION = 'events';

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleCalendarEvent = {
  id?: string;
  status?: string;
  summary?: string;
  htmlLink?: string;
  location?: string;
  updated?: string;
  start?: {
    date?: string;
    dateTime?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
  };
};

type GoogleCalendarEventsResponse = {
  items?: GoogleCalendarEvent[];
  nextPageToken?: string;
  nextSyncToken?: string;
  error?: {
    code?: number;
    message?: string;
  };
};

type CalendarSecretRecord = {
  refreshToken: string;
  nextSyncToken: string | null;
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  calendarId: string;
  grantedScope: string | null;
};

export type CalendarSyncResult = {
  importedCount: number;
  deletedCount: number;
  nextSyncToken: string | null;
};

export type GoogleCalendarFeatureState = {
  enabled: boolean;
  reason: string | null;
};

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getGoogleCalendarClientId() {
  return requireEnv(
    'PUBLIC_GOOGLE_CALENDAR_CLIENT_ID',
    import.meta.env.PUBLIC_GOOGLE_CALENDAR_CLIENT_ID || import.meta.env.GOOGLE_CALENDAR_CLIENT_ID,
  );
}

function getGoogleCalendarClientSecret() {
  return requireEnv('GOOGLE_CALENDAR_CLIENT_SECRET', import.meta.env.GOOGLE_CALENDAR_CLIENT_SECRET);
}

export function getGoogleCalendarFeatureState(): GoogleCalendarFeatureState {
  const clientId =
    import.meta.env.PUBLIC_GOOGLE_CALENDAR_CLIENT_ID || import.meta.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = import.meta.env.GOOGLE_CALENDAR_CLIENT_SECRET;

  if (!clientId) {
    return {
      enabled: false,
      reason: 'Google Calendar sync is disabled until PUBLIC_GOOGLE_CALENDAR_CLIENT_ID is set.',
    };
  }

  if (!clientSecret) {
    return {
      enabled: false,
      reason: 'Google Calendar sync is disabled until GOOGLE_CALENDAR_CLIENT_SECRET is set.',
    };
  }

  if (!hasFirebaseAdminConfig()) {
    return {
      enabled: false,
      reason:
        'Google Calendar sync is disabled until FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY are set.',
    };
  }

  return {
    enabled: true,
    reason: null,
  };
}

function assertGoogleCalendarEnabled() {
  const featureState = getGoogleCalendarFeatureState();

  if (!featureState.enabled) {
    throw new Error(featureState.reason || 'Google Calendar sync is disabled.');
  }
}

export function getGoogleCalendarRedirectUri(request: Request) {
  if (import.meta.env.GOOGLE_CALENDAR_REDIRECT_URI) {
    return import.meta.env.GOOGLE_CALENDAR_REDIRECT_URI;
  }

  const url = new URL(request.url);
  return `${url.origin}/api/google-calendar/callback`;
}

function toBase64Url(input: Buffer) {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function createOAuthState() {
  return toBase64Url(randomBytes(24));
}

export function createCodeVerifier() {
  return toBase64Url(randomBytes(48));
}

export function createCodeChallenge(codeVerifier: string) {
  return createHash('sha256').update(codeVerifier).digest('base64url');
}

export function createGoogleCalendarAuthUrl({
  request,
  state,
  codeChallenge,
}: {
  request: Request;
  state: string;
  codeChallenge: string;
}) {
  assertGoogleCalendarEnabled();

  const params = new URLSearchParams({
    client_id: getGoogleCalendarClientId(),
    redirect_uri: getGoogleCalendarRedirectUri(request),
    response_type: 'code',
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent',
    scope: GOOGLE_CALENDAR_SCOPE,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeToken(params: URLSearchParams) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const payload = (await response.json()) as GoogleTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || 'Google token exchange failed.');
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    grantedScope: payload.scope ?? null,
    expiresInSeconds: payload.expires_in ?? 3600,
  };
}

export async function exchangeAuthorizationCode({
  code,
  codeVerifier,
  request,
}: {
  code: string;
  codeVerifier: string;
  request: Request;
}) {
  assertGoogleCalendarEnabled();

  return exchangeToken(
    new URLSearchParams({
      client_id: getGoogleCalendarClientId(),
      client_secret: getGoogleCalendarClientSecret(),
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: getGoogleCalendarRedirectUri(request),
    }),
  );
}

async function refreshAccessToken({
  refreshToken,
  request,
}: {
  refreshToken: string;
  request: Request;
}) {
  assertGoogleCalendarEnabled();

  return exchangeToken(
    new URLSearchParams({
      client_id: getGoogleCalendarClientId(),
      client_secret: getGoogleCalendarClientSecret(),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      redirect_uri: getGoogleCalendarRedirectUri(request),
    }),
  );
}

async function getConnectionDoc(userId: string) {
  return getAdminDb().collection(CALENDAR_CONNECTIONS_COLLECTION).doc(userId).get();
}

async function getSecretDoc(userId: string) {
  return getAdminDb().collection(CALENDAR_SECRETS_COLLECTION).doc(userId).get();
}

export async function verifyRequestUser(request: Request) {
  assertGoogleCalendarEnabled();

  const authorization = request.headers.get('authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new Error('Missing Firebase authorization token.');
  }

  const idToken = authorization.slice('Bearer '.length).trim();

  if (!idToken) {
    throw new Error('Missing Firebase authorization token.');
  }

  return getAdminAuth().verifyIdToken(idToken);
}

function normalizeEventDate(value?: { date?: string; dateTime?: string }) {
  if (!value) {
    return null;
  }

  const raw = value.dateTime || value.date;

  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function eventShouldBeSkipped(event: GoogleCalendarEvent, includeTentativeEvents: boolean) {
  if (!event.id) {
    return true;
  }

  if (event.status === 'cancelled') {
    return true;
  }

  if (!includeTentativeEvents && event.status === 'tentative') {
    return true;
  }

  return false;
}

async function clearCalendarEvents(userId: string) {
  const eventsCollection = getAdminDb()
    .collection(CALENDAR_CONNECTIONS_COLLECTION)
    .doc(userId)
    .collection(CALENDAR_EVENTS_SUBCOLLECTION);

  while (true) {
    const snapshot = await eventsCollection.limit(250).get();

    if (snapshot.empty) {
      return;
    }

    const batch = getAdminDb().batch();
    snapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });
    await batch.commit();
  }
}

async function fetchGoogleCalendarEvents({
  accessToken,
  nextSyncToken,
}: {
  accessToken: string;
  nextSyncToken: string | null;
}) {
  let pageToken: string | null = null;
  let latestSyncToken: string | null = null;
  const items: GoogleCalendarEvent[] = [];

  do {
    const params = new URLSearchParams({
      maxResults: '250',
      showDeleted: 'true',
      singleEvents: 'true',
    });

    if (nextSyncToken) {
      params.set('syncToken', nextSyncToken);
    }

    if (pageToken) {
      params.set('pageToken', pageToken);
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const payload = (await response.json()) as GoogleCalendarEventsResponse;

    if (!response.ok) {
      const code = payload.error?.code || response.status;
      const message = payload.error?.message || 'Google Calendar sync failed.';
      const error = new Error(message) as Error & { statusCode?: number };
      error.statusCode = code;
      throw error;
    }

    items.push(...(payload.items || []));
    pageToken = payload.nextPageToken || null;
    latestSyncToken = payload.nextSyncToken || latestSyncToken;
  } while (pageToken);

  return {
    items,
    nextSyncToken: latestSyncToken,
  };
}

async function applyEvents({
  userId,
  events,
  includeTentativeEvents,
}: {
  userId: string;
  events: GoogleCalendarEvent[];
  includeTentativeEvents: boolean;
}) {
  let importedCount = 0;
  let deletedCount = 0;

  for (let index = 0; index < events.length; index += 200) {
    const batch = getAdminDb().batch();
    const slice = events.slice(index, index + 200);

    slice.forEach((event) => {
      const eventId = event.id;

      if (!eventId) {
        return;
      }

      const eventRef = getAdminDb()
        .collection(CALENDAR_CONNECTIONS_COLLECTION)
        .doc(userId)
        .collection(CALENDAR_EVENTS_SUBCOLLECTION)
        .doc(eventId);

      if (eventShouldBeSkipped(event, includeTentativeEvents)) {
        batch.delete(eventRef);
        deletedCount += 1;
        return;
      }

      const startAt = normalizeEventDate(event.start);
      const endAt = normalizeEventDate(event.end);

      if (!startAt || !endAt) {
        return;
      }

      batch.set(
        eventRef,
        {
          provider: 'google',
          googleEventId: eventId,
          title: event.summary || 'Untitled meeting',
          status: event.status || 'confirmed',
          isAllDay: Boolean(event.start?.date && !event.start?.dateTime),
          startAt: Timestamp.fromDate(startAt),
          endAt: Timestamp.fromDate(endAt),
          location: event.location || null,
          htmlLink: event.htmlLink || null,
          sourceUpdatedAt: event.updated ? Timestamp.fromDate(new Date(event.updated)) : null,
          syncedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );

      importedCount += 1;
    });

    await batch.commit();
  }

  return {
    importedCount,
    deletedCount,
  };
}

async function setConnectionStatus(userId: string, values: Record<string, unknown>) {
  await getAdminDb()
    .collection(CALENDAR_CONNECTIONS_COLLECTION)
    .doc(userId)
    .set(
      {
        provider: 'google',
        syncMode: 'read_only',
        calendarSelection: 'primary',
        updatedAt: FieldValue.serverTimestamp(),
        ...values,
      },
      { merge: true },
    );
}

export async function storeCalendarTokens({
  userId,
  refreshToken,
  accessToken,
  grantedScope,
  expiresInSeconds,
}: {
  userId: string;
  refreshToken: string | null;
  accessToken: string;
  grantedScope: string | null;
  expiresInSeconds: number;
}) {
  assertGoogleCalendarEnabled();

  const existingSecret = await getSecretDoc(userId);
  const existingData = existingSecret.data() as Partial<CalendarSecretRecord> | undefined;
  const resolvedRefreshToken = refreshToken || existingData?.refreshToken;

  if (!resolvedRefreshToken) {
    throw new Error('Google did not return a refresh token. Try reconnecting and approve offline access.');
  }

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  await getAdminDb()
    .collection(CALENDAR_SECRETS_COLLECTION)
    .doc(userId)
    .set(
      {
        refreshToken: resolvedRefreshToken,
        accessToken,
        accessTokenExpiresAt: Timestamp.fromDate(expiresAt),
        nextSyncToken: existingData?.nextSyncToken || null,
        calendarId: 'primary',
        grantedScope,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  await setConnectionStatus(userId, {
    status: 'connected',
    connectedAt: FieldValue.serverTimestamp(),
    syncError: null,
  });
}

export async function syncGoogleCalendarForUser({
  userId,
  request,
}: {
  userId: string;
  request: Request;
}): Promise<CalendarSyncResult> {
  assertGoogleCalendarEnabled();

  const connectionSnapshot = await getConnectionDoc(userId);
  const connection =
    (connectionSnapshot.data() as
      | {
          includeTentativeEvents?: boolean;
        }
      | undefined) || {};
  const includeTentativeEvents = connection.includeTentativeEvents !== false;

  const secretSnapshot = await getSecretDoc(userId);
  const secret = secretSnapshot.data() as Partial<CalendarSecretRecord> | undefined;

  if (!secret?.refreshToken) {
    throw new Error('Google Calendar is not connected for this account yet.');
  }

  try {
    const refreshedToken = await refreshAccessToken({
      refreshToken: secret.refreshToken,
      request,
    });

    const syncPayload = await fetchGoogleCalendarEvents({
      accessToken: refreshedToken.accessToken,
      nextSyncToken: secret.nextSyncToken || null,
    });

    const applied = await applyEvents({
      userId,
      events: syncPayload.items,
      includeTentativeEvents,
    });

    const expiresAt = new Date(Date.now() + refreshedToken.expiresInSeconds * 1000);

    await adminDb
      .collection(CALENDAR_SECRETS_COLLECTION)
      .doc(userId)
      .set(
        {
          refreshToken: secret.refreshToken,
          accessToken: refreshedToken.accessToken,
          accessTokenExpiresAt: Timestamp.fromDate(expiresAt),
          nextSyncToken: syncPayload.nextSyncToken || secret.nextSyncToken || null,
          calendarId: 'primary',
          grantedScope: refreshedToken.grantedScope,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    await setConnectionStatus(userId, {
      status: 'connected',
      lastSyncAt: FieldValue.serverTimestamp(),
      syncError: null,
    });

    return {
      importedCount: applied.importedCount,
      deletedCount: applied.deletedCount,
      nextSyncToken: syncPayload.nextSyncToken || secret.nextSyncToken || null,
    };
  } catch (error) {
    const statusCode =
      typeof error === 'object' && error && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode)
        : null;

    if (statusCode === 410) {
      await clearCalendarEvents(userId);

      await getAdminDb()
        .collection(CALENDAR_SECRETS_COLLECTION)
        .doc(userId)
        .set(
          {
            nextSyncToken: null,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

      return syncGoogleCalendarForUser({
        userId,
        request,
      });
    }

    const message = error instanceof Error ? error.message : 'Calendar sync failed.';

    await setConnectionStatus(userId, {
      status: 'sync_error',
      syncError: message,
    });

    throw error;
  }
}

export async function disconnectGoogleCalendarForUser(userId: string) {
  assertGoogleCalendarEnabled();

  await clearCalendarEvents(userId);
  await getAdminDb().collection(CALENDAR_SECRETS_COLLECTION).doc(userId).delete();

  await getAdminDb()
    .collection(CALENDAR_CONNECTIONS_COLLECTION)
    .doc(userId)
    .set(
      {
        provider: 'google',
        status: 'not_connected',
        requestedScopes: [GOOGLE_CALENDAR_SCOPE],
        syncMode: 'read_only',
        calendarSelection: 'primary',
        requestedAt: null,
        connectedAt: null,
        lastSyncAt: null,
        syncError: null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export function buildErrorRedirectUrl(request: Request, message: string) {
  const url = new URL(request.url);
  url.pathname = '/';
  url.search = '';
  url.searchParams.set('calendar', 'error');
  url.searchParams.set('calendar_message', message);
  return url.toString();
}

export function buildSuccessRedirectUrl(request: Request) {
  const url = new URL(request.url);
  url.pathname = '/';
  url.search = '';
  url.searchParams.set('calendar', 'connected');
  return url.toString();
}

export async function setCalendarError(userId: string, message: string) {
  await setConnectionStatus(userId, {
    status: 'sync_error',
    syncError: message,
  });
}

export async function verifyUserFromIdToken(request: Request): Promise<DecodedIdToken> {
  return verifyRequestUser(request);
}
