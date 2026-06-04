import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import Home from "./Home";
import Category from "./Category";
import AuthForm from "./Login";
import NewTopic from "./NewTopic";
import ProfilePage from "./Profile";
import Sidebar from "./Sidebar";
import ArticlesPage from './Articles';
import EventsPage from './Events';
import JobsPage from './Jobs';
import NewArticleForm from "./NewArticle";
import NewEventForm from "./NewEvent";
import NewJobForm from "./NewJob";
import ArticlePage from "./Article";
import JobPage from "./Job";
import EventPage from './Event';
import EditArticle from './EditArticle';
import EditEvent from './EditEvent';
import EditJob from './EditJob';
import Notifications from './Notifications';
import SearchResults from './SearchResults';
import ThemeToggle from './ThemeToggle';

// ← מחוץ ל-App
function AppRoutes() {
  const location = useLocation();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/category" element={<Category key={location.search} />} />
      <Route path="/auth" element={<AuthForm />} />
      <Route path="/new-topic" element={<NewTopic />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/articles/new" element={<NewArticleForm />} />
      <Route path="/events/new" element={<NewEventForm />} />
      <Route path="/jobs/new" element={<NewJobForm />} />
      <Route path="/articles/:id" element={<ArticlePage />} />
      <Route path="/events/:id" element={<EventPage />} />
      <Route path="/jobs/:id" element={<JobPage />} />
      <Route path="/articles/:id/edit" element={<EditArticle />} />
      <Route path="/events/:id/edit" element={<EditEvent />} />
      <Route path="/jobs/:id/edit" element={<EditJob />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/search" element={<SearchResults />} />
    </Routes>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState({
    firstName: "אורח",
    lastName: "בבדיקה",
    votes: 10,
    isAdmin: false,
    links: { topics: [], posts: [], uploads: [] }
  });

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
    }
  }, []);

  return (
    <BrowserRouter>
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'row-reverse',
          minHeight: '100vh',
          backgroundColor: '#0a0e1a',
          color: '#e2e8f0'
        }}
      >
        {/* SIDEBAR RIGHT */}
        <aside style={{ width: '224px', flexShrink: 0 }}>
          <Sidebar currentUser={currentUser} />
        </aside>

        {/* CONTENT LEFT */}
        <main 
          style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '40px',
            direction: 'rtl'
          }}
        >
          <ThemeToggle />
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}