import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from './context/AuthContext'
import './CreateUser.css'

function CreateUser() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [image, setImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const { token } = useAuth()
  const navigate = useNavigate()
  
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const Submit = async (e) => {
    e.preventDefault()
    

    if (!name || !email || !password || !age) {
      setError("All fields are required")
      return
    }
    
    setLoading(true)
    
    try {
      // Create form data to handle file upload
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('age', age)
      // just for adding picture to the backend and displaying in the main page
      if (image) {
        formData.append('image', image)
      }
      
      const response = await axios.post(
        'http://localhost:3000/createUser', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      console.log("User created successfully:", response.data)
      navigate('/')
    } catch (err) {
      console.error("Error creating user:", err)
      setError(err.response?.data?.message || "Failed to create user. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="create-container">
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={Submit}>
        <h2 className="create-title">Add User</h2>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            className="form-control" 
            name="name" 
            id="name" 
            placeholder="Enter name" 
            onChange={(e) => setName(e.target.value)} 
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            className="form-control" 
            name="email" 
            id="email" 
            placeholder="Enter email" 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            className="form-control" 
            name="password" 
            id="password" 
            placeholder="Enter password" 
            onChange={(e) => setPassword(e.target.value)} 
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input 
            type="number" 
            className="form-control" 
            name="age" 
            id="age" 
            placeholder="Enter age" 
            onChange={(e) => setAge(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Profile Image</label>
          <input 
            type="file" 
            className="form-control" 
            name="image" 
            id="image" 
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          />
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
        </div>
        <button 
          type="submit" 
          className="create-button"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

export default CreateUser