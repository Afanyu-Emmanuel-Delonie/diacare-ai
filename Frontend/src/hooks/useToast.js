import { useToast as useToastContext } from '../context/ToastContext.jsx';

export default function useToast() {
  return useToastContext();
}
