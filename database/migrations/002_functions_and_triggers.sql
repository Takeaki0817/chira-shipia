-- Functions and triggers migration
-- This migration adds business logic functions and additional triggers

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