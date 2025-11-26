# Frontend Application

React.js frontend application for the online shop with authentication features.

## Features

- **User Authentication**
  - Login
  - Registration
  - Password Reset (Forgot Password / Reset Password)
  - Email Verification
  - JWT Token Management with Auto-refresh

- **Protected Routes**
  - Dashboard (requires authentication)
  - Automatic redirect to login for unauthenticated users

- **User Interface**
  - Responsive design
  - Modern gradient styling
  - Form validation
  - Error handling
  - Loading states

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` and set your API URL:

```
VITE_API_URL=http://localhost:3001/api
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Auth/              # Authentication components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── ResetPassword.tsx
│   │   ├── VerifyEmail.tsx
│   │   └── Auth.css
│   ├── Layout/            # Layout components
│   │   ├── Layout.tsx
│   │   └── Layout.css
│   └── ProtectedRoute.tsx # Route protection
├── context/
│   └── AuthContext.tsx    # Auth state management
├── services/
│   └── auth.service.ts    # API calls
├── types/
│   └── auth.types.ts      # TypeScript types
├── pages/
│   └── Dashboard.tsx      # Dashboard page
├── App.tsx                # Main app component
├── main.tsx              # App entry point
└── index.css             # Global styles
```

## API Integration

The frontend expects the following API endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

## Technologies

- React 18
- TypeScript
- React Router 6
- Axios
- Vite
