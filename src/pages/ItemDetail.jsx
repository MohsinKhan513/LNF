import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Toast, { useToast } from '../components/Toast';
import './ItemDetail.css';

const ItemDetail = () => {
    const { type, id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toasts, showToast } = useToast();

    useEffect(() => {
        fetchItem();
    }, [type, id]);

    const fetchItem = async () => {
        try {
            const response = await api.get(`/items/${type}/${id}`);
            setItem(response.data);
        } catch (error) {
            console.error('Failed to fetch item:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this ${type} item?\n\nItem: ${item.item_name}`)) return;

        try {
            await api.delete(`/items/${type}/${id}`);
            showToast('Item deleted successfully', 'success');
            setTimeout(() => {
                navigate('/my-items');
            }, 1500);
        } catch (error) {
            showToast('Failed to delete item', 'error');
        }
    };

    const handleMarkRecovered = async () => {
        if (!confirm(`Are you sure you want to mark this item as recovered?\n\nItem: ${item.item_name}`)) return;

        try {
            await api.patch(`/items/lost/${id}/recover`);
            showToast('Item marked as recovered!', 'success');
            // Refresh the item data
            fetchItem();
        } catch (error) {
            showToast('Failed to update item', 'error');
        }
    };

    const handleMarkClosed = async () => {
        if (!confirm(`Are you sure you want to mark this found item as closed?\n\nItem: ${item.item_name}`)) return;

        try {
            await api.patch(`/items/found/${id}/close`);
            showToast('Found item marked as closed!', 'success');
            // Refresh the item data
            fetchItem();
        } catch (error) {
            showToast('Failed to update item', 'error');
        }
    };

    if (loading) {
        return (
            <div className="item-detail-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading item details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="item-detail-page">
                <div className="container">
                    <div className="empty-state">
                        <h2>Item not found</h2>
                        <button className="btn btn-primary mt-lg" onClick={() => navigate('/search')}>
                            Back to Reported Items
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const imageUrl = item.image_path?.startsWith('http')
        ? item.image_path
        : item.image_path
            ? `http://localhost:5000/uploads/${item.image_path}`
            : null;
    const location = type === 'lost' ? item.last_known_location : item.location_found;
    const date = type === 'lost' ? item.date_lost : item.date_found;

    // Check permissions
    const isOwner = user?.id === item.user_id;
    const isAdmin = user?.role === 'admin';
    const canManage = isOwner || isAdmin;

    console.log('[DEBUG] ItemDetail Permissions:', { userId: user?.id, userRole: user?.role, itemOwner: item.user_id, isOwner, isAdmin, canManage });

    return (
        <div className="item-detail-page">
            <div className="container container-sm">
                <button className="btn btn-ghost mb-lg" onClick={() => navigate(-1)}>
                    ← Back
                </button>

                <div className="item-detail-card">
                    <div className="item-detail-image">
                        {imageUrl ? (
                            <img src={imageUrl} alt={item.item_name} />
                        ) : (
                            <div className="image-placeholder">
                                <span>📦</span>
                            </div>
                        )}
                    </div>

                    <div className="item-detail-content">
                        <div className="item-detail-header">
                            <div>
                                <span className="item-type-badge">
                                    {type === 'lost' ? '🔍 Lost Item' : '✅ Found Item'}
                                </span>
                                <h1>{item.item_name}</h1>
                                <span className={`badge ${item.status === 'active' ? 'badge-info' : 'badge-success'}`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>

                        <div className="item-detail-section">
                            <h3>Description</h3>
                            <p>{item.description}</p>
                        </div>

                        <div className="item-detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Category</span>
                                <span className="detail-value">{item.category}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Location</span>
                                <span className="detail-value">{location}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Date</span>
                                <span className="detail-value">{new Date(date).toLocaleDateString()}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Posted</span>
                                <span className="detail-value">{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="item-detail-section">
                            <h3>Contact Information</h3>
                            <div className="contact-info">
                                <div className="contact-item">
                                    <span className="contact-label">Name:</span>
                                    <span className="contact-value">{item.full_name}</span>
                                </div>
                                <div className="contact-item">
                                    <span className="contact-label">Email:</span>
                                    <span className="contact-value">{item.email}</span>
                                </div>
                                {item.phone_number && (
                                    <div className="contact-item">
                                        <span className="contact-label">Phone:</span>
                                        <span className="contact-value">{item.phone_number}</span>
                                    </div>
                                )}
                                {item.whatsapp_number && (
                                    <div className="contact-item">
                                        <span className="contact-label">WhatsApp:</span>
                                        <span className="contact-value">{item.whatsapp_number}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {canManage && (
                            <div className="item-detail-section">
                                <h3>Manage This Item</h3>
                                <p style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>
                                    {isOwner
                                        ? "You are viewing your own report. You can manage it using the buttons below."
                                        : "Admin Control: You can manage this user's report."}
                                </p>
                                <div className="item-actions" style={{ gap: '0.75rem', display: 'flex' }}>
                                    {type === 'lost' && item.status === 'active' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleMarkRecovered}
                                        >
                                            ✓ Mark as Recovered
                                        </button>
                                    )}
                                    {type === 'found' && item.status === 'active' && (
                                        <button
                                            className="btn btn-success"
                                            onClick={handleMarkClosed}
                                        >
                                            ✓ Mark as Closed
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleDelete}
                                    >
                                        🗑 Delete Report
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Toast toasts={toasts} />
        </div>
    );
};

export default ItemDetail;
