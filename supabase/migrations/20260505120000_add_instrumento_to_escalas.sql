-- Adiciona coluna instrumento à tabela escalas
ALTER TABLE public.escalas
  ADD COLUMN IF NOT EXISTS instrumento_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL;
