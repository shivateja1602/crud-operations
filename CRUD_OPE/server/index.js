const express = require('express')
const mongoose = require("mongoose") 
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const UserModel = require('./models/users')
const verifyToken = require('./middleware/auth')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/crud")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err))

// Auth routes
app.post("/register", upload.single('image'), async (req, res) => {
  try {
    console.log("Register endpoint called with body:", req.body);
    console.log("Register endpoint file:", req.file);
    console.log("Headers:", req.headers);
    
    // Validate required fields
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    
    const { name, email, password } = req.body;
    const age = req.body.age ? parseInt(req.body.age) : 0;
    const role = req.body.role || 'user';
    
    console.log("Processing registration with:", { name, email, age, role });
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, 10)    // Create new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      age, // Age is already parsed to integer above
      role, // Role is already set with default above
      imagePath: req.file ? `/uploads/${req.file.filename}` : ""
    }
    
    console.log("Creating new user:", { ...newUser, password: "[HIDDEN]" });
    
    const user = await UserModel.create(newUser)
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      JWT_SECRET,
      { expiresIn: '1h' }
    )
      res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
        imagePath: user.imagePath
      }
    })  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error stack:", error.stack);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: "Registration failed", 
      error: error.message,
      details: error.toString()
    });
  }
})

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Find user
    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      JWT_SECRET,
      { expiresIn: '1h' }
    )
      res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
        imagePath: user.imagePath
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Login failed", error: error.message })
  }
})

// Protected routes - require authentication
app.post("/createUser", verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name, email, password, age, role } = req.body
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = {
      name,
      email,
      password: hashedPassword,
      age,
      role: role || 'user',
      imagePath: req.file ? `/uploads/${req.file.filename}` : ""
    }
    
    const user = await UserModel.create(newUser)
    res.status(201).json(user)
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ message: "Failed to create user", error: error.message })
  }
})

app.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await UserModel.find({}, { password: 0 }) // Exclude password
    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Failed to fetch users", error: error.message })
  }
})

// Search endpoint for users
app.get("/search", verifyToken, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await UserModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }, { password: 0 }); // Exclude password

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Failed to search users", error: error.message });
  }
})

app.get('/getUser/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id
    const user = await UserModel.findById(id, { password: 0 }) // Exclude password
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ message: "Failed to fetch user", error: error.message })
  }
})

app.put('/updateUser/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, age, password, role } = req.body
    
    const updateData = { name, email, age }
    
    // Add role if provided
    if (role) {
      updateData.role = role
    }
    
    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, 10)
    }
    
    // If new image is uploaded, update image path
    if (req.file) {
      // Get the current user to see if we need to delete old image
      const currentUser = await UserModel.findById(id)
      if (currentUser.imagePath) {
        const oldImagePath = path.join(__dirname, currentUser.imagePath)
        // Delete old image if it exists
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      updateData.imagePath = `/uploads/${req.file.filename}`
    }
      // Add debugging logs
    console.log("Update data:", updateData);
    console.log("User ID:", id);
    
    try {
      const user = await UserModel.findByIdAndUpdate(
        id, 
        updateData,
        { new: true, select: '-password' } // Return updated doc without password
      )
      
      if (!user) {
        console.error("User not found for update");
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("Update successful, returning user:", user);
      res.json(user);
    } catch (dbError) {
      console.error("Database error during update:", dbError);
      return res.status(500).json({ message: "Database error during update", error: dbError.message });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
})

app.delete('/deleteUser/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id
    
    // Get user to delete their image if exists
    const user = await UserModel.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    // Delete associated image file if exists
    if (user.imagePath) {
      const imagePath = path.join(__dirname, user.imagePath)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }
    
    // Delete user from database
    const result = await UserModel.findByIdAndDelete(id)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Failed to delete user", error: error.message })
  }
})

// Start server

// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000")
})