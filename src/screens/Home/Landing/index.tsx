import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/form/Button';

const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20 rounded-3xl overflow-hidden artisan-pattern-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary-100/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl lg:max-w-3xl">
            <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Connect with skilled</span>
              <span className="block text-accent-dark">Artisans worldwide</span>
            </h1>
            <p className="mt-6 text-xl text-gray-700">
              Discover unique handcrafted products, personalized for you by
              talented artisans. Share their stories, support their craft.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <Button variant="primary" size="lg" as={Link} to="/register">
                Join Now
              </Button>
              <Button variant="outline" size="lg" as={Link} to="/login">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 rounded-xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900">
            Why Choose Artisan Connect?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We're more than just a marketplace - we're a community that
            celebrates craftsmanship
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent-light">
              <svg
                className="h-6 w-6 text-accent-dark"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Direct Connection
            </h3>
            <p className="mt-2 text-base text-gray-600">
              Connect directly with artisans to create custom pieces that tell
              your story
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent-light">
              <svg
                className="h-6 w-6 text-accent-dark"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Quality Craftsmanship
            </h3>
            <p className="mt-2 text-base text-gray-600">
              Each piece tells a story of tradition, skill, and dedication to
              the craft
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent-light">
              <svg
                className="h-6 w-6 text-accent-dark"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Global Artisans
            </h3>
            <p className="mt-2 text-base text-gray-600">
              Discover unique techniques and traditions from artisans around the
              world
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-accent rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:py-20">
              <div className="lg:w-0 lg:flex-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-white">
                  Are you an artisan looking to share your craft?
                </h2>
                <p className="mt-4 max-w-3xl text-lg text-accent-light">
                  Join our community of skilled artisans and bring your
                  creations to customers who value handcrafted quality.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:ml-8">
                <div className="sm:flex">
                  <Link to="/register">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white text-white hover:bg-white hover:text-accent"
                    >
                      Become an Artisan
                    </Button>
                  </Link>
                </div>
                <p className="mt-3 text-sm text-accent-light">
                  No hidden fees. Share your story and products with the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
