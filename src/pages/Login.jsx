import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast, { useToast } from '../components/Toast';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toasts, showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            showToast('Login successful!', 'success');
            navigate('/');
        } catch (error) {
            showToast(error.response?.data?.error || 'Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">University Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="your.name@isb.nu.edu.pk"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                            <Link to="/forgot-password" style={{ color: 'var(--primary-500)', fontSize: 'var(--font-size-sm)', textDecoration: 'none' }}>
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Don't have an account? <Link to="/register">Sign up</Link></p>
                    </div>
                </div>
            </div>
            <Toast toasts={toasts} />
        </div>
    );
};

export default Login;
