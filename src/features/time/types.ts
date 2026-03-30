export interface TimeEntryMetadata {
  clientId: string | null;
  clientName: string | null;
  label: string | null;
  billable: boolean;
}

export interface TrackingClient {
  id: string;
  userId: string;
  name: string;
  label: string;
  weeklyGoalHours: number;
  weeklyLimitHours: number | null;
  hourlyRate: number;
  billableDefault: boolean;
}

export interface TrackingClientInput {
  name: string;
  label?: string;
  weeklyGoalHours?: number;
  weeklyLimitHours?: number | null;
  hourlyRate?: number;
  billableDefault?: boolean;
}

export interface BusinessProfile {
  businessName: string;
  contactName: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  cityStatePostal: string;
  paymentTerms: string;
  currency: string;
  invoicePrefix: string;
}

export type WorkdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type CalendarConnectionStatus =
  | 'not_connected'
  | 'ready_for_backend'
  | 'connected'
  | 'sync_error';

export interface SchedulePreferences {
  targetDaysPerWeek: number;
  activeDays: WorkdayKey[];
  dailyMaxHours: number;
  preferredStartHour: number;
}

export interface CalendarConnection {
  status: CalendarConnectionStatus;
  provider: 'google';
  requestedScopes: string[];
  syncMode: 'read_only';
  calendarSelection: 'primary';
  showMeetingsInPlanner: boolean;
  includeTentativeEvents: boolean;
  requestedAt: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
  syncError: string | null;
}

export interface SyncedCalendarEvent {
  id: string;
  provider: 'google';
  googleEventId: string;
  title: string;
  status: string;
  isAllDay: boolean;
  startAt: string;
  endAt: string;
  location: string | null;
  htmlLink: string | null;
}

export const EMPTY_BUSINESS_PROFILE: BusinessProfile = {
  businessName: '',
  contactName: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  cityStatePostal: '',
  paymentTerms: 'Due on receipt',
  currency: 'USD',
  invoicePrefix: 'INV',
};

export const DEFAULT_SCHEDULE_PREFERENCES: SchedulePreferences = {
  targetDaysPerWeek: 4,
  activeDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  dailyMaxHours: 6,
  preferredStartHour: 9,
};

export const DEFAULT_CALENDAR_CONNECTION: CalendarConnection = {
  status: 'not_connected',
  provider: 'google',
  requestedScopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  syncMode: 'read_only',
  calendarSelection: 'primary',
  showMeetingsInPlanner: true,
  includeTentativeEvents: true,
  requestedAt: null,
  connectedAt: null,
  lastSyncAt: null,
  syncError: null,
};
