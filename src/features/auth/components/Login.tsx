import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';
import { useAuth } from '../../../store/AuthContext';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/ui/Alert';
import { MapIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

interface LoginFormValues {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const { login, state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Get redirect path from location state or use default
  const from = (location.state as any)?.from?.pathname || '/';

  // Initialize form
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useForm<LoginFormValues>({
    initialValues: {
      emailOrUsername: '',
      password: '',
      rememberMe: false,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.emailOrUsername) {
        errors.emailOrUsername = 'Email or username is required';
      }

      if (!values.password) {
        errors.password = 'Password is required';
      }

      return errors;
    },
    onSubmit: async (values) => {
      setLoginError(null);

      try {
        await login(values.emailOrUsername, values.password, values.rememberMe);
        navigate(from, { replace: true });
      } catch (error: any) {
        setLoginError(
          error.response?.data?.message ||
            'Login failed. Please check your credentials.',
        );
      }
    },
  });

  // Toggle password visibility
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-accent hover:text-accent-dark"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Session expired message */}
      {location.search.includes('session_expired=true') && (
        <Alert type="info" title="Session Expired" variant="subtle">
          Your session has expired. Please login again.
        </Alert>
      )}

      {/* Login error */}
      {loginError && (
        <Alert
          type="error"
          variant="subtle"
          dismissible
          onDismiss={() => setLoginError(null)}
        >
          {loginError}
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Email or Username"
          type="text"
          name="emailOrUsername"
          id="emailOrUsername"
          value={values.emailOrUsername}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.emailOrUsername ? errors.emailOrUsername : ''}
          leftAddon={<MapIcon className="h-5 w-5 text-gray-400" />}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          id="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password ? errors.password : ''}
          leftAddon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          rightAddon={
            <button
              type="button"
              onClick={toggleShowPassword}
              className="text-gray-400 hover:text-gray-500"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          }
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={values.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-700"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-accent hover:text-accent-dark"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          isFullWidth
          variant="primary"
          size="lg"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            leftIcon={
              <svg
                className="h-5 w-5"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            }
          >
            Twitter
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            leftIcon={
              <svg
                className="h-5 w-5"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
