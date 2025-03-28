import cookies from 'browser-cookies';
import envData from '../../../config/env.json';
import type {
  ChallengeFile,
  ClaimedCertifications,
  CompletedChallenge,
  User
} from '../redux/prop-types';
import { FlashMessageArg } from '../components/Flash/redux';

const { apiLocation } = envData;

// Configuration and utility functions
class ApiService {
  private static base = apiLocation;
  private static defaultOptions: RequestInit = {
    credentials: 'include'
  };

  /**
   * Retrieve CSRF token from browser cookies
   * @returns CSRF token or empty string
   */
  private static getCSRFToken(): string {
    return typeof window !== 'undefined' ? cookies.get('csrf_token') ?? '' : '';
  }

  /**
   * Generic method to make HTTP requests
   * @param method HTTP method
   * @param path API endpoint path
   * @param body Request body
   * @returns Promise with response data
   */
  private static async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    path: string, 
    body?: unknown
  ): Promise<T> {
    const options: RequestInit = {
      ...this.defaultOptions,
      method,
      headers: method !== 'GET' ? {
        'CSRF-Token': this.getCSRFToken(),
        'Content-Type': 'application/json'
      } : undefined,
      body: body ? JSON.stringify(body) : undefined
    };

    const response = await fetch(`${this.base}${path}`, options);
    return response.json();
  }

  // User-related API methods
  static async getSessionUser(): Promise<SessionUser> {
    const data = await this.request<ApiUser & ApiSessionResponse>('GET', '/user/get-session-user');
    const { result, user } = this.parseApiResponseToClientUser(data);
    return {
      sessionMeta: data.sessionMeta,
      result,
      user
    };
  }

  static async getUserProfile(username: string): Promise<UserProfileResponse> {
    const data = await this.request<{ entities?: ApiUser; result?: string }>(
      'GET', 
      `/api/users/get-public-profile?username=${username}`
    );
    
    const { result, user } = this.parseApiResponseToClientUser({
      user: data.entities?.user ?? {},
      result: data.result
    });
    
    return {
      entities: { user },
      result
    };
  }

  /**
   * Parse API response to standardized user format
   * @param data API user response
   * @returns Parsed user response
   */
  private static parseApiResponseToClientUser(data: ApiUser): UserResponse {
    const userData = data.user?.[data?.result ?? ''];
    
    const completedChallenges: CompletedChallenge[] = userData 
      ? userData.completedChallenges?.reduce((acc, curr) => [
          ...acc,
          {
            ...curr,
            challengeFiles: curr.files.map(({ key: fileKey, ...file }) => ({
              ...file,
              fileKey
            }))
          }
        ], []) ?? []
      : [];

    return {
      user: { [data.result ?? '']: { ...userData, completedChallenges } },
      result: data.result
    };
  }

  // Specific GET methods
  static getShowCert(username: string, certSlug: string): Promise<Cert> {
    return this.request('GET', `/certificate/showCert/${username}/${certSlug}`);
  }

  static getUsernameExists(username: string): Promise<boolean> {
    return this.request('GET', `/api/users/exists?username=${username}`);
  }

  static getVerifyCanClaimCert(
    username: string, 
    certification: string
  ): Promise<GetVerifyCanClaimCert> {
    return this.request(
      'GET', 
      `/certificate/verify-can-claim-cert?username=${username}&superBlock=${certification}`
    );
  }

  // POST methods
  static addDonation(body: Donation): Promise<void> {
    return this.request('POST', '/donate/add-donation', body);
  }

  static postChargeStripe(body: Donation): Promise<void> {
    return this.request('POST', '/donate/charge-stripe', body);
  }

  static postChargeStripeCard(body: Donation): Promise<void> {
    return this.request('POST', '/donate/charge-stripe-card', body);
  }

  static postReportUser(body: Report): Promise<void> {
    return this.request('POST', '/user/report-user', body);
  }

  static postDeleteAccount(): Promise<void> {
    return this.request('POST', '/account/delete', {});
  }

  static postResetProgress(): Promise<void> {
    return this.request('POST', '/account/reset-progress', {});
  }

  static postWebhookToken(): Promise<void> {
    return this.request('POST', '/user/webhook-token', {});
  }

  // PUT methods
  static putUpdateMyAbout(values: MyAbout): Promise<void> {
    return this.request('PUT', '/update-my-about', values);
  }

  static putUpdateMyUsername(username: string): Promise<void> {
    return this.request('PUT', '/update-my-username', { username });
  }

  static putUpdateMyProfileUI(profileUI: User['profileUI']): Promise<void> {
    return this.request('PUT', '/update-my-profileui', { profileUI });
  }

  static putUpdateUserFlag(update: Record<string, string>): Promise<void> {
    return this.request('PUT', '/update-user-flag', update);
  }

  static putUserAcceptsTerms(quincyEmails: boolean): Promise<void> {
    return this.request('PUT', '/update-privacy-terms', { quincyEmails });
  }

  static putUserUpdateEmail(email: string): Promise<void> {
    return this.request('PUT', '/update-my-email', { email });
  }

  static putVerifyCert(certSlug: string): Promise<void> {
    return this.request('PUT', '/certificate/verify', { certSlug });
  }

  // DELETE methods
  static deleteWebhookToken(): Promise<void> {
    return this.request('DELETE', '/user/webhook-token', {});
  }
}

// Type definitions (kept from original file)
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

interface Cert {
  certTitle: string;
  username: string;
  date: Date;
  completionTime: string;
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

export default ApiService;