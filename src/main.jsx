// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Your main App component
import './index.css';     // Global styles (imports _variables, _base, _theme, etc.)

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter> {/* Handles client-side routing */}
            <ThemeProvider> {/* Provides theme context (light/dark) */}
                <NotificationProvider> {/* Provides notification context and renders notifications */}
                    <AuthProvider> {/* Provides authentication context */}
                        <App /> {/* Your main application component with routes */}
                    </AuthProvider>
                </NotificationProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>,
);