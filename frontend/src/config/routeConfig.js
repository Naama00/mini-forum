import { lazy } from 'react';

// Lazy load components for better performance
const Home = lazy(() => import('../components/Home/Home'));
const Category = lazy(() => import('../components/Category'));
const AuthForm = lazy(() => import('../components/Login'));
const NewTopic = lazy(() => import('../components/NewTopic'));
const ProfilePage = lazy(() => import('../components/Profile'));
const ArticlesPage = lazy(() => import('../components/Articles'));
const EventsPage = lazy(() => import('../components/Events'));
const JobsPage = lazy(() => import('../components/Jobs'));
const NewArticleForm = lazy(() => import('../components/NewArticle'));
const NewEventForm = lazy(() => import('../components/NewEvent'));
const NewJobForm = lazy(() => import('../components/NewJob'));
const ArticlePage = lazy(() => import('../components/Article'));
const JobPage = lazy(() => import('../components/Job'));
const EventPage = lazy(() => import('../components/Event'));
const EditArticle = lazy(() => import('../components/EditArticle'));
const EditEvent = lazy(() => import('../components/EditEvent'));
const EditJob = lazy(() => import('../components/EditJob'));
const Notifications = lazy(() => import('../components/Notifications'));
const SearchResults = lazy(() => import('../components/Searchresults'));
const AIWorkspaceContainer = lazy(() => import('../components/AIWorkspaceContainer'));
/**
 * Route configuration
 * כל הנתיבים באפליקציה במקום אחד
 */
export const routes = [
  { path: '/', element: Home },
  { path: '/category', element: Category, key: 'category' },
  { path: '/auth', element: AuthForm },
  { path: '/new-topic', element: NewTopic },
  { path: '/profile/:userId', element: ProfilePage },
  { path: '/articles', element: ArticlesPage },
  { path: '/events', element: EventsPage },
  { path: '/jobs', element: JobsPage },
  { path: '/articles/new', element: NewArticleForm },
  { path: '/events/new', element: NewEventForm },
  { path: '/jobs/new', element: NewJobForm },
  { path: '/articles/:id', element: ArticlePage },
  { path: '/events/:id', element: EventPage },
  { path: '/jobs/:id', element: JobPage },
  { path: '/articles/:id/edit', element: EditArticle },
  { path: '/events/:id/edit', element: EditEvent },
  { path: '/jobs/:id/edit', element: EditJob },
  { path: '/notifications', element: Notifications },
  { path: '/search', element: SearchResults },
  { path: '/ai-workspace', element: AIWorkspaceContainer },
];
