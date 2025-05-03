# Artisan Connect - Client

## Overview

Artisan Connect is a social commerce platform designed specifically for the artisan crafts community. This application bridges the gap between talented artisans and customers seeking unique, handcrafted products through engaging storytelling and personalized experiences.

The platform enables artisans to build their brand, share their craft journey, and sell products with flexible pricing and customization options, while providing customers with an immersive shopping experience that values the stories and craftsmanship behind each piece.

## Features

### For Artisans

- **Customizable Profiles**: Build a unique brand presence with customizable templates and themes
- **Rich Content Publishing**: Share your craft journey through story-based posts with rich media support
- **Product Management**: List products with flexible pricing and customization options
- **Dynamic Pricing**: Negotiate prices and handle custom orders through the quote system
- **Dashboard Analytics**: Track performance metrics for products and content
- **Shop Management**: Manage orders, inventory, and customer communications

### For Customers

- **Discover Artisans**: Explore profiles of talented craftspeople across various disciplines
- **Engaging Content**: Experience the stories and processes behind handcrafted items
- **Custom Orders**: Request personalized items through the quote request system
- **Secure Checkout**: Safe and straightforward purchasing process
- **Account Management**: Track orders, save favorite items, and follow artisans

## Mockup screenshots

### Auth page

![Register](https://github.com/user-attachments/assets/25c29d63-2a35-40ef-89d0-77f79dab9778)

![Log in](https://github.com/user-attachments/assets/18f28dcd-a69a-4a47-8edb-53c00dcb29dc)

### Homepage

![Homepage1](https://github.com/user-attachments/assets/98a20596-4430-4053-82ec-0ed07e2cc983)

![Homepage2](https://github.com/user-attachments/assets/f7eff7f8-1530-4b67-be74-a82b0313ef71)

![Homepage3](https://github.com/user-attachments/assets/e1c9594c-a9ee-4df3-a2e9-6a12c5bcd46c)

![Homepage4](https://github.com/user-attachments/assets/320deced-8914-472c-9304-bc7d6402d19c)

![Homepage5](https://github.com/user-attachments/assets/64028e3b-4113-4557-bcbb-5a35b591fd7a)

### Not found page

![Not found](https://github.com/user-attachments/assets/74d35739-74ac-45e2-aa21-7fbc39727b36)

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Routing**: React Router v7
- **State Management**: React Context API with custom hooks
- **API Communication**: Axios with request/response interceptors
- **UI Components**: Custom component library with Headless UI
- **Styling**: Tailwind CSS with custom theme configuration
- **Form Handling**: Custom form hooks with validation
- **Authentication**: JWT-based auth with refresh token mechanism
- **Data Fetching**: React Query for caching and state management

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-organization/artisan-connect-client.git
cd artisan-connect-client
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm start
# or
yarn start
```

The application should now be running at `http://localhost:3000`.

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── common/         # Base components (Button, Input, etc.)
│   ├── layout/         # Layout components (Navbar, Footer, etc.)
│   └── ui/             # Complex UI components (Modal, Alert, etc.)
├── config/             # Configuration files
├── features/           # Feature-based modules
│   ├── auth/           # Authentication related components
│   ├── home/           # Homepage components
│   ├── artisan/        # Artisan-specific features
│   ├── profile/        # User profile features
│   └── ...
├── hooks/              # Custom React hooks
├── routes/             # Routing configuration
├── services/           # API service layers
├── store/              # State management
├── styles/             # Global styles and theme
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Runs the test suite
- `npm eject`: Ejects from Create React App (use with caution)

## Key Components

### Auth Flow

The application implements a complete authentication flow with:

- Registration with email verification
- Login with JWT
- Password reset functionality
- Token refresh mechanism for session persistence

### Form Handling

Custom form handling with:

- Input validation
- Error messaging
- Form state management
- Asynchronous submission

### Layout Components

- Responsive navigation with mobile support
- Authenticated vs. non-authenticated views
- Role-based sidebar navigation (Customer, Artisan, Admin)

## State Management

The application uses React Context API for global state management:

- `AuthContext`: Manages authentication state and user information
- Custom hooks to access state and actions from components

## Styling Approach

The application uses Tailwind CSS with:

- Custom theme configuration
- Extended color palette for the Artisan Connect brand
- Responsive design patterns
- Custom component styling

## API Integration

API requests are managed through:

- Axios instance with base configuration
- Request/response interceptors for authentication
- Token refresh handling
- Error handling

## Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `build/` directory.

### Deployment Options

- **Static Hosting**: Deploy to Netlify, Vercel, or GitHub Pages
- **Server Deployment**: Deploy to a traditional web server or cloud provider

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Acknowledgements

- [Headless UI](https://headlessui.dev/) for accessible UI components
- [Heroicons](https://heroicons.com/) for beautiful SVG icons
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [React Query](https://react-query.tanstack.com/) for data fetching

---

For more information, please contact the Artisan Connect development team at [email@example.com](mailto:email@example.com).
