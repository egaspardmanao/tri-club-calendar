-- Ajoute Duathlon, Aquathlon et Autre aux types d'épreuve autorisés (en plus de Triathlon,
-- Course à pied, Trail, Cyclo déjà en place). À exécuter après migration_type_epreuve.sql
-- si celle-ci a déjà été appliquée — sans effet si elle ne l'a pas encore été, dans quel cas
-- exécute d'abord migration_type_epreuve.sql.

alter table triathlons drop constraint if exists triathlons_type_epreuve_check;

alter table triathlons
  add constraint triathlons_type_epreuve_check
  check (type_epreuve in ('Triathlon', 'Duathlon', 'Aquathlon', 'Course à pied', 'Trail', 'Cyclo', 'Autre'));
