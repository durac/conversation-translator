import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import LanguageSelector from '../components/LanguageSelector';
import { useRoomStore } from '../lib/room-store';
import { useSupabase } from '../lib/supabase-context';

type FormData = {
  roomCode: string;
  userName: string;
  language: string;
};

const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const supabase = useSupabase();
  const { joinRoom, isLoading, error, clearError } = useRoomStore();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      roomCode: '',
      userName: '',
      language: '',
    }
  });
  
  const onSubmit = async (data: FormData) => {
    try {
      await joinRoom(supabase, data.roomCode, data.userName, data.language);
      // Store user data for room rejoining
      localStorage.setItem(`room_${data.roomCode}_user`, JSON.stringify({
        userName: data.userName,
        language: data.language
      }));
      navigate(`/room/${data.roomCode}`);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const formatRoomCodeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    
    // Remove non-numeric characters
    value = value.replace(/[^0-9]/g, '');
    
    // Limit to 6 digits
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    
    event.target.value = value;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Join Conversation" showBackButton />
      
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="card">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary-100 p-3 rounded-full">
                <Users size={24} className="text-primary-600" />
              </div>
            </div>
            
            <h2 className="text-center text-xl font-semibold mb-6">
              Join an Existing Conversation
            </h2>
            
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-4">
                <div className="flex">
                  <div className="flex-1">
                    <p className="text-sm">{error}</p>
                  </div>
                  <button onClick={clearError} className="text-error-500">
                    &times;
                  </button>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Room Code
                </label>
                <input
                  id="roomCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  className={`input text-center text-lg tracking-wider ${errors.roomCode ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  {...register('roomCode', { 
                    required: 'Room code is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Room code must be 6 digits'
                    }
                  })}
                  onChange={formatRoomCodeInput}
                  maxLength={6}
                />
                {errors.roomCode && (
                  <p className="mt-1 text-sm text-error-600">{errors.roomCode.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  id="userName"
                  type="text"
                  placeholder="Enter your name"
                  className={`input ${errors.userName ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  {...register('userName', { required: 'Name is required' })}
                />
                {errors.userName && (
                  <p className="mt-1 text-sm text-error-600">{errors.userName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Language
                </label>
                <LanguageSelector
                  value={selectedLanguage}
                  onChange={(language) => {
                    setSelectedLanguage(language);
                    // Update the form value
                    register('language', { value: language });
                  }}
                  className={errors.language ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}
                />
                {errors.language && (
                  <p className="mt-1 text-sm text-error-600">{errors.language.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
                className="mt-6"
              >
                Join Conversation
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default JoinRoom;