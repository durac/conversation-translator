import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { transcribeSpeech } from '../lib/openai';

type AudioRecorderProps = {
  onTranscription: (text: string) => void;
  isDisabled?: boolean;
};

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscription, isDisabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          const transcription = await transcribeSpeech(audioBlob);
          onTranscription(transcription);
        } catch (error) {
          console.error('Transcription error:', error);
          // Handle the error (e.g., show a notification)
        } finally {
          setIsProcessing(false);
        }
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      // Handle the error (e.g., show a notification)
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <motion.button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isDisabled || isProcessing}
      className={`
        relative rounded-full p-3 flex items-center justify-center
        ${isRecording ? 'bg-error-500 text-white' : 'bg-primary-600 text-white'}
        ${isDisabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
        transition-all duration-200
        ${isRecording ? 'recording-pulse' : ''}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isProcessing ? (
        <Loader className="w-6 h-6 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-6 h-6" />
      ) : (
        <Mic className="w-6 h-6" />
      )}
      
      {isRecording && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-error-500"
          animate={{ scale: [1, 1.15], opacity: [1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

export default AudioRecorder;