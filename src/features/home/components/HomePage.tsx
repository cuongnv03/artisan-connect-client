import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

// Sample artisan data
const featuredArtisans = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Master Ceramicist',
    imageUrl:
      'https://images.unsplash.com/photo-1534126511673-b6899657816a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 120,
    specialties: ['Pottery', 'Ceramic Art', 'Sculptures'],
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Wood Craftsman',
    imageUrl:
      'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 95,
    specialties: ['Furniture', 'Wood Carving', 'Restoration'],
  },
  {
    id: '3',
    name: 'Elena Mendoza',
    title: 'Textile Artist',
    imageUrl:
      'https://images.unsplash.com/photo-1559595500-e15296215b38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewCount: 83,
    specialties: ['Weaving', 'Embroidery', 'Natural Dyes'],
  },
];

// Sample product data
const featuredProducts = [
  {
    id: '1',
    name: 'Handcrafted Ceramic Vase',
    price: 79.99,
    imageUrl:
      'https://images.unsplash.com/photo-1612196808214-b7e239f6f28b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    artisan: 'Sarah Johnson',
    customizable: true,
  },
  {
    id: '2',
    name: 'Wooden Cutting Board Set',
    price: 49.99,
    imageUrl:
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    artisan: 'Michael Chen',
    customizable: false,
  },
  {
    id: '3',
    name: 'Hand-woven Wall Tapestry',
    price: 129.99,
    imageUrl:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    artisan: 'Elena Mendoza',
    customizable: true,
  },
  {
    id: '4',
    name: 'Artisan Leather Journal',
    price: 39.99,
    imageUrl:
      'https://images.unsplash.com/photo-1544148156-077e9e100704?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    artisan: 'Robert Davis',
    customizable: true,
  },
];

const HomePage: React.FC = () => {
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
              <Button variant="primary" size="lg" as={Link} to="/products">
                Explore Products
              </Button>
              <Button variant="outline" size="lg" as={Link} to="/artisans">
                Meet Our Artisans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900">
            Craft Categories
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Explore handcrafted treasures across various categories
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            'Ceramics',
            'Woodworking',
            'Textiles',
            'Jewelry',
            'Leather',
            'Glass',
            'Metal',
            'Paper',
          ].map((category, index) => (
            <Link
              key={index}
              to={`/products?category=${category.toLowerCase()}`}
              className="group relative rounded-lg overflow-hidden bg-gray-100 hover:bg-gray-200 transition-all"
            >
              <div className="h-60 bg-gray-200 flex items-center justify-center p-8">
                <h3 className="text-2xl font-medium text-gray-900 text-center group-hover:text-accent transition-colors">
                  {category}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Artisans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900">
            Meet Our Artisans
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Talented craftspeople who bring creativity and skill to every piece
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredArtisans.map((artisan) => (
            <Card
              key={artisan.id}
              className="h-full artisan-vintage-card hover:shadow-md transition-all"
              isHoverable
            >
              <div className="relative pb-2/3">
                <img
                  src={artisan.imageUrl}
                  alt={artisan.name}
                  className="absolute h-full w-full object-cover rounded-t-xl"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {artisan.name}
                    </h3>
                    <p className="text-sm text-gray-600">{artisan.title}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm font-medium">
                      {artisan.rating}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      ({artisan.reviewCount})
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {artisan.specialties.map((specialty, index) => (
                    <Badge key={index} variant="default" rounded>
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="mt-6">
                  <Link to={`/artisans/${artisan.id}`}>
                    <Button variant="outline" size="sm" isFullWidth>
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/artisans">
            <Button variant="outline">View All Artisans</Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900">
            Featured Products
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Discover unique handcrafted treasures for your home
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group relative">
              <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <Link to={`/products/${product.id}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    By {product.artisan}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ${product.price}
                </p>
              </div>

              {product.customizable && (
                <div className="mt-2">
                  <Badge variant="success" size="sm">
                    Customizable
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/products">
            <Button variant="outline">View All Products</Button>
          </Link>
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

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
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
                  <Link to="/artisan/upgrade">
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

export default HomePage;
