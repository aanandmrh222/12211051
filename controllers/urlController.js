const Joi = require('joi');
const Url = require('../models/Url');
const { generateShortCode } = require('../services/urlService');
const BASE_URL = process.env.BASE_URL;

const schema = Joi.object({
  url: Joi.string().uri().required(),
  validity: Joi.number().integer().min(1).optional(),
  shortcode: Joi.string().alphanum().min(3).max(20).optional()
});

exports.createShortUrl = async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { url, validity = 30, shortcode } = value;
    const shortCode = shortcode || await generateShortCode();

    const existing = await Url.findOne({ shortCode });
    if (existing) return res.status(400).json({ success: false, message: 'Shortcode already in use' });

    const expiresAt = new Date(Date.now() + validity * 60000);

    const newUrl = new Url({
      originalUrl: url,
      shortCode,
      expiresAt,
      clickData: []
    });

    await newUrl.save();

    return res.status(201).json({
      shortLink: `${BASE_URL}/${shortCode}`,
      expiry: expiresAt.toISOString()
    });
  } catch (err) {
    next(err);
  }
};

exports.redirectUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) return res.status(404).json({ message: 'Shortcode not found' });
    if (url.expiresAt < new Date()) return res.status(410).json({ message: 'Link expired' });

    const click = {
      timestamp: new Date(),
      referrer: req.get('Referer') || 'direct',
      ip: req.ip
    };

    url.clickData.push(click);
    await url.save();

    res.redirect(url.originalUrl);
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) return res.status(404).json({ message: 'Shortcode not found' });

    return res.json({
      shortCode,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      expiry: url.expiresAt,
      totalClicks: url.clickData.length,
      clicks: url.clickData.map(click => ({
        timestamp: click.timestamp,
        referrer: click.referrer,
        location: click.ip
      }))
    });
  } catch (err) {
    next(err);
  }
};
