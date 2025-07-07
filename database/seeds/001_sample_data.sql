-- Sample data for development and testing
-- Note: This seed data assumes you have test users in your Supabase Auth

-- Insert sample user profiles (replace UUIDs with actual test user IDs)
-- INSERT INTO user_profiles (id, display_name, allergies, dietary_restrictions, cooking_skill_level) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'テストユーザー1', '["ナッツ", "卵"]'::jsonb, ARRAY['ベジタリアン'], 3),
-- ('00000000-0000-0000-0000-000000000002', 'テストユーザー2', '[]'::jsonb, ARRAY[]::text[], 2);

-- Sample inventory items (replace user_id with actual test user IDs)
-- INSERT INTO inventory (user_id, ingredient_name, quantity, unit, expiry_date, category) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'りんご', 5, 'pieces', '2024-12-31', '果物'),
-- ('00000000-0000-0000-0000-000000000001', '牛乳', 1, 'L', '2024-12-25', '乳製品'),
-- ('00000000-0000-0000-0000-000000000001', '卵', 12, 'pieces', '2024-12-28', '動物性食品'),
-- ('00000000-0000-0000-0000-000000000001', '米', 5, 'kg', '2025-06-30', '穀物'),
-- ('00000000-0000-0000-0000-000000000002', 'にんじん', 3, 'pieces', '2024-12-30', '野菜'),
-- ('00000000-0000-0000-0000-000000000002', '豚肉', 500, 'g', '2024-12-26', '肉類');

-- Sample sales info (replace user_id with actual test user IDs)
-- INSERT INTO sales_info (user_id, image_url, processing_status, store_name, items_count) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'test-images/sample-flyer1.jpg', 'structured', 'スーパーマーケットA', 5),
-- ('00000000-0000-0000-0000-000000000002', 'test-images/sample-flyer2.jpg', 'structured', 'スーパーマーケットB', 3);

-- Sample recipes (replace user_id with actual test user IDs)
-- INSERT INTO recipes (user_id, title, description, ingredients, instructions, difficulty_level, cooking_time, servings, categories, tags) VALUES
-- ('00000000-0000-0000-0000-000000000001', 
--  'りんごのケーキ', 
--  '簡単に作れるりんごケーキです', 
--  '[{"name": "りんご", "amount": "2個", "source": "冷蔵庫"}, {"name": "小麦粉", "amount": "200g", "source": "追加購入"}]'::jsonb,
--  ARRAY['りんごを薄切りにする', '生地を混ぜる', 'オーブンで焼く'],
--  2, 45, 4, ARRAY['デザート'], ARRAY['簡単', '手作り']),
-- ('00000000-0000-0000-0000-000000000002',
--  'にんじんサラダ',
--  'ヘルシーなにんじんサラダ',
--  '[{"name": "にんじん", "amount": "2本", "source": "冷蔵庫"}, {"name": "ドレッシング", "amount": "適量", "source": "追加購入"}]'::jsonb,
--  ARRAY['にんじんを千切りにする', 'ドレッシングと和える'],
--  1, 10, 2, ARRAY['サラダ'], ARRAY['ヘルシー', '時短']);

-- This file contains commented sample data for reference
-- Uncomment and modify the UUIDs when you have actual test users