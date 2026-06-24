-- এই ফাইলটাও Supabase SQL Editor এ Run করুন (আগের schema.sql এর পরে)
-- এটা নতুন user signup হলে automatic profile row বানিয়ে দেবে

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, points)
  values (new.id, new.raw_user_meta_data->>'display_name', 100);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
