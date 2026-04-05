const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const shortid = require('shortid');
const validUrl = require('valid-url');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseAllowedOrigins() {
  const rawOrigins = process.env.CORS_ALLOWED_ORIGINS?.trim();

  if (!rawOrigins) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variable: CORS_ALLOWED_ORIGINS');
    }

    return ['http://localhost:3000'];
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function loadConfig() {
  const adminUsername = process.env.ADMIN_USERNAME?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if ((adminUsername && !adminPassword) || (!adminUsername && adminPassword)) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must both be provided together');
  }

  return {
    port: process.env.PORT || 5000,
    mongoUri: requireEnv('MONGODB_URI'),
    jwtSecret: requireEnv('JWT_SECRET'),
    baseUrl: requireEnv('BASE_URL').replace(/\/+$/, ''),
    allowedOrigins: parseAllowedOrigins(),
    adminSeedUsername: adminUsername,
    adminSeedPassword: adminPassword,
  };
}

const config = loadConfig();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
  })
);
app.use(express.json());

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  shortUrl: {
    type: String,
    required: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Url = mongoose.model('Url', urlSchema);

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model('Admin', adminSchema);

async function ensureSeedAdmin() {
  if (!config.adminSeedUsername || !config.adminSeedPassword) {
    console.log('Admin seed skipped because ADMIN_USERNAME and ADMIN_PASSWORD are not set');
    return;
  }

  const adminExists = await Admin.findOne({ username: config.adminSeedUsername });

  if (adminExists) {
    console.log(`Admin seed skipped because "${config.adminSeedUsername}" already exists`);
    return;
  }

  const hashedPassword = await bcrypt.hash(config.adminSeedPassword, 12);
  const admin = new Admin({
    username: config.adminSeedUsername,
    password: hashedPassword,
  });

  await admin.save();
  console.log(`Seeded admin account "${config.adminSeedUsername}"`);
}

async function authenticateAdmin(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.admin = admin;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

app.get('/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();

    res.json({
      status: 'ok',
      mongodb: 'connected',
      uptimeSeconds: Math.round(process.uptime()),
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      mongodb: 'disconnected',
    });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ adminId: admin._id }, config.jwtSecret, { expiresIn: '24h' });

    return res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Admin login failed:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/verify', authenticateAdmin, (req, res) => {
  res.json({
    admin: {
      id: req.admin._id,
      username: req.admin.username,
    },
  });
});

app.post('/api/shorten', async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    let url = await Url.findOne({ originalUrl });
    if (url) {
      return res.json({
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        shortCode: url.shortCode,
      });
    }

    const shortCode = shortid.generate();
    const shortUrl = `${config.baseUrl}/${shortCode}`;

    url = new Url({
      originalUrl,
      shortCode,
      shortUrl,
    });

    await url.save();

    return res.json({
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      shortCode: url.shortCode,
    });
  } catch (error) {
    console.error('URL shortening failed:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/urls', authenticateAdmin, async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    return res.json(urls);
  } catch (error) {
    console.error('Fetching URLs failed:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/urls/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { originalUrl } = req.body;

    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const updatedUrl = await Url.findByIdAndUpdate(id, { originalUrl }, { new: true });

    if (!updatedUrl) {
      return res.status(404).json({ error: 'URL not found' });
    }

    return res.json(updatedUrl);
  } catch (error) {
    console.error('Updating URL failed:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/urls/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUrl = await Url.findByIdAndDelete(id);

    if (!deletedUrl) {
      return res.status(404).json({ error: 'URL not found' });
    }

    return res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Deleting URL failed:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/urls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    const url = await Url.findOne({ shortCode: shortcode });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    return res.json(url);
  } catch (error) {
    console.error('Fetching URL details failed:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    const url = await Url.findOne({ shortCode: shortcode });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    url.clicks += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Redirect failed:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

async function startServer() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    await ensureSeedAdmin();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
