import cookies from 'browser-cookies';
import envData from '../../../config/env.json';
import { FlashMessageArg } from '../components/Flash/redux';
import type {
  ChallengeFile,
  ClaimedCertifications,
  CompletedChallenge,
  User
} from '../redux/prop-types';

// ===== Constants & Defaults =====
const { apiLocation: base } = envData;
const defaultOptions: RequestInit = {
  credentials: 'include'
};

// ===== CSRF Token Helper =====
function getCSRFToken(): string {
  return typeof window !== 'undefined' ? cookies.get('csrf_token') ?? '' : '';
}

// ===== HTTP Request Helpers =====
async function get<T>(path: string): Promise<T> {
  return fetch(`${base}${path}`, defaultOptions).then<T>(res => res.json());
}

function post<T = void>(path: string, body: unknown): Promise<T> {
  return request('POST', path, body);
}

function put<T = void>(path: string, body: unknown): Promise<T> {
  return request('PUT', path, body);
}

function deleteRequest<T = void>(path: string, body: unknown): Promise<T> {
  return request('DELETE', path, body);
}

async function request<T>(
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  body: unknown
): Promise<T> {
  const options: RequestInit = {
    ...defaultOptions,
    method,
    headers: {
      'CSRF-Token': getCSRFToken(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
  return fetch(`${base}${path}`, options).then<T>(res => res.json());
}

// ===== Type Definitions =====
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

type UserProfileResponse = {
  entities: Omit<UserResponse, 'result'>;
  result: string | undefined;
};

interface Cert {
  certTitle: string;
  username: string;
  date: Date;
  completionTime: string;
}

export interface GetVerifyCanClaimCert {
  response: {
    type: string;
    message: {
      status: boolean;
      result: string;
    };
    variables: {
      name: string;
    };
  };
  isCertMap: ClaimedCertifications;
  completedChallenges: CompletedChallenge[];
  message?: FlashMessageArg;
}

interface Donation {
  email: string;
  amount: number;
  duration: string;
  provider: string;
  subscriptionId: string;
  customerId: string;
  startDate: Date;
}

interface Report {
  username: string;
  reportDescription: string;
}

interface MyAbout {
  name: string;
  location: string;
  about: string;
  picture: string;
}

// ===== API Data Transformation =====
function parseApiResponseToClientUser(data: ApiUser): UserResponse {
  const userData = data.user?.[data.result ?? ''];
  const completedChallenges: CompletedChallenge[] =
    userData?.completedChallenges?.map(challenge => ({
      ...challenge,
      challengeFiles: challenge.files.map(({ key: fileKey, ...file }) => ({
        ...file,
        fileKey
      }))
    })) ?? [];

  return {
    user: userData ? { [data.result ?? '']: { ...userData, completedChallenges } } : {},
    result: data.result
  };
}

// ===== GET Requests =====
export function getSessionUser(): Promise<SessionUser> {
  return get<ApiUser & ApiSessionResponse>('/user/get-session-user').then(data => {
    const { result, user } = parseApiResponseToClientUser(data);
    return {
      sessionMeta: data.sessionMeta,
      result,
      user
    };
  });
}

export function getUserProfile(username: string): Promise<UserProfileResponse> {
  return get<{ entities?: ApiUser; result?: string }>(
    `/api/users/get-public-profile?username=${username}`
  ).then(data => {
    const { result, user } = parseApiResponseToClientUser({
      user: data.entities?.user ?? {},
      result: data.result
    });
    return {
      entities: { user },
      result
    };
  });
}

export function getShowCert(username: string, certSlug: string): Promise<Cert> {
  return get(`/certificate/showCert/${username}/${certSlug}`);
}

export function getUsernameExists(username: string): Promise<boolean> {
  return get(`/api/users/exists?username=${username}`);
}

export function getVerifyCanClaimCert(
  username: string,
  certification: string
): Promise<GetVerifyCanClaimCert> {
  return get(
    `/certificate/verify-can-claim-cert?username=${username}&superBlock=${certification}`
  );
}

// ===== POST Requests =====
export function addDonation(body: Donation): Promise<void> {
  return post('/donate/add-donation', body);
}

export function postChargeStripe(body: Donation): Promise<void> {
  return post('/donate/charge-stripe', body);
}

export function postChargeStripeCard(body: Donation): Promise<void> {
  return post('/donate/charge-stripe-card', body);
}

export function postReportUser(body: Report): Promise<void> {
  return post('/user/report-user', body);
}

export function postDeleteAccount(): Promise<void> {
  return post('/account/delete', {});
}

export function postResetProgress(): Promise<void> {
  return post('/account/reset-progress', {});
}

export function postWebhookToken(): Promise<void> {
  return post('/user/webhook-token', {});
}

// ===== PUT Requests =====
export function putUpdateMyAbout(values: MyAbout): Promise<void> {
  return put('/update-my-about', values);
}

export function putUpdateMyUsername(username: string): Promise<void> {
  return put('/update-my-username', { username });
}

export function putUpdateMyProfileUI(profileUI: User['profileUI']): Promise<void> {
  return put('/update-my-profileui', { profileUI });
}

export function putUpdateUserFlag(update: Record<string, string>): Promise<void> {
  return put('/update-user-flag', update);
}

export function putUserAcceptsTerms(quincyEmails: boolean): Promise<void> {
  return put('/update-privacy-terms', { quincyEmails });
}

export function putUserUpdateEmail(email: string): Promise<void> {
  return put('/update-my-email', { email });
}

export function putVerifyCert(certSlug: string): Promise<void> {
  return put('/certificate/verify', { certSlug });
}

// ===== DELETE Requests =====
export function deleteWebhookToken(): Promise<void> {
  return deleteRequest('/user/webhook-token', {});
}
