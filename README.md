# Artisan Connect - Client

React SPA for **Artisan Connect**, a social commerce platform for Vietnamese artisans. Combines a social feed with a full e-commerce storefront - artisans publish posts, manage products, negotiate prices, and handle custom orders, all in one place.

> The backend lives in a separate repository: **artisan-connect-server**.
> For Docker-based deployment (both services together), see the [deployment section](#deployment-with-docker).

---

## Features

- Social feed - follow artisans, like and comment on posts
- Product browsing, search, and filtering
- Multi-seller shopping cart and checkout
- Price negotiation between buyer and artisan
- Custom order requests via chat
- Real-time messaging and notifications (Socket.io)
- Artisan dashboard - manage products, orders, quotes, negotiations
- Artisan profile theming and customization
- Admin panel - manage users and artisan upgrade requests
- Wishlist for products and posts

---

## Screenshots

### General & Customer

| Homepage - logged out | Homepage - logged in |
| --- | --- |
| ![Homepage (logged out)](https://github.com/user-attachments/assets/07416177-c4d2-4222-9d9b-a11b8836c259) | ![Homepage (logged in)](https://github.com/user-attachments/assets/2c369d70-389e-4084-adbb-9940d4e18cb9) |

| Discover page | Store |
| --- | --- |
| ![Discover](https://github.com/user-attachments/assets/605021dd-fe64-413f-bb98-52ad0947144c) | ![Store](https://github.com/user-attachments/assets/1b1c1929-f30d-428a-9187-506342e11915) |

| Post details | Product details |
| --- | --- |
| ![Post details](https://github.com/user-attachments/assets/0fddf271-6c79-4c6a-8036-cc63f663b9dd) | ![Product details](https://github.com/user-attachments/assets/c9d2473e-4aef-4b01-916c-0ce1b5480557) |

### Ordering process

![Cart](https://github.com/user-attachments/assets/f3a2171f-5304-42f8-8d69-29fe15a6135f) ![Checkout](https://github.com/user-attachments/assets/b27e4967-ad01-4077-85de-e2bb2d5b807e) ![Order confirmation](https://github.com/user-attachments/assets/2e14aa3f-3341-41b8-9a05-102bcf636b18)

### Artisan upgrade request

![Step 1](https://github.com/user-attachments/assets/4d3c6356-86cd-4240-823e-9e8c2cb87e93) ![Step 2](https://github.com/user-attachments/assets/53cc1ba1-7565-4f2d-87de-883c55828448)

### Artisan

| Post management | Create post |
| --- | --- |
| ![Post list](https://github.com/user-attachments/assets/2a54545f-9afc-45db-b77c-8e1798598d67) | ![Post editor](https://github.com/user-attachments/assets/0226b875-f4a9-4264-901e-831e754a6565) |

| Product management | Order management |
| --- | --- |
| ![Product list](https://github.com/user-attachments/assets/eef66fd2-d253-4532-8603-d14779f68b94) | ![Order management](https://github.com/user-attachments/assets/1d318823-07dc-4098-9033-99f3e4c8caf7) |

| Custom order management | Price negotiation |
| --- | --- |
| ![Custom orders](https://github.com/user-attachments/assets/4b764bbd-134b-401e-b7fc-3a1b65f93fca) | ![Negotiation](https://github.com/user-attachments/assets/41e55377-502a-4bf1-9bd6-b8d435b33a9a) |

### Profile theming

![Before](https://github.com/user-attachments/assets/e6c29f20-b1e5-4c48-9813-c9ecd561ad39) ![Selecting theme](https://github.com/user-attachments/assets/2fe4409e-7390-4199-a0e6-ac1688e5578a) ![After](https://github.com/user-attachments/assets/f47087e3-8b80-4323-a02e-c8db345c5e01)

### Admin

![Admin panel](https://github.com/user-attachments/assets/c0efd258-7041-40fa-b01b-185c2b4df320)

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State | React Context + Redux Toolkit |
| Real-time | Socket.io client |
| HTTP | Axios (proxied to backend via Vite) |
| Forms | React Hook Form |

---

## Local development

### Prerequisites

- Node.js 20+
- The backend server running on port 5000 (see artisan-connect-server)

### Setup

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev
```

The Vite dev server proxies `/api` and `/socket.io` requests to `http://localhost:5000` automatically - no environment variables needed for local development.

### Other commands

```bash
npm run build        # Production build
npm run type-check   # TypeScript check
npm run lint         # ESLint
npm run preview      # Preview production build locally
```

---

## Deployment with Docker

This app is deployed together with the backend and a PostgreSQL database using Docker Compose. The Compose file and shared `.env` live in the **parent directory** of this repository - see the [artisan-connect-server](https://github.com/cuongnv03/artisan-connect-server) README for full deployment instructions.

Quick start (from the parent directory):

```bash
cp .env.example .env   # fill in secrets
docker compose up --build
```

The client is served on **port 80** via Nginx.
