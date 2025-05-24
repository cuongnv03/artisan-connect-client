export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  TIMEOUT_ERROR: 'Yêu cầu hết thời gian chờ. Vui lòng thử lại.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',

  // Authentication errors
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  UNAUTHORIZED: 'Bạn không có quyền truy cập.',
  FORBIDDEN: 'Truy cập bị từ chối.',

  // Validation errors
  REQUIRED_FIELD: 'Trường này là bắt buộc.',
  INVALID_EMAIL: 'Email không hợp lệ.',
  INVALID_PHONE: 'Số điện thoại không hợp lệ.',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 6 ký tự.',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp.',

  // File upload errors
  FILE_TOO_LARGE: 'File quá lớn. Kích thước tối đa là {maxSize}MB.',
  INVALID_FILE_TYPE: 'Loại file không được hỗ trợ.',
  UPLOAD_FAILED: 'Tải file lên thất bại. Vui lòng thử lại.',

  // Cart errors
  PRODUCT_OUT_OF_STOCK: 'Sản phẩm đã hết hàng.',
  INVALID_QUANTITY: 'Số lượng không hợp lệ.',
  CART_EMPTY: 'Giỏ hàng trống.',

  // Order errors
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng.',
  CANNOT_CANCEL_ORDER: 'Không thể hủy đơn hàng này.',
  PAYMENT_FAILED: 'Thanh toán thất bại.',

  // General errors
  SOMETHING_WENT_WRONG: 'Có lỗi xảy ra. Vui lòng thử lại.',
  NOT_FOUND: 'Không tìm thấy.',
  PERMISSION_DENIED: 'Không có quyền thực hiện thao tác này.',
} as const;

export const ERROR_CODES = {
  // HTTP Status Codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,

  // Custom error codes
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  PRODUCT_UNAVAILABLE: 'PRODUCT_UNAVAILABLE',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
} as const;

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.code) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return ERROR_MESSAGES.NETWORK_ERROR;
      case 'TIMEOUT':
        return ERROR_MESSAGES.TIMEOUT_ERROR;
      default:
        return ERROR_MESSAGES.SOMETHING_WENT_WRONG;
    }
  }

  return ERROR_MESSAGES.SOMETHING_WENT_WRONG;
}
