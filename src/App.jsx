// src/App.jsx
import React, { useEffect } from 'react';
import AppRoutes from './routes'; // Your main routing configuration
import useAuth from './hooks/useAuth'; // To conditionally render ChatWidget
import ScrollToTop from './components/common/ScrollToTop'; // Helper to scroll to top on route change
import './App.css'; // App-specific global styles (not component/page specific)

import ChatWidget from './components/chat/UserChatWidget'; // Ensure this is UserChatWidget

const App = () => {

    // For conditional rendering of ChatWidget
    const { isAuthenticated, user, isLoading: authIsLoading } = useAuth();

    // Handle initial theme application based on localStorage or system preference
    useEffect(() => {
        
    }, []); 

    return (
        // The class `app-wrapper theme-${theme}` can be used if you want to style based on theme directly
        // For now, ThemeProvider handles `data-theme` on <html>
        <div className="app-wrapper">
            <ScrollToTop /> {/* Helper component to scroll to top on navigation */}
            <AppRoutes /> {/* Renders all your application's routes and pages */}
            {!authIsLoading && isAuthenticated && user && <ChatWidget />}
        </div>
    );
};

export default App;