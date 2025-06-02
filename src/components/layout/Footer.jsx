// src/components/layout/Footer.jsx
import { APP_NAME, ROUTES, SUPPORT_EMAIL_ADDRESS, SUPPORTED_CRYPTO_SYMBOLS_FRONTEND } from '../../utils/constants';
import './Footer.css';

const CryptoIconSmall = ({ symbol }) => (
    <div className="crypto-icon-footer" title={symbol}>
        {symbol}
    </div>
);


const Footer = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2019; // Your platform's start year

    return (
        <footer className="site-footer"> 
            <div className="footer-main-content">
                <div className="footer-container"> 
                    <div className="footer-grid">
                        {/* Column 1: About Us / Brand */}
                        <div className="footer-column about-column">
                            <h3 className="footer-logo">{APP_NAME}</h3>
                            <p className="footer-tagline">
                                Revolutionizing cryptocurrency investments with AI-powered insights and a secure,
                                user-centric platform. Join us to build your digital future.
                            </p>
                        </div>

                        {/* Column 2: Quick Links (Kept from your original structure) */}
                        <div className="footer-column links-column">
                            <h4 className="footer-column-title">Quick Links</h4>
                            <ul className="footer-link-list">
                                <li><a href={ROUTES.TERMS_OF_SERVICE}>Terms of Service</a></li>
                                <li><a href={ROUTES.PRIVACY_POLICY}>Privacy Policy</a></li>
                                <li><a href="/faqs">FAQ</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Contact Information */}
                        <div className="footer-column contact-column">
                            <h4 className="footer-column-title">Get In Touch</h4>
                            <ul className="footer-contact-list">
                                <li> {SUPPORT_EMAIL_ADDRESS}</li>
                            </ul>
                        </div>

                        {/* Column 4: Supported Cryptocurrencies */}
                        <div className="footer-column cryptos-column">
                            <h4 className="footer-column-title">We Support</h4>
                            <div className="footer-crypto-icons">
                                {SUPPORTED_CRYPTO_SYMBOLS_FRONTEND.slice(0, 10).map(symbol => (
                                    <CryptoIconSmall key={symbol} symbol={symbol} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-container">
                    <p className="footer-copyright">
                        &copy; {startYear} - {currentYear} {APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

// Add PropTypes for CryptoIconSmall if you keep it as a component here
import PropTypes from 'prop-types';
CryptoIconSmall.propTypes = { symbol: PropTypes.string.isRequired };

export default Footer;