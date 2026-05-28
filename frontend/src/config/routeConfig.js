import { lazy } from 'react';

// Lazy load components for better performance
const Home = lazy(() => import('../components/Home/Home'));
const Category = lazy(() => import('../components/Category/Category'));
const AuthForm = lazy(() => import('../components/Login'));
const NewTopic = lazy(() => import('../components/NewTopic'));
const ProfilePage = lazy(() => import('../components/Profile'));
const ArticlesPage = lazy(() => import('../components/Article/Articles'));
const EventsPage = lazy(() => import('../components/Event/Events'));
const JobsPage = lazy(() => import('../components/Job/Jobs'));
const NewArticleForm = lazy(() => import('../components/Article/NewArticle'));
const NewEventForm = lazy(() => import('../components/Event/NewEvent'));
const NewJobForm = lazy(() => import('../components/Job/NewJob'));
const ArticlePage = lazy(() => import('../components/Article/Article'));
const JobPage = lazy(() => import('../components/Job/Job'));
const EventPage = lazy(() => import('../components/Event/Event'));
const EditArticle = lazy(() => import('../components/Article/EditArticle'));
const EditEvent = lazy(() => import('../components/Event/EditEvent'));
const EditJob = lazy(() => import('../components/Job/EditJob'));
const Notifications = lazy(() => import('../components/Notifications'));
const SearchResults = lazy(() => import('../components/Searchresults'));
const AIWorkspaceContainer = lazy(() => import('../components/AIWorkspace/AIWorkspaceContainer'));
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
