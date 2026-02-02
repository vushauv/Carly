import "./App.css";
import LoginPage from "./components/LoginPage/LoginPage";
import KPIPage from "./components/KPIPage/KPIPage";
import PartnerBookingsPage from "./components/PartnerBookingsPage/PartnerBookingsPage";
import Content from "./components/Elements/Content/Content";
import Header from "./components/Elements/Header/Header";
import { useState } from "react";
import Footer from "./components/Elements/Footer/Footer";
import ManageCarsPage from "./components/Cars/ManageCarsPage/ManageCarsPage";
import ManageBookingsPage from "./components/Bookings//ManageBookingsPage/ManageBookingsPage";
import UsersPage from "./components/Users/UsersPage/UsersPage";
import UserViewPage from "./components/Users/UserViewPage/UserViewPage";
import UserEditPage from "./components/Users/UserEditPage/UserEditPage";
import UserRegisterPage from "./components/Users/UserRegisterPage/UserRegisterPage";
import CarViewPage from "./components/Cars/CarViewPage/CarViewPage";
import CarEditPage from "./components/Cars/CarEditPage/CarEditPage";
import CarCreatePage from "./components/Cars/CarCreatePage/CarCreatePage";
import CarImagesPage from "./components/Cars/CarImagesPage/CarImagesPage";
import BookingViewPage from "./components/Bookings/BookingViewPage/BookingViewPage";
import BookingEditPage from "./components/Bookings//BookingEditPage/BookingEditPage";
import BookingCreatePage from "./components/Bookings//BookingCreatePage/BookingCreatePage";
import FlatBookingViewPage from "./components/PartnerBookingsPage/FlatBookingViewPage";

import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [loggedIn, setLoggedIn] = useState<boolean>(true);

  return (
    <>
      <Header loggedIn={loggedIn} />

      <Content>
        <Routes>
          <Route path="/login" element={loggedIn ? <Navigate to="/kpi" /> : <LoginPage setLoggedIn={setLoggedIn} />} />

          <Route
            path="/kpi"
            element={loggedIn ? <KPIPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/cars"
            element={loggedIn ? <ManageCarsPage /> : <Navigate to="/login" />}
          />

          {/* Car Management Routes */}
          <Route
            path="/cars/new"
            element={loggedIn ? <CarCreatePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/cars/:id/images"
            element={loggedIn ? <CarImagesPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/cars/:id"
            element={loggedIn ? <CarViewPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/cars/:id/edit"
            element={loggedIn ? <CarEditPage /> : <Navigate to="/login" />}
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

          {/* Booking Management Routes */}
          <Route
            path="/bookings/new"
            element={loggedIn ? <BookingCreatePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/bookings/:id"
            element={loggedIn ? <BookingViewPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/bookings/:id/edit"
            element={loggedIn ? <BookingEditPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/partner-bookings"
            element={loggedIn ? <PartnerBookingsPage /> : <Navigate to="/login" />}
          />

          {/* Flat Booking View Route */}
          <Route
            path="/flat-bookings/:id"
            element={loggedIn ? <FlatBookingViewPage /> : <Navigate to="/login" />}
          />

          <Route path="*" element={<Navigate to="/kpi" />} />
        </Routes>
      </Content>

      <Footer />
    </>
  );
}

export default App;

