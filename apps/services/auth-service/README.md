# Auth Service

Authentication microservice built with NestJS, MongoDB, and Mongoose.

## Features

- User registration with email and password
- User login with JWT token generation
- Password hashing with bcrypt
- JWT authentication and validation
- Microservice communication via TCP
- MongoDB integration with Mongoose

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB (if running locally):

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

4. Run the service:

```bash
npm run start:dev
```

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRATION` - JWT token expiration time
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `JWT_REFRESH_EXPIRATION` - Refresh token expiration time
- `AUTH_SERVICE_PORT` - Port for the microservice
- `AUTH_SERVICE_HOST` - Host for the microservice

## API Endpoints (via Microservice)

The service communicates via TCP microservice patterns:

- `auth.register` - Register a new user
- `auth.login` - Login and get JWT token
- `auth.validate` - Validate JWT token
- `auth.refresh` - Refresh JWT token
- `auth.profile` - Get user profile

## Development

```bash
# Run in development mode
npm run start:dev

# Run tests
npm run test

# Lint code
npm run lint
```
