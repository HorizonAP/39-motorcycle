# 

MIT License

## License

Common issues and solutions are covered in [SETUP.md](./SETUP.md).

## 🚨 Troubleshooting

- **PWA Features**: Installable app with offline support
- **API Documentation**: Available at http://localhost:3001/swagger when running
- **Detailed Setup**: See [SETUP.md](./SETUP.md) for comprehensive setup instructions

## 📖 Documentation

- Frontend application
- Backend API server
- MongoDB database
   This starts:

```sql
bun run docker:up
```bash

For production deployment:

## 🐳 Docker Deployment

- **User** - Authentication and user management
- **WorkOrderPart** - Parts used in work orders
- **WorkOrder** - Customer work orders with vehicle info
- **StockMovement** - Track stock IN/OUT movements
- **Part** - Spare parts inventory (SKU, name, price, quantity)

## 📚 Database Models

```

bun run setup           # Install all dependencies
bun run docker:down     # Stop Docker services
bun run docker:up       # Start with Docker Compose
bun run build           # Build frontend for production
bun run dev:frontend     # Start frontend only
bun run dev:backend      # Start backend only
bun run dev              # Start both frontend and backend

```bash

## 🔧 Available Commands

```

└── SETUP.md           # Detailed setup instructions
├── docker-compose.yml  # Docker services configuration
├── frontend/           # Remix React application
├── backend/            # ElysiaJS API server
motorcycle-workshop-manager/

```md

## 🗂️ Project Structure

- **Swagger Documentation** for API testing
- **Work Order Processing** with transaction rollback
- **Stock Management** with automatic inventory updates
- **JWT Authentication** for secure access
- **MongoDB** database with Mongoose ODM
- **RESTful API** with ElysiaJS

- **Offline Support** - Service worker for offline functionality
- **PWA Support** - Installable as a Progressive Web App
- **Stock History** - Track IN/OUT movements for each part
- **Work Orders** - Create orders with customer info, vehicle details, and parts selection
- **Spare Parts Management** - View, create, edit, delete parts
- **Authentication** with protected routes
- **Dark mode support** with Material UI

## 📱 Features

- **User**: user@workshop.com / user123
- **Admin**: admin@workshop.com / admin123

- **API Documentation**: http://localhost:3001/swagger
- **Frontend**: http://localhost:3000

```

cd .. && bun run dev

```bash
5. **Start the application:**

```

cd backend && bun run seed

```bash
4. **Seed database with sample data:**

```

cd ../frontend && cp .env.example .env

# Frontend environment

cd backend && cp .env.example .env

# Backend environment

```bash
3. **Configure environment:**

```

docker run -d -p 27017:27017 --name workshop-mongodb mongo:7

```bash
2. **Start MongoDB database:**

```

bun run setup

```bash
1. **Install dependencies:**


- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for database)
- [Bun](https://bun.sh) (latest version)

## 🚀 Quick Start

A full-stack spare-part stock management system designed for motorcycle workshops.
 Motorcycle Workshop Stock Management System
```