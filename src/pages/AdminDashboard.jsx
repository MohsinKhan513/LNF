import { useState, useEffect } from 'react';
import api from '../utils/api';
import Toast, { useToast } from '../components/Toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        activeLost: 0,
        activeFound: 0,
        recovered: 0,
        closed: 0
    });
    const [recentLost, setRecentLost] = useState([]);
    const [recentFound, setRecentFound] = useState([]);
    const [matches, setMatches] = useState([]);
    const [history, setHistory] = useState([]);
    const [emailLogs, setEmailLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const { toasts, showToast } = useToast();

    const [selectedLog, setSelectedLog] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewingUserProfile, setViewingUserProfile] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        fetchMatches();
        fetchHistory();
        fetchEmailLogs();
        fetchUsers();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/admin/dashboard');
            setStats(response.data.stats);
            setRecentLost(response.data.recentLost);
            setRecentFound(response.data.recentFound);
        } catch (error) {
            showToast('Failed to fetch dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMatches = async () => {
        try {
            const response = await api.get('/admin/matches');
            setMatches(response.data);
        } catch (error) {
            console.error('Failed to fetch matches');
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await api.get('/admin/history');
            setHistory(response.data);
        } catch (error) {
            console.error('Failed to fetch history');
        }
    };

    const fetchEmailLogs = async () => {
        try {
            const response = await api.get('/admin/email-logs');
            setEmailLogs(response.data);
        } catch (error) {
            console.error('Failed to fetch email logs');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users');
        }
    };

    const handleCloseItem = async (id, type) => {
        if (!confirm('Are you sure you want to close this item?')) return;

        try {
            await api.patch(`/admin/close/${type}/${id}`);
            showToast('Item closed successfully', 'success');
            fetchDashboardData();
        } catch (error) {
            showToast('Failed to close item', 'error');
        }
    };

    const handleBanUser = async (userId) => {
        if (!confirm('Are you sure you want to ban this user?')) return;

        try {
            await api.post(`/admin/ban/${userId}`);
            showToast('User banned successfully', 'success');
            fetchUsers(); // Refresh users list
            fetchDashboardData(); // Refresh recent items
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to ban user', 'error');
        }
    };

    const handleUnbanUser = async (userId) => {
        if (!confirm('Are you sure you want to unban this user?')) return;

        try {
            await api.post(`/admin/unban/${userId}`);
            showToast('User unbanned successfully', 'success');
            fetchUsers(); // Refresh users list
            fetchDashboardData(); // Refresh recent items
        } catch (error) {
            showToast('Failed to unban user', 'error');
        }
    };

    const handleViewUserProfile = async (userId) => {
        try {
            setViewingUserProfile(true);
            const response = await api.get(`/admin/users/${userId}`);
            setSelectedUser(response.data);
        } catch (error) {
            showToast('Failed to fetch user profile', 'error');
        } finally {
            setViewingUserProfile(false);
        }
    };



    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <div className="admin-actions">
                        <button className="btn btn-outline" onClick={() => {
                            fetchDashboardData();
                            fetchMatches();
                            fetchHistory();
                            fetchEmailLogs();
                            fetchUsers();
                        }}>
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.activeLost}</div>
                        <div className="stat-label">Active Lost Items</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.activeFound}</div>
                        <div className="stat-label">Active Found Items</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.recovered}</div>
                        <div className="stat-label">Recovered Items</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.closed}</div>
                        <div className="stat-label">Closed Found Items</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
                        onClick={() => setActiveTab('matches')}
                    >
                        Auto-Matches
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Activity History
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'emails' ? 'active' : ''}`}
                        onClick={() => setActiveTab('emails')}
                    >
                        Email Logs
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="overview-section">
                            <div className="section-header">
                                <h2>Recent Lost Items</h2>
                            </div>
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>User</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentLost.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.item_name}</td>
                                                <td>
                                                    <div>{item.full_name}</div>
                                                    <div className="text-sm text-muted">{item.email}</div>
                                                </td>
                                                <td>{new Date(item.date_lost).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge badge-${item.status === 'active' ? 'info' : 'success'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {item.user_role !== 'admin' && (
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleBanUser(item.user_id)}
                                                            disabled={!item.user_id || item.user_status === 'banned'}
                                                            title={!item.user_id ? "User not available" : (item.user_status === 'banned' ? "User already banned" : "Ban User")}
                                                        >
                                                            {item.user_status === 'banned' ? 'Banned' : 'Ban User'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="section-header mt-xl">
                                <h2>Recent Found Items</h2>
                            </div>
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>User</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentFound.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.item_name}</td>
                                                <td>
                                                    <div>{item.full_name}</div>
                                                    <div className="text-sm text-muted">{item.email}</div>
                                                </td>
                                                <td>{new Date(item.date_found).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge badge-${item.status === 'active' ? 'info' : 'success'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {item.status === 'active' && (
                                                        <button
                                                            className="btn btn-sm btn-success mr-sm"
                                                            onClick={() => handleCloseItem(item.id, 'found')}
                                                        >
                                                            Close
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="users-section">
                            <h2>User Management</h2>
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Joined Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user._id}>
                                                <td>{user.full_name}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`badge badge-${user.role === 'admin' ? 'primary' : 'secondary'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-${user.status === 'active' ? 'success' : 'danger'}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary mr-sm"
                                                        onClick={() => handleViewUserProfile(user._id)}
                                                        style={{ marginRight: '0.5rem' }}
                                                    >
                                                        View Profile
                                                    </button>
                                                    {user.role !== 'admin' && (
                                                        user.status === 'active' ? (
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleBanUser(user._id)}
                                                            >
                                                                Ban User
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleUnbanUser(user._id)}
                                                            >
                                                                Unban User
                                                            </button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'matches' && (
                        <div className="matches-section">
                            <h2>Potential Matches</h2>
                            <p className="mb-lg text-muted">
                                Items that share similar characteristics (name, category, location, date).
                            </p>

                            {matches.length > 0 ? (
                                <div className="matches-grid">
                                    {matches.map((match, index) => (
                                        <div key={index} className="match-card">
                                            <div className="match-header">
                                                <span className="match-score">
                                                    {Math.round(match.confidenceScore)}% Match
                                                </span>
                                            </div>
                                            <div className="match-content">
                                                <div className="match-side">
                                                    <h4>Lost Item</h4>
                                                    <p><strong>{match.lostItem.item_name}</strong></p>
                                                    <p className="text-sm">{match.lostItem.last_known_location}</p>
                                                    <p className="text-sm">{new Date(match.lostItem.date_lost).toLocaleDateString()}</p>
                                                </div>
                                                <div className="match-divider">↔️</div>
                                                <div className="match-side">
                                                    <h4>Found Item</h4>
                                                    <p><strong>{match.foundItem.item_name}</strong></p>
                                                    <p className="text-sm">{match.foundItem.location_found}</p>
                                                    <p className="text-sm">{new Date(match.foundItem.date_found).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No potential matches found at the moment.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="history-section">
                            <h2>Activity History</h2>
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Admin</th>
                                            <th>Action</th>
                                            <th>Description</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map(log => (
                                            <tr key={log.id}>
                                                <td>{log.admin_name}</td>
                                                <td>
                                                    <span className="badge badge-secondary">{log.action_type}</span>
                                                </td>
                                                <td>{log.description}</td>
                                                <td>{new Date(log.created_at).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'emails' && (
                        <div className="emails-section">
                            <h2>Email Logs</h2>
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Recipient</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Sent At</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {emailLogs.map(log => (
                                            <tr key={log._id}>
                                                <td>
                                                    <div>{log.recipient_name}</div>
                                                    <div className="text-sm text-muted">{log.recipient_email}</div>
                                                </td>
                                                <td>{log.subject}</td>
                                                <td>
                                                    <span className={`badge badge-${log.status === 'sent' ? 'success' : 'danger'}`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(log.sent_at).toLocaleString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => setSelectedLog(log)}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Email Details Modal */}
                {selectedLog && (
                    <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
                        <div className="modal-content email-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Email Details</h3>
                                <button className="close-btn" onClick={() => setSelectedLog(null)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="email-meta">
                                    <p><strong>To:</strong> {selectedLog.recipient_name} ({selectedLog.recipient_email})</p>
                                    <p><strong>Subject:</strong> {selectedLog.subject}</p>
                                    <p><strong>Sent At:</strong> {new Date(selectedLog.sent_at).toLocaleString()}</p>
                                    <p><strong>Status:</strong> {selectedLog.status}</p>
                                </div>
                                <div className="email-preview-frame">
                                    <div dangerouslySetInnerHTML={{ __html: selectedLog.content }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Profile Modal */}
                {selectedUser && (
                    <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                            <div className="modal-header">
                                <h3>User Profile</h3>
                                <button className="close-btn" onClick={() => setSelectedUser(null)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                            Full Name
                                        </label>
                                        <p style={{ margin: 0, fontSize: '1.1rem' }}>{selectedUser.full_name}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                            Email
                                        </label>
                                        <p style={{ margin: 0, fontSize: '1.1rem' }}>{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                            Phone Number
                                        </label>
                                        <p style={{ margin: 0, fontSize: '1.1rem' }}>
                                            {selectedUser.phone_number || 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                            WhatsApp Number
                                        </label>
                                        <p style={{ margin: 0, fontSize: '1.1rem' }}>
                                            {selectedUser.whatsapp_number || 'Not provided'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                                Role
                                            </label>
                                            <span className={`badge badge-${selectedUser.role === 'admin' ? 'primary' : 'secondary'}`}>
                                                {selectedUser.role}
                                            </span>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                                Status
                                            </label>
                                            <span className={`badge badge-${selectedUser.status === 'active' ? 'success' : 'danger'}`}>
                                                {selectedUser.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                            Joined Date
                                        </label>
                                        <p style={{ margin: 0, fontSize: '1.1rem' }}>
                                            {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Toast toasts={toasts} />
        </div>
    );
};

export default AdminDashboard;
