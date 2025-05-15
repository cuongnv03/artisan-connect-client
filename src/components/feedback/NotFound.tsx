import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../form/Button';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col min-h-[80vh] items-center justify-center text-center px-4 py-16">
      <div className="max-w-md">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
          Page not found
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for. It might have
          been removed or is temporarily unavailable.
        </p>
        <div className="mt-10 flex justify-center space-x-4">
          <Button variant="primary" as={Link} to="/">
            Go back home
          </Button>
          <Button
            variant="outline"
            as="a"
            href="mailto:support@artisanconnect.com"
          >
            Contact support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
