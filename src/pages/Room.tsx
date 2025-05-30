import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import RoomCodeDisplay from '../components/RoomCodeDisplay';
import ParticipantsList from '../components/ParticipantsList';
import Button from '../components/Button';
import { useRoomStore } from '../lib/room-store';
import { useSupabase } from '../lib/supabase-context';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const supabase = useSupabase();
  const { t } = useTranslation();
  const { 
    roomCode,
    participants,
    messages,
    currentParticipantId,
    currentLanguage,
    error,
    clearError,
    sendMessage,
    leaveRoom,
    joinRoom
  } = useRoomStore();

  // Use a ref to track if we've already attempted to join
  const hasAttemptedJoin = React.useRef(false);

  useEffect(() => {
    if (!roomId || hasAttemptedJoin.current) return;

    const attemptJoin = async () => {
      hasAttemptedJoin.current = true;
      
      // Try to get stored participant data
      const storedData = localStorage.getItem(`room_${roomId}_user`);
      if (storedData) {
        try {
          const { userName, language } = JSON.parse(storedData);
          await joinRoom(supabase, roomId, userName, language);
          return;
        } catch (error) {
          console.error('Error rejoining with stored data:', error);
          // If stored data fails, clear it and continue with normal join flow
          localStorage.removeItem(`room_${roomId}_user`);
        }
      }
      
      // If no stored data or stored data failed, redirect to join page
      navigate(`/join?roomCode=${roomId}`);
    };

    attemptJoin();
  }, [roomId, navigate, joinRoom, supabase]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    await sendMessage(supabase, text);
  };

  const handleLeaveRoom = async () => {
    await leaveRoom(supabase);
    navigate('/');
  };

  // If we have a roomCode but no currentParticipantId, we're creating a new room
  if (roomCode && !currentParticipantId) {
    return (
      <div className="flex flex-col h-screen">
        <Header title={t('app.name')} roomCode={roomCode} />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('room.created.title')}</h2>
            <p className="text-gray-600 mb-6">{t('room.created.shareCode')}</p>
            <RoomCodeDisplay code={roomCode} />
            <p className="text-gray-500 mt-6">{t('room.created.waiting')}</p>
          </div>
        </div>
        <div className="bg-white p-3 border-t border-gray-200">
          <Button 
            variant="secondary"
            onClick={handleLeaveRoom}
            className="w-full"
          >
            {t('room.leaveConversation')}
          </Button>
        </div>
      </div>
    );
  }

  // At this point, we know all required values are non-null
  if (!roomCode || !currentParticipantId || !currentLanguage) {
    return null; // This should never happen due to the checks above
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title={t('app.name')} roomCode={roomCode} />
      
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 m-4 rounded">
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4"
      >
        <RoomCodeDisplay code={roomCode} />
      </motion.div>

      <ParticipantsList 
        participants={participants} 
        currentParticipantId={currentParticipantId} 
      />

      <div className="flex-1 flex flex-col bg-gray-50">
        <MessageList 
          messages={messages} 
          currentParticipantId={currentParticipantId} 
          currentLanguage={currentLanguage} 
        />
        
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
      
      <div className="bg-white p-3 border-t border-gray-200">
        <Button 
          variant="secondary"
          onClick={handleLeaveRoom}
          className="w-full"
        >
          {t('room.leaveConversation')}
        </Button>
      </div>
    </div>
  );
};

export default Room;