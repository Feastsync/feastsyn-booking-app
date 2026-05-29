const cloudinary = require('cloudinary').v2;

require('dotenv').config();

cloudinary.config({
 cloud_name: process.env.cloudinaryCloudName, 
  api_key: process.env.cloudinaryApiKey, 
  api_secret: process.env.cloudinaryApiSecret
});
module.exports = cloudinary