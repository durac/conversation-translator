import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Button from '../components/Button';
import LanguageSelector from '../components/LanguageSelector';
import { useRoomStore } from '../lib/room-store';
import { useSupabase } from '../lib/supabase-context';

type FormData = {
  userName: string;
  language: string;
};

const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const supabase = useSupabase();
  const { createRoom, isLoading } = useRoomStore();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [error, setError] = useState('');
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      userName: '',
      language: '',
    }
  });
  
  // Add validation for language
  React.useEffect(() => {
    register('language', { required: 'Language is required' });
  }, [register]);

  const onSubmit = async (data: FormData) => {
    if (!data.language) {
      return; // Don't submit if no language is selected
    }
    try {
      const { roomCode, participantId } = await createRoom(supabase, data.userName, data.language);
      // Store participant data with the returned participantId
      localStorage.setItem(`room_${roomCode}_user`, JSON.stringify({
        userName: data.userName,
        language: data.language,
        participantId
      }));
      navigate(`/room/${roomCode}`);
    } catch (error) {
      console.error('Error creating room:', error);
      setError(error instanceof Error ? error.message : 'Failed to create room');
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      <div className="flex-none">
        <Header title="Create Conversation" showBackButton/>
      </div>
      
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-4 md:p-6 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto py-8"
          >
            <div className="card">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary-100 p-3 rounded-full">
                  <UserPlus size={24} className="text-primary-600" />
                </div>
              </div>
              
              <h2 className="text-center text-xl font-semibold mb-6">
                Create a New Conversation
              </h2>
              
              {error && (
                <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-4">
                  <div className="flex">
                    <div className="flex-1">
                      <p className="text-sm">{error}</p>
                    </div>
                    <button onClick={() => setError('')} className="text-error-500">
                      &times;
                    </button>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                      setValue('language', language, { shouldValidate: true });
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
                  Create Room
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CreateRoom;