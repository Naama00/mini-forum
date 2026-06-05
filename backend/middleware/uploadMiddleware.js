const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const uploadFolder = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const hasCloudinaryConfig =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

const storage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'mini-forum',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }],
      },
    })
  : multer.diskStorage({
      destination: uploadFolder,
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.png';
        const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        cb(null, name);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;