# 📦 Lost & Found Portal

A comprehensive, secure web application designed to help university communities report and find lost items. Built with modern web technologies and a focus on user experience, security, and automated matching.

---

## 🌟 Overview

The Lost & Found Portal is a full-stack web application that facilitates the reporting and recovery of lost items within the FAST-NUCES community. The system features intelligent auto-matching, automated email notifications, comprehensive admin controls, and enterprise-grade security practices.

### Key Highlights

- ✅ **3 Development Sprints Completed** - All 35 user stories implemented
- 🔒 **Enterprise Security** - Following NIST & OWASP security standards
- 📧 **Automated Matching** - Smart email notifications for potential matches
- 👨‍💼 **Admin Dashboard** - Complete oversight and management capabilities
- 📱 **Mobile Responsive** - Works seamlessly on all devices

---

## 🎯 Features by Sprint

### Sprint 1: Core Functionality & Reporting ✅ 

**User Authentication & Registration**
- ✅ US-01: User registration with university email validation
- ✅ US-02: Secure login with JWT authentication
- ✅ US-03: University email domain enforcement (*.nu.edu.pk)
- ✅ US-04: Login to existing account
- ✅ US-05: Secure logout functionality

**Lost Item Reporting**
- ✅ US-08: Create lost item reports (name, description, location)
- ✅ US-09: Upload images to lost item reports (Cloudinary integration)
- ✅ US-10: View personal lost items list

**Found Item Reporting**
- ✅ US-14: Create found item reports (name, description, location)
- ✅ US-15: Upload images to found item reports
- ✅ US-16: View personal found items list

**Item Details**
- ✅ US-24: View detailed information for any lost or found item

### Sprint 2: Report Management & Advanced Searching ✅

**Profile Management**
- ✅ US-06: Update contact information (phone, WhatsApp)
- ✅ US-07: Password reset with OTP verification

**Lost Item Management**
- ✅ US-11: Edit active lost item reports
- ✅ US-12: Mark items as 'Recovered'
- ✅ US-13: Delete lost item reports

**Found Item Management**
- ✅ US-17: Edit found item location and details
- ✅ US-18: Delete found item reports (when returned)

**Advanced Search & Filtering**
- ✅ US-19: Search items by keyword (item name)
- ✅ US-20: Filter by category (Electronics, Textbooks, Personal Items, etc.)
- ✅ US-21: Filter by building/location (Library, CS Lawn, etc.)
- ✅ US-22: Filter by date range (last 7 days, custom dates)
- ✅ US-23: Sort reports by posting date

### Sprint 3: Admin Controls, Notifications & Polish ✅

**Admin Dashboard**
- ✅ US-25: View all active lost and found reports
- ✅ US-26: Contact reporters
- ✅ US-27: Mark items as officially 'Closed'
- ✅ US-28: Auto-suggest matching items with confidence scoring
- ✅ US-29: Ban/unban user accounts (with self-ban prevention)
- ✅ US-35: View history log of all closed/recovered reports

**Smart Notifications**
- ✅ US-30: Automated email notifications for matching items
- ✅ US-31: Confirmation messages after report submission
- ✅ US-32: Contact details visibility after admin verification
- ✅ US-33: Email notifications when items are matched

**User Experience**
- ✅ US-34: Mobile-friendly responsive forms
- ✅ Enhanced UI with modern design patterns
- ✅ Toast notifications for user actions
- ✅ Loading states and error handling

---

## 🔒 Security Features

### Industry-Standard Security Practices

1. **OTP Protection** (NEW)
   - ✅ OTP codes are **NEVER** visible to administrators
   - ✅ Email logs categorized by type (OTP vs Match Notifications)
   - ✅ Sensitive emails flagged and content masked in admin panel
   - ✅ Follows NIST and OWASP security guidelines

2. **Password Security**
   - ✅ Bcrypt hashing with salt (10 rounds)
   - ✅ Passwords never stored in plain text
   - ✅ Password reset with OTP verification
   - ✅ Old password remains valid until reset completion

3. **Authentication & Authorization**
   - ✅ JWT-based authentication
   - ✅ Role-based access control (User/Admin)
   - ✅ Protected routes with middleware
   - ✅ Token expiration handling

4. **Input Validation**
   - ✅ Email domain validation
   - ✅ Form validation on client and server
   - ✅ SQL injection prevention (MongoDB)
   - ✅ XSS protection

5. **Admin Controls**
   - ✅ Admins cannot ban themselves
   - ✅ Activity logging for all admin actions
   - ✅ Email log auditing (without exposing OTPs)

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Custom CSS** - Premium design system with CSS variables

### Backend
- **Node.js 16+** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM library
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

### Services & Tools
- **Cloudinary** - Image storage and CDN
- **Nodemailer** - Email delivery
- **Gmail SMTP** - Email service

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd LNF
   ```

2. **Install Dependencies**
   
   Install root dependencies:
   ```bash
   npm install
   ```
   
   Install server dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Environment Configuration**

   Create `.env` file in the `server` directory:
   ```env
   # Server Configuration
   PORT=5000
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/lost-and-found
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lost-and-found
   
   # JWT Secret (generate a strong random string)
   JWT_SECRET=your_super_secret_jwt_key_change_this
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your_app_specific_password
   
   # Client URL
   CLIENT_URL=http://localhost:5173
   ```

4. **Gmail App Password Setup**
   
   To send emails, you need a Gmail App Password:
   1. Go to Google Account Settings
   2. Enable 2-Factor Authentication
   3. Generate App Password: Account → Security → App Passwords
   4. Use the generated 16-character password in `EMAIL_PASS`

5. **Cloudinary Setup**
   
   For image uploads:
   1. Create account at [cloudinary.com](https://cloudinary.com)
   2. Get credentials from Dashboard
   3. Add to `.env` file

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:5000`

2. **Start the Frontend (New Terminal)**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## 📂 Project Structure

```
LNF/
├── public/                      # Static assets
├── server/                      # Backend application
│   ├── config/                  # Configuration files
│   │   └── cloudinary.js       # Cloudinary setup
│   ├── database/                # Database connection
│   │   └── db.js               
│   ├── middleware/              # Express middleware
│   │   └── auth.js             # Authentication & authorization
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js             # User model
│   │   ├── LostItem.js         # Lost item model
│   │   ├── FoundItem.js        # Found item model
│   │   ├── EmailLog.js         # Email logging with security
│   │   ├── ActivityLog.js      # Admin activity tracking
│   │   ├── OTP.js              # OTP verification
│   │   └── PasswordReset.js    # Password reset tokens
│   ├── routes/                  # API routes
│   │   ├── auth.routes.js      # Authentication endpoints
│   │   ├── user.routes.js      # User profile endpoints
│   │   ├── items.routes.js     # Lost/Found items endpoints
│   │   └── admin.routes.js     # Admin panel endpoints
│   ├── utils/                   # Utility functions
│   │   └── email.js            # Email sending with categorization
│   ├── .env                     # Environment variables (not in repo)
│   ├── server.js               # Express app entry point
│   └── package.json            
├── src/                         # Frontend application
│   ├── assets/                  # Images and styles
│   ├── components/              # Reusable React components
│   │   ├── Navbar.jsx          
│   │   ├── Footer.jsx          
│   │   └── Toast.jsx           
│   ├── context/                 # React Context
│   │   └── AuthContext.jsx     # Authentication state
│   ├── pages/                   # Page components
│   │   ├── Home.jsx            # Landing page
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration with OTP
│   │   ├── ForgotPassword.jsx  # Password reset flow
│   │   ├── Profile.jsx         # User profile
│   │   ├── ReportLost.jsx      # Report lost item
│   │   ├── ReportFound.jsx     # Report found item
│   │   ├── MyItems.jsx         # User's items
│   │   ├── Search.jsx          # Search & filter
│   │   ├── ItemDetail.jsx      # Item details
│   │   ├── AdminDashboard.jsx  # Admin panel
│   │   └── [Other pages]       
│   ├── utils/                   # Frontend utilities
│   │   └── api.js              # Axios instance
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # React entry point
├── .gitignore
├── package.json                 # Root package file
├── vite.config.ts              # Vite configuration
└── README.md                    # This file
```

---

## 🎨 Design System

The application uses a custom CSS design system with:

- **Color Palette**: Modern gradient-based theme
- **Typography**: Inter/Roboto fonts from Google Fonts
- **Components**: Buttons, cards, forms, modals, toasts
- **Responsive**: Mobile-first design approach
- **Animations**: Smooth transitions and micro-interactions

---

## 📧 Email System

### Email Types

1. **Registration OTP** 
   - Sent during account registration
   - 6-digit code, 5-minute expiration
   - ✅ **Content hidden from admins**

2. **Password Reset OTP**
   - Sent for password recovery
   - 6-digit code, 10-minute expiration
   - ✅ **Content hidden from admins**

3. **Match Notifications**
   - Sent when lost/found items match
   - Contains contact details
   - ✅ **Visible to admins for auditing**

### Email Security

- **Sensitive Emails**: OTP emails are flagged as `is_sensitive: true`
- **Content Masking**: Admin panel shows `[SENSITIVE CONTENT HIDDEN]` for OTPs
- **Audit Trail**: Metadata (recipient, subject, timestamp) is logged
- **Security Notice**: UI displays warnings when viewing masked emails

---

## 🔍 Auto-Matching Algorithm

The system automatically matches lost and found items based on:

1. **Category Match** (30 points)
2. **Keyword Similarity** in item name (20 points each)
3. **Location Proximity** (25 points)
4. **Date Proximity** within 7 days (25 points)

Items with ≥50% confidence score trigger automatic email notifications to both parties.

---

## 👨‍💼 Admin Features

### Dashboard Sections

1. **Overview**
   - Active/recovered lost items count
   - Active/closed found items count
   - Recent items list

2. **User Management**
   - View all users
   - View user profiles
   - Ban/unban users (except self)
   - Activity tracking

3. **Auto-Matches**
   - View potential matches
   - Confidence scoring
   - Side-by-side comparison

4. **Activity History**
   - All admin actions logged
   - Timestamps and descriptions
   - 50 most recent entries

5. **Email Logs**
   - All sent emails tracked
   - Email type categorization
   - ✅ **OTP content protected**
   - Match notifications viewable

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication**
- [ ] Register with valid university email
- [ ] Verify OTP within 5 minutes
- [ ] Login with correct credentials
- [ ] Logout successfully
- [ ] Reset password with OTP

**Lost Items**
- [ ] Create lost item report
- [ ] Upload image
- [ ] Edit report details
- [ ] Mark as recovered
- [ ] Delete report

**Found Items**
- [ ] Create found item report
- [ ] Upload image
- [ ] Edit location
- [ ] Delete report

**Search & Filter**
- [ ] Search by keyword
- [ ] Filter by category
- [ ] Filter by location
- [ ] Filter by date range
- [ ] Sort by date

**Admin**
- [ ] View dashboard stats
- [ ] Ban user (not self)
- [ ] View email logs
- [ ] Verify OTPs are hidden
- [ ] View match notifications
- [ ] Close items

---

## 🔧 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```
Solution: Ensure MongoDB is running
- Local: Start with `mongod` command
- Atlas: Check connection string and network access
```

**2. Email Not Sending**
```
Solution: Verify Gmail App Password
1. Check EMAIL_USER and EMAIL_PASS in .env
2. Ensure App Password is correct (not Gmail password)
3. Enable "Less secure app access" if needed
```

**3. Image Upload Fails**
```
Solution: Check Cloudinary credentials
1. Verify CLOUDINARY_* variables in .env
2. Check API key is active
3. Ensure upload preset is correct
```

**4. JWT Authentication Errors**
```
Solution: Check JWT_SECRET
1. Ensure JWT_SECRET is set in .env
2. Try logging in again
3. Clear browser localStorage
```

---

## 🚀 Deployment

### Backend Deployment (Render/Railway)

1. Create account on deployment platform
2. Connect GitHub repository
3. Set environment variables
4. Deploy backend service
5. Update frontend API URL

### Frontend Deployment (Vercel/Netlify)

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy
5. Update CORS in backend

### Database (MongoDB Atlas)

1. Create cluster
2. Configure network access
3. Get connection string
4. Update MONGODB_URI in backend

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

## 🎓 University Project

**Institution**: FAST-NUCES  
**Course**: Information Systems Engineering (ISE)  
**Project**: Lost & Found Portal  
**Academic Year**: 2024-2025

---

## 🏆 Acknowledgments

- FAST-NUCES for project guidelines
- MongoDB for database platform
- Cloudinary for image hosting
- Google for email services
- React and Node.js communities

---

**Built with 💙 by the development team**
