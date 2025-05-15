import React from 'react';
import { NewsFeed } from './Feed';
import { useAuth } from '@/context/AuthContext';
import LandingPage from './Landing';

// // Sample artisan data
// const featuredArtisans = [
//   {
//     id: '1',
//     name: 'Sarah Johnson',
//     title: 'Master Ceramicist',
//     imageUrl:
//       'https://images.unsplash.com/photo-1534126511673-b6899657816a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
//     rating: 4.9,
//     reviewCount: 120,
//     specialties: ['Pottery', 'Ceramic Art', 'Sculptures'],
//   },
//   {
//     id: '2',
//     name: 'Michael Chen',
//     title: 'Wood Craftsman',
//     imageUrl:
//       'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
//     rating: 4.8,
//     reviewCount: 95,
//     specialties: ['Furniture', 'Wood Carving', 'Restoration'],
//   },
//   {
//     id: '3',
//     name: 'Elena Mendoza',
//     title: 'Textile Artist',
//     imageUrl:
//       'https://images.unsplash.com/photo-1559595500-e15296215b38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
//     rating: 4.7,
//     reviewCount: 83,
//     specialties: ['Weaving', 'Embroidery', 'Natural Dyes'],
//   },
// ];

// // Sample product data
// const featuredProducts = [
//   {
//     id: '1',
//     name: 'Handcrafted Ceramic Vase',
//     price: 79.99,
//     imageUrl:
//       'https://images.unsplash.com/photo-1612196808214-b7e239f6f28b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
//     artisan: 'Sarah Johnson',
//     customizable: true,
//   },
//   {
//     id: '2',
//     name: 'Wooden Cutting Board Set',
//     price: 49.99,
//     imageUrl:
//       'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
//     artisan: 'Michael Chen',
//     customizable: false,
//   },
//   {
//     id: '3',
//     name: 'Hand-woven Wall Tapestry',
//     price: 129.99,
//     imageUrl:
//       'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
//     artisan: 'Elena Mendoza',
//     customizable: true,
//   },
//   {
//     id: '4',
//     name: 'Artisan Leather Journal',
//     price: 39.99,
//     imageUrl:
//       'https://images.unsplash.com/photo-1544148156-077e9e100704?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
//     artisan: 'Robert Davis',
//     customizable: true,
//   },
// ];

const HomePage: React.FC = () => {
  const { state } = useAuth();
  const { isAuthenticated } = state;

  // If not authenticated, show landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // For authenticated users, show the news feed
  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Feed</h1>
        <NewsFeed />
      </div>
    </div>
  );
};

export default HomePage;
