# URL Shortener App (MERN Stack)

A full-stack URL shortener application built with MongoDB, Express.js, React, and Node.js.

## Features

### User Features
- Shorten long URLs with a single click
- Get shortened URLs that redirect to original links
- Copy shortened URLs to clipboard
- Responsive design for mobile and desktop

### Admin Features (Bonus)
- 🔐 **Secure Admin Authentication** - JWT-based login system
- 📊 **Admin Dashboard** - View all shortened URLs with analytics
- 📈 **Click Tracking** - Monitor URL usage statistics
- ✏️ **Edit URLs** - Modify original URLs after creation
- 🗑️ **Delete URLs** - Remove URLs with confirmation
- 📱 **Responsive Admin Panel** - Works on all devices
- 🔒 **Protected Routes** - Admin-only access to management features

## Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Axios
- CSS3 with modern styling

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled
- Environment variables with dotenv

## Project Structure

```
url-shortener/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── UrlShortener.js
    │   │   └── Admin.js
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Create backend directory and install dependencies:**
   ```bash
   mkdir url-shortener
   cd url-shortener
   mkdir backend
   cd backend
   npm init -y
   npm install express mongoose cors dotenv shortid valid-url jsonwebtoken bcryptjs
   npm install -D nodemon
   ```

2. **Create server.js file** with the provided backend code

3. **Create .env file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/urlshortener
   BASE_URL=http://localhost:5000
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   ```

4. **Update package.json scripts:**
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

   **Note:** A default admin account will be created automatically:
   - **Username:** admin
   - **Password:** admin123

### Frontend Setup

1. **Create React app:**
   ```bash
   cd .. # Go back to url-shortener directory
   npx create-react-app frontend
   cd frontend
   npm install axios react-router-dom
   ```

2. **Replace src files** with the provided React components

3. **Add proxy to package.json:**
   ```json
   "proxy": "http://localhost:5000"
   ```

4. **Start the frontend:**
   ```bash
   npm start
   ```

### MongoDB Setup

**Option 1: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Database will be created automatically

**Option 2: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update MONGODB_URI in .env file

## API Endpoints

### Public Endpoints

#### POST /api/shorten
Shorten a long URL
```json
Request: {
  "originalUrl": "https://www.example.com/very/long/path"
}

Response: {
  "originalUrl": "https://www.example.com/very/long/path",
  "shortUrl": "http://localhost:5000/abc123",
  "shortCode": "abc123"
}
```

#### GET /:shortcode
Redirect to original URL
- Redirects user to original URL
- Increments click counter

### Admin Authentication Endpoints

#### POST /api/admin/login
Admin login
```json
Request: {
  "username": "admin",
  "password": "admin123"
}

Response: {
  "token": "jwt_token_here",
  "admin": {
    "id": "admin_id",
    "username": "admin"
  }
}
```

#### POST /api/admin/verify
Verify admin token
```json
Headers: {
  "Authorization": "Bearer jwt_token_here"
}

Response: {
  "admin": {
    "id": "admin_id",
    "username": "admin"
  }
}
```

### Protected Admin Endpoints (Require Authentication)

#### GET /api/urls
Get all URLs (Admin only)
```json
Headers: {
  "Authorization": "Bearer jwt_token_here"
}

Response: [
  {
    "_id": "...",
    "originalUrl": "https://www.example.com",
    "shortCode": "abc123",
    "shortUrl": "http://localhost:5000/abc123",
    "clicks": 5,
    "createdAt": "2025-08-25T10:30:00.000Z"
  }
]
```

#### PUT /api/urls/:id
Edit URL (Admin only)
```json
Headers: {
  "Authorization": "Bearer jwt_token_here"
}

Request: {
  "originalUrl": "https://www.updated-example.com"
}

Response: {
  "_id": "url_id",
  "originalUrl": "https://www.updated-example.com",
  "shortCode": "abc123",
  "shortUrl": "http://localhost:5000/abc123",
  "clicks": 5,
  "createdAt": "2025-08-25T10:30:00.000Z"
}
```

#### DELETE /api/urls/:id
Delete URL (Admin only)
```json
Headers: {
  "Authorization": "Bearer jwt_token_here"
}

Response: {
  "message": "URL deleted successfully"
}
```

## Usage

1. **Shortening URLs:**
   - Go to http://localhost:3000
   - Enter a long URL in the input field
   - Click "Shorten URL"
   - Copy the generated short URL

2. **Using Shortened URLs:**
   - Visit the shortened URL (e.g., http://localhost:3000/abc123)
   - You'll be redirected to the original URL
   - Click count is automatically tracked

3. **Admin Dashboard:**
   - Go to http://localhost:3000/admin
   - **Login with default credentials:**
     - Username: `admin`
     - Password: `admin123`
   - View all shortened URLs and their statistics
   - Edit existing URLs by clicking the "Edit" button
   - Delete URLs with confirmation modal
   - See total clicks and active URLs
   - Logout when done

## Deployment

### Backend Deployment (Railway/Heroku)
1. Create account on Railway or Heroku
2. Connect your GitHub repository
3. Add environment variables
4. Deploy backend

### Frontend Deployment (Vercel/Netlify)
1. Build the React app: `npm run build`
2. Deploy build folder to Vercel or Netlify
3. Update API endpoints to production backend URL

### Environment Variables for Production
```env
MONGODB_URI=your_mongodb_atlas_connection_string
BASE_URL=https://your-backend-domain.com
PORT=5000
```

## Testing

Test the following scenarios:
1. **Public Features:**
   - Shorten a valid URL
   - Try to shorten an invalid URL
   - Visit a shortened URL
   - Visit a non-existent short code
   - Copy shortened URL to clipboard

2. **Admin Authentication:**
   - Try to access admin page without login (should show login form)
   - Login with correct credentials (admin/admin123)
   - Login with incorrect credentials (should show error)
   - Verify token persistence (refresh page, should stay logged in)
   - Logout functionality

3. **Admin Management:**
   - View all URLs in admin dashboard
   - Edit an existing URL
   - Cancel edit operation
   - Delete a URL with confirmation
   - Cancel delete operation
   - Verify click tracking works
   - Check responsive design on mobile

## Features Implemented

✅ URL shortening with unique codes  
✅ URL validation  
✅ Redirection functionality  
✅ Click tracking  
✅ **Secure Admin Authentication (JWT)**  
✅ **Protected Admin Dashboard**  
✅ **Edit URL functionality for admins**  
✅ **Delete URL functionality with confirmation**  
✅ Responsive design  
✅ Error handling  
✅ Copy to clipboard  
✅ Analytics and statistics  
✅ **Auto-logout on invalid tokens**  
✅ **Modal confirmations for destructive actions**  

## Future Enhancements

- User authentication
- Custom short codes
- Expiration dates for URLs
- QR code generation
- Bulk URL shortening
- Advanced analytics (charts, time-based stats)
- Rate limiting
- URL preview before redirect