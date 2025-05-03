import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Loader } from '../../../components/ui/Loader';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/ui/Alert';
import { AuthService } from '../../../services/auth.service';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Verification token is missing');
        setIsVerifying(false);
        return;
      }

      try {
        await AuthService.verifyEmail(token);
        setIsVerified(true);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Email verification failed');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

  // Show loader while verifying
  if (isVerifying) {
    return <Loader size="lg" text="Verifying your email..." />;
  }

  // Show success message
  if (isVerified) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          Email verified successfully
        </h3>
        <p className="text-gray-600">
          Thank you for verifying your email address. Your account is now fully
          activated.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button variant="primary" isFullWidth>
              Go to home page
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show error message
  return (
    <div className="space-y-6">
      <Alert type="error" variant="subtle">
        {error || 'Email verification failed'}
      </Alert>

      <p className="text-gray-600">
        The verification link may have expired or is invalid. Please request a
        new verification email.
      </p>

      <div className="flex flex-col space-y-3">
        <Button
          variant="primary"
          onClick={() => {
            // Send new verification email (if user is logged in)
            AuthService.sendVerificationEmail()
              .then(() => {
                navigate('/');
              })
              .catch(() => {
                // If user is not logged in or other error
                navigate('/login');
              });
          }}
        >
          Request new verification email
        </Button>

        <Link to="/login">
          <Button variant="outline" isFullWidth>
            Back to sign in
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
