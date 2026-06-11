-- Create 'images' bucket
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- Set up Row Level Security (RLS) on storage.objects

-- Allow public read access to 'images' bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'images' );

-- Allow authenticated admins to upload/update/delete
create policy "Admin Insert Access"
  on storage.objects for insert
  with check ( 
    bucket_id = 'images' and 
    auth.role() = 'authenticated' and
    exists (select 1 from public.users where uid = (auth.jwt() ->> 'sub') and is_admin = true)
  );

create policy "Admin Update Access"
  on storage.objects for update
  using ( 
    bucket_id = 'images' and 
    auth.role() = 'authenticated' and
    exists (select 1 from public.users where uid = (auth.jwt() ->> 'sub') and is_admin = true)
  );

create policy "Admin Delete Access"
  on storage.objects for delete
  using ( 
    bucket_id = 'images' and 
    auth.role() = 'authenticated' and
    exists (select 1 from public.users where uid = (auth.jwt() ->> 'sub') and is_admin = true)
  );
