import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import Rewatch from "./pages/Rewatch";
import Dashboard from "./pages/Dashboard";
import Curriculum from "./pages/Curriculum";
import Module from "./pages/Module";
import Lesson from "./pages/Lesson";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">

        <aside className="sidebar">

          <div className="sidebar-brand">
            <h2>ICT Tracker</h2>
            <p>Learning Progress</p>
          </div>

          <nav className="sidebar-nav">

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/curriculum"
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Curriculum
            </NavLink>

             <NavLink
              to="/rewatch"
            className={({ isActive }) =>
           `sidebar-link ${
            isActive ? "active" : ""
              }`
              }
>
  Rewatch
</NavLink>
          </nav>

        </aside>

        <div className="main-content">

          <header className="topbar">
            <div className="topbar-title">
              ICT Learning System
            </div>

            <div className="muted">
              Version 1
            </div>
          </header>

          <main className="page-container">

            <Routes>

              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/curriculum"
                element={<Curriculum />}
              />

              <Route
                path="/module/:id"
                element={<Module />}
              />

              <Route
                path="/lesson/:id"
                element={<Lesson />}

              />

              <Route
                path="/rewatch"
                element={<Rewatch />}
              />

            </Routes>

          </main>

        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;