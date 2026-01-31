import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * RoleGuard
 * - Use blockedRoles to deny certain roles
 * - Use allowedRoles to allow only certain roles
 *
 * If denied, redirects to /dashboard.
 */
const RoleGuard = ({ children, blockedRoles = [], allowedRoles = [] }) => {
  const role = localStorage.getItem('role');

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (blockedRoles.length > 0 && blockedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleGuard;
