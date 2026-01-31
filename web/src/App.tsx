import "./App.css";
import LoginPage from "./components/LoginPage/LoginPage";
import KPIPage from "./components/KPIPage/KPIPage";
import PartnerBookingsPage from "./components/PartnerBookingsPage/PartnerBookingsPage";
import Content from "./components/Content/Content";
import Header from "./components/Header/Header";
import { useState } from "react";
import Footer from "./components/Footer/Footer";
import ManageCarsPage from "./components/ManageCarsPage/ManageCarsPage";
import ManageBookingsPage from "./components/ManageBookingsPage/ManageBookingsPage";
import UsersPage from "./components/UsersPage/UsersPage";
import UserViewPage from "./components/UserViewPage/UserViewPage";
import UserEditPage from "./components/UserEditPage/UserEditPage";
import UserRegisterPage from "./components/UserRegisterPage/UserRegisterPage";

import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [loggedIn, setLoggedIn] = useState<boolean>(true);

  return (
    <>
      <Header loggedIn={loggedIn} />

      <Content>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/kpi"
            element={loggedIn ? <KPIPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/cars"
            element={loggedIn ? <ManageCarsPage /> : <Navigate to="/login" />}
          />

          {/* User Management Routes */}
          <Route
            path="/users"
            element={loggedIn ? <UsersPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/users/register"
            element={loggedIn ? <UserRegisterPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/users/:id"
            element={loggedIn ? <UserViewPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/users/:id/edit"
            element={loggedIn ? <UserEditPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/manage-bookings"
            element={loggedIn ? <ManageBookingsPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/partner-bookings"
            element={loggedIn ? <PartnerBookingsPage /> : <Navigate to="/login" />}
          />

          <Route path="*" element={<Navigate to="/kpi" />} />
        </Routes>
      </Content>

      <Footer />
    </>
  );
}

export default App;

