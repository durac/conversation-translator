import { create } from 'zustand';
import { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { MessageData, ParticipantData } from './types';

interface RoomState {
  roomId: string | null;
  roomCode: string | null;
  participants: ParticipantData[];
  messages: MessageData[];
  currentParticipantId: string | null;
  currentLanguage: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createRoom: (supabase: SupabaseClient, creatorName: string, language: string) => Promise<string>;
  joinRoom: (supabase: SupabaseClient, roomCode: string, userName: string, language: string) => Promise<void>;
  leaveRoom: (supabase: SupabaseClient) => void;
  sendMessage: (supabase: SupabaseClient, text: string) => Promise<void>;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  roomId: null,
  roomCode: null,
  participants: [],
  messages: [],
  currentParticipantId: null,
  currentLanguage: null,
  isLoading: false,
  error: null,

  createRoom: async (supabase: SupabaseClient, creatorName: string, language: string) => {
    set({ isLoading: true, error: null });
    try {
      // Generate a 6-digit room code
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      const roomId = nanoid();
      
      // Insert room
      const { error: roomError } = await supabase
        .from('rooms')
        .insert({
          id: roomId,
          code: roomCode,
          created_by: creatorName
        });
        
      if (roomError) throw new Error(roomError.message);
      
      // Insert creator as first participant
      const participantId = nanoid();
      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          id: participantId,
          room_id: roomId,
          user_name: creatorName,
          language: language
        });
        
      if (participantError) throw new Error(participantError.message);
      
      // Set room data in store
      set({
        roomId,
        roomCode,
        participants: [{ id: participantId, userName: creatorName, language }],
        currentParticipantId: participantId,
        currentLanguage: language,
        isLoading: false
      });
      
      // Setup real-time subscription
      setupRoomSubscriptions(supabase, roomId);
      
      return roomCode;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create room', 
        isLoading: false 
      });
      throw error;
    }
  },

  joinRoom: async (supabase: SupabaseClient, roomCode: string, userName: string, language: string) => {
    set({ isLoading: true, error: null });
    try {
      // Find room by code
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('id, code')
        .eq('code', roomCode)
        .single();
        
      if (roomError) throw new Error('Room not found');
      
      const roomId = roomData.id;
      
      // Insert new participant
      const participantId = nanoid();
      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          id: participantId,
          room_id: roomId,
          user_name: userName,
          language: language
        });
        
      if (participantError) throw new Error(participantError.message);
      
      // Get existing participants
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('id, user_name, language')
        .eq('room_id', roomId);
        
      if (participantsError) throw new Error(participantsError.message);
      
      // Get existing messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id, 
          original_text,
          original_language,
          created_at,
          sender_id,
          participants(user_name),
          translations(language, translated_text)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw new Error(messagesError.message);
      
      // Format messages
      const formattedMessages = messages.map((msg) => {
        return {
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.participants?.user_name || 'Unknown',
          originalText: msg.original_text,
          originalLanguage: msg.original_language,
          translations: msg.translations.reduce((acc, t) => {
            acc[t.language] = t.translated_text;
            return acc;
          }, {}),
          createdAt: msg.created_at
        };
      });
      
      // Set room data in store
      set({
        roomId,
        roomCode,
        participants: participants.map(p => ({
          id: p.id,
          userName: p.user_name,
          language: p.language
        })),
        messages: formattedMessages,
        currentParticipantId: participantId,
        currentLanguage: language,
        isLoading: false
      });
      
      // Setup real-time subscription
      setupRoomSubscriptions(supabase, roomId);
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to join room', 
        isLoading: false 
      });
      throw error;
    }
  },

  leaveRoom: (supabase: SupabaseClient) => {
    const { roomId, currentParticipantId } = get();
    
    if (roomId && currentParticipantId) {
      // Remove participant from database
      supabase
        .from('participants')
        .delete()
        .eq('id', currentParticipantId)
        .then(() => {
          // Remove subscriptions
          supabase.removeAllChannels();
          
          // Reset store
          set({
            roomId: null,
            roomCode: null,
            participants: [],
            messages: [],
            currentParticipantId: null,
            currentLanguage: null
          });
        })
        .catch(error => {
          console.error('Error leaving room:', error);
        });
    }
  },

  sendMessage: async (supabase: SupabaseClient, text: string) => {
    const { roomId, currentParticipantId, currentLanguage, participants } = get();
    
    if (!roomId || !currentParticipantId || !currentLanguage) {
      set({ error: 'Not connected to a room' });
      return;
    }
    
    try {
      const messageId = nanoid();
      
      // Insert message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          room_id: roomId,
          sender_id: currentParticipantId,
          original_text: text,
          original_language: currentLanguage
        });
        
      if (messageError) throw new Error(messageError.message);
      
      // Create translations for each participant's language
      const uniqueLanguages = [...new Set(participants.map(p => p.language))];
      
      // Don't translate for the original language
      const languagesToTranslate = uniqueLanguages.filter(lang => lang !== currentLanguage);
      
      // This would typically be done on a server to avoid exposing API keys
      // For this example, we're doing it client-side
      const translationPromises = languagesToTranslate.map(async (language) => {
        const translatedText = await translateText(text, language);
        
        return supabase
          .from('translations')
          .insert({
            message_id: messageId,
            language,
            translated_text: translatedText
          });
      });
      
      await Promise.all(translationPromises);
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message'
      });
    }
  },
  
  clearError: () => set({ error: null })
}));

// Helper function to set up real-time subscriptions
function setupRoomSubscriptions(supabase: SupabaseClient, roomId: string) {
  // Listen for new participants
  supabase
    .channel(`room:${roomId}:participants`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'participants',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      useRoomStore.setState(state => ({
        participants: [
          ...state.participants,
          {
            id: payload.new.id,
            userName: payload.new.user_name,
            language: payload.new.language
          }
        ]
      }));
    })
    .on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'participants',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      useRoomStore.setState(state => ({
        participants: state.participants.filter(p => p.id !== payload.old.id)
      }));
    })
    .subscribe();
    
  // Listen for new messages
  supabase
    .channel(`room:${roomId}:messages`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.${roomId}`
    }, async (payload) => {
      // Get participant info for the sender
      const { data: senderData } = await supabase
        .from('participants')
        .select('user_name')
        .eq('id', payload.new.sender_id)
        .single();
        
      // Get translations for this message
      const { data: translations } = await supabase
        .from('translations')
        .select('language, translated_text')
        .eq('message_id', payload.new.id);
        
      const translationsMap = translations?.reduce((acc, t) => {
        acc[t.language] = t.translated_text;
        return acc;
      }, {}) || {};
      
      const newMessage = {
        id: payload.new.id,
        senderId: payload.new.sender_id,
        senderName: senderData?.user_name || 'Unknown',
        originalText: payload.new.original_text,
        originalLanguage: payload.new.original_language,
        translations: translationsMap,
        createdAt: payload.new.created_at
      };
      
      useRoomStore.setState(state => ({
        messages: [...state.messages, newMessage]
      }));
    })
    .subscribe();
    
  // Listen for new translations
  supabase
    .channel(`room:${roomId}:translations`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'translations'
    }, async (payload) => {
      // Find the message this translation belongs to
      const { data: messageData } = await supabase
        .from('messages')
        .select('id, room_id')
        .eq('id', payload.new.message_id)
        .single();
        
      // Only update if it's for our room
      if (messageData?.room_id === roomId) {
        useRoomStore.setState(state => ({
          messages: state.messages.map(msg => {
            if (msg.id === payload.new.message_id) {
              return {
                ...msg,
                translations: {
                  ...msg.translations,
                  [payload.new.language]: payload.new.translated_text
                }
              };
            }
            return msg;
          })
        }));
      }
    })
    .subscribe();
}

// Mock function for translation - would be replaced by actual OpenAI call
async function translateText(text: string, targetLanguage: string): Promise<string> {
  // This is just a placeholder - in the real app, we'd call the OpenAI API
  // But for this example, we're just appending a note
  return `[Translated to ${targetLanguage}]: ${text}`;
}