import React, { useEffect, useRef } from 'react';
import Message from './Message';
import { MessageData } from '../lib/types';

type MessageListProps = {
  messages: MessageData[];
  currentParticipantId: string;
  currentLanguage: string;
};

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentParticipantId, 
  currentLanguage 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <Message 
            key={message.id} 
            message={message} 
            isCurrentUser={message.senderId === currentParticipantId}
            userLanguage={currentLanguage} 
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;