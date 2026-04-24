# 🏗️ Backend Architecture - מבנה Backend מסודר

## מבנה התיקיות

```
backend/
├── models/                    # 📊 Mongoose Schemas
│   ├── User.js
│   ├── Article.js
│   ├── Event.js
│   ├── Job.js
│   ├── Notification.js
│   ├── Category.js
│   ├── Topic.js
│   ├── Post.js
│   ├── Upload.js
│   └── index.js              # Central export for all models
│
├── controllers/               # 🎛️ Request Handlers & Business Logic
│   ├── authController.js
│   ├── articleController.js
│   ├── eventController.js
│   ├── jobController.js
│   ├── notificationController.js
│   ├── topicController.js
│   ├── postController.js
│   ├── userController.js
│   ├── dataController.js
│   └── searchController.js
│
├── services/                  # 🔧 Business Logic & Utilities
│   ├── authService.js         # Authentication logic
│   ├── notificationService.js # Notification creation helper
│   └── (other services as needed)
│
├── routes/                    # 🛣️ API Endpoints
│   ├── authRoutes.js
│   ├── articleRoutes.js
│   ├── eventRoutes.js
│   ├── jobRoutes.js
│   ├── notificationRoutes.js
│   ├── topicRoutes.js
│   ├── postRoutes.js
│   ├── userRoutes.js
│   ├── searchRoutes.js
│   └── dataRoutes.js
│
├── middleware/                # 🔐 Middleware Functions
│   └── authMiddleware.js      # JWT authentication
│
└── app.js                     # 🚀 Entry Point
```

## קטגוריות Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - הרשמה
- `POST /api/auth/login` - התחברות
- `POST /api/auth/google` - התחברות עם Google

### 📝 Articles
- `GET /api/articles` - קבל כל מאמרים
- `GET /api/articles/:id` - קבל מאמר ספציפי
- `POST /api/articles` - צור מאמר חדש (דורש auth)
- `PUT /api/articles/:id` - עדכן מאמר (דורש auth)
- `DELETE /api/articles/:id` - מחק מאמר (דורש auth)
- `POST /api/articles/:id/like` - לייק/ביטול לייק (דורש auth)
- `POST /api/articles/:id/comments` - הוסף תגובה (דורש auth)
- `DELETE /api/articles/:id/comments/:commentId` - מחק תגובה (דורש auth)

### 📅 Events
- `GET /api/events` - קבל כל אירועים
- `GET /api/events/:id` - קבל אירוע ספציפי
- `POST /api/events` - צור אירוע חדש (דורש auth)
- `PUT /api/events/:id` - עדכן אירוע (דורש auth)
- `DELETE /api/events/:id` - מחק אירוע (דורש auth)
- `POST /api/events/:id/like` - לייק (דורש auth)
- `POST /api/events/:id/attend` - הרשמה/ביטול (דורש auth)
- `POST /api/events/:id/comments` - הוסף תגובה (דורש auth)
- `DELETE /api/events/:id/comments/:commentId` - מחק תגובה (דורש auth)

### 💼 Jobs
- `GET /api/jobs` - קבל כל משרות
- `GET /api/jobs/:id` - קבל משרה ספציפית
- `POST /api/jobs` - פרסם משרה (דורש auth)
- `PUT /api/jobs/:id` - עדכן משרה (דורש auth)
- `DELETE /api/jobs/:id` - מחק משרה (דורש auth)
- `POST /api/jobs/:id/like` - לייק (דורש auth)
- `POST /api/jobs/:id/comments` - הוסף תגובה (דורש auth)
- `DELETE /api/jobs/:id/comments/:commentId` - מחק תגובה (דורש auth)

### 📌 Topics & Posts
- `POST /api/topics` - צור נושא חדש (דורש auth)
- `GET /api/topics/:topicId` - קבל נושא (מכל dataRoutes)
- `POST /api/posts` - הוסף פוסט (דורש auth)
- `PATCH /api/posts/:postId` - עדכן פוסט (דורש auth)
- `DELETE /api/posts/:postId` - מחק פוסט (דורש auth)
- `POST /api/posts/:postId/vote` - הצבע על פוסט (דורש auth)

### 👥 Users
- `GET /api/users` - קבל רשימת משתמשים (מכל dataRoutes)
- `GET /api/users/:userId` - קבל פרטי משתמש (מכל dataRoutes)
- `PATCH /api/users/:userId` - עדכן פרופיל (דורש auth)

### 🔔 Notifications
- `GET /api/notifications` - קבל התראות (דורש auth)
- `GET /api/notifications/unread-count` - קבל מספר התראות שלא נקראו (דורש auth)
- `PUT /api/notifications/:id/read` - סמן כנקרא (דורש auth)
- `PUT /api/notifications/read-all` - סמן הכל כנקרא (דורש auth)
- `DELETE /api/notifications/:id` - מחק התראה (דורש auth)
- `DELETE /api/notifications` - מחק הכל (דורש auth)

### 🔍 Search & Data
- `GET /api/search?q=...` - חפש (articles, events, jobs, topics, users)
- `GET /api/categories` - קבל קטגוריות
- `GET /api/categories/:categoryId` - קבל קטגוריה ספציפית
- `GET /api/posts/:postId` - קבל פוסט
- `GET /api/statistics` - סטטיסטיקה
- `GET /api/trending` - נושאים פופולריים

## עיקרונות הארכיטקטורה

### Models (models/)
- סכמות Mongoose מנוקות וברורות
- כל קובץ מדגם יחיד
- סדר אלפביתי של קבצים

### Controllers (controllers/)
- הכנסת הלוגיקה של העסקים
- בידול בין לוגיקה ל-HTTP handling
- כל קובץ מטפל ב-entity אחת (או הגבלה)
- פונקציות async מנוקות

### Services (services/)
- עזרי עסקיים חוצי-entities
- אם"ת (Authentication, Notification)
- קלות לבדיקה (testable)

### Routes (routes/)
- מיפוי צלול בין endpoints לפונקציות controller
- הגבלות מוקדמות של middleware
- קלות קריאה ותחזוקה

### Middleware (middleware/)
- פונקציות בדיקה (validation, auth)
- השמורה החדשה: authMiddleware.js

## משוקלל עם Express.js

```javascript
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', dataRoutes);
```

## הערות חשובות

1. **JWT Authentication**: כל הrequests המוגנים דורשים:
   ```
   Authorization: Bearer <token>
   ```

2. **Route Ordering**: ב-Express, צריך לשים routes ספציפיות לפני routes כלליות
   - `/api/notifications/unread-count` לפני `/api/notifications/:id`

3. **Error Handling**: כל התגובות כוללות `success` boolean לשימושי client

4. **Populate**: כל queries המתקשרות למודלים אחרים משתמשות ב-populate

## טעינת מודלים המרכזית

ניתן לטעון את כל המודלים מ-`models/index.js`:

```javascript
const { User, Article, Event, Job, Notification, Category, Topic, Post, Upload, initializeDatabase } = require('./models');
```
