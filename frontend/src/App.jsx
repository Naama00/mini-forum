import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';
import AppShell from './components/layout/AppShell';
import Sidebar from './components/Sidebar/Sidebar';

// ── Lazy routes ──────────────────────────────────────
const Home               = lazy(() => import('./components/Home/Home'));
const Category           = lazy(() => import('./components/Category/Category'));
const AuthForm           = lazy(() => import('./components/Auth'));
const NewTopic           = lazy(() => import('./components/NewTopic'));
const ProfilePage        = lazy(() => import('./components/Profile'));
const ArticlesPage       = lazy(() => import('./components/Article/Articles'));
const EventsPage         = lazy(() => import('./components/Event/Events'));
const JobsPage           = lazy(() => import('./components/Job/Jobs'));
const NewArticleForm     = lazy(() => import('./components/Article/NewArticle'));
const NewEventForm       = lazy(() => import('./components/Event/NewEvent'));
const NewJobForm         = lazy(() => import('./components/Job/NewJob'));
const ArticlePage        = lazy(() => import('./components/Article/Article'));
const JobPage            = lazy(() => import('./components/Job/Job'));
const EventPage          = lazy(() => import('./components/Event/Event'));
const EditArticle        = lazy(() => import('./components/Article/EditArticle'));
const EditEvent          = lazy(() => import('./components/Event/EditEvent'));
const EditJob            = lazy(() => import('./components/Job/EditJob'));
const Notifications      = lazy(() => import('./components/Notification/Notifications'));
const SearchResults      = lazy(() => import('./components/Search/Searchresults'));
const AIWorkspace        = lazy(() => import('./components/AIWorkspace/AIWorkspaceContainer'));
const Usage              = lazy(() => import('./components/Usage/Usage'));
const Challenges         = lazy(() => import('./components/Challenges/Challenges'));
const Challenge          = lazy(() => import('./components/Challenges/Challenge'));
const Topic              = lazy(() => import('./components/Topic/Topic'));

// דפים שמציגים סיידבר
const WITH_SIDEBAR = [
  '/', '/category', '/articles', '/events', '/jobs',
  '/notifications', '/search', '/new-topic', '/ai-workspace', '/usage', '/challenges', '/challenge', '/topic', '/topics'
];

function useSidebar() {
  const { pathname } = useLocation();
  return WITH_SIDEBAR.some(r =>
    r === '/' ? pathname === '/' : pathname === r || pathname.startsWith(r + '/')
  );
}

// ── Layout wrapper שמחליט אם להציג סיידבר ──────────
function Layout({ children, isCollapsed, setIsCollapsed }) {
  const showSidebar = useSidebar();

  return (
    <AppShell
      sidebar={showSidebar ? <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /> : null}
      isSidebarOpen={showSidebar && !isCollapsed}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      {children}
    </AppShell>
  );
}

// ── כל ה-Routes ──────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/"                   element={<Home />} />
        <Route path="/category"           element={<Category />} />
        <Route path="/auth"               element={<AuthForm />} />
        <Route path="/new-topic"          element={<NewTopic />} />
        <Route path="/profile/:userId"    element={<ProfilePage />} />
        <Route path="/articles"           element={<ArticlesPage />} />
        <Route path="/articles/new"       element={<NewArticleForm />} />
        <Route path="/articles/:id"       element={<ArticlePage />} />
        <Route path="/articles/:id/edit"  element={<EditArticle />} />
        <Route path="/events"             element={<EventsPage />} />
        <Route path="/events/new"         element={<NewEventForm />} />
        <Route path="/events/:id"         element={<EventPage />} />
        <Route path="/events/:id/edit"    element={<EditEvent />} />
        <Route path="/jobs"               element={<JobsPage />} />
        <Route path="/jobs/new"           element={<NewJobForm />} />
        <Route path="/jobs/:id"           element={<JobPage />} />
        <Route path="/jobs/:id/edit"      element={<EditJob />} />
        <Route path="/notifications"      element={<Notifications />} />
        <Route path="/search"             element={<SearchResults />} />
        <Route path="/ai-workspace"       element={<AIWorkspace />} />
        <Route path="/challenges"         element={<Challenges />} />
        <Route path="/challenges/:id"     element={<Challenge />} />
        <Route path="/topic/:id"          element={<Topic />} />
        <Route path="/usage"              element={<Usage />} />
      </Routes>
    </Suspense>
  );
}

// ── Root ──────────────────────────────────────────────
export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <Layout
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              >
                <AppRoutes />
              </Layout>
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
