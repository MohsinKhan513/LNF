# 🔍 Lost & Found Portal

A modern, secure, and user-friendly web application for university students to report and recover lost items. Built with the MERN stack (MongoDB, Express, React, Node.js).

## ✨ Key Features

### 👤 User Features
- **Secure Authentication**: Email-based OTP verification for signup and password reset.
- **Report Items**: Easily report lost or found items with image uploads.
- **Smart Matching**: Auto-match system suggests potential matches based on item details.
- **Privacy First**: Contact details are protected; communication is facilitated securely.
- **My Items**: Manage your reported items (edit, delete, mark as recovered).

### 🛡️ Admin Features
- **Dashboard**: Comprehensive overview of system stats (active items, recovered, users).
- **Activity Logs**: Detailed audit trail of all actions (item creation, deletion, status changes).
- **User Management**: View user profiles, ban/unban users.
- **Item Management**: Delete inappropriate posts, mark items as recovered/closed.
- **Email Logs**: Track all system emails (OTPs, notifications) with security masking.

## 🚀 Tech Stack

- **Frontend**: React, Vite, CSS3 (Modern UI/UX)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Image Storage**: Cloudinary
- **Email Service**: Nodemailer (Gmail SMTP)
- **Security**: JWT Authentication, BCrypt, OTP Verification

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohsinKhan513/LNF.git
   cd LNF
   ```

2. **Install Dependencies**
   ```bash
   # Install both frontend and backend dependencies
   npm run install:all
   ```

3. **Environment Configuration**
   Create a `.env` file in the `server/` directory with the following credentials:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   
   # Cloudinary (Image Uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email Service
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   
   # Domain
   UNIVERSITY_DOMAIN=example.edu.pk
   ```

4. **Run the Application**
   ```bash
   # Run both frontend and backend concurrently
   npm run dev:all
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## 📝 API Documentation

### Items
- `GET /api/items/lost` - Get all lost items
- `GET /api/items/found` - Get all found items
- `POST /api/items/lost` - Report a lost item
- `POST /api/items/found` - Report a found item

### Admin
- `GET /api/admin/dashboard` - Get system stats
- `GET /api/admin/activity-logs` - View system activity
- `DELETE /api/admin/items/:type/:id` - Delete an item
- `POST /api/admin/ban/:userId` - Ban a user

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
