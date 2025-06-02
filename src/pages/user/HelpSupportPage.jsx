// src/pages/user/HelpSupportPage.jsx
import React, { useState, useEffect } from 'react';
import { APP_NAME, UI_STATE } from '../../utils/constants';
import Card from '../../components/common/Card';
import InputField from '../../components/common/InputField'; // For the message box
import Button from '../../components/common/Button';
import logger from '../../utils/logger.util.js';
import './HelpSupportPage.css'; 
import { Mail, HelpCircle } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

const SUPPORT_EMAIL_ADDRESS = `support@${APP_NAME.toLowerCase().replace(/\s+/g, '')}.com`; // Or from .env

const HelpSupportPage = () => {
    const [userMessage, setUserMessage] = useState('');
    const [emailSubject, setEmailSubject] = useState('Support Query from SmartTechFX User');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = `Help & Support - ${APP_NAME}`;
    }, []);

    const handleMessageChange = (e) => {
        setUserMessage(e.target.value);
    };

    const handleOpenEmailClient = (e) => {
        e.preventDefault();
        if (!userMessage.trim()) {
            alert("Please type your message before sending.");
            return;
        }
        const body = encodeURIComponent(userMessage);
        const subjectEnc = encodeURIComponent(emailSubject);
        const mailtoLink = `mailto:${SUPPORT_EMAIL_ADDRESS}?subject=${subjectEnc}&body=${body}`;

        // Attempt to open mail client
        // This might be blocked by some browsers if not a direct user interaction,
        // but within a form submit it's usually fine.
        try {
            window.location.href = mailtoLink;
            logger.info("Attempting to open mail client for support query.");
            // Optionally clear message after attempting, or on success if we could detect it
            // setUserMessage(''); // Clear after attempting
        } catch (error) {
            logger.error("Could not open mail client automatically:", error);
            alert(`Could not open your email client automatically. Please manually send an email to ${SUPPORT_EMAIL_ADDRESS} with your message.`);
        }
    };

    return (
        <div className="help-support-page">
            <header className="dashboard-page-header">
                <h1>Help & Support Center</h1>
                <p>Find answers to your questions or get in touch with our support team.</p>
            </header>

            <div className="help-support-content-grid">
                <Card title="Contact Support Directly" className="contact-support-card">
                    <p>
                        If you can't find what you're looking for in our FAQs, or need specific assistance
                        with your account, please feel free to email us directly or use the form below to pre-fill
                        an email in your mail application.
                    </p>
                    <p className="support-email-address">
                        <Mail size={18} /> 
                        Support Email: <a href={`mailto:${SUPPORT_EMAIL_ADDRESS}`}>{SUPPORT_EMAIL_ADDRESS}</a>
                    </p>

                    <form onSubmit={handleOpenEmailClient} className="support-message-form">
                        <InputField
                            label="Your Message / Query"
                            type="textarea" // Assuming InputField supports textarea
                            name="userMessage"
                            value={userMessage}
                            onChange={handleMessageChange}
                            placeholder="Describe your issue or question in detail..."
                            rows={8}
                            required
                        />
                        <InputField
                            label="Email Subject (Auto-filled)"
                            type="text"
                            name="emailSubject"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            required
                        />
                        <Button type="submit" variant="primary" fullWidth>
                            Open Email & Send Message
                        </Button>
                        <small className="mailto-notice">
                            This will attempt to open your default email application with the message pre-filled.
                        </small>
                    </form>
                </Card>

                {/* Placeholder for FAQ link or a few top FAQs */}
                <Card title="Frequently Asked Questions (FAQ)" className="faq-preview-card">
                    <p>
                        Have a common question? You might find your answer quickly in our FAQ section.
                    </p>
                    {/* Example Top FAQs (can be dynamic later) */}
                    <ul className="quick-faq-links">
                        <li><a href="#faq-how-to-invest">How do I make an investment?</a></li>
                        <li><a href="#faq-withdrawal-time">How long do withdrawals take?</a></li>
                        <li><a href="#faq-reset-password">I forgot my password, what do I do?</a></li>
                    </ul>
                    <div style={{ marginTop: 'var(--space-4)' }}>
                        <p>
                            For a comprehensive list of FAQs, please visit our full FAQ section.
                        </p>
                        <Button variant="outline" onClick={() => navigate('/faqs')} fullWidth>
                            View All FAQs
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default HelpSupportPage;