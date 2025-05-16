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
    const { name, email, password, age } = req.body
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      age,
      imagePath: req.file ? `/uploads/${req.file.filename}` : ""
    }
    
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
        imagePath: user.imagePath
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Registration failed", error: error.message })
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
    const { name, email, password, age } = req.body
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = {
      name,
      email,
      password: hashedPassword,
      age,
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
    const { name, email, age, password } = req.body
    
    const updateData = { name, email, age }
    
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
    
    const user = await UserModel.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, select: '-password' } // Return updated doc without password
    )
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    res.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ message: "Failed to update user", error: error.message })
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
app.listen(3000, () => {
    console.log("Server is running on port 3000")
})