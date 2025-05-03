import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[80vh] items-center justify-center text-center px-4 py-16">
      <div className="max-w-md">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100">
          <ShieldExclamationIcon className="h-12 w-12 text-yellow-600" />
        </div>

        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
          Access Denied
        </h2>

        <p className="mt-4 text-lg text-gray-600">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button variant="primary" onClick={() => navigate(-1)}>
            Go back
          </Button>

          <Button variant="outline" as={Link} to="/">
            Home page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
