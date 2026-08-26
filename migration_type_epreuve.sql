-- Ajoute le type d'épreuve (Triathlon / Duathlon / Aquathlon / Course à pied / Trail / Cyclo /
-- Autre) aux événements existants. Toutes les épreuves déjà enregistrées sont marquées
-- 'Triathlon' par défaut (comportement inchangé).
-- Si cette colonne existe déjà avec l'ancienne contrainte (4 types), exécute plutôt
-- migration_types_supplementaires.sql.

alter table triathlons
  add column if not exists type_epreuve text not null default 'Triathlon'
  check (type_epreuve in ('Triathlon', 'Duathlon', 'Aquathlon', 'Course à pied', 'Trail', 'Cyclo', 'Autre'));
