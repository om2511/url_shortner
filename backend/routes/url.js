
const express = require('express');
const router = express.Router();
const Url = require('../models/Url');

// Helper to generate a random shortcode
function generateShortCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper to validate URLs
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// POST /api/shorten - Create a short URL
router.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) return res.status(400).json({ error: 'Original URL is required' });
  if (!isValidUrl(originalUrl)) return res.status(400).json({ error: 'Invalid URL format' });

  let shortCode;
  let url;
  // Ensure unique shortcode
  do {
    shortCode = generateShortCode();
    url = await Url.findOne({ shortCode });
  } while (url);

  const newUrl = new Url({ originalUrl, shortCode });
  await newUrl.save();
  res.json({ shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}` });
});

// Admin route: List all URLs with pagination
router.get('/admin/urls', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Url.countDocuments();
    const urls = await Url.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ urls, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

// Admin route: Delete a URL by ID
router.delete('/admin/urls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Url.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete URL' });
  }
});

// GET /:shortcode - Redirect to original URL
router.get('/:shortcode', async (req, res) => {
  const { shortcode } = req.params;
  const url = await Url.findOne({ shortCode: shortcode });
  if (!url) return res.status(404).send('Short URL not found');
  url.visitCount++;
  await url.save();
  res.redirect(url.originalUrl);
});

module.exports = router;
