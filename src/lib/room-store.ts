import { create } from 'zustand';
import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { MessageData, ParticipantData, Database } from './types';
import { translateText as openAITranslateText } from './openai';

type DatabaseMessage = Database['public']['Tables']['messages']['Row'] & {
  participants: { user_name: string } | null;
  translations: Array<{ language: string; translated_text: string }>;
};

interface RoomState {
  roomId: string | null;
  roomCode: string | null;
  participants: ParticipantData[];
  messages: MessageData[];
  currentParticipantId: string | null;
  currentLanguage: string | null;
  isLoading: boolean;
  error: string | null;
  channel: RealtimeChannel | null;  // Use proper type for channel
  isCreatingRoom: boolean;  // Add flag for room creation state
  
  // Actions
  createRoom: (supabase: SupabaseClient, creatorName: string, language: string) => Promise<{ roomCode: string; participantId: string }>;
  joinRoom: (supabase: SupabaseClient<Database>, roomCode: string, userName: string, language: string) => Promise<{ participantId: string }>;
  leaveRoom: (supabase: SupabaseClient) => void;
  sendMessage: (supabase: SupabaseClient<Database>, text: string) => Promise<void>;
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
  channel: null,
  isCreatingRoom: false,

  createRoom: async (supabase: SupabaseClient, creatorName: string, language: string) => {
    set({ isLoading: true, error: null, isCreatingRoom: true });
    try {
      console.log('Creating room for:', creatorName);
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
      console.log('Creating participant with ID:', participantId);
      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          id: participantId,
          room_id: roomId,
          user_name: creatorName,
          language: language
        });
        
      if (participantError) throw new Error(participantError.message);
      
      // Get all participants to ensure we have the correct state
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('id, user_name, language')
        .eq('room_id', roomId);
        
      if (participantsError) throw new Error(participantsError.message);
      
      console.log('Initial participants:', participants);
      
      // Set room data in store
      const initialState = {
        roomId,
        roomCode,
        participants: (participants || []).map(p => ({
          id: p.id,
          userName: p.user_name,
          language: p.language
        })),
        currentParticipantId: participantId,
        currentLanguage: language,
        isLoading: false,
        isCreatingRoom: false
      };
      
      // Set initial state
      set(initialState);
      
      // Setup real-time subscription AFTER setting initial state
      const channel = setupRoomSubscriptions(supabase, roomId);
      
      // Store channel reference for cleanup
      const state = get();
      if (state.channel) {
        state.channel.unsubscribe();
      }
      set({ channel });
      
      return { roomCode, participantId };
    } catch (error) {
      console.error('Error creating room:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create room', 
        isLoading: false,
        isCreatingRoom: false
      });
      throw error;
    }
  },

  joinRoom: async (supabase: SupabaseClient<Database>, roomCode: string, userName: string, language: string) => {
    // Don't join if we're creating a room
    if (get().isCreatingRoom) {
      console.log('Skipping join while creating room');
      return { participantId: '' };
    }

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
      
      // Get stored participant ID for this room
      const storedUserData = localStorage.getItem(`room_${roomCode}_user`);
      let participantId: string;
      
      if (storedUserData) {
        try {
          const { participantId: storedId } = JSON.parse(storedUserData);
          
          // Verify the participant still exists
          const { data: existingParticipant } = await supabase
            .from('participants')
            .select('id, language')
            .eq('id', storedId)
            .eq('room_id', roomId)
            .single();
            
          console.log('***** existingParticipant', existingParticipant);
          if (existingParticipant) {
            // Use existing participant
            participantId = existingParticipant.id;
            language = existingParticipant.language; // Use stored language preference
          } else {
            // Stored participant no longer exists, create new one
            participantId = nanoid();
            const { error: participantError } = await supabase
              .from('participants')
              .insert({
                id: participantId,
                room_id: roomId,
                user_name: userName,
                language: language
              });
              
            if (participantError) throw new Error(participantError.message);
            
            // Store new participant ID
            localStorage.setItem(`room_${roomCode}_user`, JSON.stringify({
              userName,
              language,
              participantId
            }));
          }
        } catch {
          // If there's any error with stored data, create new participant
          participantId = nanoid();
          const { error: participantError } = await supabase
            .from('participants')
            .insert({
              id: participantId,
              room_id: roomId,
              user_name: userName,
              language: language
            });
            
          if (participantError) throw new Error(participantError.message);
          
          // Store new participant data
          localStorage.setItem(`room_${roomCode}_user`, JSON.stringify({
            userName,
            language,
            participantId
          }));
        }
      } else {
        // New participant
        participantId = nanoid();
        const { error: participantError } = await supabase
          .from('participants')
          .insert({
            id: participantId,
            room_id: roomId,
            user_name: userName,
            language: language
          });
          
        if (participantError) throw new Error(participantError.message);
        
        // Store participant data
        localStorage.setItem(`room_${roomCode}_user`, JSON.stringify({
          userName,
          language,
          participantId
        }));
      }
      
      // Get all participants
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
      const formattedMessages = (messages as DatabaseMessage[]).map((msg) => {
        return {
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.participants?.user_name || 'Unknown',
          originalText: msg.original_text,
          originalLanguage: msg.original_language,
          translations: msg.translations.reduce<Record<string, string>>((acc, t) => {
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
        participants: (participants || []).map(p => ({
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
      const channel = setupRoomSubscriptions(supabase, roomId);
      
      // Store channel reference for cleanup
      const state = get();
      if (state.channel) {
        state.channel.unsubscribe();
      }
      set({ channel });
      
      return { participantId };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join room';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },

  leaveRoom: (supabase: SupabaseClient) => {
    const { roomId, currentParticipantId, channel } = get();
    
    if (roomId && currentParticipantId) {
      // Cleanup subscription
      if (channel) {
        console.log('Cleaning up channel before leaving room');
        channel.unsubscribe();
      }
      
      // Only remove the participant from the database
      void supabase
        .from('participants')
        .delete()
        .eq('id', currentParticipantId)
        .then(() => {
          // Reset store state for this user only
          set({
            roomId: null,
            roomCode: null,
            currentParticipantId: null,
            currentLanguage: null,
            channel: null,
            isCreatingRoom: false,
            // Keep messages and other participants in the store
            // They will be cleared when the component unmounts
          });
        })
        .catch((error: Error) => {
          console.error('Error leaving room:', error);
        });
    }
  },

  sendMessage: async (supabase: SupabaseClient<Database>, text: string) => {
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
        
        const { error: translationError } = await supabase
          .from('translations')
          .insert({
            message_id: messageId,
            language,
            translated_text: translatedText
          });

        if (translationError) {
          throw new Error(`Failed to save translation for ${language}: ${translationError.message}`);
        }
      });
      
      await Promise.all(translationPromises).catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save translations';
        throw new Error(errorMessage);
      });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      set({ error: errorMessage });
    }
  },
  
  clearError: () => set({ error: null })
}));

// Helper function to set up real-time subscriptions
function setupRoomSubscriptions(supabase: SupabaseClient, roomId: string) {
  const store = useRoomStore;
  
  // Get existing channel
  const existingChannel = store.getState().channel;
  
  // Only remove the specific channel if it exists
  if (existingChannel) {
    console.log('Unsubscribing from existing channel');
    existingChannel.unsubscribe();
  }
  
  console.log('Setting up subscriptions for room:', roomId);
  
  // Create a single channel for all room events
  const channel = supabase
    .channel(`room:${roomId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: roomId }
      }
    })
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'participants',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      console.log('Received participant insert:', payload.new);
      const state = store.getState();
      // Only add the participant if they don't already exist
      if (!state.participants.some(p => p.id === payload.new.id)) {
        console.log('Adding new participant:', payload.new.id);
        store.setState({
          ...state,
          participants: [
            ...state.participants,
            {
              id: payload.new.id,
              userName: payload.new.user_name,
              language: payload.new.language
            }
          ]
        });
      } else {
        console.log('Participant already exists:', payload.new.id);
      }
    })
    .on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'participants',
      filter: `room_id=eq.${roomId}`
    }, async (payload) => {
      console.log('Received participant delete:', payload);
      // Fetch fresh participant list to ensure we have the latest state
      const { data: participants, error } = await supabase
        .from('participants')
        .select('id, user_name, language')
        .eq('room_id', roomId);

      if (error) {
        console.error('Error fetching participants after delete:', error);
        return;
      }

      if (participants) {
        console.log('Updating participants list after delete:', participants);
        const state = store.getState();
        // Update participants list, ensuring no duplicates
        const uniqueParticipants = participants.reduce((acc, p) => {
          if (!acc.some(existing => existing.id === p.id)) {
            acc.push({
              id: p.id,
              userName: p.user_name,
              language: p.language
            });
          }
          return acc;
        }, [] as ParticipantData[]);

        store.setState({
          ...state,
          participants: uniqueParticipants
        });
      }
    })
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.${roomId}`
    }, async (payload) => {
      console.log('Received message insert:', payload.new);
      // Get participant info for the sender
      const { data: senderData, error: senderError } = await supabase
        .from('participants')
        .select('user_name')
        .eq('id', payload.new.sender_id)
        .single();
        
      if (senderError) {
        console.error('Error fetching sender data:', senderError);
      }
        
      // Get translations for this message
      const { data: translations, error: translationsError } = await supabase
        .from('translations')
        .select('language, translated_text')
        .eq('message_id', payload.new.id);
        
      if (translationsError) {
        console.error('Error fetching translations:', translationsError);
      }
        
      const translationsMap = translations?.reduce<Record<string, string>>((acc, t) => {
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
      
      console.log('Adding new message to state:', newMessage);
      useRoomStore.setState(state => ({
        messages: [...state.messages, newMessage]
      }));
    })
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'translations'
    }, async (payload) => {
      console.log('Received translation insert:', payload.new);
      // Find the message this translation belongs to
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('id, room_id')
        .eq('id', payload.new.message_id)
        .single();
        
      if (messageError) {
        console.error('Error fetching message data for translation:', messageError);
        return;
      }
        
      // Only update if it's for our room
      if (messageData?.room_id === roomId) {
        console.log('Updating message with new translation:', payload.new);
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
      } else {
        console.log('Translation for different room, ignoring:', messageData?.room_id);
      }
    })
    .on('system', { event: 'disconnected' }, () => {
      console.log('Channel disconnected, attempting to reconnect...');
    })
    .on('system', { event: 'connected' }, () => {
      console.log('Channel connected successfully');
    })
    .subscribe((status, err) => {
      console.log('Subscription status:', status);
      if (err) {
        console.error('Subscription error:', err);
        // Attempt to reconnect on error
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.log('Attempting to reconnect...');
          setTimeout(() => {
            const newChannel = setupRoomSubscriptions(supabase, roomId);
            store.setState({ channel: newChannel });
          }, 1000);
        }
      }
    });

  return channel;
}

// Replace the mock translation function with the actual OpenAI implementation
async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    return await openAITranslateText(text, targetLanguage);
  } catch (error: unknown) {
    console.error('Translation error:', error);
    // Return a fallback message if translation fails
    return `[Translation failed for ${targetLanguage}]: ${text}`;
  }
}