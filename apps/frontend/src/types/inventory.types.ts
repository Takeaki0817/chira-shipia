export interface InventoryItem {
  id: string
  user_id: string
  ingredient_name: string
  quantity: number
  unit: string
  expiry_date?: string
  purchase_date?: string
  category?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateInventoryItem {
  ingredient_name: string
  quantity: number
  unit?: string
  expiry_date?: string
  category?: string
  notes?: string
}

export interface UpdateInventoryItem extends Partial<CreateInventoryItem> {
  id: string
}