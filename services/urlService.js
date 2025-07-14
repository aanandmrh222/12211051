const { customAlphabet } = require('nanoid');
const Url = require('../models/Url');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 7);

exports.generateShortCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = nanoid();
    exists = await Url.findOne({ shortCode: code });
  }

  return code;
};
