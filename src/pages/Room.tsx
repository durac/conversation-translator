import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    // If we have a roomId from URL but no roomCode in state, try to join the room
    if (roomId && !roomCode) {
      // First check if this is a valid room code (6 digits)
      if (/^\d{6}$/.test(roomId)) {
        // Attempt to rejoin with stored user data
        const storedUserData = localStorage.getItem(`room_${roomId}_user`);
        if (storedUserData) {
          const { userName, language } = JSON.parse(storedUserData);
          joinRoom(supabase, roomId, userName, language).catch(() => {
            navigate('/');
          });
        } else {
          // No stored user data, redirect to join page
          navigate('/join');
        }
      } else {
        navigate('/');
      }
    }
  }, [roomId, roomCode, supabase, joinRoom, navigate]);

  const handleLeaveRoom = () => {
    if (roomId) {
      localStorage.removeItem(`room_${roomId}_user`);
    }
    leaveRoom(supabase);
    navigate('/');
  };

  const handleSendMessage = (text: string) => {
    if (text.trim()) {
      sendMessage(supabase, text);
    }
  };

  // Show loading state while joining room
  if (!roomCode || !currentParticipantId || !currentLanguage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Joining conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="TranslateChat" showBackButton roomCode={roomCode} />
      
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
          Leave Conversation
        </Button>
      </div>
    </div>
  );
};

export default Room;