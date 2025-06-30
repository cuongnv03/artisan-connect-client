import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  CustomOrderWithDetails,
  CreateCustomOrderRequest,
  ArtisanResponseRequest,
  UpdateCustomOrderRequest,
  CustomOrderStats,
  QuoteStatus,
  CounterOfferRequest,
  AcceptOfferRequest,
  RejectOfferRequest,
  NegotiationHistoryEntry,
} from '../types/custom-order';
import { PaginatedResponse } from '../types/common';

export interface GetCustomOrdersQuery {
  page?: number;
  limit?: number;
  mode?: 'sent' | 'received'; // NEW
  status?: QuoteStatus | QuoteStatus[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'title' | 'finalPrice';
  sortOrder?: 'asc' | 'desc';
}

export interface GetCustomOrderStatsQuery {
  userId?: string;
  role?: 'CUSTOMER' | 'ARTISAN';
  dateFrom?: string;
  dateTo?: string;
}

export const customOrderService = {
  // ===== EXISTING METHODS =====
  async createCustomOrder(
    data: CreateCustomOrderRequest,
  ): Promise<CustomOrderWithDetails> {
    return await apiClient.post<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.BASE,
      data,
    );
  },

  async updateCustomOrder(
    id: string,
    data: UpdateCustomOrderRequest,
  ): Promise<CustomOrderWithDetails> {
    return await apiClient.patch<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.BY_ID(id),
      data,
    );
  },

  async respondToCustomOrder(
    id: string,
    data: ArtisanResponseRequest,
  ): Promise<CustomOrderWithDetails> {
    return await apiClient.post<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.RESPOND(id),
      data,
    );
  },

  async getCustomOrder(id: string): Promise<CustomOrderWithDetails> {
    return await apiClient.get<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.BY_ID(id),
    );
  },

  async getMyCustomOrders(
    query: GetCustomOrdersQuery = {},
  ): Promise<PaginatedResponse<CustomOrderWithDetails>> {
    return await apiClient.get<PaginatedResponse<CustomOrderWithDetails>>(
      API_ENDPOINTS.CUSTOM_ORDER.MY_ORDERS,
      query,
    );
  },

  async getCustomOrderStats(
    query: GetCustomOrderStatsQuery = {},
  ): Promise<CustomOrderStats> {
    return await apiClient.get<CustomOrderStats>(
      API_ENDPOINTS.CUSTOM_ORDER.STATS,
      query,
    );
  },

  async getNegotiationHistory(id: string): Promise<NegotiationHistoryEntry[]> {
    return await apiClient.get<NegotiationHistoryEntry[]>(
      API_ENDPOINTS.CUSTOM_ORDER.HISTORY(id),
    );
  },

  async acceptCounterOffer(id: string): Promise<CustomOrderWithDetails> {
    return await apiClient.post<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.ACCEPT_COUNTER(id),
    );
  },

  async cancelCustomOrder(
    id: string,
    reason?: string,
  ): Promise<CustomOrderWithDetails> {
    return await apiClient.post<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.CANCEL(id),
      { reason },
    );
  },

  // ===== NEW: BIDIRECTIONAL NEGOTIATION METHODS =====

  async customerCounterOffer(
    id: string,
    data: CounterOfferRequest,
  ): Promise<CustomOrderWithDetails> {
    return await apiClient.post<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.COUNTER_OFFER(id),
      data,
    );
  },

  async customerAcceptOffer(
    id: string,
    data: AcceptOfferRequest,
  ): Promise<CustomOrderWithDetails> {
    return await apiClient.post<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.ACCEPT_OFFER(id),
      data,
    );
  },

  async customerRejectOffer(
    id: string,
    data: RejectOfferRequest,
  ): Promise<CustomOrderWithDetails> {
    return await apiClient.post<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.REJECT_OFFER(id),
      data,
    );
  },

  // ===== UTILITY METHODS =====

  async validateCustomOrderAccess(id: string): Promise<boolean> {
    try {
      await apiClient.get(API_ENDPOINTS.CUSTOM_ORDER.VALIDATE_ACCESS(id));
      return true;
    } catch {
      return false;
    }
  },

  async exportCustomOrders(query: GetCustomOrdersQuery = {}): Promise<Blob> {
    return await apiClient.get(API_ENDPOINTS.CUSTOM_ORDER.EXPORT, {
      ...query,
      responseType: 'blob',
    });
  },

  // ===== HELPER METHODS FOR UI =====

  // Get user action permissions
  getUserPermissions(
    order: CustomOrderWithDetails,
    currentUserId: string,
    currentUserRole: string,
  ) {
    const isCustomer = currentUserId === order.customer.id;
    const isArtisan = currentUserId === order.artisan.id;
    const isOwner = isCustomer || isArtisan;

    return {
      // View permissions
      canView: isOwner || currentUserRole === 'ADMIN',

      // Customer permissions
      canUpdate: isCustomer && order.status === 'PENDING',
      canAcceptOffer: isCustomer && order.status === 'COUNTER_OFFERED',
      canRejectOffer:
        isCustomer && ['PENDING', 'COUNTER_OFFERED'].includes(order.status),
      canCounterOffer: isCustomer && order.status === 'COUNTER_OFFERED',

      // Artisan permissions
      canRespond:
        isArtisan && ['PENDING', 'COUNTER_OFFERED'].includes(order.status),

      // Common permissions
      canCancel:
        isOwner && ['PENDING', 'COUNTER_OFFERED'].includes(order.status),
      canMessage: isOwner,

      // Status checks
      isExpired: order.expiresAt
        ? new Date(order.expiresAt) < new Date()
        : false,
      isActive: ['PENDING', 'COUNTER_OFFERED'].includes(order.status),
      isCompleted: order.status === 'ACCEPTED',
      isCancelled: ['REJECTED', 'EXPIRED'].includes(order.status),
    };
  },

  // Get status display info
  getStatusDisplay(status: QuoteStatus) {
    const statusMap = {
      [QuoteStatus.PENDING]: {
        label: 'Đang chờ xử lý',
        color: 'warning',
        icon: 'clock',
        description: 'Đang chờ nghệ nhân phản hồi',
      },
      [QuoteStatus.COUNTER_OFFERED]: {
        label: 'Đề xuất ngược',
        color: 'info',
        icon: 'exchange',
        description: 'Đang trong quá trình thương lượng',
      },
      [QuoteStatus.ACCEPTED]: {
        label: 'Đã chấp nhận',
        color: 'success',
        icon: 'check-circle',
        description: 'Yêu cầu đã được chấp nhận',
      },
      [QuoteStatus.REJECTED]: {
        label: 'Đã từ chối',
        color: 'error',
        icon: 'x-circle',
        description: 'Yêu cầu đã bị từ chối',
      },
      [QuoteStatus.EXPIRED]: {
        label: 'Đã hết hạn',
        color: 'error',
        icon: 'clock-x',
        description: 'Yêu cầu đã hết hạn',
      },
    };

    return statusMap[status] || statusMap[QuoteStatus.PENDING];
  },

  // Format negotiation history for display
  formatNegotiationHistory(history: NegotiationHistoryEntry[]) {
    return history.map((entry) => ({
      ...entry,
      displayText: this.getHistoryDisplayText(entry),
      timestamp: new Date(entry.timestamp),
    }));
  },

  // Get display text for history entry
  getHistoryDisplayText(entry: NegotiationHistoryEntry): string {
    const actor = entry.actor === 'customer' ? 'Khách hàng' : 'Nghệ nhân';

    switch (entry.action) {
      case 'CREATE':
        return `${actor} đã tạo yêu cầu custom order`;
      case 'ACCEPT':
        return `${actor} đã chấp nhận yêu cầu`;
      case 'REJECT':
        return `${actor} đã từ chối yêu cầu`;
      case 'COUNTER_OFFER':
        return `${actor} đã đưa ra đề xuất ngược với giá ${entry.data.finalPrice?.toLocaleString()}đ`;
      case 'CUSTOMER_COUNTER_OFFER':
        return `${actor} đã đưa ra đề xuất ngược với giá ${entry.data.finalPrice?.toLocaleString()}đ`;
      case 'CUSTOMER_ACCEPT':
        return `${actor} đã chấp nhận đề xuất`;
      case 'CUSTOMER_REJECT':
        return `${actor} đã từ chối đề xuất`;
      case 'UPDATE':
        return `${actor} đã cập nhật thông tin yêu cầu`;
      case 'MESSAGE':
        return `${actor} đã gửi tin nhắn`;
      default:
        return `${actor} đã thực hiện hành động`;
    }
  },
};
