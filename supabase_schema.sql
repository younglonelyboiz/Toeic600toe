-- ==========================================================
-- BẢN ĐẶC TẢ SQL CHO DỰ ÁN TOEIC VOCAB MASTERY (SUPABASE)
-- Copy toàn bộ nội dung file này và paste vào:
-- Supabase Dashboard -> SQL Editor -> Bấm "RUN"
-- ==========================================================

-- 1. BẢNG HỒ SƠ NGƯỜI DÙNG & CÁ NHÂN HÓA (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  target_score INT DEFAULT 650,          -- Mục tiêu TOEIC: 450, 650, 800, 900
  daily_goal INT DEFAULT 15,             -- Số từ mục tiêu học mỗi ngày
  sound_accent TEXT DEFAULT 'en-US',     -- Giọng đọc: 'en-US' hoặc 'en-GB'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG TIẾN ĐỘ TỪNG TỪ VỰNG (USER WORD PROGRESS)
-- Lưu dạng Sparse: Chỉ ghi record khi người dùng đã học (mastered hoặc review)
CREATE TABLE IF NOT EXISTS public.user_word_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id INT NOT NULL,                  -- ID từ 1 đến 600
  status TEXT NOT NULL CHECK (status IN ('mastered', 'review')),
  review_count INT DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- Index tối ưu tốc độ query theo user
CREATE INDEX IF NOT EXISTS idx_word_progress_user_id ON public.user_word_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_word_progress_status ON public.user_word_progress(user_id, status);

-- 3. BẢNG TỪ VỰNG YÊU THÍCH (USER FAVORITES)
CREATE TABLE IF NOT EXISTS public.user_favorites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, word_id)
);

-- 4. BẢNG THỐNG KÊ HỌC TẬP & STREAK (USER STATS)
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  streak INT DEFAULT 1,
  last_study_date DATE DEFAULT CURRENT_DATE,
  quiz_score_total INT DEFAULT 0,
  quiz_questions_answered INT DEFAULT 0,
  cards_reviewed_today INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- BẢO MẬT: ROW LEVEL SECURITY (RLS)
-- Đảm bảo mỗi user chỉ có quyền xem/sửa dữ liệu của chính mình
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Policy Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy Word Progress
DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_word_progress;
CREATE POLICY "Users can manage own progress" ON public.user_word_progress
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy Favorites
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.user_favorites;
CREATE POLICY "Users can manage own favorites" ON public.user_favorites
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy Stats
DROP POLICY IF EXISTS "Users can manage own stats" ON public.user_stats;
CREATE POLICY "Users can manage own stats" ON public.user_stats
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==========================================================
-- TỰ ĐỘNG TẠO PROFILE & STATS KHI USER ĐĂNG KÝ MỚI
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Tạo Profile mặc định
  INSERT INTO public.profiles (id, email, display_name, avatar_url, target_score, daily_goal)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    650,
    15
  )
  ON CONFLICT (id) DO NOTHING;

  -- Tạo Stats mặc định
  INSERT INTO public.user_stats (user_id, streak, last_study_date, cards_reviewed_today)
  VALUES (NEW.id, 1, CURRENT_DATE, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gắn Trigger vào auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
