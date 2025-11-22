import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-logo">
                        <div className="logo-icon">📦</div>
                        <span className="logo-text">Lost & Found</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="navbar-links">
                        <NavLink to="/" className="nav-link">Home</NavLink>
                        <NavLink to="/reportedItems" className="nav-link">Reported Items</NavLink>

                        {isAuthenticated ? (
                            <>
                                <NavLink to="/report-lost" className="nav-link">Report Lost</NavLink>
                                <NavLink to="/report-found" className="nav-link">Report Found</NavLink>
                                <NavLink to="/my-items" className="nav-link">My Items</NavLink>
                                {isAdmin && <NavLink to="/admin" className="nav-link admin-link">Admin</NavLink>}

                                <div className="nav-user-menu">
                                    <button className="user-button">
                                        <div className="user-avatar">{user?.fullName?.charAt(0) || 'U'}</div>
                                        <span>{user?.fullName}</span>
                                    </button>
                                    <div className="user-dropdown">
                                        <Link to="/profile" className="dropdown-item">Profile</Link>
                                        <button onClick={handleLogout} className="dropdown-item">Logout</button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <Link to="/reportedItems" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                            Reported Items
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/report-lost" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    Report Lost
                                </Link>
                                <Link to="/report-found" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    Report Found
                                </Link>
                                <Link to="/my-items" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    My Items
                                </Link>
                                {isAdmin && (
                                    <Link to="/admin" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                        Admin Dashboard
                                    </Link>
                                )}
                                <Link to="/profile" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    Profile
                                </Link>
                                <button onClick={handleLogout} className="mobile-link">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link to="/register" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
