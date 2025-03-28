import cookies from 'browser-cookies';
import envData from '../../../config/env.json';
import { FlashMessageArg } from '../components/Flash/redux';

import type {
  ChallengeFile,
  ClaimedCertifications,
  CompletedChallenge,
  User
} from '../redux/prop-types';

// Configuration
const { apiLocation } = envData;
const API_BASE = apiLocation;
const DEFAULT_OPTIONS: RequestInit = { credentials: 'include' };

// Utility Functions
const getCSRFToken = (): string => {
  const token = typeof window !== 'undefined' ? cookies.get('csrf_token') : null;
  return token ?? '';
};

const createRequestOptions = (
  method: 'POST' | 'PUT' | 'DELETE',
  body: unknown
): RequestInit => ({
  ...DEFAULT_OPTIONS,
  method,
  headers: {
    'CSRF-Token': getCSRFToken(),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});

// Core HTTP Methods
const fetchData = async <T>(path: string): Promise<T> => {
  return fetch(`${API_BASE}${path}`, DEFAULT_OPTIONS).then(res => res.json());
};

const sendData = async <T>(
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  body: unknown
): Promise<T> => {
  const options = createRequestOptions(method, body);
  return fetch(`${API_BASE}${path}`, options).then(res => res.json());
};

// Simplified HTTP Method Wrappers
export const get = fetchData;
export const post = <T = void>(path: string, body: unknown): Promise<T> => sendData('POST', path, body);
export const put = <T = void>(path: string, body: unknown): Promise<T> => sendData('PUT', path, body);
export const deleteRequest = <T = void>(path: string, body: unknown): Promise<T> => sendData('DELETE', path, body);

// Type Definitions
interface SessionUser {
  user?: { [username: string]: User };
  sessionMeta: { activeDonations: number };
}

type ChallengeFilesForFiles = {
  files: Array<Omit<ChallengeFile, 'fileKey'> & { key: string }>;
} & Omit<CompletedChallenge, 'challengeFiles'>;

type ApiSessionResponse = Omit<SessionUser, 'user'>;
type ApiUser = {
  user: {
    [username: string]: Omit<User, 'completedChallenges'> & {
      completedChallenges?: ChallengeFilesForFiles[];
    };
  };
  result?: string;
};

type UserResponse = {
  user: { [username: string]: User } | Record<string, never>;
  result: string | undefined;
};

// Response Parsing
const parseApiResponseToClientUser = (data: ApiUser): UserResponse => {
  const userData = data.user?.[data?.result ?? ''];
  const completedChallenges = userData?.completedChallenges?.reduce(
    (acc: CompletedChallenge[], curr: ChallengeFilesForFiles) => [
      ...acc,
      {
        ...curr,
        challengeFiles: curr.files.map(({ key: fileKey, ...file }) => ({
          ...file,
          fileKey
        }))
      }
    ],
    []
  ) ?? [];

  return {
    user: { [data.result ?? '']: { ...userData, completedChallenges } },
    result: data.result
  };
};

// API Methods
export const getSessionUser = async (): Promise<SessionUser> => {
  const data = await get<ApiUser & ApiSessionResponse>('/user/get-session-user');
  const { result, user } = parseApiResponseToClientUser(data);
  
  return {
    sessionMeta: data.sessionMeta,
    result,
    user
  };
};

export const getUserProfile = async (username: string): Promise<{
  entities: Omit<UserResponse, 'result'>;
  result: string | undefined;
}> => {
  const data = await get<{ entities?: ApiUser; result?: string }>(
    `/api/users/get-public-profile?username=${username}`
  );
  
  const { result, user } = parseApiResponseToClientUser({
    user: data.entities?.user ?? {},
    result: data.result
  });

  return {
    entities: { user },
    result
  };
};

export const getShowCert = (username: string, certSlug: string): Promise<{
  certTitle: string;
  username: string;
  date: Date;
  completionTime: string;
}> => get(`/certificate/showCert/${username}/${certSlug}`);

export const getUsernameExists = (username: string): Promise<boolean> =>
  get(`/api/users/exists?username=${username}`);

export const getVerifyCanClaimCert = (
  username: string,
  certification: string
): Promise<{
    response: {
      type: string;
      message: { status: boolean; result: string };
      variables: { name: string };
    };
    isCertMap: ClaimedCertifications;
    completedChallenges: CompletedChallenge[];
    message?: FlashMessageArg;
  }> => get(`/certificate/verify-can-claim-cert?username=${username}&superBlock=${certification}`);

// Donation Related
export const addDonation = (body: {
  email: string;
  amount: number;
  duration: string;
  provider: string;
  subscriptionId: string;
  customerId: string;
  startDate: Date;
}): Promise<void> => post('/donate/add-donation', body);

export const postChargeStripe = (body: {
  email: string;
  amount: number;
  duration: string;
  provider: string;
  subscriptionId: string;
  customerId: string;
  startDate: Date;
}): Promise<void> => post('/donate/charge-stripe', body);

export const postChargeStripeCard = (body: {
  email: string;
  amount: number;
  duration: string;
  provider: string;
  subscriptionId: string;
  customerId: string;
  startDate: Date;
}): Promise<void> => post('/donate/charge-stripe-card', body);

// User Actions
export const postReportUser = (body: {
  username: string;
  reportDescription: string;
}): Promise<void> => post('/user/report-user', body);

export const postDeleteAccount = (): Promise<void> => post('/account/delete', {});
export const postResetProgress = (): Promise<void> => post('/account/reset-progress', {});
export const postWebhookToken = (): Promise<void> => post('/user/webhook-token', {});

// Update Actions
export const putUpdateMyAbout = (values: {
  name: string;
  location: string;
  about: string;
  picture: string;
}): Promise<void> => put('/update-my-about', { ...values });

export const putUpdateMyUsername = (username: string): Promise<void> =>
  put('/update-my-username', { username });

export const putUpdateMyProfileUI = (profileUI: User['profileUI']): Promise<void> =>
  put('/update-my-profileui', { profileUI });

export const putUpdateUserFlag = (update: Record<string, string>): Promise<void> =>
  put('/update-user-flag', update);

export const putUserAcceptsTerms = (quincyEmails: boolean): Promise<void> =>
  put('/update-privacy-terms', { quincyEmails });

export const putUserUpdateEmail = (email: string): Promise<void> =>
  put('/update-my-email', { email });

export const putVerifyCert = (certSlug: string): Promise<void> =>
  put('/certificate/verify', { certSlug });

// Delete Actions
export const deleteWebhookToken = (): Promise<void> => deleteRequest('/user/webhook-token', {});