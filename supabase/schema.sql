-- =====================================================================
-- Star Pets, Chandigarh: database setup
-- Paste this whole file into Supabase -> SQL Editor -> New query -> Run.
-- It is safe to run only once on a fresh project.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. PROFILES: one row per registered person (customer or admin)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- Automatically create a profile whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the person making this request an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


-- ---------------------------------------------------------------------
-- 2. APPOINTMENTS
-- ---------------------------------------------------------------------
create table public.appointments (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  user_id           uuid references auth.users (id) on delete set null, -- empty for guest bookings
  owner_name        text not null check (char_length(owner_name) between 2 and 100),
  pet_name          text not null check (char_length(pet_name) between 1 and 60),
  pet_type          text not null default 'Dog',
  email             text not null check (char_length(email) <= 200),
  phone             text not null check (char_length(phone) between 10 and 15),
  service           text not null,
  appointment_date  date not null,
  appointment_time  time not null,
  notes             text check (char_length(notes) <= 500),
  heard_from        text,
  status            text not null default 'pending'
                    check (status in ('pending', 'confirmed', 'completed', 'cancelled'))
);

create index appointments_slot_idx on public.appointments (appointment_date, appointment_time);
create index appointments_user_idx on public.appointments (user_id);


-- ---------------------------------------------------------------------
-- 3. NO DOUBLE BOOKING: max 2 active appointments per time slot
--    (2 = number of vets/consulting rooms working at the same time).
--    If you change 2 here, also change slotCapacity in src/lib/clinic.ts.
-- ---------------------------------------------------------------------
create or replace function public.check_slot_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status <> 'cancelled' then
    -- lock this slot so two people booking at the same second cannot both win
    perform pg_advisory_xact_lock(
      hashtext(new.appointment_date::text || ' ' || new.appointment_time::text)
    );

    if (
      select count(*)
      from public.appointments
      where appointment_date = new.appointment_date
        and appointment_time = new.appointment_time
        and status <> 'cancelled'
        and id <> new.id
    ) >= 2 then
      raise exception 'SLOT_FULL';
    end if;
  end if;
  return new;
end;
$$;

create trigger appointments_check_capacity
  before insert or update on public.appointments
  for each row execute function public.check_slot_capacity();


-- ---------------------------------------------------------------------
-- 4. SECURITY RULES (Row Level Security)
--    Nobody can read or change data unless a rule below allows it.
-- ---------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.appointments enable row level security;

-- Profiles: you can read your own; admins can read everyone's.
-- (There is deliberately NO update rule, so nobody can make themselves admin.)
create policy "Read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "Admins read all profiles"
  on public.profiles for select to authenticated
  using (public.is_admin());

-- Appointments: anyone (guest or logged in) can create a "pending" booking.
create policy "Anyone can book"
  on public.appointments for insert to anon, authenticated
  with check (
    status = 'pending'
    and (user_id is null or user_id = auth.uid())
  );

-- Customers can read their own appointments.
create policy "Customers read own appointments"
  on public.appointments for select to authenticated
  using (user_id = auth.uid());

-- Admins can read and update every appointment.
create policy "Admins read all appointments"
  on public.appointments for select to authenticated
  using (public.is_admin());

create policy "Admins update appointments"
  on public.appointments for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- Permissions: what each kind of visitor is allowed to attempt at all.
-- (The security rules above then narrow this down row by row.)
grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert on public.appointments to anon, authenticated;
grant select on public.appointments to authenticated;
grant update (status) on public.appointments to authenticated;  -- admins may only change the status
grant execute on function public.is_admin() to authenticated;


-- ---------------------------------------------------------------------
-- 5. HELPER FUNCTIONS THE WEBSITE CALLS
-- ---------------------------------------------------------------------

-- Which time slots are taken on a day? Returns only times and counts,
-- never names or phone numbers, so it is safe for guests to call.
create or replace function public.get_slot_counts(day date)
returns table (slot_time time, booked bigint)
language sql
security definer
stable
set search_path = public
as $$
  select appointment_time, count(*)
  from public.appointments
  where appointment_date = day
    and status <> 'cancelled'
  group by appointment_time;
$$;

grant execute on function public.get_slot_counts(date) to anon, authenticated;

-- A customer cancels their own appointment (and nothing else about it).
create or replace function public.cancel_my_appointment(appointment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  changed integer;
begin
  update public.appointments
  set status = 'cancelled'
  where id = appointment_id
    and user_id = auth.uid()
    and status in ('pending', 'confirmed');
  get diagnostics changed = row_count;
  return changed > 0;
end;
$$;

revoke execute on function public.cancel_my_appointment(uuid) from public, anon;
grant execute on function public.cancel_my_appointment(uuid) to authenticated;


-- ---------------------------------------------------------------------
-- 6. MAKE YOURSELF THE ADMIN  (do this AFTER you have signed up on the site)
--    Replace the email, then run just this one line:
--
--    update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------
