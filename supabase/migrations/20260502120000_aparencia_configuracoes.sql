-- Adiciona colunas de personalização de aparência à tabela configuracoes
ALTER TABLE public.configuracoes
  ADD COLUMN IF NOT EXISTS cor_fundo text,
  ADD COLUMN IF NOT EXISTS cor_principal text,
  ADD COLUMN IF NOT EXISTS cor_linha1 text,
  ADD COLUMN IF NOT EXISTS cor_linha2 text,
  ADD COLUMN IF NOT EXISTS cor_mes_ano text,
  ADD COLUMN IF NOT EXISTS logo_tamanho integer;
