import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';
import Toast, { useToast } from '../components/Toast';
import './MyItems.css';

const MyItems = () => {
    const [activeType, setActiveType] = useState('all'); // 'all', 'lost', 'found'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toasts, showToast } = useToast();

    useEffect(() => {
        fetchMyItems();
    }, [activeType]);

    const fetchMyItems = async () => {
        setLoading(true);
        try {
            let allItems = [];

            if (activeType === 'all' || activeType === 'lost') {
                const lostResponse = await api.get('/items/lost/my');
                const lostItems = lostResponse.data.map(item => ({ ...item, type: 'lost' }));
                allItems = [...allItems, ...lostItems];
            }

            if (activeType === 'all' || activeType === 'found') {
                const foundResponse = await api.get('/items/found/my');
                const foundItems = foundResponse.data.map(item => ({ ...item, type: 'found' }));
                allItems = [...allItems, ...foundItems];
            }

            // Sort by date (newest first)
            allItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setItems(allItems);
        } catch (error) {
            showToast('Failed to fetch your items', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, type) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await api.delete(`/items/${type}/${id}`);
            showToast('Item deleted successfully', 'success');
            fetchMyItems();
        } catch (error) {
            showToast('Failed to delete item', 'error');
        }
    };

    const handleMarkRecovered = async (id) => {
        try {
            await api.patch(`/items/lost/${id}/recover`);
            showToast('Item marked as recovered!', 'success');
            fetchMyItems();
        } catch (error) {
            showToast('Failed to update item', 'error');
        }
    };

    return (
        <div className="my-items-page">
            <div className="container">
                <div className="my-items-header">
                    <h1>My Items</h1>
                    <div className="header-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/report-lost')}>
                            Report Lost Item
                        </button>
                        <button className="btn btn-outline" onClick={() => navigate('/report-found')}>
                            Report Found Item
                        </button>
                    </div>
                </div>

                <div className="my-items-tabs">
                    <button
                        className={`tab-button ${activeType === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveType('all')}
                    >
                        All Items
                    </button>
                    <button
                        className={`tab-button ${activeType === 'lost' ? 'active' : ''}`}
                        onClick={() => setActiveType('lost')}
                    >
                        My Lost Items
                    </button>
                    <button
                        className={`tab-button ${activeType === 'found' ? 'active' : ''}`}
                        onClick={() => setActiveType('found')}
                    >
                        My Found Items
                    </button>
                </div>

                <div className="my-items-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your items...</p>
                        </div>
                    ) : items.length > 0 ? (
                        <div className="grid grid-4">
                            {items.map(item => (
                                <div key={`${item.type}-${item.id}`} className="my-item-card-wrapper">
                                    <ItemCard item={item} type={item.type} />
                                    <div className="item-actions">
                                        {item.type === 'lost' && item.status === 'active' && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleMarkRecovered(item.id)}
                                            >
                                                Mark as Recovered
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => handleDelete(item.id, item.type)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <h3>No items found</h3>
                            <p>You haven't reported any items yet.</p>
                        </div>
                    )}
                </div>
            </div>
            <Toast toasts={toasts} />
        </div>
    );
};

export default MyItems;
