import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { formatPrice, formatRelativeTime } from '../../../utils/format';
import {
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  ClockIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface CustomOrderData {
  type:
    | 'custom_order_proposal'
    | 'custom_order_response'
    | 'custom_order_update';
  negotiationId: string;
  proposal?: {
    productName: string;
    description: string;
    estimatedPrice: number;
    estimatedDuration: string;
    specifications?: Record<string, string>;
    materials?: string[];
    dimensions?: string;
    colorPreferences?: string[];
    deadline?: string;
  };
  response?: {
    accepted: boolean;
    counterOffer?: {
      price: number;
      duration: string;
      modifications: string;
      conditions?: string[];
    };
    message: string;
    canProceed?: boolean;
    requiresMoreInfo?: boolean;
    additionalQuestions?: string[];
  };
  status: string;
  timestamp: string;
}

interface CustomOrderDisplayProps {
  data: CustomOrderData;
  content: string;
  isOwn: boolean;
  userRole: string;
  onRespond?: (response: any) => void;
  onUpdate?: (updates: any) => void;
  onCreateOrder?: (negotiationId: string) => void;
  loading?: boolean;
}

export const CustomOrderDisplay: React.FC<CustomOrderDisplayProps> = ({
  data,
  content,
  isOwn,
  userRole,
  onRespond,
  onUpdate,
  onCreateOrder,
  loading = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseData, setResponseData] = useState({
    accepted: false,
    message: '',
    counterOffer: {
      price: '',
      duration: '',
      modifications: '',
    },
    requiresMoreInfo: false,
    additionalQuestions: [''],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'negotiating':
        return 'info';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ phản hồi';
      case 'accepted':
        return 'Đã chấp nhận';
      case 'rejected':
        return 'Đã từ chối';
      case 'negotiating':
        return 'Đang đàm phán';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleResponse = (accepted: boolean) => {
    const response = {
      accepted,
      message: responseData.message,
      canProceed: accepted,
      requiresMoreInfo: responseData.requiresMoreInfo,
      ...(accepted &&
        responseData.counterOffer.price && {
          counterOffer: {
            price: parseFloat(responseData.counterOffer.price),
            duration: responseData.counterOffer.duration,
            modifications: responseData.counterOffer.modifications,
          },
        }),
      ...(responseData.requiresMoreInfo && {
        additionalQuestions: responseData.additionalQuestions.filter((q) =>
          q.trim(),
        ),
      }),
    };

    onRespond?.(response);
    setShowResponseForm(false);
  };

  const addQuestion = () => {
    setResponseData((prev) => ({
      ...prev,
      additionalQuestions: [...prev.additionalQuestions, ''],
    }));
  };

  const removeQuestion = (index: number) => {
    setResponseData((prev) => ({
      ...prev,
      additionalQuestions: prev.additionalQuestions.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const updateQuestion = (index: number, value: string) => {
    setResponseData((prev) => ({
      ...prev,
      additionalQuestions: prev.additionalQuestions.map((q, i) =>
        i === index ? value : q,
      ),
    }));
  };

  const renderProposal = () => {
    if (!data.proposal) return null;

    const { proposal } = data;

    return (
      <div className="bg-blue-50 rounded-lg p-4 mt-2">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-lg text-blue-900">
            {proposal.productName}
          </h4>
          <Badge variant={getStatusColor(data.status)} size="sm">
            {getStatusText(data.status)}
          </Badge>
        </div>

        <p className="text-gray-700 mb-4">{proposal.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm">
            <CurrencyDollarIcon className="w-4 h-4 mr-2 text-green-600" />
            <span>
              Giá ước tính: <strong>${proposal.estimatedPrice}</strong>
            </span>
          </div>
          <div className="flex items-center text-sm">
            <ClockIcon className="w-4 h-4 mr-2 text-blue-600" />
            <span>
              Thời gian: <strong>{proposal.estimatedDuration}</strong>
            </span>
          </div>
        </div>

        {proposal.dimensions && (
          <div className="text-sm mb-2">
            <strong>Kích thước:</strong> {proposal.dimensions}
          </div>
        )}

        {proposal.deadline && (
          <div className="text-sm mb-2">
            <strong>Deadline:</strong>{' '}
            {new Date(proposal.deadline).toLocaleDateString('vi-VN')}
          </div>
        )}

        {proposal.materials && proposal.materials.length > 0 && (
          <div className="mb-3">
            <strong className="text-sm">Chất liệu:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {proposal.materials.map((material, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {material}
                </span>
              ))}
            </div>
          </div>
        )}

        {proposal.colorPreferences && proposal.colorPreferences.length > 0 && (
          <div className="mb-3">
            <strong className="text-sm">Màu sắc:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {proposal.colorPreferences.map((color, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        )}

        {proposal.specifications &&
          Object.keys(proposal.specifications).length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <InformationCircleIcon className="w-4 h-4 mr-1" />
                {showDetails ? 'Ẩn' : 'Xem'} thông số kỹ thuật
              </button>

              {showDetails && (
                <div className="mt-2 p-3 bg-white rounded border">
                  {Object.entries(proposal.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-1 border-b last:border-b-0"
                      >
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}

        {/* Action buttons */}
        {!isOwn && userRole === 'ARTISAN' && data.status === 'pending' && (
          <div className="flex space-x-2 pt-3 border-t">
            <Button
              size="sm"
              onClick={() => setShowResponseForm(true)}
              leftIcon={<CheckIcon className="w-4 h-4" />}
            >
              Phản hồi
            </Button>
          </div>
        )}

        {isOwn && data.status === 'pending' && (
          <div className="flex space-x-2 pt-3 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate?.({ negotiationId: data.negotiationId })}
              leftIcon={<PencilIcon className="w-4 h-4" />}
            >
              Chỉnh sửa
            </Button>
          </div>
        )}

        {data.status === 'accepted' && userRole === 'CUSTOMER' && (
          <div className="flex space-x-2 pt-3 border-t">
            <Button
              size="sm"
              onClick={() => onCreateOrder?.(data.negotiationId)}
              className="bg-green-600 hover:bg-green-700"
            >
              Tạo đơn hàng
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderResponse = () => {
    if (!data.response) return null;

    const { response } = data;

    return (
      <div
        className={`rounded-lg p-4 mt-2 ${
          response.accepted ? 'bg-green-50' : 'bg-yellow-50'
        }`}
      >
        <div className="flex items-center mb-2">
          {response.accepted ? (
            <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
          ) : (
            <InformationCircleIcon className="w-5 h-5 text-yellow-600 mr-2" />
          )}
          <h4 className="font-semibold">
            {response.accepted ? 'Đề xuất được chấp nhận' : 'Phản hồi đề xuất'}
          </h4>
        </div>

        <p className="text-gray-700 mb-3">{response.message}</p>

        {response.counterOffer && (
          <div className="bg-white rounded p-3 mb-3">
            <h5 className="font-medium mb-2">Đề xuất mới:</h5>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Giá:</strong> ${response.counterOffer.price}
              </div>
              <div>
                <strong>Thời gian:</strong> {response.counterOffer.duration}
              </div>
              <div>
                <strong>Thay đổi:</strong> {response.counterOffer.modifications}
              </div>
              {response.counterOffer.conditions && (
                <div>
                  <strong>Điều kiện:</strong>
                  <ul className="list-disc list-inside ml-2">
                    {response.counterOffer.conditions.map(
                      (condition, index) => (
                        <li key={index}>{condition}</li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {response.additionalQuestions &&
          response.additionalQuestions.length > 0 && (
            <div className="bg-white rounded p-3">
              <h5 className="font-medium mb-2">Câu hỏi thêm:</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {response.additionalQuestions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          )}
      </div>
    );
  };

  const renderResponseForm = () => {
    if (!showResponseForm) return null;

    return (
      <div className="bg-white rounded-lg border p-4 mt-3">
        <h4 className="font-semibold mb-3">Phản hồi đề xuất</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tin nhắn phản hồi *
            </label>
            <textarea
              rows={3}
              value={responseData.message}
              onChange={(e) =>
                setResponseData((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="Nhập phản hồi của bạn..."
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={responseData.requiresMoreInfo}
                onChange={(e) =>
                  setResponseData((prev) => ({
                    ...prev,
                    requiresMoreInfo: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm">Cần thêm thông tin</span>
            </label>
          </div>

          {responseData.requiresMoreInfo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Câu hỏi bổ sung
              </label>
              {responseData.additionalQuestions.map((question, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    className="flex-1 rounded border-gray-300 focus:border-primary focus:ring-primary"
                    placeholder={`Câu hỏi ${index + 1}`}
                  />
                  {responseData.additionalQuestions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
              >
                Thêm câu hỏi
              </Button>
            </div>
          )}

          <div className="border-t pt-4">
            <h5 className="font-medium mb-3">Đề xuất ngược (tùy chọn)</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá mới ($)
                </label>
                <input
                  type="number"
                  value={responseData.counterOffer.price}
                  onChange={(e) =>
                    setResponseData((prev) => ({
                      ...prev,
                      counterOffer: {
                        ...prev.counterOffer,
                        price: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder="Giá đề xuất"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian mới
                </label>
                <input
                  type="text"
                  value={responseData.counterOffer.duration}
                  onChange={(e) =>
                    setResponseData((prev) => ({
                      ...prev,
                      counterOffer: {
                        ...prev.counterOffer,
                        duration: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder="VD: 3-4 tuần"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thay đổi/Lý do
              </label>
              <textarea
                rows={2}
                value={responseData.counterOffer.modifications}
                onChange={(e) =>
                  setResponseData((prev) => ({
                    ...prev,
                    counterOffer: {
                      ...prev.counterOffer,
                      modifications: e.target.value,
                    },
                  }))
                }
                className="w-full rounded border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="Giải thích về thay đổi giá/thời gian..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowResponseForm(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => handleResponse(false)}
              loading={loading}
            >
              Từ chối
            </Button>
            <Button onClick={() => handleResponse(true)} loading={loading}>
              Chấp nhận
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="whitespace-pre-wrap">{content}</div>

      {data.type === 'custom_order_proposal' && renderProposal()}
      {data.type === 'custom_order_response' && renderResponse()}

      {renderResponseForm()}
    </div>
  );
};
