-- Complete database setup script for SmartRecipe
-- Run this script in your Supabase SQL editor to set up the complete database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE processing_status AS ENUM (
  'uploaded', 
  'ocr_processing', 
  'ai_processing',
  'structured', 
  'error'
);

-- User profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  allergies JSONB DEFAULT '[]'::jsonb,
  taste_preferences JSONB DEFAULT '{}'::jsonb,
  dietary_restrictions TEXT[] DEFAULT '{}',
  cooking_skill_level INTEGER DEFAULT 1 CHECK (cooking_skill_level BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pieces',
  expiry_date DATE,
  purchase_date DATE DEFAULT CURRENT_DATE,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales info table
CREATE TABLE IF NOT EXISTS sales_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  ocr_text TEXT,
  structured_data JSONB,
  processing_status processing_status DEFAULT 'uploaded',
  processing_method TEXT,
  store_name TEXT,
  sale_period_start DATE,
  sale_period_end DATE,
  items_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions TEXT[] NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  cooking_time INTEGER,
  servings INTEGER DEFAULT 1,
  total_cost DECIMAL(10,2),
  sale_savings DECIMAL(10,2) DEFAULT 0,
  categories TEXT[],
  tags TEXT[],
  nutritional_info JSONB,
  ai_generated BOOLEAN DEFAULT true,
  generation_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cooking history table
CREATE TABLE IF NOT EXISTS cooking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  cooked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  modifications TEXT,
  actual_cost DECIMAL(10,2),
  would_cook_again BOOLEAN
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_user_expiry ON inventory(user_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_user_category ON inventory(user_id, category);
CREATE INDEX IF NOT EXISTS idx_sales_info_user_status ON sales_info(user_id, processing_status);
CREATE INDEX IF NOT EXISTS idx_recipes_user_created ON recipes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cooking_history_user_recipe ON cooking_history(user_id, recipe_id);
CREATE INDEX IF NOT EXISTS idx_cooking_history_cooked_at ON cooking_history(cooked_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can insert own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can update own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can delete own inventory" ON inventory;

DROP POLICY IF EXISTS "Users can view own sales data" ON sales_info;
DROP POLICY IF EXISTS "Users can insert own sales data" ON sales_info;
DROP POLICY IF EXISTS "Users can update own sales data" ON sales_info;
DROP POLICY IF EXISTS "Users can delete own sales data" ON sales_info;

DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

DROP POLICY IF EXISTS "Users can view own cooking history" ON cooking_history;
DROP POLICY IF EXISTS "Users can insert own cooking history" ON cooking_history;
DROP POLICY IF EXISTS "Users can update own cooking history" ON cooking_history;
DROP POLICY IF EXISTS "Users can delete own cooking history" ON cooking_history;

-- Create comprehensive RLS policies

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = id);

-- Inventory policies
CREATE POLICY "Users can view own inventory" ON inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" ON inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON inventory
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory" ON inventory
  FOR DELETE USING (auth.uid() = user_id);

-- Sales info policies
CREATE POLICY "Users can view own sales data" ON sales_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales data" ON sales_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales data" ON sales_info
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales data" ON sales_info
  FOR DELETE USING (auth.uid() = user_id);

-- Recipes policies
CREATE POLICY "Users can view own recipes" ON recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Cooking history policies
CREATE POLICY "Users can view own cooking history" ON cooking_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cooking history" ON cooking_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cooking history" ON cooking_history
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cooking history" ON cooking_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at 
  BEFORE UPDATE ON inventory 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_info_updated_at ON sales_info;
CREATE TRIGGER update_sales_info_updated_at 
  BEFORE UPDATE ON sales_info 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, created_at, updated_at)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to get expiring inventory items
CREATE OR REPLACE FUNCTION get_expiring_inventory(user_uuid UUID, days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
  id UUID,
  ingredient_name TEXT,
  quantity DECIMAL(10,2),
  unit TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    inv.id,
    inv.ingredient_name,
    inv.quantity,
    inv.unit,
    inv.expiry_date,
    (inv.expiry_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM inventory inv
  WHERE inv.user_id = user_uuid
    AND inv.expiry_date IS NOT NULL
    AND inv.expiry_date <= CURRENT_DATE + days_ahead
  ORDER BY inv.expiry_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate recipe cost based on ingredients
CREATE OR REPLACE FUNCTION calculate_recipe_cost(recipe_ingredients JSONB, sale_items JSONB DEFAULT '[]'::JSONB)
RETURNS TABLE (
  total_cost DECIMAL(10,2),
  sale_savings DECIMAL(10,2)
) AS $$
DECLARE
  ingredient JSONB;
  total DECIMAL(10,2) := 0;
  savings DECIMAL(10,2) := 0;
  ingredient_cost DECIMAL(10,2);
  sale_price DECIMAL(10,2);
  original_price DECIMAL(10,2);
BEGIN
  -- Loop through recipe ingredients
  FOR ingredient IN SELECT * FROM jsonb_array_elements(recipe_ingredients)
  LOOP
    -- Get ingredient cost (simplified calculation)
    ingredient_cost := COALESCE((ingredient->>'cost')::DECIMAL(10,2), 0);
    total := total + ingredient_cost;
    
    -- Check if ingredient is in sale items for savings calculation
    IF sale_items != '[]'::JSONB THEN
      SELECT 
        (sale_item->>'sale_price')::DECIMAL(10,2),
        (sale_item->>'original_price')::DECIMAL(10,2)
      INTO sale_price, original_price
      FROM jsonb_array_elements(sale_items) sale_item
      WHERE LOWER(sale_item->>'name') = LOWER(ingredient->>'name')
      LIMIT 1;
      
      IF sale_price IS NOT NULL AND original_price IS NOT NULL THEN
        savings := savings + (original_price - sale_price);
      END IF;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT total, savings;
END;
$$ LANGUAGE plpgsql;

-- Function to get user cooking statistics
CREATE OR REPLACE FUNCTION get_user_cooking_stats(user_uuid UUID)
RETURNS TABLE (
  total_recipes_cooked INTEGER,
  avg_rating DECIMAL(3,2),
  total_cost_saved DECIMAL(10,2),
  favorite_categories TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(ch.id)::INTEGER as total_recipes_cooked,
    ROUND(AVG(ch.rating), 2) as avg_rating,
    COALESCE(SUM(r.sale_savings), 0) as total_cost_saved,
    ARRAY_AGG(DISTINCT category) FILTER (WHERE category IS NOT NULL) as favorite_categories
  FROM cooking_history ch
  JOIN recipes r ON r.id = ch.recipe_id
  CROSS JOIN LATERAL unnest(r.categories) as category
  WHERE ch.user_id = user_uuid
    AND ch.rating IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for sale images
INSERT INTO storage.buckets (id, name, public)
VALUES ('sale-images', 'sale-images', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own sale images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own sale images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own sale images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own sale images" ON storage.objects;

-- Comprehensive storage policies for sale images
CREATE POLICY "Users can upload their own sale images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'sale-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own sale images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'sale-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own sale images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'sale-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  ) WITH CHECK (
    bucket_id = 'sale-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own sale images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'sale-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );