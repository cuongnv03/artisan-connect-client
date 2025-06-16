import React from 'react';
import { useParams } from 'react-router-dom';
import { EmailVerificationStatus } from '../../components/auth/EmailVerificationStatus';

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="animate-fade-in">
      <EmailVerificationStatus token={token || ''} />
    </div>
  );
};
