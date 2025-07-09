# 

Ready to go! 🎉

- ✅ Responsive design
- ✅ Service worker caching
- ✅ Install as desktop/mobile app
- ✅ Offline functionality

### PWA Features

- ✅ Session management
- ✅ Role-based access (Admin/User)
- ✅ Protected routes
- ✅ JWT-based authentication

### Authentication

- ✅ Work order status tracking
- ✅ Automatic stock deduction
- ✅ Real-time cost calculation
- ✅ Add multiple parts to work orders
- ✅ Create work orders with customer & vehicle info

### Work Orders

- ✅ Stock history per part
- ✅ Low stock alerts
- ✅ Track stock movements (IN/OUT)
- ✅ Add/Edit/Delete parts
- ✅ View all spare parts with stock levels

### Stock Management

## 📚 Key Features

- **Logs**: Check terminal output for both frontend and backend logs
- **Database Inspection**: Use MongoDB Compass or any MongoDB client
- **API Testing**: Use Swagger UI at http://localhost:3001/swagger
- **Hot Reload**: Both frontend and backend have hot reload enabled

### Development Tips

- Check API_URL in frontend/.env
- Verify CORS_ORIGIN in backend/.env matches frontend URL

4. **CORS errors**:

```sh
bun install
rm -rf node_modules
# Reinstall dependencies
```bash
```

5. **Module not found errors**:

   - Check firewall settings
   - Verify DATABASE_URL in backend/.env
   - Check MongoDB is running

6. **Database connection failed**:

```sh
taskkill /PID <PID> /F
netstat -ano | findstr :3000
# Kill processes on ports 3000/3001
```bash
```

7. **Port already in use**:

### Common Issues

## 🚨 Troubleshooting

```ini
└── README.md
├── package.json           # Root package.json
├── docker-compose.yml      # Docker services
│   └── Dockerfile
│   ├── .env
│   ├── package.json
│   │   └── icons/          # PWA icons
│   ├── public/
│   │   └── root.tsx        # App root
│   │   ├── styles/         # CSS/Theme files
│   │   ├── utils/          # Utility functions
│   │   ├── components/     # React components
│   │   ├── routes/         # Page routes
│   ├── app/
├── frontend/               # Remix React application
│   └── Dockerfile
│   ├── .env
│   ├── package.json
│   │   └── seed.ts         # Database seeding
│   │   ├── index.ts        # Main server file
│   │   ├── middleware/     # Authentication middleware
│   │   ├── routes/         # API routes
│   │   ├── models/         # MongoDB models
│   │   ├── config/         # Database configuration
│   ├── src/
├── backend/                 # ElysiaJS API server
motorcycle-workshop-manager/
```

## 🗂️ Project Structure

```sh
bun run typecheck    # Run TypeScript checks
bun run preview      # Preview production build
bun run start        # Start production server
bun run build        # Build for production
bun run dev          # Start development server
cd frontend
```bash

```

bun run seed         # Seed database with sample data
bun run start        # Start production server
bun run build        # Build for production
bun run dev          # Start development server
cd backend

```bash

```

bun run setup        # Install all dependencies
bun run docker:down  # Stop Docker services
bun run docker:up    # Start with Docker
bun run start        # Start production server
bun run build        # Build frontend for production
bun run dev:frontend # Start frontend only
bun run dev:backend  # Start backend only
bun run dev          # Start both frontend and backend

```bash

## 🔧 Available Commands

4. **Mobile Friendly**: Responsive design for mobile devices
3. **Push Notifications**: Get notified about low stock
2. **Offline Support**: Works without internet connection
1. **Install as App**: Click "Install" button in browser

The application is a Progressive Web App (PWA):

## 📱 PWA Features

- **User**: user@workshop.com / user123
- **Admin**: admin@workshop.com / admin123

- **API Health Check**: http://localhost:3001/health
- **API Documentation**: http://localhost:3001/swagger
- **Frontend**: http://localhost:3000

## 🌐 Accessing the Application

```

bun run docker:down

# Stop all services

bun run docker:up

# Build and start all services

```bash


```

bun run dev:frontend

# Frontend only

bun run dev:backend

# Backend only

```bash


- **Frontend** on http://localhost:3000
- **Backend API** on http://localhost:3001
This will start:

```

bun run dev

# From project root directory

```bash


## 🏃‍♂️ Running the Application

- **10 sample parts** with stock data
- **Sample user**: user@workshop.com / user123
- **Admin user**: admin@workshop.com / admin123
This creates:

```

bun run seed

# Run the seed script to create sample data

cd backend

# Navigate to backend directory

```bash


3. Get connection string and update `DATABASE_URL` in `backend/.env`
2. Create a new cluster
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
#### Option B: MongoDB Atlas (Cloud)

```

mongo:7
-e MONGO_INITDB_ROOT_PASSWORD=workshop123   
-e MONGO_INITDB_ROOT_USERNAME=workshop   
docker run -d -p 27017:27017 --name workshop-mongodb \

# Start MongoDB with Docker

```bash
#### Option A: Local MongoDB with Docker


```

API_URL=http://localhost:3001

```env
Edit `frontend/.env`:

```

cp .env.example .env
cd ../frontend

# Navigate to frontend and copy environment file

```bash
#### Frontend Environment (.env)

```

VAPID_SUBJECT=mailto:your-email@domain.com
VAPID_PRIVATE_KEY=
VAPID_PUBLIC_KEY=

# Web Push Notifications (optional)

CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=mongodb://localhost:27017/motorcycle-workshop
PORT=3001
NODE_ENV=development

```env
Edit `backend/.env` with your settings:

```

cp .env.example .env
cd backend

# Navigate to backend and copy environment file

```bash
#### Backend Environment (.env)


```

bun run setup

# Install all dependencies (root, frontend, backend)

cd h:\MyProject\139--motorcycle

# Navigate to project directory

```bash


## 📋 Setup Instructions

- **Git** for version control
- **MongoDB** (local installation OR MongoDB Atlas account)
- **Docker & Docker Compose** - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Bun** (latest version) - [Install from bun.sh](https://bun.sh)

Before you start, make sure you have:

## Prerequisites
 🚀 Quick Start Guide - Motorcycle Workshop Manager
```