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
      
      <div className="flex items-center w-full">
        <div className={`relative px-8 py-4 rounded-lg border transition-colors duration-200 w-full ${
          copied ? 'bg-green-100 border-green-300' : 'bg-primary-50 border-primary-200'
        }`}>
          <motion.div 
            className="text-3xl font-bold tracking-wider text-primary-800 px-4 py-2 rounded items-center justify-center flex flex-col"
            animate={{ backgroundColor: 'transparent' }}
            transition={{ duration: 0.2 }}
          >
            <span>
              {formatCode(code)}
            </span>
              <motion.span
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: copied ? 1 : 0,
                  height: copied ? 'auto' : 0
                }}
                className="text-sm text-green-600 mt-1 overflow-hidden"
              >
                Code copied!
              </motion.span>
          </motion.div>
          
          <motion.button
            onClick={copyToClipboard}
            className="absolute -right-2 -top-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Copy size={16} className="text-primary-700" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RoomCodeDisplay;