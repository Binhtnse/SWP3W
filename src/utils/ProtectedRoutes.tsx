import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from '../hooks/useAuthState'

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isLoggedInRef, roleRef, checkAuthState } = useAuthState();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Force a check of auth state when component mounts
    checkAuthState();
    setIsChecking(false);
  }, [checkAuthState]);

  // Show nothing while checking auth state
  if (isChecking) {
    return null;
  }

  console.log("ProtectedRoute check:", { 
    isLoggedIn: isLoggedInRef.current, 
    role: roleRef.current,
    allowedRoles,
    accessToken: localStorage.getItem("accessToken"),
    userRole: localStorage.getItem("userRole")
  });

  // If user is not logged in, redirect to login
  if (!isLoggedInRef.current) {
    console.log("Not logged in, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user's role is included
  if (allowedRoles && !allowedRoles.includes(roleRef.current)) {
    // User doesn't have the required role, redirect to home
    console.log(`User role ${roleRef.current} not in allowed roles, redirecting to home`);
    return <Navigate to="/" replace />;
  }

  // User is logged in and has the required role (or no specific role is required)
  console.log("Access granted to protected route");
  return <>{children}</>;
};

export default ProtectedRoute;