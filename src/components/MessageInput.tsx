import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import AudioRecorder from './AudioRecorder';

type MessageInputProps = {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
};

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isDisabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleTranscription = (text: string) => {
    if (text.trim()) {
      onSendMessage(text.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white p-3 border-t">
      <div className="relative flex-1">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isDisabled}
          className="input pr-10 py-3"
        />
        
        <motion.button
          type="submit"
          disabled={!message.trim() || isDisabled}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full
            ${!message.trim() || isDisabled ? 'text-gray-400' : 'text-primary-600 hover:bg-primary-50'}
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send size={20} />
        </motion.button>
      </div>
      
      <AudioRecorder onTranscription={handleTranscription} isDisabled={isDisabled} />
    </form>
  );
};

export default MessageInput;