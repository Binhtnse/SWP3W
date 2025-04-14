import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from '../hooks/useAuthState'

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isLoggedInRef, roleRef } = useAuthState();

  // Since GUEST is allowed, we can directly render for guest access
  if (allowedRoles?.includes("GUEST")) {
    return <>{children}</>;
  }

  if (!isLoggedInRef.current) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(roleRef.current)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;