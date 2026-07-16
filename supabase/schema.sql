-- ══════════════════════════════════════════════
-- MINTIQ Database Schema
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- ═══ Extensions ═══
create extension if not exists "uuid-ossp";

-- ═══ 1. Profiles ═══
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  points integer default 100,
  total_earned integer default 100,
  referral_code text unique,
  referred_by uuid references public.profiles(id),
  referral_count integer default 0,
  level integer default 1,
  streak_days integer default 0,
  last_active timestamptz default now(),
  fb_profile_link text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

-- ═══ 2. Tasks ═══
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text default '',
  description text,
  content_link text not null,
  task_type text not null check (task_type in ('view','follow','comment','like','subscribe','share')),
  points_per_action integer not null default 2,
  total_needed integer not null default 20,
  total_completed integer default 0,
  status text default 'active' check (status in ('active','completed','paused','expired')),
  platform text default 'website',
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Anyone can view active tasks" on public.tasks
  for select using (status = 'active');

create policy "Users can view own tasks" on public.tasks
  for select using (auth.uid() = owner_id);

create policy "Users can create tasks" on public.tasks
  for insert with check (auth.uid() = owner_id);

create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = owner_id);

-- ═══ 3. Submissions ═══
create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  screenshot_url text,
  timer_completed boolean default false,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.submissions enable row level security;

create policy "Users can view own submissions" on public.submissions
  for select using (auth.uid() = user_id);

create policy "Task owners can view submissions" on public.submissions
  for select using (
    auth.uid() in (select owner_id from public.tasks where id = task_id)
  );

create policy "Users can create submissions" on public.submissions
  for insert with check (auth.uid() = user_id);

create policy "Task owners can update submissions" on public.submissions
  for update using (
    auth.uid() in (select owner_id from public.tasks where id = task_id)
  );

-- ═══ 4. Transactions ═══
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  amount integer not null,
  balance_after integer not null,
  description text default '',
  reference_id uuid,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

-- ═══ 5. Ads ═══
create table public.ads (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  ad_type text not null check (ad_type in ('banner','video','popup','social_bar')),
  ad_network text default 'adsterra',
  script_url text,
  ad_code text,
  points_reward integer default 1,
  cooldown_seconds integer default 60,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.ads enable row level security;

create policy "Anyone can view active ads" on public.ads
  for select using (is_active = true);

-- ═══ 6. Ad Views (tracking) ═══
create table public.ad_views (
  id uuid default uuid_generate_v4() primary key,
  ad_id uuid references public.ads(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  points_earned integer default 0,
  viewed_at timestamptz default now()
);

alter table public.ad_views enable row level security;

create policy "Users can view own ad views" on public.ad_views
  for select using (auth.uid() = user_id);

create policy "Users can create ad views" on public.ad_views
  for insert with check (auth.uid() = user_id);

-- ═══ 7. Video Tasks ═══
create table public.video_tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  video_url text not null,
  thumbnail_url text,
  duration_seconds integer default 60,
  points_reward integer default 5,
  watch_seconds_required integer default 30,
  total_watches integer default 0,
  max_watches integer default 1000,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.video_tasks enable row level security;

create policy "Anyone can view active videos" on public.video_tasks
  for select using (is_active = true);

-- ═══ 8. Video Views ═══
create table public.video_views (
  id uuid default uuid_generate_v4() primary key,
  video_id uuid references public.video_tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  watch_seconds integer default 0,
  completed boolean default false,
  points_earned integer default 0,
  viewed_at timestamptz default now()
);

alter table public.video_views enable row level security;

create policy "Users can view own video views" on public.video_views
  for select using (auth.uid() = user_id);

create policy "Users can create video views" on public.video_views
  for insert with check (auth.uid() = user_id);

-- ═══ 9. Surveys ═══
create table public.surveys (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text default '',
  survey_url text not null,
  points_reward integer default 20,
  estimated_minutes integer default 5,
  provider text default 'manual',
  total_completions integer default 0,
  max_completions integer default 500,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.surveys enable row level security;

create policy "Anyone can view active surveys" on public.surveys
  for select using (is_active = true);

-- ═══ 10. Survey Completions ═══
create table public.survey_completions (
  id uuid default uuid_generate_v4() primary key,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  screenshot_url text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  points_earned integer default 0,
  completed_at timestamptz default now()
);

alter table public.survey_completions enable row level security;

create policy "Users can view own survey completions" on public.survey_completions
  for select using (auth.uid() = user_id);

create policy "Users can create survey completions" on public.survey_completions
  for insert with check (auth.uid() = user_id);

-- ═══ 11. Games ═══
create table public.games (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text default '',
  game_url text not null,
  thumbnail_url text,
  points_per_play integer default 5,
  max_plays_per_day integer default 10,
  game_type text default 'iframe' check (game_type in ('iframe','link')),
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.games enable row level security;

create policy "Anyone can view active games" on public.games
  for select using (is_active = true);

-- ═══ 12. Game Plays ═══
create table public.game_plays (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer default 0,
  points_earned integer default 0,
  played_at timestamptz default now()
);

alter table public.game_plays enable row level security;

create policy "Users can view own game plays" on public.game_plays
  for select using (auth.uid() = user_id);

create policy "Users can create game plays" on public.game_plays
  for insert with check (auth.uid() = user_id);

-- ═══ 13. Withdrawals ═══
create table public.withdrawals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null,
  method text not null check (method in ('bkash','nagad','rocket','bank')),
  account_number text not null,
  status text default 'pending' check (status in ('pending','processing','completed','rejected')),
  processed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.withdrawals enable row level security;

create policy "Users can view own withdrawals" on public.withdrawals
  for select using (auth.uid() = user_id);

create policy "Users can create withdrawals" on public.withdrawals
  for insert with check (auth.uid() = user_id);

-- ═══ 14. Achievements ═══
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text default '',
  icon text default '🏅',
  requirement_type text not null,
  requirement_value integer not null,
  points_reward integer default 0,
  created_at timestamptz default now()
);

alter table public.achievements enable row level security;

create policy "Anyone can view achievements" on public.achievements
  for select using (true);

-- ═══ 15. User Achievements ═══
create table public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_id uuid references public.achievements(id) on delete cascade not null,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "Users can view own achievements" on public.user_achievements
  for select using (auth.uid() = user_id);

-- ═══ 16. Daily Bonuses ═══
create table public.daily_bonuses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  claimed_date date default current_date,
  streak_day integer default 1,
  points_earned integer default 5,
  unique(user_id, claimed_date)
);

alter table public.daily_bonuses enable row level security;

create policy "Users can view own daily bonuses" on public.daily_bonuses
  for select using (auth.uid() = user_id);

create policy "Users can claim daily bonus" on public.daily_bonuses
  for insert with check (auth.uid() = user_id);

-- ═══ Functions ═══

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  _ref_code text;
begin
  _ref_code := 'MINT' || substr(replace(new.id::text, '-', ''), 1, 8);
  insert into public.profiles (id, email, display_name, points, total_earned, referral_code, referred_by)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    100,
    100,
    _ref_code,
    (select id from public.profiles where referral_code = new.raw_user_meta_data->>'referred_by_code' limit 1)
  );

  -- Referral bonus
  if new.raw_user_meta_data->>'referred_by_code' is not null then
    update public.profiles
    set points = points + 100,
        total_earned = total_earned + 100,
        referral_count = referral_count + 1
    where referral_code = new.raw_user_meta_data->>'referred_by_code';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Approve submission
create or replace function public.approve_submission(submission_id uuid)
returns void as $$
declare
  _task_id uuid;
  _user_id uuid;
  _points integer;
  _current_points integer;
begin
  select task_id, user_id into _task_id, _user_id
  from public.submissions where id = submission_id;

  select points_per_action into _points
  from public.tasks where id = _task_id;

  update public.submissions
  set status = 'approved', reviewed_at = now()
  where id = submission_id;

  update public.tasks
  set total_completed = total_completed + 1,
      status = case when total_completed + 1 >= total_needed then 'completed' else status end
  where id = _task_id;

  select points into _current_points from public.profiles where id = _user_id;

  update public.profiles
  set points = points + _points,
      total_earned = total_earned + _points
  where id = _user_id;

  insert into public.transactions (user_id, type, amount, balance_after, description, reference_id)
  values (_user_id, 'task_reward', _points, _current_points + _points, 'টাস্ক সম্পন্ন', _task_id);
end;
$$ language plpgsql security definer;

-- Reject submission
create or replace function public.reject_submission(submission_id uuid)
returns void as $$
begin
  update public.submissions
  set status = 'rejected', reviewed_at = now()
  where id = submission_id;
end;
$$ language plpgsql security definer;

-- Claim daily bonus
create or replace function public.claim_daily_bonus(_user_id uuid)
returns integer as $$
declare
  _streak integer;
  _bonus integer;
  _yesterday date;
  _current_points integer;
begin
  _yesterday := current_date - interval '1 day';

  select streak_days into _streak
  from public.profiles where id = _user_id;

  -- Check if claimed yesterday for streak
  if not exists (select 1 from public.daily_bonuses where user_id = _user_id and claimed_date = _yesterday) then
    _streak := 0;
  end if;

  _streak := _streak + 1;
  _bonus := least(5 + (_streak - 1) * 2, 50); -- Max 50 points

  select points into _current_points from public.profiles where id = _user_id;

  insert into public.daily_bonuses (user_id, claimed_date, streak_day, points_earned)
  values (_user_id, current_date, _streak, _bonus);

  update public.profiles
  set points = points + _bonus,
      total_earned = total_earned + _bonus,
      streak_days = _streak
  where id = _user_id;

  insert into public.transactions (user_id, type, amount, balance_after, description)
  values (_user_id, 'daily_bonus', _bonus, _current_points + _bonus, 'দৈনিক বোনাস — দিন ' || _streak);

  return _bonus;
end;
$$ language plpgsql security definer;

-- Record ad view
create or replace function public.record_ad_view(_ad_id uuid, _user_id uuid)
returns integer as $$
declare
  _reward integer;
  _cooldown integer;
  _current_points integer;
begin
  select points_reward, cooldown_seconds into _reward, _cooldown
  from public.ads where id = _ad_id and is_active = true;

  if _reward is null then return 0; end if;

  -- Cooldown check
  if exists (
    select 1 from public.ad_views
    where ad_id = _ad_id and user_id = _user_id
    and viewed_at > now() - (_cooldown || ' seconds')::interval
  ) then return 0; end if;

  select points into _current_points from public.profiles where id = _user_id;

  insert into public.ad_views (ad_id, user_id, points_earned)
  values (_ad_id, _user_id, _reward);

  update public.profiles
  set points = points + _reward,
      total_earned = total_earned + _reward
  where id = _user_id;

  insert into public.transactions (user_id, type, amount, balance_after, description)
  values (_user_id, 'ad_reward', _reward, _current_points + _reward, 'বিজ্ঞাপন দেখেছেন');

  return _reward;
end;
$$ language plpgsql security definer;

-- Record video watch
create or replace function public.record_video_watch(_video_id uuid, _user_id uuid, _seconds integer)
returns integer as $$
declare
  _required integer;
  _reward integer;
  _current_points integer;
begin
  select watch_seconds_required, points_reward into _required, _reward
  from public.video_tasks where id = _video_id and is_active = true;

  if _reward is null or _seconds < _required then return 0; end if;

  -- Already watched?
  if exists (
    select 1 from public.video_views
    where video_id = _video_id and user_id = _user_id and completed = true
  ) then return 0; end if;

  select points into _current_points from public.profiles where id = _user_id;

  insert into public.video_views (video_id, user_id, watch_seconds, completed, points_earned)
  values (_video_id, _user_id, _seconds, true, _reward)
  on conflict do nothing;

  update public.video_tasks set total_watches = total_watches + 1 where id = _video_id;

  update public.profiles
  set points = points + _reward,
      total_earned = total_earned + _reward
  where id = _user_id;

  insert into public.transactions (user_id, type, amount, balance_after, description)
  values (_user_id, 'video_reward', _reward, _current_points + _reward, 'ভিডিও দেখেছেন');

  return _reward;
end;
$$ language plpgsql security definer;

-- Record game play
create or replace function public.record_game_play(_game_id uuid, _user_id uuid, _score integer)
returns integer as $$
declare
  _reward integer;
  _max_plays integer;
  _today_plays integer;
  _current_points integer;
begin
  select points_per_play, max_plays_per_day into _reward, _max_plays
  from public.games where id = _game_id and is_active = true;

  if _reward is null then return 0; end if;

  select count(*) into _today_plays
  from public.game_plays
  where game_id = _game_id and user_id = _user_id and played_at::date = current_date;

  if _today_plays >= _max_plays then return 0; end if;

  select points into _current_points from public.profiles where id = _user_id;

  insert into public.game_plays (game_id, user_id, score, points_earned)
  values (_game_id, _user_id, _score, _reward);

  update public.profiles
  set points = points + _reward,
      total_earned = total_earned + _reward
  where id = _user_id;

  insert into public.transactions (user_id, type, amount, balance_after, description)
  values (_user_id, 'game_reward', _reward, _current_points + _reward, 'গে� খেলেছেন');

  return _reward;
end;
$$ language plpgsql security definer;

-- Update level based on total_earned
create or replace function public.update_user_level()
returns trigger as $$
begin
  new.level := case
    when new.total_earned >= 15000 then 10
    when new.total_earned >= 10000 then 9
    when new.total_earned >= 6000 then 8
    when new.total_earned >= 4000 then 7
    when new.total_earned >= 2500 then 6
    when new.total_earned >= 1500 then 5
    when new.total_earned >= 1000 then 4
    when new.total_earned >= 600 then 3
    when new.total_earned >= 300 then 2
    when new.total_earned >= 100 then 1
    else 1
  end;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_points_update
  before update of total_earned on public.profiles
  for each row execute function public.update_user_level();

-- ═══ Storage Bucket ═══
insert into storage.buckets (id, name, public) values ('screenshots', 'screenshots', true);

create policy "Anyone can view screenshots" on storage.objects
  for select using (bucket_id = 'screenshots');

create policy "Authenticated users can upload" on storage.objects
  for insert with check (bucket_id = 'screenshots' and auth.role() = 'authenticated');

-- ═══ Sample Data ═══
insert into public.ads (title, ad_type, ad_network, points_reward, cooldown_seconds) values
  ('Top Banner Ad', 'banner', 'adsterra', 1, 30),
  ('Video Ad', 'video', 'adsterra', 3, 120),
  ('Social Bar', 'social_bar', 'adsterra', 1, 60),
  ('Popup Ad', 'popup', 'adsterra', 2, 90);

insert into public.video_tasks (title, video_url, duration_seconds, points_reward, watch_seconds_required) values
  ('AI Tools 2025', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 120, 5, 30),
  ('বাংলা টিউটোরিয়াল', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 90, 4, 25),
  ('Tech Review', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 180, 8, 45);

insert into public.surveys (title, description, survey_url, points_reward, estimated_minutes) values
  ('বাজার সমীক্ষা ২০২৫', 'আপনার পছন্দের প্রোডাক্ট সম্পর্কে বলুন', 'https://example.com/survey1', 25, 5),
  ('টেক প্রেফারেন্স', 'কোন টেক ব্র্যান্ড বেশি ব্যবহার করেন?', 'https://example.com/survey2', 20, 3),
  ('দৈনিক রুটিন', 'আপনার দৈনিক রুটিন শেয়ার করুন', 'https://example.com/survey3', 15, 2);

insert into public.games (title, description, game_url, points_per_play, max_plays_per_day, game_type) values
  ('টিক ট্যাক টো', 'ক্লাসিক গেম — জিতলে বোনাস!', '/games/tictactoe', 3, 10, 'iframe'),
  ('মেমরি ম্যাচ', 'মেমরি টেস্ট করুন', '/games/memory', 5, 5, 'iframe'),
  ('কুইজ মাস্টার', 'জেনারেল নলেজ কুইজ', '/games/quiz', 4, 8, 'iframe');

insert into public.achievements (title, description, icon, requirement_type, requirement_value, points_reward) values
  ('প্রথম পদক্ষেপ', 'প্রথম টাস্ক সম্পন্ন করুন', '🎯', 'tasks_completed', 1, 10),
  ('সক্রিয় সদস্য', '১০টি টাস্ক সম্পন্ন করুন', '⚡', 'tasks_completed', 10, 50),
  ('রেফারেল মাস্টার', '৫ জনকে রেফার করুন', '👥', 'referrals', 5, 100),
  ('৭ দিনের স্ট্রিক', '৭ দিন লগাতার আসুন', '🔥', 'streak', 7, 30),
  ('গেম লাভার', '৫০ বার গেম খেলুন', '🎮', 'games_played', 50, 75),
  ('ভিডিও দর্শক', '২৫টি ভিডিও দেখুন', '📺', 'videos_watched', 25, 40),
  ('সার্ভে বিশেষজ্ঞ', '১০টি সার্ভে সম্পন্ন করুন', '📝', 'surveys_completed', 10, 60);
