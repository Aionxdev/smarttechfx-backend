import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import PropTypes from 'prop-types';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Common Components
import Button from '../components/common/Button';
import PlanCard from '../components/plans/PlanCard';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';

// Services
import { planApiService, publicApiService } from '../services'; 

// Utils & Constants
import { APP_NAME, ROUTES } from '../utils/constants';
import logger from '../utils/logger.util.js';
import { formatCurrency } from '../utils/formatters.js';

// Styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './LandingPage.css'; 

// Assets
import heroPoster from '../assets/heroImage.jpg';

// Icons
import {
    TrendingUp, Zap, ShieldCheck, Users, Cpu, BarChartBig, ChevronRight,
    Lock, GitCompareArrows, Target, CheckCircle, LifeBuoy, Shuffle,
    Award, UsersRound, BrainCircuit, ArrowRight
} from 'lucide-react';

// CoinGecko IDs for backend proxy to fetch
const COINGECKO_COIN_IDS_FOR_REQUEST = [
    'bitcoin', 'ethereum', 'tether', 'binancecoin', 'ripple', 'cardano',
    'solana', 'polkadot', 'dogecoin', 'matic-network', 'litecoin', 'avalanche-2',
    'tron', 'shiba-inu', 'chainlink'
];

const LandingPage = () => {
    const [plans, setPlans] = useState([]);
    const [cryptoMarketData, setCryptoMarketData] = useState([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);
    const [priceFetchError, setPriceFetchError] = useState(''); // Correctly 
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
        document.title = `${APP_NAME} - AI-Powered Crypto Investing`;
        window.scrollTo(0, 0);

        const fetchPlans = async () => {
            setIsLoadingPlans(true);
            try {
                const planResponse = await planApiService.getPublicInvestmentPlanGuideApi();
                if (planResponse.success && planResponse.data) {
                    setPlans(planResponse.data.slice(0, 3));
                } else {
                    logger.error("Landing: Failed to fetch plans:", planResponse.message); setPlans([]);
                }
            } catch (error) { logger.error("Landing: Error fetching plans:", error); setPlans([]); }
            finally { setIsLoadingPlans(false); }
        };

        const fetchCryptoPricesViaBackend = async () => {
            console.log("Landing: Fetching crypto prices via backend proxy..."); // DEBUG
            setIsLoadingPrices(true);
            setPriceFetchError('');
            try {
                const response = await publicApiService.getFreePublicCryptoPricesApi(COINGECKO_COIN_IDS_FOR_REQUEST);
                if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                    setCryptoMarketData(response.data);
                    console.log("Landing: Crypto market data SET from backend:", response.data.length); // DEBUG
                } else {
                    const msg = response.message || "Backend did not return expected price data.";
                    logger.error("Landing:", msg, response.data);
                    setCryptoMarketData([]); setPriceFetchError(msg);
                }
            } catch (error) {
                const msg = error.message || 'Failed to fetch crypto prices.';
                logger.error("Landing: Error calling price service:", error);
                setCryptoMarketData([]); setPriceFetchError(msg);
            } finally {
                setIsLoadingPrices(false);
                console.log("Landing: fetchCryptoPrices finished. isLoadingPrices:", false); // DEBUG
            }
        };

        fetchPlans();
        fetchCryptoPricesViaBackend();
        const priceInterval = setInterval(fetchCryptoPricesViaBackend, 60000 * 5); // Refresh every 5 mins
        return () => clearInterval(priceInterval);
    }, []);

    const handleGetStarted = () => navigate(ROUTES.REGISTER);
    const handleViewPlans = () => navigate(ROUTES.USER_PLANS);

    const testimonialSliderSettings = {
        dots: true, infinite: true, speed: 700, slidesToShow: 2, slidesToScroll: 1,
        autoplay: true, autoplaySpeed: 5500, pauseOnHover: true, arrows: false,
        responsive: [{ breakpoint: 768, settings: { slidesToShow: 1, arrows: false } }]
    };

    return (
        <div className="landing-page-wrapper">
            {/* --- 1. Hero Section --- */}
            <section className="hero-section video-hero">
                <img
                    src={heroPoster}
                    alt="Hero Background"
                    className="hero-video-bg loaded" // Or conditionally apply classes based on your logic
                />

                <div className="hero-overlay"></div>
                <div className="container hero-content-container text-center" data-aos="fade-in" data-aos-delay="300">
                    <h1 className="hero-title">Intelligent Crypto Investing, <span className="highlight-text">Powered by AI</span></h1>
                    <p className="hero-subtitle">Join {APP_NAME} to leverage advanced artificial intelligence for optimized crypto portfolio growth and secure asset management.</p>
                    <div className="hero-cta-buttons">
                        <Button variant="primary" size="xl" onClick={handleGetStarted} className="hero-cta pulse-hover">
                            Get Started Free
                        </Button>
                        <Button variant="outline-light" size="xl" onClick={handleViewPlans} className="hero-cta-secondary">Explore Investment Plans</Button>
                    </div>
                </div>
            </section>

            {/* --- 2. Crypto Price Ticker (Marquee) --- */}
            {isLoadingPrices && !cryptoMarketData.length ? (
                <div className="price-ticker-loading">Loading Market Prices...</div>
            ) : cryptoMarketData.length > 0 ? (
                <section className="price-ticker-section">
                    <div className="ticker-marquee-wrapper"><div className="ticker-track">
                        {[...cryptoMarketData, ...cryptoMarketData, ...cryptoMarketData].map((coin, index) => (
                            <div key={`${coin.id}-${index}`} className="ticker-item">
                                <img src={coin.image} alt={coin.name} className="ticker-coin-logo" />
                                <span className="ticker-coin-symbol">{coin.symbol.toUpperCase()}</span>
                                <span className="ticker-coin-price">{formatCurrency(coin.current_price, 2, coin.current_price < 1 ? 4 : 2)}</span>
                                <span className={`ticker-coin-change ${coin.price_change_percentage_24h >= 0 ? 'up' : 'down'}`}>
                                    {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                                </span>
                            </div>
                        ))}
                    </div></div>
                </section>
            ) : priceFetchError ? (
                <div className="price-ticker-loading error">{priceFetchError}</div>
            ) : (
                <div className="price-ticker-loading">Market data currently unavailable.</div>
            )}

            {/* --- 3. "Why Choose Us?" Section --- */}
            <section className="why-choose-us-section section-padding alternate-bg">
                <div className="container">
                    <h2 className="section-title text-center" data-aos="fade-up">The {APP_NAME} Advantage</h2>
                    <p className="section-subtitle text-center" data-aos="fade-up" data-aos-delay="100">Experience the new era of crypto investing with features designed for performance, security, and ease of use.</p>
                    <div className="features-grid-landing">
                        <div className="feature-item" data-aos="fade-right" data-aos-delay="300"><ShieldCheck size={36} className="feature-icon" /><h3>Fortress-Level Security</h3><p>Employing cold storage, multi-factor authentication, and regular audits to keep your assets safe.</p></div>
                        <div className="feature-item" data-aos="fade-left" data-aos-delay="200"><TrendingUp size={36} className="feature-icon" /><h3>Optimized Returns</h3><p>Diverse, AI-selected plans aiming for consistent growth and competitive returns on your investments.</p></div>
                        <div className="feature-item" data-aos="fade-left" data-aos-delay="300"><UsersRound size={36} className="feature-icon" /><h3>User-Friendly Platform</h3><p>Intuitive dashboard and seamless experience for both novice and expert crypto investors.</p></div>
                    </div>
                </div>
            </section>

            {/* --- 4. How It Works --- */}
            <section className="how-it-works-section section-padding">
                <div className="container">
                    <h2 className="section-title text-center" data-aos="fade-up">Start Your Investing Journey</h2>
                    <div className="steps-grid-visual">
                        <div className="step-item-visual" data-aos="fade-up" data-aos-delay="100"><div className="step-icon-wrapper"><Users size={32} /></div><h3>1. Quick Sign Up</h3><p>Create your secure account in under two minutes.</p></div>
                        <div className="step-item-visual" data-aos="fade-up" data-aos-delay="200"><div className="step-icon-wrapper"><Zap size={32} /></div><h3>2. Select & Fund</h3><p>Choose a managed plan and fund it with your crypto.</p></div>
                        <div className="step-item-visual" data-aos="fade-up" data-aos-delay="300"><div className="step-icon-wrapper"><Cpu size={32} /></div><h3>3. AI at Work</h3><p>Our algorithms optimize your investments 24/7 for growth.</p></div>
                    </div>
                </div>
            </section>

            {/* --- 5. Investment Plans Preview --- */}
            <section className="plans-overview-section section-padding alternate-bg">
                <div className="container">
                    <h2 className="section-title text-center" data-aos="fade-up">Investment Plans</h2>
                    <p className="section-subtitle text-center" data-aos="fade-up" data-aos-delay="100">Select a plan that matches your ambitions.</p>
                    {isLoadingPlans ? <div className="loading-placeholder"><Spinner size="lg" /></div> : (
                        plans.length > 0 ? (
                            <div className="plans-grid-landing">
                                {plans.map((plan, index) => (
                                    <div key={plan._id} data-aos="zoom-in-up" data-aos-delay={(index + 1) * 100} className="plan-card-wrapper-landing">
                                        <PlanCard plan={plan} onInvestNowClick={() => navigate(ROUTES.REGISTER)} />
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-center info-text">Our investment plans are currently being fine-tuned by our AI. Please check back shortly!</p>
                    )}
                    {plans.length > 0 && (
                        <div className="text-center section-cta-spacing" data-aos="fade-up">
                            <Button variant="primary" size="lg" onClick={handleViewPlans} className="pulse-hover">
                                Explore All Plans
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* --- 6. Security Highlights Section --- */}
            <section className="security-focus-section section-padding">
                <div className="container security-container-flex">
                    <div className="security-image-area" data-aos="fade-right">
                        <Lock size={120} color="var(--theme-primary-main)" strokeWidth={1.2} />
                    </div>
                    <div className="security-content-wrapper" data-aos="fade-left">
                        <h2 className="section-title text-left">Your Security is Paramount</h2>
                        <p className="section-subtitle text-left less-margin">We are committed to providing a fortress-like environment for your digital assets.</p>
                        <ul className="security-features-list">
                            <li><CheckCircle size={20} /> Cutting-Edge Encryption</li>
                            <li><CheckCircle size={20} /> Predominant Cold Storage</li>
                            <li><CheckCircle size={20} /> Proactive Threat Intelligence</li>
                            <li><CheckCircle size={20} /> Regular Penetration Testing</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* --- 7. Testimonials --- */}
            <section className="testimonials-section section-padding">
                <div className="container">
                    <h2 className="section-title text-center" data-aos="fade-up">What Our Investors Say</h2>
                    <Slider {...testimonialSliderSettings} className="testimonial-carousel">
                        <div className="testimonial-slide-item"><Card className="testimonial-card"><p className="testimonial-text">"{APP_NAME}'s has simplified my crypto investments. Impressive returns!"</p><p className="testimonial-author">- Jordan K., Tech Entrepreneur</p></Card></div>
                        <div className="testimonial-slide-item"><Card className="testimonial-card"><p className="testimonial-text">"Easy to navigate, even for a crypto newbie. The security gives me peace of mind."</p><p className="testimonial-author">- Lynda M., Marketing Pro</p></Card></div>
                        <div className="testimonial-slide-item"><Card className="testimonial-card"><p className="testimonial-text">"Top-notch transparency and AI performance. Highly recommended for serious investors."</p><p className="testimonial-author">- Dan G., Retired Exec</p></Card></div>
                    </Slider>
                </div>
            </section>



            {/* --- 9. Final Call to Action (CTA) --- */}
            <section className="final-cta-section text-center section-padding">
                <div className="container" data-aos="zoom-in">
                    <h2 className="section-title">Begin Your AI-Powered Crypto Success Story Today.</h2>
                    <p className="section-subtitle">Unlock unparalleled investment potential with {APP_NAME}. Your journey to smarter crypto wealth starts now.</p>
                    <Button variant="light" size="xl" onClick={handleGetStarted} className="hero-cta pulse-hover final-cta-button">
                        Register Now
                    </Button>
                </div>
            </section>

            {/* --- Sticky Mobile CTA --- */}
            <div className="sticky-invest-cta mobile-only">
                <Button variant="primary" size="lg" onClick={handleGetStarted} fullWidth>Start Investing Now</Button>
            </div>
        </div>
    );
};

export default LandingPage;