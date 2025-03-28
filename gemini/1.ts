import cookies from 'browser-cookies';
import envData from '../../../config/env.json';
import { FlashMessageArg } from '../components/Flash/redux';
import type {
  ChallengeFile,
  ClaimedCertifications,
  CompletedChallenge,
  User,
} from '../redux/prop-types';

const { apiLocation } = envData;
const base = apiLocation;
const defaultOptions: RequestInit = {
  credentials: 'include',
};

// csrf_token is passed to the client as a cookie. The client must send
// this back as a header.
const getCSRFToken = (): string => typeof window !== 'undefined' ? cookies.get('csrf_token') ?? '' : '';

const handleResponse = async <T>(response: Response): Promise<T> => response.json();

const request = async <T>(
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  body: unknown,
): Promise<T> => {
  const options: RequestInit = {
    ...defaultOptions,
    method,
    headers: {
      'CSRF-Token': getCSRFToken(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
  const response = await fetch(`${base}${path}`, options);
  return handleResponse(response);
};

/** GET **/
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

const parseApiResponseToClientUser = (data: ApiUser): UserResponse => {
  const userData = data.user?.[data?.result ?? ''];
  const completedChallenges: CompletedChallenge[] = userData?.completedChallenges?.reduce(
    (acc: CompletedChallenge[], curr: ChallengeFilesForFiles) => [
      ...acc,
      {
        ...curr,
        challengeFiles: curr.files.map(({ key: fileKey, ...file }) => ({
          ...file,
          fileKey,
        })),
      },
    ],
    [],
  ) ?? [];

  return {
    user: { [data.result ?? '']: { ...userData, completedChallenges } },
    result: data.result,
  };
};

export const getSessionUser = async (): Promise<SessionUser> => {
  const response: ApiUser & ApiSessionResponse = await get('/user/get-session-user');
  const { result, user } = parseApiResponseToClientUser(response);
  return {
    sessionMeta: response.sessionMeta,
    result,
    user,
  };
};

type UserProfileResponse = {
  entities: Omit<UserResponse, 'result'>;
  result: string | undefined;
};

export const getUserProfile = async (username: string): Promise<UserProfileResponse> => {
  const response: { entities?: ApiUser; result?: string } = await get(
    `/api/users/get-public-profile?username=${username}`,
  );
  const { result, user } = parseApiResponseToClientUser({
    user: response.entities?.user ?? {},
    result: response.result,
  });
  return {
    entities: { user },
    result,
  };
};

interface Cert {
  certTitle: string;
  username: string;
  date: Date;
  completionTime: string;
}

export const getShowCert = (username: string, certSlug: string): Promise<Cert> =>
  get(`/certificate/showCert/${username}/${certSlug}`);

export const getUsernameExists = (username: string): Promise<boolean> =>
  get(`/api/users/exists?username=${username}`);

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

export const getVerifyCanClaimCert = (
  username: string,
  certification: string,
): Promise<GetVerifyCanClaimCert> =>
  get(`/certificate/verify-can-claim-cert?username=${username}&superBlock=${certification}`);

/** POST **/
interface Donation {
  email: string;
  amount: number;
  duration: string;
  provider: string;
  subscriptionId: string;
  customerId: string;
  startDate: Date;
}

export const addDonation = (body: Donation): Promise<void> => post('/donate/add-donation', body);

export const postChargeStripe = (body: Donation): Promise<void> => post('/donate/charge-stripe', body);

export const postChargeStripeCard = (body: Donation): Promise<void> =>
  post('/donate/charge-stripe-card', body);

interface Report {
  username: string;
  reportDescription: string;
}

export const postReportUser = (body: Report): Promise<void> => post('/user/report-user', body);

// Both are called without a payload in danger-zone-saga,
// which suggests both are sent without any body
// TODO: Convert to DELETE
export const postDeleteAccount = (): Promise<void> => post('/account/delete', {});

export const postResetProgress = (): Promise<void> => post('/account/reset-progress', {});

export const postWebhookToken = (): Promise<void> => post('/user/webhook-token', {});

/** PUT **/
interface MyAbout {
  name: string;
  location: string;
  about: string;
  picture: string;
}

export const putUpdateMyAbout = (values: MyAbout): Promise<void> =>
  put('/update-my-about', { ...values });

export const putUpdateMyUsername = (username: string): Promise<void> =>
  put('/update-my-username', { username });

export const putUpdateMyProfileUI = (profileUI: User['profileUI']): Promise<void> =>
  put('/update-my-profileui', { profileUI });

// Update should contain only one flag and one new value
// It's possible to constrain to only one key with TS, but is overkill for this
// https://stackoverflow.com/a/60807986
export const putUpdateUserFlag = (update: Record<string, string>): Promise<void> =>
  put('/update-user-flag', update);

export const putUserAcceptsTerms = (quincyEmails: boolean): Promise<void> =>
  put('/update-privacy-terms', { quincyEmails });

export const putUserUpdateEmail = (email: string): Promise<void> =>
  put('/update-my-email', { email });

export const putVerifyCert = (certSlug: string): Promise<void> =>
  put('/certificate/verify', { certSlug });

/** DELETE **/
export const deleteWebhookToken = (): Promise<void> => deleteRequest('/user/webhook-token', {});