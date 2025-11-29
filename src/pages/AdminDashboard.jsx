import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    const [selectedItemActivity, setSelectedItemActivity] = useState(null);
    const [loadingItemActivity, setLoadingItemActivity] = useState(false);

    // Activity history filtering state
    const [historyUserType, setHistoryUserType] = useState('');
    const [historyActionType, setHistoryActionType] = useState('');
    const [historyItemType, setHistoryItemType] = useState('');
    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');


    useEffect(() => {
        fetchDashboardData();
        fetchMatches();
        fetchHistory();
        fetchEmailLogs();
        fetchUsers();
    }, []);

    // Refetch history when filters change
    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [historyUserType, historyActionType, historyItemType, historyStartDate, historyEndDate]);

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
            const params = new URLSearchParams();
            if (historyUserType) params.append('userType', historyUserType);
            if (historyActionType) params.append('actionType', historyActionType);
            if (historyItemType) params.append('itemType', historyItemType);
            if (historyStartDate) params.append('startDate', historyStartDate);
            if (historyEndDate) params.append('endDate', historyEndDate);

            const response = await api.get(`/admin/history?${params.toString()}`);
            setHistory(response.data);
        } catch (error) {
            showToast('Failed to fetch activity history', 'error');
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

    const handleDeleteItem = async (id, type) => {
        if (!confirm('Are you sure you want to delete this item?  This action cannot be undone.')) return;

        try {
            await api.delete(`/admin/items/${type}/${id}`);
            showToast('Item deleted successfully', 'success');
            fetchDashboardData();
        } catch (error) {
            showToast('Failed to delete item', 'error');
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

    const handleViewItemActivity = async (itemId, itemType) => {
        try {
            setLoadingItemActivity(true);
            const response = await api.get(`/admin/activity-logs/item/${itemType}/${itemId}`);
            setSelectedItemActivity(response.data);
        } catch (error) {
            showToast('Failed to fetch item activity logs', 'error');
        } finally {
            setLoadingItemActivity(false);
        }
    };

    // Shared styles for filter inputs
    const filterInputStyle = {
        width: '100%',
        padding: '0.6rem',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#fff',
        color: '#1e293b',
        fontSize: '0.9rem',
        height: '42px' // Fixed height for alignment
    };

    const filterLabelStyle = {
        display: 'block',
        marginBottom: '0.4rem',
        fontWeight: '600',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const filterGroupStyle = {
        flex: '1 1 150px', // Adjusted min-width for better one-row fit
        minWidth: '150px'
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
                                                <td>
                                                    <Link to={`/item/lost/${item.id}`} className="text-primary hover:underline">
                                                        {item.unique_id || item.id}
                                                    </Link>
                                                    <div className="text-sm text-muted">{item.item_name}</div>
                                                </td>
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
                                                    <button
                                                        className="btn btn-sm btn-primary mr-sm"
                                                        onClick={() => handleViewItemActivity(item.id, 'lost')}
                                                        style={{ marginRight: '0.5rem' }}
                                                    >
                                                        View Activity
                                                    </button>
                                                    {item.status === 'active' && (
                                                        <button
                                                            className="btn btn-sm btn-success mr-sm"
                                                            onClick={() => handleCloseItem(item.id, 'lost')}
                                                            style={{ marginRight: '0.5rem' }}
                                                        >
                                                            Mark Recovered
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteItem(item.id, 'lost')}
                                                    >
                                                        Delete
                                                    </button>
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
                                                <td>
                                                    <Link to={`/item/found/${item.id}`} className="text-primary hover:underline">
                                                        {item.unique_id || item.id}
                                                    </Link>
                                                    <div className="text-sm text-muted">{item.item_name}</div>
                                                </td>
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
                                                    <button
                                                        className="btn btn-sm btn-primary mr-sm"
                                                        onClick={() => handleViewItemActivity(item.id, 'found')}
                                                        style={{ marginRight: '0.5rem' }}
                                                    >
                                                        View Activity
                                                    </button>
                                                    {item.status === 'active' && (
                                                        <button
                                                            className="btn btn-sm btn-success mr-sm"
                                                            onClick={() => handleCloseItem(item.id, 'found')}
                                                            style={{ marginRight: '0.5rem' }}
                                                        >
                                                            Close
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteItem(item.id, 'found')}
                                                    >
                                                        Delete
                                                    </button>
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

                            {/* Filtering and Sorting Controls - REDESIGNED */}
                            <div style={{
                                backgroundColor: 'var(--card-bg)',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                flexWrap: 'nowrap', // Changed from wrap to nowrap
                                overflowX: 'auto', // Allow horizontal scroll if items overflow
                                gap: '1rem',
                                alignItems: 'flex-end', // Aligns the button with the inputs
                                border: '1px solid var(--border)'
                            }}>
                                {/* User Type */}
                                <div style={filterGroupStyle}>
                                    <label style={filterLabelStyle}>
                                        👤 User Type
                                    </label>
                                    <select
                                        value={historyUserType}
                                        onChange={(e) => setHistoryUserType(e.target.value)}
                                        style={filterInputStyle}
                                    >
                                        <option value="">All Users</option>
                                        <option value="admin">Admin Only</option>
                                        <option value="user">Regular Users Only</option>
                                    </select>
                                </div>

                                {/* Action Type */}
                                <div style={filterGroupStyle}>
                                    <label style={filterLabelStyle}>
                                        ⚡ Action Type
                                    </label>
                                    <select
                                        value={historyActionType}
                                        onChange={(e) => setHistoryActionType(e.target.value)}
                                        style={filterInputStyle}
                                    >
                                        <option value="">All Actions</option>
                                        <option value="create_item">Create Item</option>
                                        <option value="edit_item">Edit Item</option>
                                        <option value="delete_item">Delete Item</option>
                                        <option value="recover_item">Recover Item</option>
                                        <option value="close_item">Close Item</option>
                                        <option value="ban_user">Ban User</option>
                                        <option value="unban_user">Unban User</option>
                                    </select>
                                </div>

                                {/* Item Type */}
                                <div style={filterGroupStyle}>
                                    <label style={filterLabelStyle}>
                                        📦 Item Type
                                    </label>
                                    <select
                                        value={historyItemType}
                                        onChange={(e) => setHistoryItemType(e.target.value)}
                                        style={filterInputStyle}
                                    >
                                        <option value="">All Types</option>
                                        <option value="lost">Lost Items</option>
                                        <option value="found">Found Items</option>
                                        <option value="user">User Actions</option>
                                    </select>
                                </div>

                                {/* From Date */}
                                <div style={filterGroupStyle}>
                                    <label style={filterLabelStyle}>
                                        📅 From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={historyStartDate}
                                        onChange={(e) => setHistoryStartDate(e.target.value)}
                                        style={filterInputStyle}
                                    />
                                </div>

                                {/* To Date */}
                                <div style={filterGroupStyle}>
                                    <label style={filterLabelStyle}>
                                        📅 To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={historyEndDate}
                                        onChange={(e) => setHistoryEndDate(e.target.value)}
                                        style={filterInputStyle}
                                    />
                                </div>

                                {/* Clear Filters Button */}
                                <div style={filterGroupStyle}>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => {
                                            setHistoryUserType('');
                                            setHistoryActionType('');
                                            setHistoryItemType('');
                                            setHistoryStartDate('');
                                            setHistoryEndDate('');
                                        }}
                                        style={{
                                            ...filterInputStyle,
                                            height: '42px', // Explicit height to match inputs
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            backgroundColor: '#f1f5f9',
                                            border: '1px solid #cbd5e1'
                                        }}
                                    >
                                        🔄 Clear Filters
                                    </button>
                                </div>
                            </div>

                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        < tr >
                                            <th>User/Admin</th>
                                            <th>Action</th>
                                            <th>Item</th>
                                            <th>Description</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map(log => (
                                            <tr key={log.id}>
                                                <td>
                                                    <div>{log.admin_name}</div>
                                                    {log.is_admin_action && (
                                                        <span className="badge badge-danger" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                            Admin
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="badge badge-secondary">{log.action_type}</span>
                                                </td>
                                                <td>
                                                    {log.item_unique_id ? (
                                                        <div>
                                                            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                                {log.item_unique_id}
                                                            </div>
                                                            <div className="text-sm text-muted">{log.item_name || 'N/A'}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">N/A</span>
                                                    )}
                                                </td>
                                                <td>{log.description}</td>
                                                <td>{new Date(log.created_at).toLocaleString()}</td>
                                                <td>
                                                    {log.item_id && log.item_type && (log.item_type === 'lost' || log.item_type === 'found') && (
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleViewItemActivity(log.item_id, log.item_type)}
                                                        >
                                                            View Item Activity
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div >
                    )}

                    {
                        activeTab === 'emails' && (
                            <div className="emails-section">
                                <h2>Email Logs</h2>
                                <div className="table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Recipient</th>
                                                <th>Subject</th>
                                                <th>Type</th>
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
                                                        <span className={`badge badge-${log.email_type === 'match_notification' ? 'info' :
                                                            log.is_sensitive ? 'warning' : 'secondary'
                                                            }`}>
                                                            {log.email_type === 'registration_otp' ? 'Registration OTP' :
                                                                log.email_type === 'password_reset_otp' ? 'Password Reset OTP' :
                                                                    log.email_type === 'match_notification' ? 'Match Alert' :
                                                                        'General'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${log.status === 'sent' ? 'success' : 'danger'}`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(log.sent_at).toLocaleString()}</td>
                                                    <td>
                                                        {log.is_sensitive ? (
                                                            <button
                                                                className="btn btn-sm btn-secondary"
                                                                disabled
                                                                title="OTP content is hidden for security reasons"
                                                            >
                                                                🔒 Protected
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => setSelectedLog(log)}
                                                            >
                                                                View Details
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }
                </div >

                {/* Email Details Modal */}
                {
                    selectedLog && (
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
                                        <p><strong>Type:</strong> {selectedLog.email_type === 'registration_otp' ? 'Registration OTP' :
                                            selectedLog.email_type === 'password_reset_otp' ? 'Password Reset OTP' :
                                                selectedLog.email_type === 'match_notification' ? 'Match Notification' :
                                                    'General'}</p>
                                        <p><strong>Sent At:</strong> {new Date(selectedLog.sent_at).toLocaleString()}</p>
                                        <p><strong>Status:</strong> {selectedLog.status}</p>
                                    </div>
                                    {selectedLog.is_sensitive || selectedLog.content_masked ? (
                                        <div style={{
                                            backgroundColor: '#fef3c7',
                                            borderLeft: '4px solid #f59e0b',
                                            padding: '20px',
                                            margin: '20px 0',
                                            borderRadius: '4px'
                                        }}>
                                            <h4 style={{ margin: '0 0 10px 0', color: '#92400e' }}>🔒 Security Notice</h4>
                                            <p style={{ margin: 0, color: '#92400e' }}>
                                                This email contains sensitive information (OTP verification code) and its content
                                                has been hidden for security reasons. OTP codes should never be accessible to
                                                administrators or any third party.
                                            </p>
                                            <p style={{ margin: '10px 0 0 0', fontSize: '0.9em', color: '#78350f' }}>
                                                <strong>Security Best Practice:</strong> Only the recipient should have access to
                                                one-time passwords. This follows international security standards (NIST, OWASP).
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="email-preview-frame">
                                            <div dangerouslySetInnerHTML={{ __html: selectedLog.content }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* User Profile Modal */}
                {
                    selectedUser && (
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
                    )
                }

                {/* Item Activity Modal */}
                {
                    selectedItemActivity && (
                        <div className="modal-overlay" onClick={() => setSelectedItemActivity(null)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
                                <div className="modal-header">
                                    <h3>Item Activity Log</h3>
                                    <button className="close-btn" onClick={() => setSelectedItemActivity(null)}>&times;</button>
                                </div>
                                <div className="modal-body">
                                    {/* Deleted Item Warning */}
                                    {selectedItemActivity.item.is_deleted && (
                                        <div style={{
                                            backgroundColor: '#fee2e2',
                                            borderLeft: '4px solid #dc2626',
                                            padding: '1rem',
                                            marginBottom: '1.5rem',
                                            borderRadius: '4px'
                                        }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                🗑️ This item has been deleted
                                            </h4>
                                            <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.9rem' }}>
                                                Deleted on {new Date(selectedItemActivity.item.deleted_at).toLocaleString()}
                                                {selectedItemActivity.item.deleted_by && ` by ${selectedItemActivity.item.deleted_by.full_name}`}
                                            </p>
                                        </div>
                                    )}

                                    {/* Item Details */}
                                    <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                        <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--primary)' }}>📦 Item Details</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                                    Unique ID
                                                </label>
                                                <p style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'monospace' }}>{selectedItemActivity.item.unique_id}</p>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                                    Status
                                                </label>
                                                <span className={`badge badge-${selectedItemActivity.item.status === 'deleted' ? 'danger' :
                                                    selectedItemActivity.item.status === 'active' ? 'info' : 'success'
                                                    }`}>
                                                    {selectedItemActivity.item.status}
                                                </span>
                                            </div>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                                    Item Name
                                                </label>
                                                <p style={{ margin: 0, fontSize: '1.1rem' }}>{selectedItemActivity.item.item_name}</p>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                                    Category
                                                </label>
                                                <p style={{ margin: 0 }}>{selectedItemActivity.item.category}</p>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                                    Created At
                                                </label>
                                                <p style={{ margin: 0 }}>{new Date(selectedItemActivity.item.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reporter Details */}
                                    <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                        <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--primary)' }}>👤 Posted By</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                                    Name
                                                </label>
                                                <p style={{ margin: 0, fontSize: '1.1rem' }}>{selectedItemActivity.item.reporter.full_name}</p>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                                    Email
                                                </label>
                                                <p style={{ margin: 0 }}>{selectedItemActivity.item.reporter.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Activity Timeline */}
                                    <div>
                                        <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--primary)' }}>📝 Activity Timeline</h4>
                                        {selectedItemActivity.activity_logs.length > 0 ? (
                                            <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1.5rem' }}>
                                                {selectedItemActivity.activity_logs.map((log, index) => (
                                                    <div key={log.id} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: '-1.69rem',
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            backgroundColor: log.is_admin_action ? 'var(--danger)' : 'var(--primary)',
                                                            border: '2px solid var(--bg)'
                                                        }} />
                                                        <div style={{ backgroundColor: 'var(--card-bg)', padding: '1rem', borderRadius: '8px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                                <div>
                                                                    <span className={`badge badge-${log.is_admin_action ? 'danger' : 'primary'}`} style={{ marginRight: '0.5rem' }}>
                                                                        {log.action_type}
                                                                    </span>
                                                                    {log.is_admin_action && (
                                                                        <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                                                                            Admin Action
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                                    {new Date(log.timestamp).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-primary)' }}>
                                                                {log.description}
                                                            </p>
                                                            {log.performed_by && (
                                                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                                    By: {log.performed_by.full_name} ({log.performed_by.email})
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No activity logs yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
            <Toast toasts={toasts} />
        </div >
    );
};

export default AdminDashboard;