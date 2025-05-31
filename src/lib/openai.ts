import OpenAI from 'openai';

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error('Missing OpenAI API key environment variable');
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true // Note: In production, you'd use a backend service
});

export async function transcribeSpeech(audioBlob: Blob): Promise<string> {
  try {
    // Convert blob to file
    const audioFile = new File([audioBlob], 'recording.webm', { 
      type: 'audio/webm' 
    });
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });
    
    return transcription.text;
  } catch (error) {
    console.error('Error transcribing speech:', error);
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Only return the translated text without any additional information or comments.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 16000,
    });

    return chatCompletion.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
}