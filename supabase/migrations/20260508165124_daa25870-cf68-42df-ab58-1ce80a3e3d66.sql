
-- 1. Roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "user_roles_self_select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_roles_admin_select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_admin_manage" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Lock down public tables: keep public SELECT, restrict writes to admins
DROP POLICY IF EXISTS "colab_insert_all" ON public.colaboradores;
DROP POLICY IF EXISTS "colab_update_all" ON public.colaboradores;
DROP POLICY IF EXISTS "colab_delete_all" ON public.colaboradores;
CREATE POLICY "colab_admin_insert" ON public.colaboradores FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "colab_admin_update" ON public.colaboradores FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "colab_admin_delete" ON public.colaboradores FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "esc_insert_all" ON public.escalas;
DROP POLICY IF EXISTS "esc_update_all" ON public.escalas;
DROP POLICY IF EXISTS "esc_delete_all" ON public.escalas;
CREATE POLICY "esc_admin_insert" ON public.escalas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "esc_admin_update" ON public.escalas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "esc_admin_delete" ON public.escalas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "cfg_insert_all" ON public.configuracoes;
DROP POLICY IF EXISTS "cfg_update_all" ON public.configuracoes;
CREATE POLICY "cfg_admin_insert" ON public.configuracoes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cfg_admin_update" ON public.configuracoes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cfg_admin_delete" ON public.configuracoes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "vers_insert_all" ON public.versiculos;
DROP POLICY IF EXISTS "vers_update_all" ON public.versiculos;
DROP POLICY IF EXISTS "vers_delete_all" ON public.versiculos;
CREATE POLICY "vers_admin_insert" ON public.versiculos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "vers_admin_update" ON public.versiculos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "vers_admin_delete" ON public.versiculos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Storage: keep public reads via getPublicUrl, restrict listing & writes
DROP POLICY IF EXISTS "escala_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "escala_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "escala_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "escala_assets_delete" ON storage.objects;

CREATE POLICY "escala_assets_admin_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'escala-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "escala_assets_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'escala-assets' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'escala-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "escala_assets_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'escala-assets' AND public.has_role(auth.uid(), 'admin'));
