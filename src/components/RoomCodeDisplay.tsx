import React from 'react';
import { Copy } from 'lucide-react';
import { motion } from 'framer-motion';

type RoomCodeDisplayProps = {
  code: string;
};

const RoomCodeDisplay: React.FC<RoomCodeDisplayProps> = ({ code }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCode = (code: string) => {
    return code.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.08 }}
        className="inline-block"
      >
        {char}
      </motion.span>
    ));
  };

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-gray-600 mb-2">Share this code with others to join the conversation:</p>
      
      <div className="flex items-center">
        <div className="relative px-8 py-4 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="text-3xl font-bold tracking-wider text-primary-800">
            {formatCode(code)}
          </div>
          
          <motion.button
            onClick={copyToClipboard}
            className="absolute -right-2 -top-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Copy size={16} className="text-primary-700" />
          </motion.button>
          
          {copied && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-green-600 font-medium"
            >
              Code copied!
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCodeDisplay;