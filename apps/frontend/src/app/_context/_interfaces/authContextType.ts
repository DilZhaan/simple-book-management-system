
import { User } from './user';

export interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}