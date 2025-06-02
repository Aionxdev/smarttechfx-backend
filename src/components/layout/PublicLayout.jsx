// src/components/layout/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Assuming a 'public' variant of Navbar
import Footer from './Footer';
import './PublicLayout.css'; // Optional specific styles for this layout wrapper

const PublicLayout = () => {
    return (
        <div className="public-layout">
            <Navbar variant="public" />
            <main className="public-main-content">
                <Outlet /> {/* Content of LandingPage, TermsPage, etc. */}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;