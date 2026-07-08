import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { isPremiumTier } from "../lib/utils";

interface RequireTierProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

export const RequireTier: React.FC<RequireTierProps> = ({ children, redirectTo = "/campaigns" }) => {
  const { currentOwner } = useAuth();

  if (!currentOwner) {
    return <Navigate to="/login" replace />;
  }

  const isPremium = isPremiumTier(currentOwner.tier);

  if (!isPremium) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
