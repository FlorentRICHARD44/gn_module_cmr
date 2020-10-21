
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

CREATE SCHEMA gn_cmr;

SET search_path = gn_cmr, public, pg_catalog;

SET default_with_oids = false;


------------------------
------- TABLES ---------
------------------------

-- Add complements for t_module common table
CREATE TABLE gn_cmr.t_module_complements (
    id_module integer NOT NULL,
    data jsonb,
    uuid_module_complement uuid NOT NULL DEFAULT uuid_generate_v4(),
    CONSTRAINT fk_gn_cmr_t_module_complements_id_module FOREIGN KEY (id_module) REFERENCES gn_commons.t_modules(id_module)
);

--TABLE t_sitegroup: contains a group of sites.
CREATE TABLE gn_cmr.t_sitegroup (
    id_sitegroup serial NOT NULL,
    uuid_sitegroup uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying (100),
    comments text,
    data jsonb,
    geom geometry(Geometry, 4326),
    id_module integer NOT NULL,
    CONSTRAINT pk_gn_cmr_t_sitegroup PRIMARY KEY (id_sitegroup),
    CONSTRAINT fk_gn_cmr_t_sitegroup_id_module FOREIGN KEY (id_module) REFERENCES gn_commons.t_modules(id_module)
);

-- TABLE t_site: contains each geometry where a capture or recapture was made.
CREATE TABLE gn_cmr.t_site (
    id_site serial NOT NULL,
    uuid_site uuid NOT NULL DEFAULT uuid_generate_v4(),
    id_module integer NOT NULL,
    id_sitegroup integer,
    name character varying (100),
    comments text,
    data jsonb,
    geom geometry(Geometry,4326),
    recurrent boolean,
    CONSTRAINT pk_gn_cmr_t_site PRIMARY KEY (id_site),
    CONSTRAINT fk_gn_cmr_t_site_id_module FOREIGN KEY (id_module) REFERENCES gn_commons.t_modules(id_module),
    CONSTRAINT fk_gn_cmr_t_site_id_sitegroup FOREIGN KEY (id_sitegroup) REFERENCES gn_cmr.t_sitegroup(id_sitegroup)
);

CREATE TABLE gn_cmr.cor_site_module(
    id_site integer NOT NULL,
    id_module integer NOT NULL,
    CONSTRAINT pk_gn_cmr_cor_site_module PRIMARY KEY (id_site, id_module),
    CONSTRAINT fk_gn_cmr_cor_site_module_id_site FOREIGN KEY (id_site) REFERENCES gn_cmr.t_site,
    CONSTRAINT fk_gn_cmr_cor_site_module_id_module FOREIGN KEY (id_module) REFERENCES gn_commons.t_modules(id_module)
);

-- TABLE t_individual: contains each individual (individu in French) which has been captured and maybe recaptured
CREATE TABLE gn_cmr.t_individual(
    id_individual serial NOT NULL,
    uuid_individual uuid NOT NULL DEFAULT uuid_generate_v4(),
    id_module integer NOT NULL,
    data jsonb,
    identifier character varying(100),
    rfid character varying(255),
    marker character varying(255),
    sex integer,
    comments text,
    CONSTRAINT pk_gn_cmr_t_individual PRIMARY KEY (id_individual),
    CONSTRAINT fk_gn_cmr_t_individual_id_module FOREIGN KEY (id_module) REFERENCES gn_commons.t_modules(id_module),
    CONSTRAINT fk_gn_cmr_t_individual_sex FOREIGN KEY (sex) REFERENCES ref_nomenclatures.t_nomenclatures(id_nomenclature),
    CONSTRAINT check_gn_cmr_t_individual_sex_nomenclature CHECK (ref_nomenclatures.check_nomenclature_type_by_mnemonique(sex,'SEXE')) NOT VALID
);

CREATE TABLE gn_cmr.cor_individual_module(
    id_individual integer NOT NULL,
    id_module integer NOT NULL,
    CONSTRAINT pk_gn_cmr_cor_individual_module PRIMARY KEY (id_individual, id_module),
    CONSTRAINT fk_gn_cmr_cor_individual_module_id_individual FOREIGN KEY (id_individual) REFERENCES gn_cmr.t_individual(id_individual),
    CONSTRAINT fk_gn_cmr_cor_individual_module_id_module FOREIGN KEY (id_module) REFERENCES gn_commons.t_modules(id_module)
);

-- TABLE t_visit: contains 1 visit on a site with 0..N individual captured/recaptured
CREATE TABLE gn_cmr.t_visit(
    id_visit serial NOT NULL,
    uuid_visit uuid NOT NULL DEFAULT uuid_generate_v4(),
    id_site integer NOT NULL,
    data jsonb,
    comments text,
    date timestamp,
    observation boolean,
    id_dataset integer,
    CONSTRAINT pk_gn_cmr_t_visit PRIMARY KEY (id_visit),
    CONSTRAINT fk_gn_cmr_t_visit_id_site FOREIGN KEY (id_site) REFERENCES gn_cmr.t_site(id_site),
    CONSTRAINT fk_gn_cmr_t_visit_id_dataset FOREIGN KEY (id_dataset) REFERENCES gn_meta.t_datasets(id_dataset)
);

CREATE TABLE gn_cmr.cor_visit_observer(
    id_visit integer NOT NULL,
    id_observer integer NOT NULL,
    CONSTRAINT pk_gn_cmr_cor_visit_observer PRIMARY KEY (id_visit, id_observer),
    CONSTRAINT fk_gn_cmr_cor_visit_observer_id_visit FOREIGN KEY (id_visit) REFERENCES gn_cmr.t_visit(id_visit),
    CONSTRAINT fk_gn_cmr_cor_visit_observer_id_observer FOREIGN KEY (id_observer) REFERENCES utilisateurs.t_roles(id_role)
);

-- TABLE t_observation: contains all observations concerning 1 individual in 1 visit
CREATE TABLE gn_cmr.t_observation(
    id_observation serial NOT NULL,
    uuid_observation uuid NOT NULL DEFAULT uuid_generate_v4(),
    id_individual integer NOT NULL,
    id_visit integer NOT NULL,
    data jsonb,
    comments text,
    CONSTRAINT pk_gn_cmr_t_observation PRIMARY KEY (id_observation),
    CONSTRAINT fk_gn_cmr_t_observation_id_individual FOREIGN KEY (id_individual) REFERENCES gn_cmr.t_individual(id_individual),
    CONSTRAINT fk_gn_cmr_t_observation_id_visite FOREIGN KEY (id_visit) REFERENCES gn_cmr.t_visit(id_visit),
    CONSTRAINT check_gn_cmr_t_observation_type_observation_nomenclature CHECK (ref_nomenclatures.check_nomenclature_type_by_mnemonique(type_observation,'CMR_OBSERVATION_TYPE')) NOT VALID
);


-- TABLE LOCATION for media storage.
INSERT INTO gn_commons.bib_tables_location (schema_name, table_name, pk_field, uuid_field_name, table_desc) VALUES
('gn_cmr', 't_module_complements', 'id_module', 'uuid_module_complement', 'Table centralisant les compléments de module pour la CMR'),
('gn_cmr', 't_sitegroup', 'id_sitegroup', 'uuid_sitegroup', 'Table centralisant les groupe de sites pour la CMR'),
('gn_cmr', 't_site', 'id_site', 'uuid_site', 'Table centralisant les sites pour la CMR'),
('gn_cmr', 't_individual', 'id_individual', 'uuid_individual', 'Table centralisant les individus pour la CMR'),
('gn_cmr', 't_observation', 'id_observation', 'uuid_observation', 'Table centralisant les observations pour la CMR');
