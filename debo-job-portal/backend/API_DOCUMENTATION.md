# Debo Engineering Job Portal - API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
All endpoints except `/auth/login` and `/auth/register` require JWT authentication.

### Headers
Authorization: Bearer <jwt_token>
Content-Type: application/json

## API Endpoints

### Authentication Endpoints

#### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}