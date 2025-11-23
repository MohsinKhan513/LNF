import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import MyItems from './pages/MyItems';
import Search from './pages/Search';
import ItemDetail from './pages/ItemDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import ForgotPassword from './pages/ForgotPassword';
import './layout.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin route wrapper
const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

function AppRoutes() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reportedItems" element={<Search />} />
                <Route path="/item/:type/:id" element={<ItemDetail />} />

                <Route path="/report-lost" element={
                    <ProtectedRoute>
                        <ReportLost />
                    </ProtectedRoute>
                } />

                <Route path="/report-found" element={
                    <ProtectedRoute>
                        <ReportFound />
                    </ProtectedRoute>
                } />

                <Route path="/my-items" element={
                    <ProtectedRoute>
                        <MyItems />
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />

                <Route path="/admin" element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                } />

                {/* Static Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
