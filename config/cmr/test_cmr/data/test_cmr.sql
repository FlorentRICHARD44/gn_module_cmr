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
 SELECT v.date::date AS "Date",
    sg.name AS "Aire d''étude",
	sg.id_sitegroup as "id_sitegroup",
    s.name AS "Point de Capture",
	s.id_site as "id_site",
	s.geom as "geom",
    s.data #>> '{piege_type}'::text[] AS "Type de Piège",
    NULLIF(s.data #>> '{habitat}'::text[], 'null'::text) AS "Habitat",
    NULLIF(s.data #>> '{conductivité}'::text[], 'null'::text) AS "Conductivité",
    ((s.data -> 'date_pose'::text)::text)::date AS "Date de pose",
    NULLIF((s.data -> 'date_retrait'::text)::text, 'null'::text)::date AS "Date de retrait",
	v.id_visit as "id_visit",
    v.data #>> '{session}'::text[] AS "Session",
    ds.dataset_name AS "Jeu de données",
    vo.v_observers AS "Operateur(s)",
        CASE
            WHEN v.observation IS TRUE THEN 'Oui'::text
            ELSE 'Non'::text
        END AS "Observation",
    i.id_individual as "id_individual",
    i.identifier AS "N° Individu",
    i.rfid AS "RFID",
    i.marker AS "Marquage",
    i.data #>> '{sexe}'::text[] AS "Sexe",
	o.id_observation as "id_observation",
    o.data #>> '{type}'::text[] AS "Type Observation",
    o.data #>> '{individual_state}'::text[] AS "Etat individu",
    o.data #>> '{etat_femelle}'::text[] AS "Etat Femelle",
    o.data #>> '{developpement_stade}'::text[] AS "Stade de développement",
    (o.data #>> '{age}'::text[])::integer AS "Age estimé",
    o.data #>> '{particular_signs}'::text[] AS "Signes particulier",
    (o.data #>> '{poids_g}'::text[])::integer AS "Poids (g)",
    (o.data #>> '{longueur_dossiere_mm}'::text[])::integer AS "Longueur dossière (mm)",
    (o.data #>> '{largeur_dossiere_mm}'::text[])::integer AS "Largeur dossière (mm)",
    (o.data #>> '{longueur_plastron_mm}'::text[])::integer AS "Longueur plastron (mm)",
    (o.data #>> '{largeur_avant_plastron_mm}'::text[])::integer AS "Largeur Avant plastron (mm)",
    (o.data #>> '{largeur_arriere_plastron_mm}'::text[])::integer AS "Largeur Arrière plastron (mm)",
    o.data #>> '{mesures_complementaire}'::text[] AS "Mesures complémentaires",
    NULLIF((o.data -> 'date_capture'::text)::text, 'null'::text)::date AS "Date de capture",
    NULLIF((o.data -> 'date_relache'::text)::text, 'null'::text)::date AS "Date de relache",
    o.data #>> '{conditions_manipulation}'::text[] AS "Conditions de manipulation",
    o.data #>> '{typage_gen_ouinon}'::text[] AS "Typage génétique",
    NULLIF(o.data #>> '{typage_gen_date_prelevement}'::text[], 'null'::text)::date AS "Typage gén. Date prélèvement",
    regexp_replace(o.data #>> '{typage_gen_type_prelevement}'::text[], '[\[\]"]'::text, ''::text, 'g'::text) AS "Typage gén. Type prélèvement",
    o.data #>> '{typage_gen_analyse_par}'::text[] AS "Typage gén. Analyse par",
    regexp_replace(o.data #>> '{typage_gen_type_analyse}'::text[], '[\[\]"]'::text, ''::text, 'g'::text) AS "Typage gén. Type analyse",
    o.data #>> '{typage_gen_resultat}'::text[] AS "Typage gén. Résultat",
    o.data #>> '{analyse_comp_ouinon}'::text[] AS "Analyse complémentaire",
    NULLIF((o.data -> 'analyse_comp_date_prelevement'::text)::text, 'null'::text)::date AS "Analyse comp. Date prélèvement",
    regexp_replace(o.data #>> '{analyse_comp_type_prelevement}'::text[], '[\[\]"]'::text, ''::text, 'g'::text) AS "Analyse comp. Type prélèvement",
    o.data #>> '{analyse_comp_type_prelevement_autre}'::text[] AS "Analyse comp. type autre prélèvement",
    o.data #>> '{analyse_comp_objectif}'::text[] AS "Analyse comp. Objectif",
    o.data #>> '{analyse_comp_analyse_par}'::text[] AS "Analyse comp. Analyse par",
    regexp_replace(o.data #>> '{analyse_comp_type_analyse}'::text[], '[\[\]"]'::text, ''::text, 'g'::text) AS "Analyse comp. Type",
    o.data #>> '{analyse_comp_resultats}'::text[] AS "Analyse comp. Résultat"
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

