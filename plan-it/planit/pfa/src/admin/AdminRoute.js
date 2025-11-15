import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const role = sessionStorage.getItem('role');

  if (role !== 'ADMIN') {
    alert('접근 권한이 없습니다.');
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;