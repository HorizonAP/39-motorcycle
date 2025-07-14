# 🔗 Frontend-Backend Integration Guide

This guide explains how the frontend and backend are integrated in the Motorcycle Workshop Management System.

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    Mongoose    ┌─────────────────┐
│   Frontend      │ ──────────────> │   Backend       │ ──────────────> │  MongoDB Atlas  │
│   (Remix)       │                 │   (Elysia)      │                 │                 │
│   Port: 3000    │                 │   Port: 3001    │                 │  Cloud Database │
└─────────────────┘                 └─────────────────┘                 └─────────────────┘
```

## 🔧 Configuration

### Backend Configuration (`.env`)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="mongodb+srv://39-yan-yon:HX6yXQjAHzfjuD2n@cluster0.ksjqymp.mongodb.net/motorcycle-workshop?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration (`.env`)
```env
API_URL=http://localhost:3001
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
bun run setup
```

### 2. Seed Database (First Time Only)
```bash
bun run seed
```

### 3. Start Development Servers
```bash
# Start both frontend and backend
bun run dev

# Or start individually
bun run dev:backend
bun run dev:frontend
```

### 4. Test Integration
```bash
# Windows PowerShell
.\test-integration.ps1

# Linux/Mac
./test-integration.sh
```

## 🔐 Authentication Flow

1. **User Login**: Frontend sends credentials to `/auth/login`
2. **JWT Token**: Backend responds with JWT token
3. **Token Storage**: Frontend stores token in localStorage
4. **Authenticated Requests**: Frontend includes token in Authorization header
5. **Token Verification**: Backend middleware validates token for protected routes

## 📡 API Integration

### Frontend API Client (`frontend/app/utils/auth.ts`)
- Base API client with automatic token handling
- Error handling and automatic logout on 401
- TypeScript interfaces for type safety

### API Modules (`frontend/app/utils/api.ts`)
- `partsApi`: CRUD operations for motorcycle parts
- `stockApi`: Stock movement tracking
- `workOrdersApi`: Work order management

## 🛡️ Error Handling

### Frontend
- Automatic token refresh/logout on authentication errors
- User-friendly error messages
- Loading states for async operations

### Backend
- Centralized error handling in Elysia
- Proper HTTP status codes
- Structured error responses

## 🗄️ Database Integration

### MongoDB Atlas Connection
- Cloud-hosted MongoDB database
- Optimized connection pooling
- Automatic reconnection handling
- Connection status monitoring

### Models
- `User`: Authentication and authorization
- `Part`: Motorcycle parts inventory
- `StockMovement`: Inventory tracking
- `WorkOrder`: Customer work orders
- `WorkOrderPart`: Parts used in work orders

## 🔄 Real-time Features

The system supports:
- Real-time inventory updates
- Work order status changes
- Low stock alerts
- Push notifications (configurable)

## 🐳 Docker Deployment

### Development
```bash
bun run docker:up
```

### Production
The Docker Compose file is configured for MongoDB Atlas, eliminating the need for a local database container.

## 🧪 Testing

### Backend Tests
```bash
cd backend
bun run test
```

### Integration Tests
```bash
.\test-integration.ps1  # Windows
./test-integration.sh   # Linux/Mac
```

## 📚 API Documentation

When running in development mode, Swagger documentation is available at:
- http://localhost:3001/swagger

## 🔧 Development Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start both frontend and backend |
| `bun run dev:backend` | Start only backend |
| `bun run dev:frontend` | Start only frontend |
| `bun run build` | Build both applications |
| `bun run seed` | Seed database with sample data |
| `bun run test` | Run backend tests |
| `bun run docker:up` | Start with Docker |
| `bun run setup` | Install all dependencies |

## 👤 Default User Accounts

After running `bun run seed`:

**Admin Account**
- Email: `admin@workshop.com`
- Password: `admin123`
- Role: `admin`

**User Account**
- Email: `user@workshop.com`
- Password: `user123`
- Role: `user`

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `CORS_ORIGIN` in backend matches frontend URL
2. **Database Connection**: Verify MongoDB Atlas credentials and whitelist IP
3. **Port Conflicts**: Ensure ports 3000 and 3001 are available
4. **Token Issues**: Clear localStorage and re-login

### Health Checks

- Backend: http://localhost:3001/health
- Frontend: http://localhost:3000
- API Root: http://localhost:3001/

## 🔒 Security Considerations

- JWT tokens have expiration times
- Passwords are hashed with bcrypt
- CORS configured for specific origins
- Input validation on all endpoints
- MongoDB Atlas provides built-in security features

## 🔄 State Management

Frontend uses:
- React hooks for local state
- localStorage for authentication persistence
- API calls for server state synchronization

No additional state management library is needed due to the straightforward data flow.
