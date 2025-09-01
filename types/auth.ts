export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}