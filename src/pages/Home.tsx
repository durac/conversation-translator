import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessagesSquare, Users, Mic, Globe } from 'lucide-react';
import Button from '../components/Button';
import Header from '../components/Header';
import Logo from '../assets/logo.svg';

const Home: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      <div className="flex-none">
        <Header title="LingoLoom" />
      </div>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-50"></div>
              <div className="relative text-white p-4 rounded-full">
                <img src={Logo} alt="Logo" className="w-[100px] h-[100px] text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">LingoLoom</h1>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center">
            <div className="p-4">
              <div className="bg-primary-50 text-primary-600  p-3 rounded-full inline-flex mb-3">
                <Globe size={22} />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">Instantaneous</h3>
              <p className="text-gray-600 text-sm">Automatically translated to your language</p>
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
      
      <footer className="flex-none py-4 text-center text-gray-500 text-sm">
        <p>© 2025 LingoLoom. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home