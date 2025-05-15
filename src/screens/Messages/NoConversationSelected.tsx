import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export const NoConversationSelected: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">
        No conversation selected
      </h3>
      <p className="text-sm text-gray-500 mt-2">
        Select a conversation from the list or start a new one
      </p>
    </div>
  );
};
