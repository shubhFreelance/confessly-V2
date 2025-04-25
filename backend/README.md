# Confessly Backend

A robust backend API for the Confessly application, built with Node.js, Express, and TypeScript.

## Features

- User authentication and authorization
- Real-time notifications
- Search functionality with filters
- Pagination for large data sets
- API documentation with Swagger
- Rate limiting and security features
- Comprehensive error handling
- Logging and monitoring
- Database optimization
- Testing suite

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/confessly-backend.git
cd confessly-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/confessly
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
API_KEY=your_api_key
ALLOWED_ORIGINS=http://localhost:3000
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── test/          # Test setup and utilities
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Security Features

- CORS protection
- Rate limiting
- Request size limits
- Security headers
- API key validation
- JWT authentication
- Input validation and sanitization

## Error Handling

The application uses a centralized error handling system with custom error classes for different types of errors:

- BadRequestError (400)
- UnauthorizedError (401)
- ForbiddenError (403)
- NotFoundError (404)
- ConflictError (409)
- ValidationError (422)
- DatabaseError (500)

## Logging and Monitoring

- Winston logger for structured logging
- Morgan for HTTP request logging
- System metrics monitoring
- Database connection monitoring
- API endpoint monitoring
- Health check endpoint

## Database Optimization

- Connection pooling
- Indexing strategy
- Query optimization
- Error handling
- Graceful shutdown

## Testing

- Jest for unit and integration testing
- Supertest for API testing
- MongoDB Memory Server for test database
- Coverage reporting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 