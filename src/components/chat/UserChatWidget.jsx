// src/components/chat/UserChatWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import ChatMessageItem from './ChatMessageItem';
import Button from '../common/Button';
import useAuth from '../../hooks/useAuth';
import { APP_NAME, SUPPORT_EMAIL_ADDRESS, CHAT_MESSAGE_ROLES } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import { MessageSquareText, X } from 'lucide-react';
import './UserChatWidget.css';

const UserChatWidget = () => {
    const { user, isAuthenticated } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [composedMessages, setComposedMessages] = useState([]); // Displays user's side of conversation
    const [currentMessageText, setCurrentMessageText] = useState('');
    const [uiInfoMessage, setUiInfoMessage] = useState(''); // For messages like "Your email app should open..."

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null); // For focusing textarea

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [composedMessages]);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsOpen(false); // Close widget if user logs out
            setComposedMessages([]);
            setCurrentMessageText('');
            setUiInfoMessage('');
        }
    }, [isAuthenticated]);

    const toggleChat = () => {
        setIsOpen(prev => {
            if (!prev) { // If opening
                setUiInfoMessage('');
                setComposedMessages([]); // Clear previous composition on open
                setCurrentMessageText('');
                setTimeout(() => textareaRef.current?.focus(), 0); // Focus textarea when opened
            }
            return !prev;
        });
    };

    const handleMessageInputChange = (e) => {
        setCurrentMessageText(e.target.value);
        if (uiInfoMessage) setUiInfoMessage(''); // Clear info message when user types
    };

    const handleComposeAndSend = (e) => {
        e.preventDefault();
        const trimmedMessage = currentMessageText.trim();
        if (!trimmedMessage) {
            setUiInfoMessage("Please type your message before sending.");
            return;
        }

        // Add current message to the display
        const newDisplayMessage = {
            role: CHAT_MESSAGE_ROLES.USER,
            text: trimmedMessage,
            timestamp: new Date().toISOString()
        };
        const updatedComposedMessages = [...composedMessages, newDisplayMessage];
        setComposedMessages(updatedComposedMessages);

        // Construct the full email body from all composed messages
        const fullEmailBody = updatedComposedMessages.map(msg => msg.text).join("\n\n");

        const subject = encodeURIComponent(`Support Query from ${user?.email || 'User'} - ${APP_NAME}`);
        const userContext = `User Information:\nEmail: ${user?.email || 'N/A'}\nUser ID: ${user?._id || 'N/A'}\nPlatform: ${APP_NAME}\n-----------------\n\nUser Message:\n`;
        const body = encodeURIComponent(userContext + fullEmailBody);
        const mailtoLink = `mailto:${SUPPORT_EMAIL_ADDRESS}?subject=${subject}&body=${body}`;

        try {
            window.location.href = mailtoLink;
            setUiInfoMessage("Your email application should have opened with your message. Please review and send it.");
            setCurrentMessageText(''); // Clear input field after "sending" to mailto
            // Keep composedMessages displayed as a record of what was put into the email
        } catch (error) {
            logger.error("UserChatWidget: Could not open mail client:", error);
            setUiInfoMessage(`Could not open your email client. Please manually email ${SUPPORT_EMAIL_ADDRESS} with your message.`);
        }
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <>
            <button
                onClick={toggleChat}
                className="chat-widget-toggle-button"
                aria-label={isOpen ? "Close Support Form" : "Open Support Form"}
                title="Contact Support"
            >
                {isOpen ? <X size={24} /> : <MessageSquareText size={24} />}
                {/* {isOpen ? '✖' : '💬'} */}
            </button>

            {isOpen && (
                <div className="chat-widget-window contact-widget-window">
                    <div className="chat-widget-header">
                        <h3>Contact Support</h3>
                        <button onClick={toggleChat} aria-label="Close contact form" className="chat-close-btn">×</button>
                    </div>

                    <div className="chat-widget-messages contact-preview-area">
                        {composedMessages.length === 0 && !currentMessageText && !uiInfoMessage && (
                            <p className="empty-chat-placeholder">Type your message below to send to our support team via email.</p>
                        )}
                        {composedMessages.map((msg, index) => (
                            <ChatMessageItem key={index} senderRole={msg.role} text={msg.text} timestamp={msg.timestamp} />
                        ))}
                        {uiInfoMessage && (
                            <ChatMessageItem senderRole={CHAT_MESSAGE_ROLES.SYSTEM_INFO} text={uiInfoMessage} timestamp={new Date().toISOString()} />
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleComposeAndSend} className="contact-form-area">
                        <textarea
                            ref={textareaRef}
                            value={currentMessageText}
                            onChange={handleMessageInputChange}
                            placeholder="Type your message here..."
                            className="contact-textarea"
                            rows={4}
                            aria-label="Support message input"
                        />
                        <Button type="submit" variant="primary" fullWidth className="send-email-button">
                            Compose & Send via Email App
                        </Button>
                    </form>
                </div>
            )}
        </>
    );
};

export default UserChatWidget;