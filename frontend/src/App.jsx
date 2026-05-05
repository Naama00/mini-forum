import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, useState, useEffect } from "react";
import { routes } from './config/routeConfig';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';
import Sidebar from "./components/Sidebar";
import ThemeToggle from './components/ThemeToggle';
import './css/global.css';

// ← Routes outside App
function AppRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.element />}
          />
        ))}
      </Routes>
    </Suspense>
  );
}

/**
 * Main App component
 */
function App() {
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
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <div className="min-h-screen bg-gray-900/95 text-slate-100 rtl">
                <div className="flex flex-row max-w-7xl mx-auto">
                  <div className="flex-1 px-6 md:px-10 py-8 md:py-10 min-w-0">
                    <ThemeToggle />
                    <AppRoutes />
                  </div>
                  <Sidebar currentUser={currentUser} />
                </div>
              </div>
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
