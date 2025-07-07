import { supabase } from './supabase'
import type { SalesInfo, ProcessSaleResponse } from '../types/sales.types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class SalesService {
  async getSales(): Promise<SalesInfo[]> {
    const { data, error } = await supabase
      .from('sales_info')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch sales: ${error.message}`)
    }

    return data || []
  }

  async uploadAndProcessImage(file: File): Promise<ProcessSaleResponse> {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    if (!token) {
      throw new Error('Authentication required')
    }

    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_URL}/api/sales/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Upload failed')
    }

    return response.json()
  }

  async getSaleStatus(id: string): Promise<SalesInfo> {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/api/sales/${id}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get sale status')
    }

    const result = await response.json()
    return result.data
  }

  async deleteSale(id: string): Promise<void> {
    const { error } = await supabase
      .from('sales_info')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete sale: ${error.message}`)
    }
  }
}

export const salesService = new SalesService()