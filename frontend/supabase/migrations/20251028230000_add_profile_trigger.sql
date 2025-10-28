-- Create trigger to auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql as $$
declare
  base_username text;
  final_username text;
begin
  -- Base: metadata.username o parte local del email
  base_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  -- Asegurar unicidad añadiendo sufijo corto del id
  final_username := base_username || '_' || substr(new.id::text, 1, 8);

  insert into public.profiles (id, username)
  values (new.id, final_username)
  on conflict (id) do update set username = excluded.username;

  return new;
end;
$$;

-- Ejecutar la función tras crear un usuario
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
