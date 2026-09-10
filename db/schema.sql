-- Wanderlush Egypt — PostgreSQL schema (Neon)
--
-- Localised text is stored as jsonb of the shape {"en": "...", "ar": "..."},
-- which keeps one row per entity and mirrors the `Localized` type in
-- `content/types.ts`. Fields that filters and sorts run against are kept as
-- real columns so they can be indexed.

create table if not exists destinations (
  slug                text primary key,
  id                  text not null unique,
  name                jsonb not null,
  tagline             jsonb not null,
  region              text not null,
  latitude            numeric(9, 6) not null,
  longitude           numeric(9, 6) not null,
  travel_styles       text[] not null default '{}',
  best_season         text[] not null default '{}',
  best_season_note    jsonb not null,
  recommended_min_days smallint not null,
  recommended_max_days smallint not null,
  nightly_rates       jsonb not null,
  daily_budget_from   integer not null,
  intro               jsonb not null,
  hero_image          jsonb not null,
  gallery             jsonb not null default '[]',
  attractions         jsonb not null default '[]',
  suggested_itinerary jsonb not null default '[]',
  local_advice        jsonb not null,
  getting_there       jsonb not null,
  accommodation_note  jsonb not null,
  related_slugs       text[] not null default '{}',
  accent              text not null,
  updated_at          timestamptz not null default now()
);

create index if not exists destinations_region_idx on destinations (region);
create index if not exists destinations_styles_idx on destinations using gin (travel_styles);

create table if not exists experiences (
  slug                text primary key,
  id                  text not null unique,
  name                jsonb not null,
  destination_slug    text not null references destinations (slug) on delete cascade,
  category            text not null,
  travel_styles       text[] not null default '{}',
  environment         text not null,
  group_format        text[] not null default '{}',
  family_friendly     boolean not null default true,
  duration_minutes    integer not null,
  price_from          integer not null,
  private_supplement  integer not null default 0,
  rating              numeric(2, 1) not null,
  review_count        integer not null default 0,
  max_group_size      integer not null,
  min_age             smallint,
  summary             jsonb not null,
  description         jsonb not null,
  schedule            jsonb not null,
  meeting_point       jsonb not null,
  inclusions          jsonb not null,
  exclusions          jsonb not null,
  what_to_bring       jsonb not null,
  accessibility       jsonb not null,
  cancellation        jsonb not null,
  hero_image          jsonb not null,
  gallery             jsonb not null default '[]',
  accent              text not null,
  updated_at          timestamptz not null default now()
);

create index if not exists experiences_destination_idx on experiences (destination_slug);
create index if not exists experiences_category_idx on experiences (category);
create index if not exists experiences_price_idx on experiences (price_from);

create table if not exists accommodation_levels (
  id             text primary key,
  sort_order     smallint not null,
  name           jsonb not null,
  summary        jsonb not null,
  description    jsonb not null,
  nightly_from   integer not null,
  nightly_to     integer not null,
  inclusions     jsonb not null,
  example_properties jsonb not null,
  accent         text not null
);

create table if not exists journeys (
  slug              text primary key,
  id                text not null unique,
  name              jsonb not null,
  tagline           jsonb not null,
  summary           jsonb not null,
  days              smallint not null,
  destination_slugs text[] not null default '{}',
  experience_slugs  text[] not null default '{}',
  travel_styles     text[] not null default '{}',
  suggested_tier    text not null references accommodation_levels (id),
  price_from        integer not null,
  best_season_note  jsonb not null,
  hero_image        jsonb not null,
  outline           jsonb not null default '[]',
  stop_nights       jsonb not null default '[]',
  accent            text not null,
  updated_at        timestamptz not null default now()
);

-- Added after the first deployment; create-if-not-exists above skips it on an existing table.
alter table journeys add column if not exists stop_nights jsonb not null default '[]';

create table if not exists reviews (
  id               text primary key,
  author           jsonb not null,
  origin           jsonb not null,
  journey_slug     text references journeys (slug) on delete set null,
  destination_slug text references destinations (slug) on delete set null,
  rating           smallint not null check (rating between 1 and 5),
  quote            jsonb not null,
  travelled_on     text not null,
  is_demo          boolean not null default true
);

create index if not exists reviews_journey_idx on reviews (journey_slug);
create index if not exists reviews_destination_idx on reviews (destination_slug);

create table if not exists faq_categories (
  id   text primary key,
  name jsonb not null
);

create table if not exists faqs (
  id          text primary key,
  category_id text not null references faq_categories (id) on delete cascade,
  question    jsonb not null,
  answer      jsonb not null
);

create index if not exists faqs_category_idx on faqs (category_id);

-- Phase 7 writes here. Created now so the schema is complete from the start
-- and the booking journey has somewhere to land when it is built.
create table if not exists booking_requests (
  reference        text primary key,
  created_at       timestamptz not null default now(),
  language         text not null default 'en',
  full_name        text not null,
  email            text not null,
  phone            text,
  country          text,
  preferred_contact text,
  travellers_adults smallint not null default 2,
  travellers_children smallint not null default 0,
  start_date       date,
  end_date         date,
  accommodation_tier text references accommodation_levels (id),
  currency         text not null default 'USD',
  estimate_total_usd numeric(10, 2),
  itinerary        jsonb not null default '{}',
  preferences      jsonb not null default '{}',
  status           text not null default 'new'
);

create index if not exists booking_requests_created_idx on booking_requests (created_at desc);

-- Phase 7: the request as sent. The itinerary column holds the trip snapshot
-- (days, places, experiences, party, options); estimate the USD breakdown at
-- the moment of sending, so the reply can quote what the traveller saw.
alter table booking_requests add column if not exists estimate jsonb not null default '{}';
alter table booking_requests add column if not exists tour_style text not null default 'shared';
alter table booking_requests add column if not exists service_included boolean not null default true;
alter table booking_requests add column if not exists end_date date;
