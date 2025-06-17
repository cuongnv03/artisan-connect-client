import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CustomOrderProposal } from '../../types/message';
import { useForm } from '../../hooks/common/useForm';

interface CustomOrderProposalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposal: CustomOrderProposal) => void;
  loading?: boolean;
}

interface FormData {
  productName: string;
  description: string;
  estimatedPrice: string;
  timeline: string;
  specifications: string;
  deadline: string;
}

export const CustomOrderProposalForm: React.FC<
  CustomOrderProposalFormProps
> = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const { values, errors, handleChange, handleSubmit, resetForm } =
    useForm<FormData>({
      initialValues: {
        productName: '',
        description: '',
        estimatedPrice: '',
        timeline: '',
        specifications: '',
        deadline: '',
      },
      validate: (values) => {
        const errors: Record<string, string> = {};

        if (!values.productName.trim()) {
          errors.productName = 'Tên sản phẩm là bắt buộc';
        }

        if (!values.description.trim()) {
          errors.description = 'Mô tả là bắt buộc';
        }

        if (!values.estimatedPrice) {
          errors.estimatedPrice = 'Giá dự kiến là bắt buộc';
        } else if (
          isNaN(Number(values.estimatedPrice)) ||
          Number(values.estimatedPrice) <= 0
        ) {
          errors.estimatedPrice = 'Giá dự kiến phải là số dương';
        }

        if (!values.timeline.trim()) {
          errors.timeline = 'Thời gian thực hiện là bắt buộc';
        }

        return errors;
      },
      onSubmit: async (data) => {
        const proposal: CustomOrderProposal = {
          productName: data.productName.trim(),
          description: data.description.trim(),
          estimatedPrice: Number(data.estimatedPrice),
          timeline: data.timeline.trim(),
          specifications: data.specifications.trim()
            ? { details: data.specifications.trim() }
            : undefined,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
        };

        onSubmit(proposal);
        resetForm();
        onClose();
      },
    });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo đề xuất Custom Order"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên sản phẩm"
          name="productName"
          value={values.productName}
          onChange={handleChange}
          error={errors.productName}
          placeholder="Nhập tên sản phẩm bạn muốn đặt làm"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả chi tiết *
          </label>
          <textarea
            name="description"
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Mô tả chi tiết về sản phẩm bạn muốn đặt làm..."
            value={values.description}
            onChange={handleChange}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Giá dự kiến (VNĐ)"
            name="estimatedPrice"
            type="number"
            value={values.estimatedPrice}
            onChange={handleChange}
            error={errors.estimatedPrice}
            placeholder="0"
            required
          />

          <Input
            label="Thời gian thực hiện"
            name="timeline"
            value={values.timeline}
            onChange={handleChange}
            error={errors.timeline}
            placeholder="VD: 2 tuần, 1 tháng..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Yêu cầu đặc biệt
          </label>
          <textarea
            name="specifications"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Những yêu cầu đặc biệt về chất liệu, màu sắc, kích thước..."
            value={values.specifications}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Hạn phản hồi"
          name="deadline"
          type="date"
          value={values.deadline}
          onChange={handleChange}
          error={errors.deadline}
          helperText="Nghệ nhân sẽ phản hồi trước ngày này"
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Hủy
          </Button>
          <Button type="submit" loading={loading}>
            Gửi đề xuất
          </Button>
        </div>
      </form>
    </Modal>
  );
};
