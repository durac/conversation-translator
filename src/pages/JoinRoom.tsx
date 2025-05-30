import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Button from '../components/Button';
import LanguageSelector from '../components/LanguageSelector';
import { useRoomStore } from '../lib/room-store';
import { useSupabase } from '../lib/supabase-context';

type FormData = {
  userName: string;
  language: string;
};

const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams<{ roomCode: string }>();
  const supabase = useSupabase();
  const { joinRoom, isLoading } = useRoomStore();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      userName: '',
      language: i18n.language,
    }
  });
  
  // Add validation for language and set initial value
  useEffect(() => {
    register('language', { required: t('join.errors.languageRequired') });
    setValue('language', i18n.language, { shouldValidate: true });
  }, [register, setValue, t, i18n.language]);

  const onSubmit = async (data: FormData) => {
    if (!roomCode || !data.language) {
      return; // Don't submit if no room code or language is selected
    }
    try {
      const participantId = await joinRoom(supabase, roomCode, data.userName, data.language);
      // Store participant data with the returned participantId
      localStorage.setItem(`room_${roomCode}_user`, JSON.stringify({
        userName: data.userName,
        language: data.language,
        participantId
      }));
      navigate(`/room/${roomCode}`);
    } catch (error) {
      console.error('Error joining room:', error);
      setError(error instanceof Error ? error.message : t('join.errors.joinFailed'));
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={t('app.name')} roomCode={roomCode} showBackButton />
      
      <main className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-primary-600 text-white p-3 rounded-full">
                  <Users size={24} />
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
              {t('join.title')}
            </h1>
            
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('join.yourName')}
                </label>
                <input
                  id="userName"
                  type="text"
                  placeholder="Enter your name"
                  className={`input ${errors.userName ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  {...register('userName', { required: t('join.errors.nameRequired') })}
                />
                {errors.userName && (
                  <p className="mt-1 text-sm text-error-600">{errors.userName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('join.yourLanguage')}
                </label>
                <LanguageSelector
                  value={selectedLanguage}
                  onChange={(language) => {
                    setSelectedLanguage(language);
                    setValue('language', language, { shouldValidate: true });
                  }}
                  className={errors.language ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}
                  placeholder={t('join.selectLanguage')}
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
                {t('join.joinButton')}
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default JoinRoom;