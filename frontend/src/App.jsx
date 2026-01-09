import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/share/Login";
import ProtectedRoute from "./pages/share/ProtectedRoute";
import NotFound from "./pages/share/NotFound";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import ManageView from "./components/ManageView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - Super Admin */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin (Person-in-Charge) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Create/Manage Records */}
        <Route
          path="/admin/create-record"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <ManageView />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Users (Read-only) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[3, 4]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
