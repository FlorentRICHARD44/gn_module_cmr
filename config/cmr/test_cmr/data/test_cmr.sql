-- View: gn_cmr.v_cmr_sitegroup_observations_test_cmr

-- DROP VIEW gn_cmr.v_cmr_sitegroup_observations_test_cmr;
DROP VIEW IF EXISTS gn_cmr.v_cmr_sitegroup_observations_test_cmr;
CREATE OR REPLACE VIEW gn_cmr.v_cmr_sitegroup_observations_test_cmr
 AS
 WITH visit_observers AS (
         SELECT v_1.id_visit,
            string_agg((r.prenom_role::text || ' '::text) || r.nom_role::text, ', '::text) AS v_observers
           FROM gn_cmr.t_visit v_1
             JOIN gn_cmr.cor_visit_observer vo_1 ON vo_1.id_visit = v_1.id_visit
             JOIN utilisateurs.t_roles r ON r.id_role = vo_1.id_observer
          GROUP BY v_1.id_visit
        )
 SELECT v.date::date AS "visit_date",
    sg.name AS "aire_d_etude",
	sg.id_sitegroup as "id_sitegroup",
    s.name AS "point_de_capture",
	s.id_site as "id_site",
	s.geom as "geom",
    s.data #>> '{piege_type}'::text[] AS "type_de_piege",
    NULLIF(s.data #>> '{habitat}'::text[], 'null'::text) AS "habitat",
    NULLIF(s.data #>> '{conductivité}'::text[], 'null'::text) AS "conductivite",
    ((s.data -> 'date_pose'::text)::text)::date AS "date_de_pose",
    NULLIF((s.data -> 'date_retrait'::text)::text, 'null'::text)::date AS "date_de_retrait",
	v.id_visit as "id_visit",
    v.data #>> '{session}'::text[] AS "session",
    ds.dataset_name AS "jeu_de_donnees",
    vo.v_observers AS "operateurs",
        CASE
            WHEN v.observation IS TRUE THEN 'Oui'::text
            ELSE 'Non'::text
        END AS "observation",
    i.id_individual as "id_individual",
    i.identifier AS "numero_individu",
    i.rfid AS "rfid",
    i.marker AS "marquage",
    i.data #>> '{sexe}'::text[] AS "sexe",
	o.id_observation as "id_observation",
    o.data #>> '{type}'::text[] AS "type_observation",
    o.data #>> '{individual_state}'::text[] AS "etat_individu",
    o.data #>> '{etat_femelle}'::text[] AS "etat_femelle",
    o.data #>> '{developpement_stade}'::text[] AS "stade_de_developpement",
    (o.data #>> '{age}'::text[])::integer AS "age_estime",
    o.data #>> '{particular_signs}'::text[] AS "signes_particulier",
    (o.data #>> '{poids_g}'::text[])::integer AS "poids_g",
    (o.data #>> '{longueur_dossiere_mm}'::text[])::integer AS "longueur_dossiere_mm",
    (o.data #>> '{largeur_dossiere_mm}'::text[])::integer AS "largeur_dossiere_mm",
    (o.data #>> '{longueur_plastron_mm}'::text[])::integer AS "longueur_plastron_mm",
    (o.data #>> '{largeur_avant_plastron_mm}'::text[])::integer AS "largeur_avant_plastron_mm",
    (o.data #>> '{largeur_arriere_plastron_mm}'::text[])::integer AS "largeur_arriere_plastron_mm",
    o.data #>> '{mesures_complementaire}'::text[] AS "mesures_complementaires",
    NULLIF((o.data -> 'date_capture'::text)::text, 'null'::text)::date AS "date_de_capture",
    NULLIF((o.data -> 'date_relache'::text)::text, 'null'::text)::date AS "date_de_relache",
    o.data #>> '{conditions_manipulation}'::text[] AS "conditions_de_manipulation",
    o.data #>> '{typage_gen_ouinon}'::text[] AS "typage_genetique",
    NULLIF(o.data #>> '{typage_gen_date_prelevement}'::text[], 'null'::text)::date AS "tg_date_prelevement",
    regexp_replace(o.data #>> '{typage_gen_type_prelevement}'::text[], '[\[\]"]'::text, ''::text, 'g'::text) AS "tg_type_prelevement",
    o.data #>> '{typage_gen_analyse_par}'::text[] AS "tg_analyse_par",
    regexp_replace(o.data #>> '{typage_gen_type_analyse}'::text[], '[\[\]"]'::text, ''::text, 'g'::text) AS "tg_type_analyse",
    o.data #>> '{typage_gen_resultat}'::text[] AS "tg_resultat",
    o.data #>> '{analyse_comp_ouinon}'::text[] AS "analyse_complementaire",
    NULLIF((o.data -> 'analyse_comp_date_prelevement'::text)::text, 'null'::text)::date AS "ac_date_prelevement",
    regexp_replace(o.data #>> '{analyse_comp_type_prelevement}'::text[], '[\[\]"]'::text, ''::text, 'g'::text) AS "ac_type_prelevement",
    o.data #>> '{analyse_comp_type_prelevement_autre}'::text[] AS "ac_type_autre_prelevement",
    o.data #>> '{analyse_comp_objectif}'::text[] AS "ac_objectif",
    o.data #>> '{analyse_comp_analyse_par}'::text[] AS "ac_analyse_par",
    regexp_replace(o.data #>> '{analyse_comp_type_analyse}'::text[], '[\[\]"]'::text, ''::text, 'g'::text) AS "ac_type",
    o.data #>> '{analyse_comp_resultats}'::text[] AS "acresultat"
   FROM gn_cmr.t_site s
     LEFT JOIN gn_cmr.t_sitegroup sg ON sg.id_sitegroup = s.id_sitegroup
     LEFT JOIN gn_cmr.t_visit v ON v.id_site = s.id_site
     LEFT JOIN visit_observers vo ON vo.id_visit = v.id_visit
     LEFT JOIN gn_meta.t_datasets ds ON ds.id_dataset = v.id_dataset
     LEFT JOIN gn_cmr.t_observation o ON o.id_visit = v.id_visit
     LEFT JOIN gn_cmr.t_individual i ON i.id_individual = o.id_individual
  ORDER BY v.date, i.identifier;

ALTER TABLE gn_cmr.v_cmr_sitegroup_observations_test_cmr
    OWNER TO geonatadmin;

