import { onValue, push, ref, update } from 'firebase/database';
import type { DataSnapshot } from 'firebase/database';
import { database } from './firebase';
import type { AppUser } from './authService';

export interface MeetingSummary {
  title: string;
  createdAt: number;
}

export interface MeetingResponse {
  name: string;
  slots: Record<string, true>;
  updatedAt: number;
}

export interface Meeting {
  id: string;
  title: string;
  createdBy: string;
  createdAt: number;
  responses: Record<string, MeetingResponse>;
}

export interface UserDashboard {
  meetings: Record<string, MeetingSummary>;
  savedSlots: string[];
}

const reportDatabaseError = (error: Error, onError: (message: string) => void) => {
  console.error('Realtime Database subscription failed:', error);
  onError('Could not load your data. Check your connection and try again.');
};

const toMeeting = (id: string, snapshot: DataSnapshot): Meeting | null => {
  const value: Omit<Meeting, 'id'> | null = snapshot.val();
  return value ? { id, ...value, responses: value.responses ?? {} } : null;
};

export const createMeeting = async (title: string, user: AppUser): Promise<string> => {
  const meetingRef = push(ref(database, 'meetings'));
  if (!meetingRef.key) throw new Error('Unable to create a meeting link.');
  const createdAt = Date.now();
  await update(ref(database), {
    [`meetings/${meetingRef.key}`]: {
      title: title.trim(),
      createdBy: user.uid,
      createdAt,
      responses: {},
    } satisfies Omit<Meeting, 'id'>,
    [`users/${user.uid}/meetings/${meetingRef.key}`]: {
      title: title.trim(),
      createdAt,
    } satisfies MeetingSummary,
  });
  return meetingRef.key;
};

export const listenToMeeting = (
  meetingId: string,
  callback: (meeting: Meeting | null) => void,
  onError: (message: string) => void,
) => onValue(
  ref(database, `meetings/${meetingId}`),
  (snapshot) => callback(toMeeting(meetingId, snapshot)),
  (error) => reportDatabaseError(error, onError),
);

export const listenToUserDashboard = (
  uid: string,
  callback: (dashboard: UserDashboard) => void,
  onError: (message: string) => void,
) => onValue(
  ref(database, `users/${uid}`),
  (snapshot) => {
    const value = snapshot.val() as { meetings?: UserDashboard['meetings']; savedSlots?: string[] } | null;
    callback({ meetings: value?.meetings ?? {}, savedSlots: value?.savedSlots ?? [] });
  },
  (error) => reportDatabaseError(error, onError),
);

export const saveAvailability = async (
  meetingId: string,
  meetingSummary: MeetingSummary,
  user: AppUser,
  name: string,
  slots: string[],
): Promise<void> => {
  const savedAt = Date.now();
  const slotMap = Object.fromEntries(slots.map((slot) => [slot, true])) as Record<string, true>;
  await update(ref(database), {
    [`meetings/${meetingId}/responses/${user.uid}`]: {
      name,
      slots: slotMap,
      updatedAt: savedAt,
    } satisfies MeetingResponse,
    [`users/${user.uid}/email`]: user.email,
    [`users/${user.uid}/meetings/${meetingId}`]: meetingSummary,
    [`users/${user.uid}/savedSlots`]: slots,
    [`users/${user.uid}/savedAt`]: savedAt,
  });
};

export const saveUsualSchedule = async (user: AppUser, slots: string[]): Promise<void> => {
  await update(ref(database), {
    [`users/${user.uid}/email`]: user.email,
    [`users/${user.uid}/savedSlots`]: slots,
    [`users/${user.uid}/savedAt`]: Date.now(),
  });
};
