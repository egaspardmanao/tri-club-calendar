-- Schéma Supabase pour le club de triathlon
-- À coller dans l'éditeur SQL de votre projet Supabase

-- Table principale : événements triathlon
create table if not exists triathlons (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  city        text not null,
  date        date,
  end_date    date,
  lat         double precision,
  lng         double precision,
  formats     text[] not null default '{}',   -- ['XS','M','XL']
  website     text,
  register_url text,
  whatsapp_url text,
  comment     text,
  is_club_event boolean not null default false,
  created_at  timestamptz default now()
);

-- Table participants : une ligne = une personne sur un format d'un triathlon
create table if not exists participants (
  id             uuid primary key default gen_random_uuid(),
  triathlon_id   uuid not null references triathlons(id) on delete cascade,
  name           text not null,
  format         text not null,    -- le format choisi par ce participant
  status         text not null default 'confirmed' check (status in ('confirmed', 'interested')),
  created_at     timestamptz default now()
);

-- Table bourse aux dossards : un dossard à céder pour un format d'un triathlon
create table if not exists bib_transfers (
  id            uuid primary key default gen_random_uuid(),
  triathlon_id  uuid not null references triathlons(id) on delete cascade,
  format        text not null,
  seller_name   text not null,
  contact       text not null,   -- téléphone, email ou @profil
  status        text not null default 'available' check (status in ('available', 'taken')),
  created_at    timestamptz default now()
);

-- Index pour les requêtes fréquentes
create index if not exists idx_triathlons_date on triathlons(date);
create index if not exists idx_participants_triathlon on participants(triathlon_id);
create index if not exists idx_bib_transfers_triathlon on bib_transfers(triathlon_id);

-- Activer Row Level Security (lecture publique, écriture publique car pas d'auth)
alter table triathlons enable row level security;
alter table participants enable row level security;
alter table bib_transfers enable row level security;

create policy "Lecture publique bib_transfers"
  on bib_transfers for select using (true);

create policy "Ecriture publique bib_transfers"
  on bib_transfers for insert with check (true);

create policy "Modification publique bib_transfers"
  on bib_transfers for update using (true) with check (true);

create policy "Suppression publique bib_transfers"
  on bib_transfers for delete using (true);

create policy "Lecture publique triathlons"
  on triathlons for select using (true);

create policy "Ecriture publique triathlons"
  on triathlons for insert with check (true);

create policy "Lecture publique participants"
  on participants for select using (true);

create policy "Ecriture publique participants"
  on participants for insert with check (true);

create policy "Modification publique triathlons"
  on triathlons for update using (true) with check (true);

create policy "Suppression publique triathlons"
  on triathlons for delete using (true);

create policy "Suppression publique participants"
  on participants for delete using (true);

alter table triathlons add column if not exists end_date date;
alter table triathlons add column if not exists is_club_event boolean not null default false;
alter table participants add column if not exists status text not null default 'confirmed' check (status in ('confirmed', 'interested'));

-- Migration bourse aux dossards (si triathlons/participants existent déjà) :
-- exécuter uniquement le bloc "Table bourse aux dossards" et les 4 policies bib_transfers
-- plus haut dans ce fichier (create table if not exists gère l'idempotence).

-- Données de test (optionnel, à supprimer en prod)
insert into triathlons (name, city, date, lat, lng, formats, website, comment)
values
  ('Triathlon de Nice', 'Nice', '2027-04-18', 43.7102, 7.2620, ARRAY['S','M','XL'], 'https://triathlondenice.com', 'Inscriptions ouvertes en janvier. Covoit possible depuis Paris.'),
  ('Triathlon de Paris', 'Paris', '2027-06-13', 48.8566, 2.3522, ARRAY['XS','S','M'], null, null),
  ('L''Embrunman', 'Embrun', '2027-08-09', 44.5634, 6.4957, ARRAY['XXL'], 'https://embrunman.com', 'Légendaire. Réservez l''hébergement très tôt !');
