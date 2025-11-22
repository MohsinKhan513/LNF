import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Lost Something? <br />
                            <span className="gradient-text">We'll Help You Find It</span>
                        </h1>
                        <p className="hero-subtitle">
                            FAST-NUCES Lost & Found Portal - Connecting students with their belongings
                        </p>
                        <div className="hero-actions">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/report-lost" className="btn btn-primary btn-lg">
                                        Report Lost Item
                                    </Link>
                                    <Link to="/report-found" className="btn btn-outline btn-lg">
                                        Report Found Item
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Get Started
                                    </Link>
                                    <Link to="/reportedItems" className="btn btn-outline btn-lg">
                                        Browse Items
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="hero-illustration">
                        <div className="floating-card card-1">📱</div>
                        <div className="floating-card card-2">💼</div>
                        <div className="floating-card card-3">🎒</div>
                        <div className="floating-card card-4">📚</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title text-center">How It Works</h2>
                    <div className="grid grid-3">
                        <div className="feature-card">
                            <div className="feature-icon">🔍</div>
                            <h3>Search & Filter</h3>
                            <p>Easily search through lost and found items with advanced filters by category, location, and date.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📝</div>
                            <h3>Report Items</h3>
                            <p>Quickly report lost or found items with detailed descriptions and images to help with identification.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🤝</div>
                            <h3>Get Connected</h3>
                            <p>Our system helps match lost items with found items and connects you with the finder or owner.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">100+</div>
                            <div className="stat-label">Items Recovered</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Always Available</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Find Your Lost Item?</h2>
                        <p>Join hundreds of students who have successfully recovered their belongings</p>
                        <Link to={isAuthenticated ? "/reportedItems" : "/register"} className="btn btn-primary btn-lg">
                            {isAuthenticated ? "View Reported Items" : "Sign Up Now"}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
