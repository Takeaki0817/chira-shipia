import { supabase } from './supabase'
import type { InventoryItem, CreateInventoryItem, UpdateInventoryItem } from '../types/inventory.types'

class InventoryService {
  async getItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch inventory: ${error.message}`)
    }

    return data || []
  }

  async getExpiringItems(days: number = 7): Promise<InventoryItem[]> {
    const expiryThreshold = new Date()
    expiryThreshold.setDate(expiryThreshold.getDate() + days)

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .lte('expiry_date', expiryThreshold.toISOString().split('T')[0])
      .order('expiry_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch expiring items: ${error.message}`)
    }

    return data || []
  }

  async createItem(item: CreateInventoryItem): Promise<InventoryItem> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Creating inventory item for user:', user.id)

    const { data, error } = await supabase
      .from('inventory')
      .insert({
        user_id: user.id,
        ingredient_name: item.ingredient_name,
        quantity: item.quantity,
        unit: item.unit || 'pieces',
        expiry_date: item.expiry_date,
        category: item.category,
        notes: item.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Inventory insert error:', error)
      throw new Error(`Failed to create item: ${error.message}`)
    }

    return data
  }

  async updateItem(item: UpdateInventoryItem): Promise<InventoryItem> {
    const { id, ...updateData } = item
    
    const { data, error } = await supabase
      .from('inventory')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update item: ${error.message}`)
    }

    return data
  }

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete item: ${error.message}`)
    }
  }
}

export const inventoryService = new InventoryService()