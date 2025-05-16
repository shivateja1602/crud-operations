import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './context/AuthContext'
import './UpdateUser.css'

function UpdateUser() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [image, setImage] = useState(null)
  const [currentImagePath, setCurrentImagePath] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useAuth()
  
  useEffect(() => {
    console.log("Fetching user with ID:", id)
    const fetchUserData = async () => {
      try {
        const result = await axios.get(`http://localhost:3000/getUser/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        console.log("User data received:", result.data)
        setName(result.data.name)
        setEmail(result.data.email)
        setAge(result.data.age)
        
        if (result.data.imagePath) {
          setCurrentImagePath(result.data.imagePath)
          setPreviewUrl(`http://localhost:3000${result.data.imagePath}`)
        }
        
        setLoading(false)
      } catch (err) {
        console.error("Error fetching user:", err)
        setError("Failed to load user data. Please try again.")
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [id, token])
  
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const Update = async (e) => {
    e.preventDefault()
    
    if (!name || !email || !age) {
      setError("Name, email and age are required")
      return
    }
    
    setUpdating(true)
    
    try {
      // Create form data to handle file upload
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('age', age)
      
      // Only include password if it was changed
      if (password) {
        formData.append('password', password)
      }
      
      // Only include image if a new one was selected
      if (image) {
        formData.append('image', image)
      }
      
      const response = await axios.put(
        `http://localhost:3000/updateUser/${id}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      console.log("Update successful:", response.data)
      navigate('/')
    } catch (err) {
      console.error("Update failed:", err)
      setError(err.response?.data?.message || "Failed to update user. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="update-container"><p>Loading user data...</p></div>
  if (error) return <div className="update-container"><p className="error-message">{error}</p></div>

  return (
    <div className="update-container">
      <form onSubmit={Update}>
        <h2 className="update-title">Update User</h2>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            className="form-control"
            name="name" 
            id="name" 
            placeholder="Enter name" 
            value={name || ''} 
            onChange={(e) => setName(e.target.value)} 
            disabled={updating}
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
            value={email || ''} 
            onChange={(e) => setEmail(e.target.value)}
            disabled={updating}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password (leave blank to keep current)</label>
          <input 
            type="password" 
            className="form-control"
            name="password" 
            id="password" 
            placeholder="Enter new password" 
            value={password || ''} 
            onChange={(e) => setPassword(e.target.value)}
            disabled={updating}
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
            value={age || ''} 
            onChange={(e) => setAge(e.target.value)}
            disabled={updating}
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
            disabled={updating}
          />
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="User profile" />
            </div>
          )}
        </div>
        <button 
          type="submit" 
          className="update-button"
          disabled={updating}
        >
          {updating ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  )
}

export default UpdateUser