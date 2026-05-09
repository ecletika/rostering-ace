-- M03: Organograma — tabela de posições estruturais
-- Permite posições preenchidas (employee_id) ou vagas (employee_id null)

create table if not exists public.org_positions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  titulo text not null default 'Cargo por preencher',
  department_id uuid references public.departments(id) on delete set null,
  employee_id uuid references public.employees(id) on delete set null,
  parent_id uuid references public.org_positions(id) on delete set null,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.org_positions enable row level security;

create policy "org_positions_select" on public.org_positions
  for select using (true);

create policy "org_positions_write" on public.org_positions
  for all using (auth.role() = 'authenticated');
