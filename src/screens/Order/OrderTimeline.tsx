import React from 'react';
import { OrderStatusHistory } from '../../types/order.types';
import { formatDate } from '../../helpers/formatters';

interface OrderTimelineProps {
  history: OrderStatusHistory[];
  createdAt: Date;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  history,
  createdAt,
}) => {
  // Combine creation with history and sort by date
  const allEvents = [
    {
      id: 'order-created',
      status: 'CREATED',
      note: 'Order was placed',
      createdAt: new Date(createdAt),
    },
    ...history,
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {allEvents.map((event, index) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {index !== allEvents.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      event.status === 'DELIVERED'
                        ? 'bg-green-500'
                        : event.status === 'SHIPPED'
                        ? 'bg-blue-500'
                        : event.status === 'CANCELLED' ||
                          event.status === 'REFUNDED'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                    }`}
                  >
                    <svg
                      className="h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {event.status === 'CREATED'
                        ? 'Order Created'
                        : `Status changed to ${
                            event.status.charAt(0) +
                            event.status.slice(1).toLowerCase()
                          }`}
                      {event.note && (
                        <span className="font-medium text-gray-900 ml-1">
                          - {event.note}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    {formatDate(event.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
