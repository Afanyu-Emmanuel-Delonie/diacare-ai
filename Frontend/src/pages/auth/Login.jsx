import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import useAuth from '../../hooks/useAuth.js';
import useToast from '../../hooks/useToast.js';
import { getSafeAuthError } from '../../utils/authErrors.js';
import { getDashboardPath } from '../../utils/roles.js';
import AuthLayout from './AuthLayout.jsx';
import PasswordField from './PasswordField.jsx';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    defaultValues: {
      usernameOrEmail: '',
      password: ''
    }
  });

  const onSubmit = async (values) => {
    try {
      const session = await signIn(values);
      const requestedPath = location.state?.from?.pathname;
      const destination = requestedPath?.startsWith('/dashboard')
        ? requestedPath
        : getDashboardPath(session.user.role);

      showToast({ type: 'success', message: 'Signed in successfully.' });
      navigate(destination, { replace: true });
    } catch (error) {
      const message = getSafeAuthError(error, 'Sign in failed. Check your credentials.');
      setError('root', { message });
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your secure healthcare workspace."
      footerText="Need a patient account?"
      footerLinkText="Create one"
      footerTo="/register"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="usernameOrEmail"
          label="Username or email"
          autoComplete="username"
          error={errors.usernameOrEmail?.message}
          {...register('usernameOrEmail', {
            required: 'Username or email is required.',
            maxLength: { value: 120, message: 'Username or email is too long.' }
          })}
          required
        />
        <PasswordField
          id="password"
          label="Password"
          register={register}
          error={errors.password}
          validation={{
            minLength: { value: 8, message: 'Password must contain at least 8 characters.' },
            maxLength: { value: 72, message: 'Password must not exceed 72 characters.' }
          }}
        />

        {errors.root && (
          <p role="alert" className="rounded-lg border border-[#DC2626]/20 bg-[#fef2f2] px-4 py-3 text-sm text-[#DC2626]">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Login;
