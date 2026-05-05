
create table public.colaboradores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

create table public.escalas (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  tipo text not null check (tipo in ('quarta','domingo')),
  pregador_id uuid references public.colaboradores(id) on delete set null,
  ministro_id uuid references public.colaboradores(id) on delete set null,
  back1_id uuid references public.colaboradores(id) on delete set null,
  back2_id uuid references public.colaboradores(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (data, tipo)
);

alter table public.colaboradores enable row level security;
alter table public.escalas enable row level security;

create policy "colab_select_all" on public.colaboradores for select using (true);
create policy "colab_insert_all" on public.colaboradores for insert with check (true);
create policy "colab_update_all" on public.colaboradores for update using (true);
create policy "colab_delete_all" on public.colaboradores for delete using (true);

create policy "esc_select_all" on public.escalas for select using (true);
create policy "esc_insert_all" on public.escalas for insert with check (true);
create policy "esc_update_all" on public.escalas for update using (true);
create policy "esc_delete_all" on public.escalas for delete using (true);
