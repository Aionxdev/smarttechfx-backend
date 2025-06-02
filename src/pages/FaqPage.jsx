// src/pages/user/FaqPage.jsx
import React, { useState, useEffect } from 'react';
import { APP_NAME } from '../utils/constants';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import './FaqPage.css'; // Page-specific styles

// Sample FAQ data - In a real app, this might come from a CMS or backend API
const faqData = [
    {
        id: 'q1',
        question: "How do I create an account?",
        answer:
            "Click on the 'Sign Up' button on the homepage or login page. Fill in your details (full name, email, password). You'll receive an OTP to your email to verify your account. Once verified, you can log in.",
    },
    {
        id: 'q2',
        question: "What investment plans are available?",
        answer: `We offer several plans:
      <ul>
          <li><strong>Basic Plan:</strong> 3% daily ROI for 7 days. Min $200, Max $4999.</li>
          <li><strong>Gold Plan:</strong> 3.5% daily ROI for 30 days. Min $5000, Max $14000.</li>
          <li><strong>Executive Plan:</strong> 4% daily ROI for 90 days. Min $100,000, Max $600,000.</li>
      </ul>
      Each plan has specific terms, investment ranges, and ROI percentages. You can find detailed information on the 'Investment Plans' page.`,
    },
    {
        id: 'q3',
        question: "How do I make an investment?",
        answer:
            "Once logged in, navigate to 'Investment Plans'. Choose a plan that suits you, enter the amount you wish to invest (in USD). Select the cryptocurrency you want to pay with. The system will show you the equivalent crypto amount and the wallet address to send funds to. After sending the funds, submit your Transaction ID (TXID) on the platform for our team to verify.",
    },
    {
        id: 'q4',
        question: "Which cryptocurrencies are supported for investment?",
        answer:
            "We currently support Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Solana (SOL), Polygon (MATIC), Litecoin (LTC), Ripple (XRP), Dogecoin (DOGE), Binance Coin (BNB), and Bitcoin Cash (BCH) for making investments.",
    },
    {
        id: 'q5',
        question: "How do I withdraw my earnings?",
        answer:
            "After your investment plan matures, the profits (and principal, if applicable) become available for withdrawal. Go to the 'Withdraw Funds' page. Ensure your payout wallet address for the desired cryptocurrency is set up in your 'My Profile' section. Enter the amount you wish to withdraw (in USD), select the payout crypto, and authorize with your wallet PIN. Withdrawal requests are processed by our admin team.",
    },
    {
        id: 'q6',
        question: "How long do withdrawals take to process?",
        answer:
            "Withdrawal requests are typically processed by our admin team within 24-48 business hours after approval. The time for funds to reflect in your wallet will then depend on the blockchain network speed for the specific cryptocurrency.",
    },
    {
        id: 'q7',
        question: "Is my investment secure?",
        answer: `We take security very seriously. Our platform employs various security measures including data encryption, secure server infrastructure, and best practices for handling user funds and information. However, please remember that all investments carry risk, and cryptocurrency markets can be volatile. Always invest responsibly.`,
    },
    {
        id: 'q8',
        question: "What is KYC verification and is it mandatory?",
        answer:
            "KYC (Know Your Customer) verification is an optional process for now, but may be required for certain higher transaction limits or specific regulatory compliance in the future. It involves submitting identity documents to verify your identity. This helps us maintain a secure platform and comply with financial regulations.",
    },
];

const FaqItem = ({ faq, isOpen, onToggle }) => {
    return (
        <div className={`faq-item ${isOpen ? 'open' : ''}`}>
            <button
                className="faq-question"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
            >
                <span>{faq.question}</span>
                <span className="faq-icon">
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </span>
            </button>
            <div
                id={`faq-answer-${faq.id}`}
                className="faq-answer"
                role="region"
                aria-hidden={!isOpen}
            >
                <div
                    className="faq-answer-content"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
            </div>
        </div>
    );
};

const FaqPage = () => {
    const [openFaqId, setOpenFaqId] = useState(null); // Only one FAQ open at a time

    useEffect(() => {
        document.title = `FAQ - ${APP_NAME}`;
        window.scrollTo(0, 0); // Scroll to top on page load
    }, []);

    const handleToggleFaq = (id) => {
        setOpenFaqId(openFaqId === id ? null : id);
    };

    return (
        <div className="faq-page">
            <header className="static-page-header">
                <h1>Frequently Asked Questions</h1>
                <p>Find answers to common questions about {APP_NAME}.</p>
            </header>

            <section className="static-page-content">
                {faqData.length > 0 ? (
                    <div className="faq-list">
                        {faqData.map((faq) => (
                            <FaqItem
                                key={faq.id}
                                faq={faq}
                                isOpen={openFaqId === faq.id}
                                onToggle={() => handleToggleFaq(faq.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <p>No FAQs available at the moment. Please check back later.</p>
                )}
            </section>
        </div>
    );
};

export default FaqPage;
