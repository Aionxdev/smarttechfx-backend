// src/pages/TermsOfServicePage.jsx
import React, { useEffect } from 'react';
import { APP_NAME, APP_URL, SUPPORT_EMAIL_ADDRESS, JURISDICTION } from '../utils/constants';
import './StaticPage.css'; // Shared CSS file

const TermsOfServicePage = () => {
    useEffect(() => {
        document.title = `Terms of Service - ${APP_NAME}`;
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="static-page-container">
            <header className="static-page-header">
                <h1>Terms of Service</h1>
                <p className="last-updated">Last Updated: December 26, 2021</p> 
            </header>

            <section className="static-page-content">
                <article>
                    <h2>1. Agreement to Terms</h2>
                    <p>
                        These Terms of Service constitute a legally binding agreement made between you, whether personally
                        or on behalf of an entity ("you") and {APP_NAME}, concerning your access to and
                        use of the {APP_URL} website as well as any other media form, media channel, mobile website, linked, or otherwise connected thereto (collectively, the "Site" and the "Services").
                    </p>
                    <p>
                        You agree that by accessing the Site and/or Services, you have read, understood, and agreed to be bound
                        by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are
                        expressly prohibited from using the Site and Services and you must discontinue use immediately.
                    </p>

                    <h2>2. User Representations</h2>
                    <p>
                        By using the Services, you represent and warrant that: (1) all registration information you submit will be true,
                        accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such
                        registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms
                        of Service; (4) you are not a minor in the jurisdiction in which you reside...
                    </p>

                    <h2>3. User Registration</h2>
                    <p>
                        You may be required to register with the Site to access the Services. You agree to keep your password
                        confidential and will be responsible for all use of your account and password. We reserve the right to remove,
                        reclaim, or change a username you select if we determine, in our sole discretion, that such username is
                        inappropriate, obscene, or otherwise objectionable.
                    </p>

                    <h2>4. Investment Risks</h2>
                    <p>
                        You acknowledge and agree that investing in cryptocurrencies and related investment plans involves significant risk.
                        The value of cryptocurrencies can be volatile and may decrease or increase unexpectedly. Past performance is not
                        indicative of future results. {APP_NAME} does not guarantee any return on investment or profit. You are solely responsible
                        for your investment decisions and any losses incurred.
                    </p>

                    <h2>5. Prohibited Activities</h2>
                    <p>
                        You may not access or use the Site for any purpose other than that for which we make the Site available.
                        The Site may not be used in connection with any commercial endeavors except those that are specifically
                        endorsed or approved by us.
                    </p>

                    <h2>6. Intellectual Property Rights</h2>
                    <p>
                        Unless otherwise indicated, the Site and the Services are our proprietary property and all source code,
                        databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the
                        Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks")
                        are owned or controlled by us or licensed to us...
                    </p>

                    <h2>7. Termination</h2>
                    <p>
                        We reserve the right to, in our sole discretion and without notice or liability, deny access to and use of
                        the Site and the Services (including blocking certain IP addresses), to any person for any reason or for
                        no reason...
                    </p>

                    <h2>8. Governing Law</h2>
                    <p>
                        These Terms of Service and your use of the Site and the Services are governed by and construed in
                        accordance with the laws of {JURISDICTION} applicable to agreements made and to be entirely
                        performed within {JURISDICTION}, without regard to its conflict of law principles.
                    </p>

                    <h2>9. Modifications and Interruptions</h2>
                    <p>
                        We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason
                        at our sole discretion without notice...
                    </p>

                    <h2>10. Contact Us</h2>
                    <p>
                        In order to resolve a complaint regarding the Services or to receive further information regarding use of the
                        Services, please contact us at: {SUPPORT_EMAIL_ADDRESS}.
                    </p>
                </article>
            </section>
        </div>
    );
};

export default TermsOfServicePage;