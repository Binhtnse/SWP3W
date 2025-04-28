import { useState, useEffect, useCallback, useRef } from "react";

export const useAuthState = () => {
  // Initialize state from localStorage immediately
  const accessToken = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole");
  const userFullName = localStorage.getItem("userFullName");
  
  const [role, setRole] = useState<string>(userRole || "");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!accessToken);
  const [userName, setUserName] = useState<string>(userFullName || "");

  const isLoggedInRef = useRef(!!accessToken);
  const roleRef = useRef(userRole || "");
  const userNameRef = useRef(userFullName || "");

  const checkAuthState = useCallback(() => {
    // Check for tokens directly
    const accessToken = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("userRole");
    const userFullName = localStorage.getItem("userFullName");

    console.log("Auth state check:", { 
      accessToken, 
      userRole, 
      currentIsLoggedIn: isLoggedInRef.current,
      currentRole: roleRef.current
    });

    if (accessToken) {
      // If we have an access token, consider the user logged in
      setIsLoggedIn(true);
      isLoggedInRef.current = true;
      
      // Set role if available, default to GUEST if not
      const role = userRole || "GUEST";
      setRole(role);
      roleRef.current = role;
      
      // Set username if available
      if (userFullName) {
        setUserName(userFullName);
        userNameRef.current = userFullName;
      }
      
      console.log("User authenticated:", { 
        isLoggedIn: true, 
        role: roleRef.current 
      });
    } else {
      // No token means not logged in
      resetAuthState();
      console.log("User not authenticated, state reset");
    }
  }, []);

  const resetAuthState = () => {
    setIsLoggedIn(false);
    setRole("GUEST");
    setUserName("");

    isLoggedInRef.current = false;
    roleRef.current = "GUEST";
    userNameRef.current = "";
  };

  useEffect(() => {
    checkAuthState();
    window.addEventListener("storage", checkAuthState);
    return () => window.removeEventListener("storage", checkAuthState);
  }, [checkAuthState]);

  return {
    role,
    isLoggedIn,
    userName,
    checkAuthState,
    setIsLoggedIn,
    setRole,
    setUserName,
    isLoggedInRef,
    roleRef,
    userNameRef,
  };
};
