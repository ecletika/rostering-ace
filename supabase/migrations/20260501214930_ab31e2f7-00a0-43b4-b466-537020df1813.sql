-- 1. Adicionar back3 às escalas
ALTER TABLE public.escalas ADD COLUMN IF NOT EXISTS back3_id uuid;

-- 2. Tabela de versículos
CREATE TABLE IF NOT EXISTS public.versiculos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  texto text NOT NULL,
  referencia text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.versiculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vers_select_all" ON public.versiculos FOR SELECT USING (true);
CREATE POLICY "vers_insert_all" ON public.versiculos FOR INSERT WITH CHECK (true);
CREATE POLICY "vers_update_all" ON public.versiculos FOR UPDATE USING (true);
CREATE POLICY "vers_delete_all" ON public.versiculos FOR DELETE USING (true);

-- 3. Adicionar versiculo_id à escala (opcional - quando null usa o padrão)
ALTER TABLE public.escalas ADD COLUMN IF NOT EXISTS versiculo_id uuid;

-- 4. Tabela de configurações (singleton)
CREATE TABLE IF NOT EXISTS public.configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  rodape_image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cfg_select_all" ON public.configuracoes FOR SELECT USING (true);
CREATE POLICY "cfg_insert_all" ON public.configuracoes FOR INSERT WITH CHECK (true);
CREATE POLICY "cfg_update_all" ON public.configuracoes FOR UPDATE USING (true);

INSERT INTO public.configuracoes (logo_url, rodape_image_url) VALUES (NULL, NULL);

-- Insere alguns versículos padrão
INSERT INTO public.versiculos (texto, referencia) VALUES
  ('Venham! Adoremos prostrados e ajoelhemos diante do Senhor, o nosso Criador', 'Salmos 95:6'),
  ('Cantai ao Senhor um cântico novo, cantai ao Senhor toda a terra', 'Salmos 96:1'),
  ('Louvai ao Senhor, porque é bom cantar louvores ao nosso Deus', 'Salmos 147:1');

-- 5. Bucket público para imagens
INSERT INTO storage.buckets (id, name, public) VALUES ('escala-assets', 'escala-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "escala_assets_select" ON storage.objects FOR SELECT USING (bucket_id = 'escala-assets');
CREATE POLICY "escala_assets_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'escala-assets');
CREATE POLICY "escala_assets_update" ON storage.objects FOR UPDATE USING (bucket_id = 'escala-assets');
CREATE POLICY "escala_assets_delete" ON storage.objects FOR DELETE USING (bucket_id = 'escala-assets');