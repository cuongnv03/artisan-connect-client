import React from 'react';
import { useParams } from 'react-router-dom';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h1>
      <p>Viewing order ID: {id}</p>
    </div>
  );
};

export default OrderDetail;
