require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const urlRoutes = require('./routes/url');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
app.use(express.json());

app.use(logger);
app.use('/', urlRoutes);
app.use(errorHandler);

app.post('/login', (req, res) => {
  const jwt = require('jsonwebtoken');
  const user = { id: 1, name: 'Test User' };
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
