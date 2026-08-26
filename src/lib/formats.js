// Types d'épreuves proposés par le club. "Autre" n'a pas de formats prédéfinis (voir plus bas).
export const TYPES_EPREUVE = ['Triathlon', 'Duathlon', 'Aquathlon', 'Course à pied', 'Trail', 'Cyclo', 'Autre']

// Types dont le format de course n'est pas imposé — l'étape "Formats" du formulaire est masquée.
export const TYPES_SANS_FORMAT = ['Autre']

// Formats par type d'épreuve — affichés comme boutons à cocher dans le formulaire d'ajout,
// filtrés selon le type d'épreuve sélectionné. Un type absent de cet objet (ex. "Autre")
// n'a simplement aucun format à choisir.
export const FORMATS_BY_TYPE = {
  'Triathlon': {
    XS:  { label: 'XS',  color: 'bg-emerald-900 text-emerald-300', desc: '200m / 5km / 20km' },
    S:   { label: 'S',   color: 'bg-teal-900 text-teal-300',       desc: '400m / 10km / 20km' },
    M:   { label: 'M',   color: 'bg-water-900 text-water-300',     desc: '1,5km / 40km / 10km' },
    L:   { label: 'L',   color: 'bg-blue-900 text-blue-300',       desc: '2km / 80km / 20km' },
    XL:  { label: 'XL',  color: 'bg-violet-900 text-violet-300',   desc: 'Half (1,9km / 90km / 21km)' },
    XXL: { label: 'XXL', color: 'bg-orange-900 text-orange-300',   desc: 'Full Ironman (3,8km / 180km / 42km)' },
  },
  'Duathlon': {
    XS:  { label: 'XS',  color: 'bg-emerald-900 text-emerald-300', desc: '2,5km / 20km / 2,5km' },
    S:   { label: 'S',   color: 'bg-teal-900 text-teal-300',       desc: '5km / 30km / 5km' },
    M:   { label: 'M',   color: 'bg-water-900 text-water-300',     desc: '10km / 40km / 5km' },
    L:   { label: 'L',   color: 'bg-blue-900 text-blue-300',       desc: '10km / 60km / 10km' },
    XL:  { label: 'XL',  color: 'bg-violet-900 text-violet-300',   desc: '10km / 90km / 15km' },
    XXL: { label: 'XXL', color: 'bg-orange-900 text-orange-300',   desc: 'Powerman (10km / 150km / 30km)' },
  },
  'Aquathlon': {
    XS:  { label: 'XS',  color: 'bg-emerald-900 text-emerald-300', desc: '400m / 2,5km' },
    S:   { label: 'S',   color: 'bg-teal-900 text-teal-300',       desc: '750m / 5km' },
    M:   { label: 'M',   color: 'bg-water-900 text-water-300',     desc: '1km / 8km' },
    L:   { label: 'L',   color: 'bg-blue-900 text-blue-300',       desc: '1,5km / 10km' },
    XL:  { label: 'XL',  color: 'bg-violet-900 text-violet-300',   desc: '2km / 15km' },
    XXL: { label: 'XXL', color: 'bg-orange-900 text-orange-300',   desc: '3km / 20km' },
  },
  'Course à pied': {
    '5K':      { label: '5K',      color: 'bg-emerald-900 text-emerald-300', desc: '5 km' },
    '10K':     { label: '10K',     color: 'bg-teal-900 text-teal-300',       desc: '10 km' },
    'Semi':    { label: 'Semi',    color: 'bg-water-900 text-water-300',     desc: 'Semi-marathon (21,1 km)' },
    'Marathon':{ label: 'Marathon',color: 'bg-orange-900 text-orange-300',   desc: 'Marathon (42,2 km)' },
  },
  'Trail': {
    '10K':       { label: '10K',       color: 'bg-emerald-900 text-emerald-300', desc: '10 km' },
    '20K':       { label: '20K',       color: 'bg-teal-900 text-teal-300',       desc: '20 km' },
    '30K':       { label: '30K',       color: 'bg-water-900 text-water-300',     desc: '30 km' },
    '50K':       { label: '50K',       color: 'bg-blue-900 text-blue-300',       desc: '50 km' },
    '80K':       { label: '80K',       color: 'bg-violet-900 text-violet-300',   desc: '80 km' },
    '100 Miles': { label: '100 Miles', color: 'bg-orange-900 text-orange-300',   desc: '100 miles (161 km)' },
  },
  'Cyclo': {
    '50km':  { label: '50km',  color: 'bg-emerald-900 text-emerald-300', desc: '50 km' },
    '100km': { label: '100km', color: 'bg-teal-900 text-teal-300',       desc: '100 km' },
    '150km': { label: '150km', color: 'bg-water-900 text-water-300',     desc: '150 km' },
    '200km': { label: '200km', color: 'bg-blue-900 text-blue-300',       desc: '200 km' },
    '300km+':{ label: '300km+',color: 'bg-orange-900 text-orange-300',   desc: '300 km et plus' },
  },
}

// Dictionnaire plat combinant tous les formats de tous les types. Les clés XS-XXL sont
// partagées par Triathlon/Duathlon/Aquathlon (même échelle, distances différentes) : ce
// dictionnaire ne sert donc que de secours d'affichage (badge sans connaître le type précis),
// pas de source de vérité sur la distance exacte — le formulaire, lui, utilise FORMATS_BY_TYPE.
export const FORMATS = Object.values(FORMATS_BY_TYPE).reduce((acc, byType) => ({ ...acc, ...byType }), {})

// Ordre d'affichage global (concatène l'ordre de chaque type, dans l'ordre de TYPES_EPREUVE,
// en dédupliquant les clés XS-XXL déjà vues pour ne pas les répéter 3 fois).
export const FORMAT_ORDER = [...new Set(
  TYPES_EPREUVE.flatMap(t => Object.keys(FORMATS_BY_TYPE[t] ?? {}))
)]
