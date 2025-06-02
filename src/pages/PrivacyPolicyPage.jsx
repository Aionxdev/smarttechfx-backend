// src/pages/PrivacyPolicyPage.jsx
import React, { useEffect } from 'react';
import { APP_NAME, SUPPORT_EMAIL_ADDRESS, APP_URL } from '../utils/constants';
import './StaticPage.css'; // A shared CSS file for static content pages

const PrivacyPolicyPage = () => {
    useEffect(() => {
        document.title = `Privacy Policy - ${APP_NAME}`;
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="static-page-container">
            <header className="static-page-header">
                <h1>Privacy Policy</h1>
                <p className="last-updated">Last Updated: October 26, 2023</p>
            </header>

            <section className="static-page-content">
                <article>
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to {APP_NAME}. We are committed to protecting your personal information
                        and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices
                        with regards to your personal information, please contact us at {SUPPORT_EMAIL_ADDRESS}.
                    </p>
                    <p>
                        This privacy notice describes how we might use your information if you visit our website at
                        {APP_URL}, use our mobile application, or engage with us in other related ways – including any sales,
                        marketing, or events (collectively, the "Services").
                    </p>
                    <p>
                        Please read this privacy notice carefully as it will help you understand what we do with the information
                        that we collect.
                    </p>

                    <h2>2. Information We Collect</h2>
                    <p>
                        <strong>Personal Information You Disclose to Us:</strong> We collect personal information that you voluntarily
                        provide to us when you register on the Services, express an interest in obtaining information about us or our
                        products and services, when you participate in activities on the Services, or otherwise when you contact us.
                    </p>
                    <p>
                        The personal information that we collect depends on the context of your interactions with us and the Services,
                        the choices you make, and the products and features you use. The personal information we collect may include
                        the following: Full Name, Email Address, Phone Number, Password (hashed), Country,
                        Cryptocurrency Wallet Addresses (for payouts).
                    </p>
                    <p>
                        <strong>Information Automatically Collected:</strong> We automatically collect certain information when you visit,
                        use, or navigate the Services. This information does not reveal your specific identity (like your name or contact
                        information) but may include device and usage information, such as your IP address, browser and device characteristics,
                        operating system, referring URLs, device name, country, location, information about how and
                        when you use our Services, and other technical information.
                    </p>

                    <h2>3. How We Use Your Information</h2>
                    <p>
                        We use personal information collected via our Services for a variety of business purposes described below.
                        We process your personal information for these purposes in reliance on our legitimate business interests,
                        in order to enter into or perform a contract with you, with your consent, and/or for compliance with our
                        legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below.
                    </p>
                    <ul>
                        <li>To facilitate account creation and logon process.</li>
                        <li>To manage user accounts. We may use your information for the purposes of managing your account and keeping it in working order.</li>
                        <li>To send administrative information to you.</li>
                        <li>To protect our Services (e.g., for fraud monitoring and prevention).</li>
                        <li>To enforce our terms, conditions, and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.</li>
                        <li>To respond to legal requests and prevent harm.</li>
                        {/* Add more specific uses relevant to SmartTechFX */}
                    </ul>

                    <h2>4. Will Your Information Be Shared With Anyone?</h2>
                    <p>
                        We only share information with your consent, to comply with laws, to provide you with services,
                        to protect your rights, or to fulfill business obligations. We may process or share your data that we
                        hold based on the following legal basis: ...
                    </p>

                    <h2>5. How We Keep Your Information Safe</h2>
                    <p>
                        We have implemented appropriate technical and organizational security measures designed to protect
                        the security of any personal information we process. However, despite our safeguards and efforts to
                        secure your information, no electronic transmission over the Internet or information storage technology
                        can be guaranteed to be 100% secure...
                    </p>

                    <h2>6. Your Privacy Rights</h2>
                    <p>
                        In some regions (like the EEA, UK, and Canada), you have certain rights under applicable data protection
                        laws. These may include the right (i) to request access and obtain a copy of your personal information,
                        (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and
                        (iv) if applicable, to data portability...
                    </p>

                    <h2>7. Updates to This Notice</h2>
                    <p>
                        We may update this privacy notice from time to time. The updated version will be indicated by an updated
                        "Last Updated" date and the updated version will be effective as soon as it is accessible.
                    </p>

                    <h2>8. How Can You Contact Us About This Notice?</h2>
                    <p>
                        If you have questions or comments about this notice, you may email us at {SUPPORT_EMAIL_ADDRESS}.
                    </p>
                </article>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;