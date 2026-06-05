const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary');
const logger = require('../config/logger');

const uploadFolder = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const cloudinaryConfig = cloudinary.config();
const hasCloudinaryConfig =
  Boolean(cloudinaryConfig.cloud_name) &&
  Boolean(cloudinaryConfig.api_key) &&
  Boolean(cloudinaryConfig.api_secret);

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'mini-forum',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }],
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

// POST /api/uploads
router.post('/', authMiddleware, memoryUpload.single('image'), async (req, res) => {
  try {
    logger.info({ file: req.file }, 'Upload received');

    if (!req.file) {
      logger.warn('No file received in upload request');
      return res.status(400).json({ success: false, message: 'לא נשלחה תמונה' });
    }

    let localFallback = false;
    if (hasCloudinaryConfig) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        const url = result.secure_url || result.url;
        if (url) {
          return res.json({ success: true, url });
        }
        logger.error({ result }, 'Cloudinary did not return a URL, falling back to local storage');
        localFallback = true;
      } catch (err) {
        logger.error({ err }, 'Cloudinary upload failed, falling back to local storage');
        localFallback = true;
      }
    } else {
      logger.warn('Cloudinary configuration incomplete or missing; using local upload fallback');
      localFallback = true;
    }

    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(uploadFolder, filename);
    await fs.promises.writeFile(filePath, req.file.buffer);

    if (localFallback) {
      logger.info({ filename }, 'Saved upload locally after Cloudinary failure');
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const publicUrl = `${protocol}://${host}/uploads/${filename}`;

    res.json({ success: true, url: publicUrl });
  } catch (err) {
    logger.error({ err }, 'Upload handler error');
    res.status(500).json({ success: false, message: 'שגיאה בהעלאת הקובץ' });
  }
});

module.exports = router;
