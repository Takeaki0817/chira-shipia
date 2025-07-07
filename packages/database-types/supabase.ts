export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cooking_history: {
        Row: {
          actual_cost: number | null
          cooked_at: string | null
          id: string
          modifications: string | null
          notes: string | null
          rating: number | null
          recipe_id: string
          user_id: string
          would_cook_again: boolean | null
        }
        Insert: {
          actual_cost?: number | null
          cooked_at?: string | null
          id?: string
          modifications?: string | null
          notes?: string | null
          rating?: number | null
          recipe_id: string
          user_id: string
          would_cook_again?: boolean | null
        }
        Update: {
          actual_cost?: number | null
          cooked_at?: string | null
          id?: string
          modifications?: string | null
          notes?: string | null
          rating?: number | null
          recipe_id?: string
          user_id?: string
          would_cook_again?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cooking_history_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          ingredient_name: string
          notes: string | null
          purchase_date: string | null
          quantity: number
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          ingredient_name: string
          notes?: string | null
          purchase_date?: string | null
          quantity?: number
          unit?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          ingredient_name?: string
          notes?: string | null
          purchase_date?: string | null
          quantity?: number
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          ai_generated: boolean | null
          categories: string[] | null
          cooking_time: number | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          generation_prompt: string | null
          id: string
          ingredients: Json
          instructions: string[]
          nutritional_info: Json | null
          sale_savings: number | null
          servings: number | null
          tags: string[] | null
          title: string
          total_cost: number | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          categories?: string[] | null
          cooking_time?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          generation_prompt?: string | null
          id?: string
          ingredients: Json
          instructions: string[]
          nutritional_info?: Json | null
          sale_savings?: number | null
          servings?: number | null
          tags?: string[] | null
          title: string
          total_cost?: number | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          categories?: string[] | null
          cooking_time?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          generation_prompt?: string | null
          id?: string
          ingredients?: Json
          instructions?: string[]
          nutritional_info?: Json | null
          sale_savings?: number | null
          servings?: number | null
          tags?: string[] | null
          title?: string
          total_cost?: number | null
          user_id?: string
        }
        Relationships: []
      }
      sales_info: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          image_url: string
          items_count: number | null
          ocr_text: string | null
          processing_method: string | null
          processing_status:
            | Database["public"]["Enums"]["processing_status"]
            | null
          sale_period_end: string | null
          sale_period_start: string | null
          store_name: string | null
          structured_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_url: string
          items_count?: number | null
          ocr_text?: string | null
          processing_method?: string | null
          processing_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          sale_period_end?: string | null
          sale_period_start?: string | null
          store_name?: string | null
          structured_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_url?: string
          items_count?: number | null
          ocr_text?: string | null
          processing_method?: string | null
          processing_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          sale_period_end?: string | null
          sale_period_start?: string | null
          store_name?: string | null
          structured_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          allergies: Json | null
          cooking_skill_level: number | null
          created_at: string | null
          dietary_restrictions: string[] | null
          display_name: string | null
          id: string
          taste_preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          allergies?: Json | null
          cooking_skill_level?: number | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          id: string
          taste_preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          allergies?: Json | null
          cooking_skill_level?: number | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          id?: string
          taste_preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_recipe_cost: {
        Args: { recipe_ingredients: Json; sale_items?: Json }
        Returns: {
          total_cost: number
          sale_savings: number
        }[]
      }
      get_expiring_inventory: {
        Args: { user_uuid: string; days_ahead?: number }
        Returns: {
          id: string
          ingredient_name: string
          quantity: number
          unit: string
          expiry_date: string
          days_until_expiry: number
        }[]
      }
      get_user_cooking_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_recipes_cooked: number
          avg_rating: number
          total_cost_saved: number
          favorite_categories: string[]
        }[]
      }
    }
    Enums: {
      processing_status:
        | "uploaded"
        | "ocr_processing"
        | "ai_processing"
        | "structured"
        | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      processing_status: [
        "uploaded",
        "ocr_processing",
        "ai_processing",
        "structured",
        "error",
      ],
    },
  },
} as const