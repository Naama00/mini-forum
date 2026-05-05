// API Configuration
export const API_BASE_URL = 'http://localhost:5000/api';
export const API_BASE = 'http://localhost:5000';
export const GOOGLE_CLIENT_ID = '151921932655-85p00136srh9nb2tquam8qkkjtuvfnl5.apps.googleusercontent.com';

// Endpoints
export const API_ENDPOINTS = {
  AUTH: '/auth',
  ARTICLES: '/articles',
  EVENTS: '/events',
  JOBS: '/jobs',
  TOPICS: '/topics',
  POSTS: '/posts',
  USERS: '/users',
  SEARCH: '/search',
  DATA: '/data',
  NOTIFICATIONS: '/notifications',
};

// Pagination
export const LIMITS = {
  POSTS_PER_PAGE: 10,
  ARTICLES_PER_PAGE: 9,
  EVENTS_PER_PAGE: 9,
  JOBS_PER_PAGE: 9,
  SEARCH_RESULTS: 20,
  COMMENTS_PER_PAGE: 20,
};

// Article Tags
export const ARTICLE_TAGS = [
  'AI', 'React', 'Node.js', 'TypeScript', 'CSS', 
  'Cyber', 'DevOps', 'Career', 'Python', 'Docker'
];

// Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
  URL: /^https?:\/\/.+/,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'שגיאת חיבור. בדוק את החיבור לאינטרנט.',
  UNAUTHORIZED: 'יש להתחבר תחילה.',
  FORBIDDEN: 'אין הרשאה לביצוע פעולה זו.',
  NOT_FOUND: 'הפריט לא נמצא.',
  SERVER_ERROR: 'שגיאה בשרת. אנא נסה שוב מאוחר יותר.',
  VALIDATION_ERROR: 'אחד או יותר מהשדות אינם תקינים.',
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Time Constants
export const TIME_FORMAT = {
  SHORT: 'HH:mm',
  MEDIUM: 'DD/MM/YYYY HH:mm',
  LONG: 'DD MMMM YYYY HH:mm',
};

export default {
  API_BASE_URL,
  API_BASE,
  API_ENDPOINTS,
  LIMITS,
  ARTICLE_TAGS,
  REGEX,
  ERROR_MESSAGES,
  STORAGE_KEYS,
  TIME_FORMAT,
};
