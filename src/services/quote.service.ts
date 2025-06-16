// Deprecated: Use custom-order.service.ts instead
// This file provides backward compatibility

import { customOrderService } from './custom-order.service';

// Re-export with legacy names for backward compatibility
export const quoteService = {
  // Legacy methods redirecting to custom order service
  async createQuoteRequest(data: any) {
    console.warn(
      'quoteService.createQuoteRequest is deprecated. Use customOrderService.createCustomOrder instead.',
    );
    return await customOrderService.createCustomOrder(data);
  },

  async getMyQuoteRequests(query: any = {}) {
    console.warn(
      'quoteService.getMyQuoteRequests is deprecated. Use customOrderService.getMyCustomOrders instead.',
    );
    return await customOrderService.getMyCustomOrders(query);
  },

  async getQuoteRequest(id: string) {
    console.warn(
      'quoteService.getQuoteRequest is deprecated. Use customOrderService.getCustomOrder instead.',
    );
    return await customOrderService.getCustomOrder(id);
  },

  async getQuoteStats(query: any = {}) {
    console.warn(
      'quoteService.getQuoteStats is deprecated. Use customOrderService.getCustomOrderStats instead.',
    );
    return await customOrderService.getCustomOrderStats(query);
  },

  async respondToQuote(id: string, data: any) {
    console.warn(
      'quoteService.respondToQuote is deprecated. Use customOrderService.respondToCustomOrder instead.',
    );
    return await customOrderService.respondToCustomOrder(id, data);
  },

  async cancelQuoteRequest(id: string, data: any) {
    console.warn(
      'quoteService.cancelQuoteRequest is deprecated. Use customOrderService.cancelCustomOrder instead.',
    );
    return await customOrderService.cancelCustomOrder(id, data.reason);
  },

  // Redirect other methods...
  validateQuoteAccess: customOrderService.validateCustomOrderAccess,
};

// Also export new service
export { customOrderService };
