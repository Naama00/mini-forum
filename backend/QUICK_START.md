# 🚀 Quick Start Guide - ההתחלה המהירה

## For Developers: Adding New Features

### Example: Add a "Like Article" Counter Feature

#### Step 1: Add to Model (if needed)
The model is already in place - `models/Article.js` has a `likes` array.

#### Step 2: Add Controller Logic
```javascript
// controllers/articleController.js - already exists with likeArticle function
async function likeArticle(req, res) {
  // logic already here
}
```

#### Step 3: Check Routes
```javascript
// routes/articleRoutes.js - route already defined
router.post('/:id/like', authMiddleware, articleController.likeArticle);
```

**Result**: Endpoint works at `POST /api/articles/:id/like`

---

### Example: Add a NEW Feature - "Bookmark Articles"

Follow this pattern:

#### Step 1: Update Model
```javascript
// models/User.js - add bookmarks array
const userSchema = new mongoose.Schema({
    // ... existing fields
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }]
});
```

#### Step 2: Create Controller Method
```javascript
// controllers/articleController.js - add new function
async function bookmarkArticle(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const articleId = req.params.id;
    
    if (user.bookmarks.includes(articleId)) {
      user.bookmarks.pull(articleId);
    } else {
      user.bookmarks.push(articleId);
    }
    
    await user.save();
    res.json({ success: true, bookmarked: !user.bookmarks.includes(articleId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
  // ... existing exports
  bookmarkArticle 
};
```

#### Step 3: Add Route
```javascript
// routes/articleRoutes.js
router.post('/:id/bookmark', authMiddleware, articleController.bookmarkArticle);

// Optionally, get bookmarked articles
router.get('/bookmarks', authMiddleware, articleController.getBookmarkedArticles);
```

#### Step 4: Implement the GET method in controller
```javascript
async function getBookmarkedArticles(req, res) {
  try {
    const user = await User.findById(req.user.userId)
      .populate('bookmarks', 'title summary author createdAt');
    res.json({ success: true, data: user.bookmarks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
```

#### Result
New endpoints work:
- `POST /api/articles/:id/bookmark` - Toggle bookmark
- `GET /api/articles/bookmarks` - Get bookmarked articles

---

## Directory Quick Reference

```bash
# Go to specific folder
cd backend/models        # Database schemas
cd backend/controllers   # Business logic
cd backend/routes       # Endpoint definitions
cd backend/services     # Shared utilities
cd backend/middleware   # Request processing
```

## Common Operations

### Add a New Controller Method
```javascript
// 1. Add function to controllers/entityController.js
async function newAction(req, res) {
    try {
        // logic
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// 2. Export it
module.exports = {
    existingAction,
    newAction  // Add here
};
```

### Add a New Route
```javascript
// routes/entityRoutes.js
const router = require('express').Router();
const controller = require('../controllers/entityController');
const auth = require('../middleware/authMiddleware');

// Add new route
router.post('/new-endpoint', auth, controller.newAction);

module.exports = router;
```

### Import Models in Controller
```javascript
// Option 1: Import specific models
const { User, Article } = require('../models');

// Option 2: Import individual files
const { User } = require('../models/User');
const Article = require('../models/Article');
```

## Testing Endpoints with CURL

### Auth Endpoints
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

### Protected Endpoints (require token)
```bash
# Get notifications (requires token)
TOKEN="your-jwt-token-here"
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer $TOKEN"

# Create article
curl -X POST http://localhost:5000/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"My Article","content":"...","tags":["tech"]}'
```

### Data Retrieval (no auth needed)
```bash
# Get categories
curl http://localhost:5000/api/categories

# Get users
curl http://localhost:5000/api/users

# Search
curl "http://localhost:5000/api/search?q=javascript&type=articles"

# Statistics
curl http://localhost:5000/api/statistics
```

## Response Format

All responses follow this format:

### Success
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": { /* actual data */ }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

## Common Imports

```javascript
// In any controller
const { User, Article, Event, Job } = require('../models');
const { Post } = require('../models/Post');
const { createNotification } = require('../services/notificationService');
const { registerUser, loginUser } = require('../services/authService');
```

## Debugging Tips

### Check if route is registered
```bash
# Should return "Endpoint not found" or "Endpoint description"
curl http://localhost:5000/api/my-endpoint
```

### Check import errors
```bash
# Run node to check for syntax errors
node -c backend/controllers/myController.js
```

### Check daction
```javascript
// In app.js console output
// Should see: "✓ התחברנו בהצלחה ל-MongoDB!"
```

### Check middleware
```javascript
// If unauthorized, middleware blocks request
// Response: { error: 'לא מחובר' } or { error: 'טוקן לא תקין' }
```

## File Naming Conventions

- **Models**: PascalCase + .js
  - `User.js`, `Article.js`, `Event.js`

- **Controllers**: camelCase + Controller + .js
  - `userController.js`, `articleController.js`

- **Services**: camelCase + Service + .js
  - `authService.js`, `notificationService.js`

- **Routes**: camelCase + Routes + .js
  - `userRoutes.js`, `articleRoutes.js`

- **Middleware**: camelCase + Middleware + .js
  - `authMiddleware.js`, `validationMiddleware.js`

## Troubleshooting

### Port Already in Use
```bash
# Change port in app.js or .env
PORT=5001 npm start
```

### MongoDB Not Connecting
```bash
# Make sure MongoDB is running
# Linux/Mac: mongod
# Or check connection string in app.js
```

### Import Errors
```javascript
// Check that you're using correct export format
// Named exports: const { User } = require('../models/User');
// Default exports: const Article = require('../models/Article');
```

### Route Not Found
```javascript
// Check route order in app.js
// More specific routes should come before general ones
// Example: /api/notifications/unread-count before /api/notifications/:id
```

## Performance Tips

1. **Use lean() for read-only queries**
   ```javascript
   const articles = await Article.find().lean();
   ```

2. **Select specific fields**
   ```javascript
   const users = await User.find().select('firstName email');
   ```

3. **Limit results**
   ```javascript
   const articles = await Article.find().limit(10);
   ```

4. **Index frequently searched fields**
   ```javascript
   // Already done in models/index.js initializeDatabase()
   ```

## Best Practices

✅ **DO:**
- Keep controllers focused on one entity
- Extract reusable logic to services
- Use consistent error handling
- Test endpoints with curl first
- Document complex logic with comments
- Use meaningful variable names

❌ **DON'T:**
- Mix logic and routing in controllers
- Duplicate database queries
- Ignore error cases
- Use generic variable names (data, result, etc.)
- Hardcode values (use env variables)
- Skip authentication for user data

---

**Happy Coding!** 🎉

For more details, see:
- `ARCHITECTURE.md` - Full architecture
- `MIGRATION.md` - Migration guide
- `STRUCTURE.md` - Structure reference
