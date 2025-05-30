import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import RoomCodeDisplay from '../components/RoomCodeDisplay';
import ParticipantsList from '../components/ParticipantsList';
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
    joinRoom,
    leaveRoom,
    isCreatingRoom
  } = useRoomStore();

  // Use a ref to track if we've already attempted to join
  const hasAttemptedJoin = React.useRef(false);

  useEffect(() => {
    // If we have a roomId from URL but no roomCode in state, try to join the room
    // Only attempt to join if we're not in the process of creating a room
    if (roomId && !roomCode && !hasAttemptedJoin.current && !isCreatingRoom) {
      hasAttemptedJoin.current = true;
      // First check if this is a valid room code (6 digits)
      if (/^\d{6}$/.test(roomId)) {
        // Attempt to rejoin with stored user data
        const storedUserData = localStorage.getItem(`room_${roomId}_user`);
        if (storedUserData) {
          try {
            const { userName, language } = JSON.parse(storedUserData);
            // Only join if we don't already have a currentParticipantId
            if (!currentParticipantId) {
              joinRoom(supabase, roomId, userName, language).catch((error) => {
                console.error('Failed to join room:', error);
                // If join fails, clear stored data and redirect
                localStorage.removeItem(`room_${roomId}_user`);
                navigate('/');
              });
            }
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem(`room_${roomId}_user`);
            navigate('/join');
          }
        } else {
          // No stored user data, redirect to join page
          navigate('/join');
        }
      } else {
        navigate('/');
      }
    }

    // Cleanup function
    return () => {
      hasAttemptedJoin.current = false;
    };
  }, [roomId, roomCode, currentParticipantId, isCreatingRoom, supabase, joinRoom, navigate]);

  // Add cleanup effect to handle component unmount
  useEffect(() => {
    return () => {
      // When component unmounts, clear the room state
      if (roomId) {
        const { roomCode: currentRoomCode } = useRoomStore.getState();
        // Only clear if we're actually leaving the room (not just refreshing)
        if (currentRoomCode === roomId) {
          useRoomStore.setState({
            roomId: null,
            roomCode: null,
            currentParticipantId: null,
            currentLanguage: null,
            participants: [],
            messages: []
          });
        }
      }
    };
  }, [roomId]);

  const handleSendMessage = (text: string) => {
    if (text.trim()) {
      sendMessage(supabase, text);
    }
  };

  const handleLeaveRoom = () => {
    if (roomId) {
      localStorage.removeItem(`room_${roomId}_user`);
    }
    leaveRoom(supabase);
    navigate('/');
  };
  
  // Show loading state only when joining an existing room
  if (roomId && (!roomCode || !currentParticipantId || !currentLanguage)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Joining conversation...</p>
        </div>
      </div>
    );
  }

  // If we have a roomCode, but participants is currently just myself
  if (roomCode && currentParticipantId && participants.length === 1 && participants[0].id === currentParticipantId) {
    return (
      <div className="fixed inset-0 flex flex-col bg-gray-50">
        <div className="flex-none">
          <Header title="LingoLoom" roomCode={roomCode} onLeaveRoom={handleLeaveRoom} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Room Created!</h2>
            <RoomCodeDisplay code={roomCode} />
            <p className="text-gray-500 mt-6">Waiting for others to join...</p>
          </div>
        </div>
      </div>
    );
  }

  // At this point, we know all required values are non-null
  if (!roomCode || !currentParticipantId || !currentLanguage) {
    return null; // This should never happen due to the checks above
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      <div className="flex-none">
        <Header title="LingoLoom" roomCode={roomCode} onLeaveRoom={handleLeaveRoom} />
        
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 mx-4 mt-2 rounded">
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

        <ParticipantsList 
          participants={participants} 
          currentParticipantId={currentParticipantId} 
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <MessageList 
            messages={messages} 
            currentParticipantId={currentParticipantId} 
            currentLanguage={currentLanguage} 
          />
        </div>
        
        <div className="flex-shrink-0">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default Room;