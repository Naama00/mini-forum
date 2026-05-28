import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, useState, useEffect } from "react";
import { routes } from './config/routeConfig';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import AppShell from "./components/layout/AppShell"; 

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>\
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
              <div className="min-h-screen w-full bg-slate-950 text-slate-100 antialiased" dir="rtl">
                
                {/* מבנה ה-Grid הראשי של האפליקציה - 2 עמודות קבועות */}
                <div className="grid min-h-screen w-full grid-cols-[14rem_minmax(0,1fr)] sm:grid-cols-[16rem_minmax(0,1fr)] md:grid-cols-[17.5rem_minmax(0,1fr)]">
                  
                  {/* עמודה 1: סיידבר קבוע מימין */}
                  <aside className="border-e border-white/5 bg-slate-900/40 h-full">
                    <Sidebar currentUser={currentUser} />
                  </aside>
                  
                  {/* עמודה 2: אזור התוכן הראשי משמאל */}
                  <main className="flex min-h-screen flex-col min-w-0 overflow-y-auto">
                    {/* ה-AppShell מנהל את הניווט הפנימי והתוכן הדינמי */}
                    <AppShell>
                      <AppRoutes />
                    </AppShell>
                  </main>

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