import cookies from 'browser-cookies';
import envData from '../../../config/env.json';
import { FlashMessageArg } from '../components/Flash/redux';

import type {
  ChallengeFile,
  ClaimedCertifications,
  CompletedChallenge,
  User
} from '../redux/prop-types';

const { apiLocation } = envData;
const base = apiLocation;

const defaultOptions: RequestInit = {
  credentials: 'include'
};

function getCSRFToken() {
  return typeof window !== 'undefined' ? cookies.get('csrf_token') ?? '' : '';
}

async function get<T>(path: string): Promise<T> {
  return fetch(`${base}${path}`, defaultOptions).then(res => res.json());
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
  return fetch(`${base}${path}`, options).then(res => res.json());
}

export function post<T = void>(path: string, body: unknown): Promise<T> {
  return request('POST', path, body);
}

function put<T = void>(path: string, body: unknown): Promise<T> {
  return request('PUT', path, body);
}

function deleteRequest<T = void>(path: string, body: unknown): Promise<T> {
  return request('DELETE', path, body);
}

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
  user string]: User } | Record<string, never>;
  result: string | undefined;
};

function parseApiResponseToClientUser(data: ApiUser): UserResponse {
  const userData = data.user?.[data.result ?? ''];
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
}

export function getSessionUser(): Promise<SessionUser> {
  return get<ApiUser & ApiSessionResponse>('/user/get-session-user').then(
    data => {
      const { result, user } = parseApiResponseToClientUser(data);
      return {
        sessionMeta: data.sessionMeta,
        result,
        user
      };
    }
  );
}

type UserProfileResponse = {
  entities: Omit<UserResponse, 'result'>;
  result: string | undefined;
};

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

interface Cert {
  certTitle: string;
  username: string;
  date: Date;
  completionTime: string;
}

export function getShowCert(username: string, certSlug: string): Promise<Cert> {
  return get(`/certificate/showCert/${username}/${certSlug}`);
}

export function getUsernameExists(username: string): Promise<boolean> {
  return get(`/api/users/exists?username=${username}`);
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

export function getVerifyCanClaimCert(
  username: string,
  certification: string
): Promise<GetVerifyCanClaimCert> {
  return get(
    `/certificate/verify-can-claim-cert?username=${username}&superBlock=${certification}`
  );
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

export function addDonation(body: Donation): Promise<void> {
  return post('/donate/add-donation', body);
}

export function postChargeStripe(body: Donation): Promise<void> {
  return post('/donate/charge-stripe', body);
}

export function postChargeStripeCard(body: Donation): Promise<void> {
  return post('/donate/charge-stripe-card', body);
}

interface Report {
  username: string;
  reportDescription: string;
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

interface MyAbout {
  name: string;
  location: string;
  about: string;
  picture: string;
}

export function putUpdateMyAbout(values: MyAbout): Promise<void> {
  return put('/update-my-about', values);
}

export function putUpdateMyUsername(username: string): Promise<void> {
  return put('/update-my-username', { username });
}

export function putUpdateMyProfileUI(
  profileUI: User['profileUI']
): Promise<void> {
  return put('/update-my-profileui', { profileUI });
}

export function putUpdateUserFlag(
  update: Record<string, string>
): Promise<void> {
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

export function deleteWebhookToken(): Promise<void> {
  return deleteRequest('/user/webhook-token', {});
}