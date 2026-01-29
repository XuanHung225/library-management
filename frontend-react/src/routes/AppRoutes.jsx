// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import LandingPage from "../pages/public/LandingPage";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import VerifyEmail from "../pages/public/VerifyEmail";
import ChangePassword from "../pages/member/ChangePassword";
import RequestPasswordReset from "../pages/public/RequestPasswordReset";
import ResetPassword from "../pages/public/ResetPassword";

import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import LibLayout from "../layouts/LibLayout";
import AdminLayout from "../layouts/AdminLayout";

import UserProfile from "../pages/member/UserProfile";
import EditProfile from "../pages/member/EditProfile";
import MyLoans from "../pages/member/MyLoans";
import MyFines from "../pages/member/MyFines";

import Books from "../pages/public/Books";
import BookDetail from "../pages/public/BookDetail";
import BorrowBookPage from "../pages/member/BorrowBooks";

import ApproveLoansPage from "../pages/librarian/ApproveLoans";
import ConfirmPickupPage from "../pages/librarian/ConfirmPickup";
import RejectedLoansPage from "../pages/librarian/RejectedLoans";
import ManageBookPage from "../pages/librarian/ManageBooks";
import ManageUsers from "../pages/librarian/ManageUsers";
import ReturnBook from "../pages/librarian/ReturnBook";
import ManageFines from "../pages/librarian/ManageFines";
import StatisticsAdmin from "../pages/admin/Statistics";
import StatisticsLibrarian from "../pages/librarian/StaLib";
import AdminLogs from "../pages/admin/AdminLogs";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<RequestPasswordReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />

        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetail />} />
      </Route>

      <Route
        element={
          <RoleRoute allowedRoles={["user"]}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route path="/member/profile" element={<UserProfile />} />
        <Route path="/member/change-password" element={<ChangePassword />} />
        <Route path="/member/edit-profile" element={<EditProfile />} />

        <Route path="/borrow-books" element={<Books />} />
        <Route path="/member/books/:id" element={<BookDetail />} />

        <Route path="/borrow/:id" element={<BorrowBookPage />} />

        <Route path="/my-loans" element={<MyLoans />} />
        <Route path="/my-fines" element={<MyFines />} />
      </Route>

      {/* Librarian routes */}
      <Route
        element={
          <RoleRoute allowedRoles={["librarian"]}>
            <LibLayout />
          </RoleRoute>
        }
      >
        <Route path="/librarian/profile" element={<UserProfile />} />
        <Route path="/librarian/change-password" element={<ChangePassword />} />
        <Route path="/librarian/edit-profile" element={<EditProfile />} />

        <Route path="/approve-loans" element={<ApproveLoansPage />} />
        <Route path="/confirm-pickup" element={<ConfirmPickupPage />} />
        <Route path="/rejected-loans" element={<RejectedLoansPage />} />
        <Route path="/return-books" element={<ReturnBook />} />
        <Route path="/manage-fines" element={<ManageFines />} />

        <Route path="/librarian/add-book" element={<ManageBookPage />} />
        <Route path="/librarian/books/:id" element={<BookDetail />} />
        <Route path="/librarian/books/edit/:id" element={<ManageBookPage />} />
        <Route path="/librarian/books" element={<Books />} />

        <Route path="/librarian/users" element={<ManageUsers />} />

        <Route path="/librarian/statistics" element={<StatisticsLibrarian />} />
      </Route>

      {/* Admin routes can be added similarly */}
      <Route
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route path="/admin/books" element={<Books />} />
        <Route path="/admin/books/:id" element={<BookDetail />} />
        <Route path="/admin/add-book" element={<ManageBookPage />} />
        <Route path="/admin/books/edit/:id" element={<ManageBookPage />} />

        <Route path="/admin/users" element={<ManageUsers />} />

        <Route path="/admin/logs" element={<AdminLogs />} />

        <Route path="/admin/statistics" element={<StatisticsAdmin />} />
      </Route>
    </Routes>
  );
}
