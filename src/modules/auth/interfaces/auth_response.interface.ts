export interface ProfileResponse {
  user_id: string;

  email?: string;
}

export interface AuthResponse {
  success: boolean;

  payload: ProfileResponse | null;

  error?: string;
}

export interface VerifyTokenResponse {
  email: string;

  type: number;
}
