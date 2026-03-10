import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./Home";
import Category from "./Category";
import AuthForm from "./Login";
import NewTopic from "./NewTopic";
import ProfilePage from "./Profile";
import Sidebar from "./Sidebar";

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
      {/* מבנה ה-Layout הכללי */}
      <div className="app-main-wrapper">
        <div className="app-content-layout">

          {/* הסיידבר יופיע כאן ויהיה קבוע בכל הדפים */}
          <Sidebar currentUser={currentUser} />

          {/* האזור שבו התוכן של הדפים מתחלף */}
          <div className="page-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category" element={<Category />} />
              <Route path="/auth" element={<AuthForm />} />
              <Route path="/new-topic" element={<NewTopic />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
            </Routes>
          </div>

        </div>
      </div>
    </BrowserRouter>
  );
}