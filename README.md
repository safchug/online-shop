# Online Shop - E-commerce Microservices Platform

A full-featured e-commerce platform built with microservices architecture using NestJS, Next.js, and TypeScript.

## 🏗️ Architecture

This is a monorepo containing:

### Services (Backend)
- **API Gateway** - Entry point for all client requests
- **Auth Service** - Authentication & authorization (JWT, OAuth2, RBAC)
- **User Service** - User management and profiles
- **Product Service** - Product catalog, inventory, search
- **Order Service** - Order processing and management
- **Payment Service** - Payment processing and transactions
- **Notification Service** - Email/SMS notifications

### Frontend
- **Next.js App** - Customer-facing e-commerce website

### Shared Packages
- **@online-shop/shared-types** - Common TypeScript types
- **@online-shop/shared-utils** - Utility functions
- **@online-shop/eslint-config** - Shared ESLint configuration
- **@online-shop/tsconfig** - Shared TypeScript configuration

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (for services)

### Installation

```bash
# Install dependencies for all packages
npm install

# Run all services in development mode
npm run dev

# Build all packages
npm run build

# Run tests
npm run test

# Lint all packages
npm run lint
```

## 📁 Project Structure

```
online-shop/
├── apps/
│   ├── frontend/                    # Next.js frontend
│   └── services/
│       ├── api-gateway/            # API Gateway
│       ├── auth-service/           # Authentication service
│       ├── user-service/           # User management
│       ├── product-service/        # Product catalog
│       ├── order-service/          # Order management
│       ├── payment-service/        # Payment processing
│       └── notification-service/   # Notifications
├── packages/
│   ├── shared-types/               # Shared TypeScript types
│   ├── shared-utils/               # Common utilities
│   ├── eslint-config/              # ESLint configuration
│   └── tsconfig/                   # TypeScript configuration
├── USER_STORIES.md                 # Product requirements
└── package.json                    # Root package.json
```

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL
- **Frontend**: Next.js, React, TypeScript
- **Build Tool**: Turbo (monorepo orchestration)
- **Authentication**: JWT, Passport, OAuth2
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker

## 📝 Development Status

🚧 **In Progress** - Setting up microservices architecture

## 📄 License

Private project
