export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          code: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          code: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          code?: string
          created_at?: string
          created_by?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          id: string
          room_id: string
          user_name: string
          language: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_name: string
          language: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_name?: string
          language?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          original_text: string
          original_language: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          original_text: string
          original_language: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          original_text?: string
          original_language?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "participants"
            referencedColumns: ["id"]
          }
        ]
      }
      translations: {
        Row: {
          id: string
          message_id: string
          language: string
          translated_text: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          language: string
          translated_text: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          language?: string
          translated_text?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_message_id_fkey"
            columns: ["message_id"]
            referencedRelation: "messages"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export interface RoomData {
  id: string;
  code: string;
  creatorName: string;
  creatorLanguage: string;
}

export interface ParticipantData {
  id: string;
  userName: string;
  language: string;
}

export interface MessageData {
  id: string;
  senderId: string;
  senderName: string;
  originalText: string;
  originalLanguage: string;
  translations: {
    [language: string]: string;
  };
  createdAt: string;
}

export interface LanguageOption {
  code: string;
  name: string;
}