// src/components/chat/ChatMessageItem.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/formatters';
import { CHAT_MESSAGE_ROLES } from '../../utils/constants';
// import { UserCircle2, Info } from 'lucide-react'; // Example icons
import './ChatMessageItem.css';

const ChatMessageItem = ({ senderRole, text, timestamp }) => {
    const isUser = senderRole === CHAT_MESSAGE_ROLES.USER;
    const isSystemInfo = senderRole === CHAT_MESSAGE_ROLES.SYSTEM_INFO;

    let messageClasses = 'chat-message-item-local'; // Use distinct class prefix
    if (isUser) messageClasses += ' user-message-local';
    if (isSystemInfo) messageClasses += ' system-info-message-local';

    const getAvatarContent = () => {
        if (isUser) return "You"; // <UserCircle2 size={20} />;
        if (isSystemInfo) return "Info"; // <Info size={20} />;
        return "?";
    };

    return (
        <div className={messageClasses}>
            {!isSystemInfo && ( // Optionally hide avatar for system info for cleaner look
                <div className="chat-message-avatar-local">
                    {getAvatarContent()}
                </div>
            )}
            <div className="chat-message-content-local">
                <p className="chat-message-text-local" dangerouslySetInnerHTML={isSystemInfo ? { __html: text } : undefined}>
                    {!isSystemInfo && text}
                </p>
                {timestamp && !isSystemInfo && (
                    <span className="chat-message-timestamp-local">
                        {formatDate(timestamp, 'p')}
                    </span>
                )}
            </div>
        </div>
    );
};

ChatMessageItem.propTypes = {
    senderRole: PropTypes.oneOf(Object.values(CHAT_MESSAGE_ROLES)).isRequired,
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.string,
};

export default ChatMessageItem;