import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './ItemDetail.css';

const ItemDetail = () => {
    const { type, id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

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
    const isOwner = user?.id === item.user_id;

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

                        {isOwner && (
                            <div className="item-actions">
                                <button className="btn btn-secondary" onClick={() => navigate(`/my-items`)}>
                                    Manage in My Items
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;
