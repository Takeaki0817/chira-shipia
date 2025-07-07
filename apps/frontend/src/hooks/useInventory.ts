import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '../services/inventory.service'
import type { CreateInventoryItem, UpdateInventoryItem } from '../types/inventory.types'

export function useInventory() {
  const queryClient = useQueryClient()

  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getItems,
  })

  const createItemMutation = useMutation({
    mutationFn: (item: CreateInventoryItem) => inventoryService.createItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'expiring'] })
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: (item: UpdateInventoryItem) => inventoryService.updateItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'expiring'] })
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => inventoryService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'expiring'] })
    },
  })

  return {
    items,
    isLoading,
    error,
    refetch,
    createItem: createItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
  }
}

export function useExpiringInventory(days: number = 7) {
  return useQuery({
    queryKey: ['inventory', 'expiring', days],
    queryFn: () => inventoryService.getExpiringItems(days),
  })
}