import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Spinner } from "./ui/spinner";

export const RequireAuth: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Only block with spinner on initial load (no user yet, still checking session)
  if (loading && !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
