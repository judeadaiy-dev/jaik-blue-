
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'provider', 'user');
CREATE TYPE public.service_type AS ENUM ('water', 'gas');
CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'on_the_way', 'delivered', 'cancelled', 'rejected');
CREATE TYPE public.provider_status AS ENUM ('pending_approval', 'active', 'suspended', 'banned');

-- Governorates (Iraq)
CREATE TABLE public.governorates (
  id SERIAL PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL
);
GRANT SELECT ON public.governorates TO anon, authenticated;
GRANT ALL ON public.governorates TO service_role;
ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gov readable" ON public.governorates FOR SELECT USING (true);

-- Areas
CREATE TABLE public.areas (
  id SERIAL PRIMARY KEY,
  governorate_id INT NOT NULL REFERENCES public.governorates(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL
);
GRANT SELECT ON public.areas TO anon, authenticated;
GRANT ALL ON public.areas TO service_role;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "areas readable" ON public.areas FOR SELECT USING (true);

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  governorate_id INT REFERENCES public.governorates(id),
  area_id INT REFERENCES public.areas(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Providers
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  service_type service_type NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  governorate_id INT NOT NULL REFERENCES public.governorates(id),
  area_id INT NOT NULL REFERENCES public.areas(id),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  is_available BOOLEAN NOT NULL DEFAULT false,
  available_from TIME,
  available_to TIME,
  status provider_status NOT NULL DEFAULT 'pending_approval',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.providers TO authenticated;
GRANT SELECT ON public.providers TO anon;
GRANT ALL ON public.providers TO service_role;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view active providers" ON public.providers FOR SELECT USING (
  status = 'active' OR auth.uid() = user_id OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "insert own provider" ON public.providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own provider" ON public.providers FOR UPDATE USING (
  auth.uid() = user_id OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "admin delete provider" ON public.providers FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  service_type service_type NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  notes TEXT,
  address TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own orders" ON public.orders FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id = orders.provider_id AND p.user_id = auth.uid())
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "user creates order" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update order parties" ON public.orders FOR UPDATE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id = orders.provider_id AND p.user_id = auth.uid())
  OR public.has_role(auth.uid(),'admin')
);

-- Ratings
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ratings TO authenticated;
GRANT SELECT ON public.ratings TO anon;
GRANT ALL ON public.ratings TO service_role;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "user creates rating" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT,
  related_order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own notifs" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "update own notifs" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "insert any notif" ON public.notifications FOR INSERT WITH CHECK (true);

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "report by self" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "admin view reports" ON public.reports FOR SELECT USING (public.has_role(auth.uid(),'admin') OR auth.uid() = reporter_id);

-- Favorites
CREATE TABLE public.favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, provider_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER t_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_providers_upd BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_orders_upd BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile + default 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update provider rating after new rating
CREATE OR REPLACE FUNCTION public.refresh_provider_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.providers SET
    rating_avg = (SELECT COALESCE(AVG(stars),0) FROM public.ratings WHERE provider_id = NEW.provider_id),
    rating_count = (SELECT COUNT(*) FROM public.ratings WHERE provider_id = NEW.provider_id)
  WHERE id = NEW.provider_id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER t_refresh_rating AFTER INSERT ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.refresh_provider_rating();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
