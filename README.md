# CRUD Operations with JWT Authentication and Image Upload

A full-stack application that demonstrates CRUD operations with JWT authentication and image upload functionality.

## Features

- User authentication with JWT
- User registration with profile image upload
- Create, read, update, and delete user records
- Secure protected routes
- Image storage and management
- MongoDB database integration

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Bootstrap
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- Bcrypt (password hashing)
- Multer (file upload handling)

## Getting Started

### Prerequisites
- Node.js
- MongoDB

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd crud_operations
```

2. Install dependencies for server
```bash
cd CRUD_OPE/server
npm install
```

3. Install dependencies for client
```bash
cd ../client
npm install
```

### Running the App

1. Start the server
```bash
cd ../server
npm start
```

2. Start the client (in a new terminal)
```bash
cd ../client
npm run dev
```

3. Access the application at http://localhost:5173/

## Project Structure

```
CRUD_OPE/
├── client/              # Frontend React application
│   ├── public/          # Static files
│   └── src/             # React source files
│       ├── context/     # Context API for state management
│       └── ...          # Component files
└── server/              # Backend Node.js application
    ├── middleware/      # Authentication middleware
    ├── models/          # MongoDB schemas
    ├── uploads/         # Uploaded images storage
    └── index.js         # Server entry point
```

## API Endpoints

### Authentication
- POST /register - Register a new user
- POST /login - Login a user

### Users
- GET /users - Get all users
- GET /getUser/:id - Get a specific user
- POST /createUser - Create a new user
- PUT /updateUser/:id - Update a user
- DELETE /deleteUser/:id - Delete a user
