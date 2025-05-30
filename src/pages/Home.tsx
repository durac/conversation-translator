import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessagesSquare, Globe, Users, Mic } from 'lucide-react';
import Button from '../components/Button';
import Header from '../components/Header';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="TranslateChat" />
      
      <main className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-primary-600 text-white p-4 rounded-full">
                <Globe size={40} />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">TranslateChat</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Break language barriers with real-time conversation translation
          </p>
          
          <div className="flex flex-col gap-4 mb-12">
            <Button 
              variant="primary" 
              fullWidth
              size="lg"
              icon={<MessagesSquare size={18} />}
            >
              <Link to="/create" className="w-full">Create Conversation</Link>
            </Button>
            
            <Button 
              variant="secondary"
              fullWidth
              size="lg"
              icon={<Users size={18} />}
            >
              <Link to="/join" className="w-full">Join Conversation</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="bg-primary-50 text-primary-600 p-3 rounded-full inline-flex mb-3">
                <Globe size={22} />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">Instant Translation</h3>
              <p className="text-gray-600 text-sm">Messages automatically translated to your language</p>
            </div>
            
            <div className="p-4">
              <div className="bg-primary-50 text-primary-600 p-3 rounded-full inline-flex mb-3">
                <Mic size={22} />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">Voice Input</h3>
              <p className="text-gray-600 text-sm">Speak naturally in your language</p>
            </div>
            
            <div className="p-4">
              <div className="bg-primary-50 text-primary-600 p-3 rounded-full inline-flex mb-3">
                <Users size={22} />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">Group Chat</h3>
              <p className="text-gray-600 text-sm">Multiple languages in one conversation</p>
            </div>
          </div>
        </motion.div>
      </main>
      
      <footer className="py-4 text-center text-gray-500 text-sm">
        <p>© 2025 TranslateChat. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;