import { useAuth as useAuthContext } from '../features/auth/AuthProvider.jsx';

export default function useAuth() {
  return useAuthContext();
}
