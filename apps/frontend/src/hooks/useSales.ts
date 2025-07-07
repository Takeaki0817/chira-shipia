import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesService } from '../services/sales.service'

export function useSales() {
  const queryClient = useQueryClient()

  const {
    data: sales = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sales'],
    queryFn: salesService.getSales,
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => salesService.uploadAndProcessImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => salesService.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
  })

  return {
    sales,
    isLoading,
    error,
    refetch,
    uploadAndProcess: uploadMutation.mutateAsync,
    deleteSale: deleteMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    uploadError: uploadMutation.error,
  }
}

export function useSaleStatus(id: string) {
  return useQuery({
    queryKey: ['sales', 'status', id],
    queryFn: () => salesService.getSaleStatus(id),
    enabled: !!id,
  })
}