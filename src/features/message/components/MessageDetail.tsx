import React from 'react';
import { useParams } from 'react-router-dom';

const MessageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Conversation</h1>
      <p>Viewing conversation ID: {id}</p>
    </div>
  );
};

export default MessageDetail;
