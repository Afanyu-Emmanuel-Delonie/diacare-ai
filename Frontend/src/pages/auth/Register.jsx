import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import useToast from '../../hooks/useToast.js';
import { registerPatient } from '../../features/auth/authApi.js';
import { getSafeAuthError } from '../../utils/authErrors.js';
import AuthLayout from './AuthLayout.jsx';
import PasswordField from './PasswordField.jsx';
import { emailValidation, passwordValidation } from './authValidation.js';

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values) => {
    try {
      await registerPatient(values);
      showToast({ type: 'success', message: 'Patient account created. You can now sign in.' });
      navigate('/login', { replace: true });
    } catch (error) {
      setError('root', {
        message: getSafeAuthError(error, 'Account creation failed. Check your details.')
      });
    }
  };

  return (
    <AuthLayout
      title="Create a patient account"
      description="Staff accounts are provisioned securely by an administrator."
      footerText="Already registered?"
      footerLinkText="Sign in"
      footerTo="/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="username"
          label="Username"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username', {
            required: 'Username is required.',
            minLength: { value: 3, message: 'Username must contain at least 3 characters.' },
            maxLength: { value: 50, message: 'Username must not exceed 50 characters.' },
            pattern: {
              value: /^[a-zA-Z0-9._-]+$/,
              message: 'Use letters, numbers, dots, underscores, or hyphens only.'
            }
          })}
          required
        />
        <Input
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', emailValidation)}
          required
        />
        <PasswordField
          id="password"
          label="Password"
          register={register}
          error={errors.password}
          autoComplete="new-password"
          validation={passwordValidation}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          register={register}
          error={errors.confirmPassword}
          autoComplete="new-password"
          validation={{
            validate: (value) => value === watch('password') || 'Passwords do not match.'
          }}
        />

        {errors.root && (
          <p role="alert" className="rounded-lg border border-[#DC2626]/20 bg-[#fef2f2] px-4 py-3 text-sm text-[#DC2626]">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create patient account'}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Register;
