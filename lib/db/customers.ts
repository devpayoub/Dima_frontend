import type { Customer } from '../../types';
import * as apiCustomers from '../api/customers';

export async function fetchCustomersWithCards(_ownerId: string): Promise<Customer[]> {
  try {
    return await apiCustomers.list();
  } catch {
    return [];
  }
}

export async function upsertCustomer(
  customer: { id: string; name: string; email: string; mobile?: string; status: 'Active' | 'Inactive' },
  _ownerId: string
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const res = await apiCustomers.upsert(customer.id, customer);
    return { ok: res.ok, id: customer.id };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function updateCustomerStatus(
  customerId: string,
  status: 'Active' | 'Inactive'
): Promise<{ ok: boolean; error?: string }> {
  try {
    return await apiCustomers.setStatus(customerId, status);
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
