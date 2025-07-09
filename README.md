# 

MIT License

## License

- **PWA**: Service worker + manifest
- **UI**: Material UI with dark mode
- **Authentication**: JWT tokens
- **Database**: MongoDB Atlas with Mongoose
- **Backend**: ElysiaJS with MongoDB
- **Frontend**: Remix with React Router v7

## Development

```sh
docker-compose up -d
```bash
2. **Deploy with Docker:**

```

bun run build

```bash
1. **Build the application:**

## Production Deployment

- **Service Worker** - Cache resources for offline use
- **App Installation** - Install on desktop/mobile devices
- **Push Notifications** - Stock alerts and work order updates
- **Offline Support** - Continue working without internet

## PWA Features

- `GET /stock/low-stock` - Get low stock alerts
- `POST /stock/movement` - Record stock movement

- `DELETE /work-orders/:id` - Delete work order
- `PUT /work-orders/:id` - Update work order
- `POST /work-orders` - Create work order
- `GET /work-orders` - List work orders

- `GET /parts/:id/stock-history` - Get stock movements
- `DELETE /parts/:id` - Delete part
- `PUT /parts/:id` - Update part
- `POST /parts` - Create new part
- `GET /parts` - List all parts

- `GET /auth/verify` - Token verification
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

## API Endpoints

- **User** - Authentication and user management
- **WorkOrderPart** - Parts used in work orders
- **WorkOrder** - Customer work orders
- **StockMovement** - Track stock IN/OUT movements
- **Part** - Spare parts inventory

## Database Models

```

└── README.md
├── docker-compose.yml  # Docker services configuration
├── backend/            # ElysiaJS backend API
├── frontend/           # Remix frontend application
motorcycle-workshop-manager/

```yaml

## Project Structure

- Backend API: http://localhost:3001
- Frontend: http://localhost:3000
The application will be available at:

```

bun run dev

```bash
4. **Or start for development:**

```

bun run docker:up

```bash
3. **Start with Docker:**

```

# Edit the .env files with your MongoDB Atlas connection string

cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Copy environment files

```bash
2. **Environment Setup:**

```

bun run setup
cd motorcycle-workshop-manager
git clone <repository-url>

```bash
1. **Clone and install dependencies:**


- MongoDB Atlas account (or local MongoDB)
- Docker & Docker Compose
- Bun (latest version)

## Quick Start

- **Push Notifications** for low stock alerts
- **Work Order Processing** with transaction rollback
- **Stock Management** with automatic inventory updates
- **JWT Authentication** for secure access
- **MongoDB Atlas** database with Mongoose ODM
- **RESTful API** with ElysiaJS

- **Offline Support** - Service worker for offline functionality
- **PWA Support** - Installable as a Progressive Web App
- **Stock History** - Track IN/OUT movements for each part
- **Work Orders** - Create orders with customer info, vehicle details, and parts selection
- **Spare Parts Management** - View, create, edit, delete parts
- **Authentication** with protected routes
- **Dark mode support** with Material UI

## Features

A full-stack spare-part stock management system designed for motorcycle workshops.
 Motorcycle Workshop Stock Management System
```