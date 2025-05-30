import React from 'react';
import { motion } from 'framer-motion';
import { getLanguageName } from '../lib/languages';
import { MessageData } from '../lib/types';

type MessageProps = {
  message: MessageData;
  isCurrentUser: boolean;
  userLanguage: string;
};

const Message: React.FC<MessageProps> = ({ message, isCurrentUser, userLanguage }) => {
  const translatedText = message.translations[userLanguage] || 
    (message.originalLanguage === userLanguage ? message.originalText : '');

  // Skip displaying if no translation is available
  if (message.originalLanguage !== userLanguage && !translatedText) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div 
        className={`
          max-w-[80%] rounded-2xl px-4 py-2
          ${isCurrentUser 
            ? 'bg-primary-600 text-white rounded-tr-none' 
            : 'bg-white border border-gray-200 shadow-sm rounded-tl-none'
          }
        `}
      >
        {!isCurrentUser && (
          <div className="text-sm font-medium text-primary-700 mb-1">
            {message.senderName}
          </div>
        )}
        
        {/* Original message */}
        <div className="mb-1">
          {message.originalText}
        </div>
        
        {/* Only show translation if different from original language */}
        {message.originalLanguage !== userLanguage && translatedText && (
          <div className={`
            text-sm mt-1 pt-1 border-t
            ${isCurrentUser ? 'border-primary-500 text-primary-100' : 'border-gray-200 text-gray-600'}
          `}>
            <span className="font-medium mr-1">
              {getLanguageName(userLanguage)}:
            </span>
            {translatedText}
          </div>
        )}
        
        <div className={`
          text-xs mt-1
          ${isCurrentUser ? 'text-primary-200' : 'text-gray-400'}
        `}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
};

export default Message;