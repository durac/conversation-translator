import React from 'react';
import { Users } from 'lucide-react';
import { ParticipantData } from '../lib/types';
import { getLanguageName } from '../lib/languages';

type ParticipantsListProps = {
  participants: ParticipantData[];
  currentParticipantId: string;
};

const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants, currentParticipantId }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-3">
      <div className="flex items-center gap-2 text-primary-700 mb-2">
        <Users size={18} />
        <span className="font-medium">Participants ({participants.length})</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {participants.map(participant => (
          <div 
            key={participant.id} 
            className={`
              text-sm px-3 py-1.5 rounded-full
              ${participant.id === currentParticipantId 
                ? 'bg-primary-100 text-primary-800 border border-primary-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
              }
            `}
          >
            {participant.userName}
            <span className="ml-1 text-xs opacity-75">
              ({getLanguageName(participant.language)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;