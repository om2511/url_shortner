# Linkify (MERN Stack)

A full-stack link management application built with MongoDB, Express.js, React, and Node.js.

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
linkify/
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
   mkdir linkify
   cd linkify
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
   JWT_SECRET=replace_with_a_long_random_secret
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=replace_with_a_strong_password
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

### Frontend Setup

1. **Create React app:**
   ```bash
   cd .. # Go back to linkify directory
   npx create-react-app frontend
   cd frontend
   npm install axios react-router-dom
   ```

2. **Replace src files** with the provided React components

3. **For local development, add proxy to package.json:**
   ```json
   "proxy": "http://localhost:5000"
   ```

4. **Optional frontend environment file for production-like local testing:**
   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```

5. **Start the frontend:**
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
  "username": "your_admin_username",
  "password": "your_admin_password"
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
   - Visit the shortened URL (e.g., http://localhost:5000/abc123)
   - You'll be redirected to the original URL
   - Click count is automatically tracked

3. **Admin Dashboard:**
   - Go to http://localhost:3000/admin
   - Login with the admin credentials you configured in your backend environment
   - View all shortened URLs and their statistics
   - Edit existing URLs by clicking the "Edit" button
   - Delete URLs with confirmation modal
   - See total clicks and active URLs
   - Logout when done

## Deployment

### Recommended Architecture
- Deploy `backend/` to Render as a Node web service
- Deploy `frontend/` to Vercel as a static React app
- Use MongoDB Atlas for the database
- Set `BASE_URL` on the backend to the public backend URL because short links are generated by the backend

### Render Backend Deployment
1. Create a new **Web Service** on Render from this repository.
2. Set the **Root Directory** to `backend`.
3. Use the build command `npm install`.
4. Use the start command `npm start`.
5. Set the health check path to `/health`.
6. Add the production environment variables listed below.
7. Deploy the service and copy the public Render URL.

### Vercel Frontend Deployment
1. Create a new Vercel project from this repository.
2. Set the **Root Directory** to `frontend`.
3. Keep the default build command `npm run build`.
4. Keep the default output directory `build`.
5. Add `REACT_APP_API_BASE_URL=https://your-render-service.onrender.com`.
6. Deploy the project.
7. The included `frontend/vercel.json` rewrites all frontend routes to `index.html` so `/admin` works on refresh.

### Production Environment Variables
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_secret
BASE_URL=https://your-render-service.onrender.com
CORS_ALLOWED_ORIGINS=https://your-vercel-project.vercel.app,https://your-custom-domain.com
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=replace_with_a_strong_password
```

### Production Notes
- `JWT_SECRET` is required. The backend no longer falls back to a hardcoded secret.
- `CORS_ALLOWED_ORIGINS` is required in production and supports a comma-separated list.
- `ADMIN_USERNAME` and `ADMIN_PASSWORD` are optional after the first successful admin seed. If you leave them set, startup will skip reseeding when the user already exists.
- `REACT_APP_API_BASE_URL` must point to the Render backend origin, not the Vercel frontend domain.
- Shortened links will use the backend `BASE_URL`. If you want short links on a different domain, you need an additional reverse-proxy or custom-domain routing setup.

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
   - Login with the configured admin credentials
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
