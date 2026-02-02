import "./App.css";
import LoginPage from "./components/LoginPage/LoginPage";
import KPIPage from "./components/KPIPage/KPIPage";
import PartnerBookingsPage from "./components/PartnerBookingsPage/PartnerBookingsPage";
import Content from "./components/Elements/Content/Content";
import Header from "./components/Elements/Header/Header";
import Footer from "./components/Elements/Footer/Footer";
import ProtectedRoute from "./components/Elements/ProtectedRoute/ProtectedRoute";
import ManageCarsPage from "./components/Cars//ManageCarsPage/ManageCarsPage";
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
  return (
    <>
      <Header />

      <Content>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          {/* <Route
            path="/kpi"
            element={
              <ProtectedRoute>
                <KPIPage />
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/cars"
            element={
              <ProtectedRoute>
                <ManageCarsPage />
              </ProtectedRoute>
            }
          />

          {/* Car Management Routes */}
          <Route
            path="/cars/new"
            element={
              <ProtectedRoute>
                <CarCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cars/:id/images"
            element={
              <ProtectedRoute>
                <CarImagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cars/:id"
            element={
              <ProtectedRoute>
                <CarViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cars/:id/edit"
            element={
              <ProtectedRoute>
                <CarEditPage />
              </ProtectedRoute>
            }
          />

          {/* User Management Routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/register"
            element={
              <ProtectedRoute>
                <UserRegisterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <UserViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <ProtectedRoute>
                <UserEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-bookings"
            element={
              <ProtectedRoute>
                <ManageBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Booking Management Routes */}
          <Route
            path="/bookings/new"
            element={
              <ProtectedRoute>
                <BookingCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id/edit"
            element={
              <ProtectedRoute>
                <BookingEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/partner-bookings"
            element={
              <ProtectedRoute>
                <PartnerBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Flat Booking View Route */}
          <Route
            path="/flat-bookings/:id"
            element={
              <ProtectedRoute>
                <FlatBookingViewPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/users" />} />
        </Routes>
      </Content>

      <Footer />
    </>
  );
}

export default App;

