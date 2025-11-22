import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';
import Toast, { useToast } from '../components/Toast';
import './Search.css';

const Search = () => {
    const [activeType, setActiveType] = useState('all'); // 'all', 'lost', 'found'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        keyword: '',
        category: '',
        location: '',
        dateFrom: '',
        dateTo: '',
        sort: 'newest'
    });
    const { toasts, showToast } = useToast();

    useEffect(() => {
        fetchItems();
    }, [activeType, filters]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = {
                keyword: filters.keyword,
                category: filters.category,
                location: filters.location,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
                sort: filters.sort
            };

            let allItems = [];

            if (activeType === 'all' || activeType === 'lost') {
                const lostResponse = await api.get('/items/lost', { params });
                const lostItems = lostResponse.data.map(item => ({ ...item, type: 'lost' }));
                allItems = [...allItems, ...lostItems];
            }

            if (activeType === 'all' || activeType === 'found') {
                const foundResponse = await api.get('/items/found', { params });
                const foundItems = foundResponse.data.map(item => ({ ...item, type: 'found' }));
                allItems = [...allItems, ...foundItems];
            }

            // Sort combined items by date
            allItems.sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return filters.sort === 'oldest' ? dateA - dateB : dateB - dateA;
            });

            setItems(allItems);
        } catch (error) {
            showToast('Failed to fetch items', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchItems();
    };

    const clearFilters = () => {
        setFilters({
            keyword: '',
            category: '',
            location: '',
            dateFrom: '',
            dateTo: '',
            sort: 'newest'
        });
    };

    return (
        <div className="search-page">
            <div className="container">
                <div className="search-header">
                    <h1>Reported Items</h1>
                    <p>Browse all lost and found items</p>
                </div>

                {/* Type Filter Buttons */}
                <div className="type-tabs">
                    <button
                        className={`type-tab ${activeType === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveType('all')}
                    >
                        All Items ({items.length})
                    </button>
                    <button
                        className={`type-tab ${activeType === 'lost' ? 'active' : ''}`}
                        onClick={() => setActiveType('lost')}
                    >
                        Lost Items
                    </button>
                    <button
                        className={`type-tab ${activeType === 'found' ? 'active' : ''}`}
                        onClick={() => setActiveType('found')}
                    >
                        Found Items
                    </button>
                </div>

                {/* Search and Filters */}
                <form onSubmit={handleSearch} className="search-filters">
                    <div className="filter-row">
                        <input
                            type="text"
                            name="keyword"
                            className="form-input"
                            placeholder="Search by keyword..."
                            value={filters.keyword}
                            onChange={handleFilterChange}
                        />
                        <button type="submit" className="btn btn-primary">Search</button>
                    </div>

                    <div className="filter-grid">
                        <select
                            name="category"
                            className="form-select"
                            value={filters.category}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Categories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Documents">Documents</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Books">Books</option>
                            <option value="Keys">Keys</option>
                            <option value="Other">Other</option>
                        </select>

                        <input
                            type="text"
                            name="location"
                            className="form-input"
                            placeholder="Location..."
                            value={filters.location}
                            onChange={handleFilterChange}
                        />

                        <input
                            type="date"
                            name="dateFrom"
                            className="form-input"
                            value={filters.dateFrom}
                            onChange={handleFilterChange}
                        />

                        <input
                            type="date"
                            name="dateTo"
                            className="form-input"
                            value={filters.dateTo}
                            onChange={handleFilterChange}
                        />

                        <select
                            name="sort"
                            className="form-select"
                            value={filters.sort}
                            onChange={handleFilterChange}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>

                        <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                </form>

                {/* Items Grid */}
                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: '300px' }}>
                        <div className="spinner"></div>
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-4">
                        {items.map((item) => (
                            <ItemCard
                                key={`${item.type}-${item.id}`}
                                item={item}
                                type={item.type}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>No items found</h3>
                        <p>Try adjusting your filters or search terms</p>
                    </div>
                )}
            </div>
            <Toast toasts={toasts} />
        </div>
    );
};

export default Search;
