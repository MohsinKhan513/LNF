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

const ReportFound = () => {
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        category: '',
        locationFound: '',
        dateFound: ''
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
            formDataToSend.append('locationFound', formData.locationFound);
            formDataToSend.append('dateFound', formData.dateFound);
            if (image) {
                formDataToSend.append('image', image);
            }

            await api.post('/items/found', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Found item reported successfully!', 'success');
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
                    <h1>Report Found Item</h1>
                    <p>Help reunite someone with their lost item by reporting what you found</p>
                </div>

                <form onSubmit={handleSubmit} className="report-form">
                    <div className="form-group">
                        <label className="form-label">Item Name *</label>
                        <input
                            type="text"
                            name="itemName"
                            className="form-input"
                            placeholder="e.g., Black Wallet"
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
                            <label className="form-label">Location Found *</label>
                            <select
                                name="locationFound"
                                className="form-select"
                                value={formData.locationFound}
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
                        <label className="form-label">Date Found *</label>
                        <input
                            type="date"
                            name="dateFound"
                            className="form-input"
                            value={formData.dateFound}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload Image *</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="form-input"
                            required
                        />
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                        <small style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                            Please upload a clear image of the found item
                        </small>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Report Found Item'}
                        </button>
                    </div>
                </form>
            </div>
            <Toast toasts={toasts} />
        </div>
    );
};

export default ReportFound;
