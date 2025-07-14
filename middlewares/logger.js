const fs = require('fs');
const path = require('path');
const logStream = fs.createWriteStream(path.join(__dirname, '../request.log'), { flags: 'a' });

module.exports = (req, res, next) => {
  const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n`;
  logStream.write(logEntry);
  next();
};
