// src/components/common/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        try {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth' // Or 'auto' for instant scroll
            });
        } catch {
            // Fallback for older browsers
            window.scrollTo(0, 0);
        }
    }, [pathname]); // Effect runs when the pathname (route) changes

    return null; // This component does not render anything
};

export default ScrollToTop;