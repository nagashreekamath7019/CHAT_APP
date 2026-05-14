import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { authUser } = useAuth();

    // If authUser is null, the user is not logged in
    if (!authUser) {
        // Redirect them to the login page
        return <Navigate to="/login" />;
    }

    // If user exists, render the child component (e.g., Profile)
    return children;
};

export default ProtectedRoute;