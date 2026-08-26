-- Ajoute le type d'épreuve (Triathlon / Course à pied / Trail / Cyclo) aux événements existants.
-- Toutes les épreuves déjà enregistrées sont marquées 'Triathlon' par défaut (comportement inchangé).

alter table triathlons
  add column if not exists type_epreuve text not null default 'Triathlon'
  check (type_epreuve in ('Triathlon', 'Course à pied', 'Trail', 'Cyclo'));
