# 📦 Lost & Found Portal (ISE Final Draft)

A modern, responsive web application designed to help users report and find lost items. Built with a focus on user experience, the portal facilitates the matching of lost and found items within the FAST-NUCES community (and beyond) through automated email notifications and an intuitive interface.

## ✨ Features

- **User Authentication**: Secure Sign Up, Login, and Forgot Password flows with OTP verification.
- **Report Lost Items**: Users can report lost items with detailed descriptions, categories, locations, and images.
- **Report Found Items**: Users can report found items, helping to reunite them with their owners.
- **Auto-Matching System**: Intelligent backend logic to automatically match lost and found reports based on item details.
- **Email Notifications**: Automated email alerts sent to both parties when a potential match is found.
- **Admin Dashboard**: Comprehensive dashboard for administrators to manage users, view reports, and monitor system activity (including email logs).
- **Search & Filter**: Easy-to-use search functionality to browse lost and found items.
- **Responsive Design**: Fully responsive interface that works seamlessly on desktop, tablet, and mobile devices.
- **Secure Image Uploads**: Integration with Cloudinary for optimized and secure image storage.

## 🛠️ Tech Stack

### Frontend
- **React**: UI library for building interactive user interfaces.
- **Vite**: Next-generation frontend tooling for fast builds.
- **Vanilla CSS**: Custom-built design system with CSS variables for a premium, consistent look.
- **React Router DOM**: For seamless client-side navigation.
- **Axios**: For making HTTP requests to the backend.

### Backend
- **Node.js**: JavaScript runtime for the server environment.
- **Express**: Web framework for building the REST API.
- **MongoDB**: NoSQL database for storing user and item data.
- **Mongoose**: ODM library for MongoDB object modeling.
- **Nodemailer**: For sending transactional emails (OTP, Notifications).
- **Cloudinary**: Cloud service for image management and transformation.
- **JWT (JSON Web Tokens)**: For secure user authentication.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (Local instance or Atlas connection string)
- **Cloudinary Account** (for image uploads)
- **Gmail Account** (for sending emails via Nodemailer)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LNF
   ```

2. **Install Dependencies**
   This project has a root `package.json` that manages scripts for both client and server. You can install all dependencies with one command:
   ```bash
   npm run install:all
   ```
   *Alternatively, you can install them separately:*
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the `server` directory (`server/.env`) and add the following variables:

   ```env
   # Server Configuration
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lost-and-found # Or your Atlas URI
   
   # JWT Authentication
   JWT_SECRET=your_super_secret_jwt_key
   
   # Cloudinary Configuration (for images)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email Configuration (Gmail SMTP)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   
   # Client URL (for email links)
   CLIENT_URL=http://localhost:5173
   ```

### Running the Application

To run both the frontend and backend concurrently (recommended for development):

```bash
npm run dev:all
```

This will start:
- **Frontend** on `http://localhost:5173`
- **Backend** on `http://localhost:5000`

#### Other Scripts
- `npm run dev`: Run only the frontend.
- `npm run server`: Run only the backend.
- `npm run server:dev`: Run the backend with Nodemon (auto-restart on changes).

## 📂 Project Structure

```
LNF/
├── public/              # Static assets
├── server/              # Backend code
│   ├── config/          # Configuration files (Cloudinary, etc.)
│   ├── database/        # Database connection logic
│   ├── middleware/      # Auth and other middleware
│   ├── models/          # Mongoose models (User, Item, EmailLog)
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions (Email, etc.)
│   └── server.js        # Entry point for the backend
├── src/                 # Frontend code
│   ├── assets/          # Images and styles
│   ├── components/      # Reusable React components
│   ├── context/         # React Context (Auth, etc.)
│   ├── pages/           # Page components (Login, Home, Dashboard)
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Entry point for React
├── index.html           # HTML template
└── package.json         # Root scripts and dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request