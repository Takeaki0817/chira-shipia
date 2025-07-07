import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipeService } from '../services/recipe.service'
import type { RecipeGenerationRequest } from '../types/recipe.types'

export function useRecipes() {
  const queryClient = useQueryClient()

  const {
    data: recipes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['recipes'],
    queryFn: recipeService.getRecipes,
  })

  const generateMutation = useMutation({
    mutationFn: (params: RecipeGenerationRequest) => recipeService.generateRecipe(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recipeService.deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })

  const rateMutation = useMutation({
    mutationFn: ({ recipeId, rating }: { recipeId: string; rating: any }) => 
      recipeService.rateRecipe(recipeId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })

  return {
    recipes,
    isLoading,
    error,
    refetch,
    generateRecipe: generateMutation.mutateAsync,
    deleteRecipe: deleteMutation.mutateAsync,
    rateRecipe: rateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRating: rateMutation.isPending,
    generationError: generateMutation.error,
  }
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: () => recipeService.getRecipe(id),
    enabled: !!id,
  })
}