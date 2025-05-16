import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import './Users.css'

function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()
    
    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, navigate])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const result = await axios.get('http://localhost:3000/users')
            console.log("Users loaded:", result.data)
            setUsers(result.data)
            setLoading(false)
        } catch (err) {
            console.error("Error loading users:", err)
            setError("Failed to load users. Please try again.")
            setLoading(false)
        }
    }

    const searchUsers = async () => {
        if (!searchQuery.trim()) {
            fetchUsers()
            return
        }
        
        setIsSearching(true)
        try {
            const result = await axios.get(`http://localhost:3000/search?query=${searchQuery}`)
            console.log("Search results:", result.data)
            setUsers(result.data)
        } catch (err) {
            console.error("Error searching users:", err)
            setError("Failed to search users. Please try again.")
        } finally {
            setIsSearching(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        searchUsers()
    }

    const clearSearch = () => {
        setSearchQuery('')
        fetchUsers()
    }

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers()
        }
    }, [isAuthenticated])

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const res = await axios.delete(`http://localhost:3000/deleteUser/${id}`)
                console.log("User deleted:", res.data)
                fetchUsers()
            } catch (err) {
                console.error("Error deleting user:", err)
                setError("Failed to delete user. Please try again.")
            }
        }
    }
    
    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    if (!isAuthenticated) return null
    if (loading) return <div className="users-container"><p>Loading users...</p></div>
    if (error) return <div className="users-container"><div className="error-message">{error}</div></div>

    return (
        <div className='users-container'>
            <div className="header-section">
                <h2 className="users-title">User Management</h2>
                <div className="user-controls">
                    <span className="welcome-message">Welcome, {user?.name || 'User'}</span>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </div>
            
            <div className="action-bar">
                <Link to="/create" className="add-button">Add New User</Link>
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search by name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button" disabled={isSearching}>
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                    {searchQuery && (
                        <button type="button" onClick={clearSearch} className="clear-button">
                            Clear
                        </button>
                    )}
                </form>
            </div>
            
            {users.length === 0 ? (
                <div className="no-users">
                    {searchQuery ? 'No users found matching your search.' : 'No users found. Add some users to get started.'}
                </div>
            ) : (
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Profile</th>                            <th>Name</th>
                            <th>Email</th>
                            <th>Age</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="user-image-cell">
                                    {user.imagePath ? (
                                        <img 
                                            src={`http://localhost:3000${user.imagePath}`} 
                                            alt={user.name} 
                                            className="user-image"
                                        />
                                    ) : (
                                        <div className="user-image-placeholder">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </td>                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.age}</td>
                                <td><span className={`role-badge ${user.role || 'user'}`}>{user.role || 'user'}</span></td>
                                <td className="action-buttons">
                                    <Link to={`/update/${user._id}`} className="edit-button">Edit</Link>
                                    <button 
                                        className="delete-button"
                                        onClick={() => handleDelete(user._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>    )
}

export default Users