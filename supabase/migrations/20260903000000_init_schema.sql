-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text,
  role text not null default 'USER' check (role in ('USER', 'ADMIN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. DOWNLOADS TABLE
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  source_url text not null,
  source_domain text,
  title text,
  thumbnail_url text,
  quality text,
  format text,
  file_size bigint,
  status text not null default 'QUEUED' check (status in ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  file_url text,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz
);

-- 3. DOWNLOAD FORMATS TABLE
create table if not exists public.download_formats (
  id uuid primary key default gen_random_uuid(),
  download_id uuid references public.downloads(id) on delete cascade,
  quality text,
  format text,
  resolution text,
  file_size bigint,
  audio boolean default true,
  video boolean default true,
  source_url text,
  created_at timestamptz not null default now()
);

-- 4. SUPPORTED DOMAINS TABLE
create table if not exists public.supported_domains (
  id uuid primary key default gen_random_uuid(),
  domain text unique not null,
  enabled boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. SYSTEM LOGS TABLE
create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  job_id uuid references public.downloads(id) on delete set null,
  level text not null default 'INFO' check (level in ('INFO', 'WARN', 'ERROR', 'SECURITY')),
  event text not null,
  message text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- INDEXES FOR PERFORMANCE
create index if not exists idx_downloads_user_id on public.downloads(user_id);
create index if not exists idx_downloads_status on public.downloads(status);
create index if not exists idx_downloads_created_at on public.downloads(created_at desc);
create index if not exists idx_supported_domains_domain on public.supported_domains(domain);
create index if not exists idx_system_logs_job_id on public.system_logs(job_id);

-- TRIGGER FOR NEW USER CREATION IN AUTH.USERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'USER'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.downloads enable row level security;
alter table public.download_formats enable row level security;
alter table public.supported_domains enable row level security;
alter table public.system_logs enable row level security;

-- PROFILES POLICIES
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'
    )
  );

-- DOWNLOADS POLICIES
create policy "Users can view own downloads"
  on public.downloads for select
  using (
    user_id = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

create policy "Users can insert own downloads"
  on public.downloads for insert
  with check (
    user_id is null or user_id = auth.uid()
  );

create policy "Users can update own downloads"
  on public.downloads for update
  using (
    user_id = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

create policy "Users can delete own downloads"
  on public.downloads for delete
  using (
    user_id = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

-- DOWNLOAD FORMATS POLICIES
create policy "Users can view download formats for accessible downloads"
  on public.download_formats for select
  using (
    exists (
      select 1 from public.downloads
      where downloads.id = download_formats.download_id
      and (downloads.user_id = auth.uid() or downloads.user_id is null or exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'))
    )
  );

-- SUPPORTED DOMAINS POLICIES
create policy "Anyone can view enabled supported domains"
  on public.supported_domains for select
  using (enabled = true or exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Admins can manage supported domains"
  on public.supported_domains for all
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'
    )
  );

-- SYSTEM LOGS POLICIES
create policy "Admins can view system logs"
  on public.system_logs for select
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'
    )
  );
