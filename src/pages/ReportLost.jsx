import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Toast, { useToast } from '../components/Toast';
import './ReportForm.css';

const CATEGORIES = [
    'Electronics',
    'Textbooks',
    'Stationery',
    'Clothing',
    'Accessories',
    'ID Cards',
    'Keys',
    'Bags',
    'Sports Equipment',
    'Other'
];

const LOCATIONS = [
    'Main Library',
    'CS Department',
    'EE Department',
    'Management Department',
    'Cafeteria',
    'Sports Complex',
    'Parking Area',
    'Auditorium',
    'Labs',
    'Other'
];

const ReportLost = () => {
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        category: '',
        lastKnownLocation: '',
        dateLost: ''
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toasts, showToast } = useToast();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('itemName', formData.itemName);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('lastKnownLocation', formData.lastKnownLocation);
            formDataToSend.append('dateLost', formData.dateLost);
            if (image) {
                formDataToSend.append('image', image);
            }

            await api.post('/items/lost', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Lost item reported successfully!', 'success');
            setTimeout(() => navigate('/my-items'), 1500);
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to report item', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-page">
            <div className="container container-sm">
                <div className="report-header">
                    <h1>Report Lost Item</h1>
                    <p>Help us help you find your lost item by providing detailed information</p>
                </div>

                <form onSubmit={handleSubmit} className="report-form">
                    <div className="form-group">
                        <label className="form-label">Item Name *</label>
                        <input
                            type="text"
                            name="itemName"
                            className="form-input"
                            placeholder="e.g., iPhone 13 Pro"
                            value={formData.itemName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            placeholder="Provide detailed description including color, brand, distinctive features..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">Category *</label>
                            <select
                                name="category"
                                className="form-select"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Last Known Location *</label>
                            <select
                                name="lastKnownLocation"
                                className="form-select"
                                value={formData.lastKnownLocation}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select location</option>
                                {LOCATIONS.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date Lost *</label>
                        <input
                            type="date"
                            name="dateLost"
                            className="form-input"
                            value={formData.dateLost}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="form-input"
                        />
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Report Lost Item'}
                        </button>
                    </div>
                </form>
            </div>
            <Toast toasts={toasts} />
        </div>
    );
};

export default ReportLost;
