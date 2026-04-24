# 🗂️ Backend Directory Structure Reference

## Tree View

```
backend/
├── 📁 models/                          # Database schemas
│   ├── User.js
│   ├── Article.js
│   ├── Event.js
│   ├── Job.js
│   ├── Notification.js
│   ├── Category.js
│   ├── Topic.js
│   ├── Post.js
│   ├── Upload.js
│   └── index.js                        # Central exports
│
├── 📁 controllers/                     # Business logic & request handlers
│   ├── authController.js               # Auth: register, login, google
│   ├── articleController.js            # Articles: CRUD + like + comments
│   ├── eventController.js              # Events: CRUD + like + attend
│   ├── jobController.js                # Jobs: CRUD + like + comments
│   ├── notificationController.js       # Notifications: get, read, delete
│   ├── topicController.js              # Topics: create
│   ├── postController.js               # Posts: create, update, delete, vote
│   ├── userController.js               # Users: update profile
│   ├── dataController.js               # Data: categories, topics, users
│   └── searchController.js             # Search: global search
│
├── 📁 services/                        # Shared business logic
│   ├── authService.js                  # Auth logic: register, login, Google OAuth
│   └── notificationService.js          # Notification creation helper
│
├── 📁 routes/                          # API endpoint definitions
│   ├── authRoutes.js                   # /api/auth/*
│   ├── articleRoutes.js                # /api/articles/*
│   ├── eventRoutes.js                  # /api/events/*
│   ├── jobRoutes.js                    # /api/jobs/*
│   ├── notificationRoutes.js           # /api/notifications/*
│   ├── topicRoutes.js                  # /api/topics/*
│   ├── postRoutes.js                   # /api/posts/*
│   ├── userRoutes.js                   # /api/users/*
│   ├── searchRoutes.js                 # /api/search/*
│   └── dataRoutes.js                   # /api/* (GET endpoints)
│
├── 📁 middleware/                      # HTTP middleware
│   └── authMiddleware.js               # JWT verification
│
├── 📄 app.js                           # Express app setup & entry point
├── 📄 ARCHITECTURE.md                  # Full architecture documentation
├── 📄 MIGRATION.md                     # Migration & transition guide
├── 📄 package.json
└── 📄 STRUCTURE.md                     # This file

```

## File Purpose Reference

### Models (🗃️ models/)

| File | Purpose |
|------|---------|
| `User.js` | User schema + authentication data |
| `Article.js` | Article schema with comments & likes |
| `Event.js` | Event schema with attendees & comments |
| `Job.js` | Job posting schema with requirements |
| `Notification.js` | Notification schema with timestamps |
| `Category.js` | Forum category schema |
| `Topic.js` | Discussion topic schema |
| `Post.js` | Forum post schema |
| `Upload.js` | File upload metadata |
| `index.js` | Central import point for all models |

### Controllers (🎯 controllers/)

| File | Handles | Methods |
|------|---------|---------|
| `authController.js` | Authentication | register, login, googleLogin |
| `articleController.js` | Article operations | getAll, getById, create, update, delete, like, addComment, deleteComment |
| `eventController.js` | Event operations | getAll, getById, create, update, delete, like, attend, addComment, deleteComment |
| `jobController.js` | Job operations | getAll, getById, create, update, delete, like, addComment, deleteComment |
| `notificationController.js` | Notifications | get, getUnreadCount, markAsRead, markAllAsRead, delete, deleteAll |
| `topicController.js` | Topic operations | createTopic |
| `postController.js` | Post operations | create, update, delete, vote |
| `userController.js` | User profile | updateUser |
| `dataController.js` | Data retrieval | getCategories, getTopic, getPost, getUser, etc. |
| `searchController.js` | Global search | search across all entities |

### Services (⚙️ services/)

| File | Purpose |
|------|---------|
| `authService.js` | Handles user registration, login, Google OAuth logic |
| `notificationService.js` | Creates notifications when events occur |

### Routes (🛣️ routes/)

| Route | HTTP Methods | Auth Required |
|-------|-------------|--------------|
| `/api/auth/*` | POST | ❌ |
| `/api/articles/*` | GET, POST, PUT, DELETE | POST/PUT/DELETE ✅ |
| `/api/events/*` | GET, POST, PUT, DELETE | POST/PUT/DELETE ✅ |
| `/api/jobs/*` | GET, POST, PUT, DELETE | POST/PUT/DELETE ✅ |
| `/api/topics/*` | POST | ✅ |
| `/api/posts/*` | POST, PATCH, DELETE | ✅ |
| `/api/users/*` | GET, PATCH | PATCH ✅ |
| `/api/notifications/*` | GET, PUT, DELETE | ✅ |
| `/api/search/*` | GET | ❌ |
| `/api/categories*` | GET | ❌ |

## Import Patterns

### Import Models
```javascript
// From central index
const { User, Article, Event } = require('../models');

// Or individual files
const { User } = require('../models/User');
const Article = require('../models/Article');
```

### Import Controllers in Routes
```javascript
const articleController = require('../controllers/articleController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', articleController.getAllArticles);
router.post('/', authMiddleware, articleController.createArticle);
```

### Import Services in Controllers
```javascript
const { createNotification } = require('../services/notificationService');

// Use in controller
await createNotification({
    recipient: article.author,
    sender: req.user.userId,
    type: 'like',
    refModel: 'Article',
    refId: article._id
});
```

## Common Patterns

### Creating an Endpoint

**1. Add handler in controller:**
```javascript
// controllers/myController.js
async function myAction(req, res) {
    try {
        // Business logic
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { myAction };
```

**2. Add route:**
```javascript
// routes/myRoutes.js
const router = require('express').Router();
const myController = require('../controllers/myController');
const auth = require('../middleware/authMiddleware');

router.post('/action', auth, myController.myAction);

module.exports = router;
```

**3. Register in app.js:**
```javascript
const myRoutes = require('./routes/myRoutes');
app.use('/api/my', myRoutes);
```

## Error Response Format

All endpoints return consistent format:

```javascript
// Success
{
    success: true,
    message: "Action successful",
    data: { /* actual data */ }
}

// Error
{
    success: false,
    message: "Error description",
    error: "Error details"
}
```

## Authentication

Protected endpoints require Bearer token:

```
Authorization: Bearer <JWT_TOKEN>
```

Token contains: `{ userId, email, expiresIn: '7d' }`

## Middleware Order in Routes

```javascript
router.post(
    '/endpoint',
    authMiddleware,        // 1. Check authentication
    // validateInput,       // 2. Validate input (if added)
    // checkPermissions,    // 3. Check permissions (if added)
    controller.action      // 4. Handle request
);
```

## Next Steps for Enhancement

1. **Add input validation** → Create validators folder with Joi schemas
3. **Add logging** → Use Winston or Morgan for request logging
4. **Add caching** → Redis for frequently accessed data
5. **Add tests** → Jest or Mocha for unit & integration tests

---

**Last Updated**: 2024
**Architecture Version**: v1.0 (Organized MVC-like structure)
