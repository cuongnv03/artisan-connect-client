import api from './api';
import {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '../types/api.types';

export const AddressService = {
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get('/profiles/addresses');
    return response.data.data;
  },

  getDefaultAddress: async (): Promise<Address> => {
    const response = await api.get('/profiles/addresses/default');
    return response.data.data;
  },

  createAddress: async (data: CreateAddressRequest): Promise<Address> => {
    const response = await api.post('/profiles/addresses', data);
    return response.data.data;
  },

  updateAddress: async (
    id: string,
    data: UpdateAddressRequest,
  ): Promise<Address> => {
    const response = await api.patch(`/profiles/addresses/${id}`, data);
    return response.data.data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await api.delete(`/profiles/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<Address> => {
    const response = await api.post(`/profiles/addresses/${id}/default`);
    return response.data.data;
  },
};
