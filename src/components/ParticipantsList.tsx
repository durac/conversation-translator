import React from 'react';
import { Users } from 'lucide-react';
import { ParticipantData } from '../lib/types';

type ParticipantsListProps = {
  participants: ParticipantData[];
  currentParticipantId: string;
};

const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants, currentParticipantId }) => {
  // Get current user data
  const currentUser = participants.find(p => p.id === currentParticipantId);
  // Filter out current user and calculate remaining count
  const otherParticipants = participants.filter(p => p.id !== currentParticipantId);
  const maxVisibleParticipants = window.innerWidth < 500 ? 3 : 6; // Show 3 on mobile, 6 on desktop
  const visibleParticipants = otherParticipants.slice(0, maxVisibleParticipants);
  const remainingCount = otherParticipants.length - maxVisibleParticipants;

  return (
    <div className="bg-white border-b border-gray-200 p-3">
      <div className="flex items-center gap-2 text-primary-700 mb-2">
        <Users size={18} />
        <span className="font-medium">Participants ({participants.length})</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {currentUser && (
          <div 
            className="text-sm px-3 py-1.5 rounded-full bg-primary-100 text-primary-800 border border-primary-200"
          >
            Me
            <span className="ml-1 text-xs opacity-75">
              ({currentUser?.language?.toUpperCase()})
            </span>
          </div>
        )}
        {visibleParticipants.map(participant => (
          <div 
            key={participant.id} 
            className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
          >
            {participant.userName}
            <span className="ml-1 text-xs opacity-75">
              ({participant?.language?.toUpperCase()})
            </span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            +{remainingCount} {window.innerWidth < 500 ? '' : 'more'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantsList;