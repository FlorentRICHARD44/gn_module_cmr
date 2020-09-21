-- ADD Nomenclature for CMR Observation Type
INSERT INTO ref_nomenclatures.bib_nomenclatures_types (mnemonique,label_default,definition_default,label_fr,definition_fr,source,statut) VALUES
('CMR_OBSERVATION_TYPE','Type d''observation','Nomenclature des types d''observation CMR','Type d''observation','Nomenclature des types d''observation CMR','GEONATURE','Validé');

INSERT INTO ref_nomenclatures.t_nomenclatures (id_type, cd_nomenclature,label_default,definition_default,label_fr, definition_fr) VALUES
(SELECT id_type FROM ref_nomenclatures.bib_nomenclatures_types WHERE mnemonique = 'CMR_OBSERVATION_TYPE', 'CMR_OBS_TYPE_1','Capture-Marquage','Capture d''un individu suivi d'' marquage','Capture-Marquage','Capture d''un individu suivi d'' marquage'),
(SELECT id_type FROM ref_nomenclatures.bib_nomenclatures_types WHERE mnemonique = 'CMR_OBSERVATION_TYPE', 'CMR_OBS_TYPE_2','Recapture','Recapture d''un individu déjà capturé et marqué','Recapture','Recapture d''un individu déjà capturé et marqué');

INSERT INTO ref_nomenclatures.cor_taxref_nomenclature (id_nomenclature, regne, group2_inpn) VALUES
(SELECT id_nomenclature FROM ref_nomenclatures.t_nomenclatures WHERE cd_nomenclature = 'CMR_OBS_TYPE_1', 'all','all'),
(SELECT id_nomenclature FROM ref_nomenclatures.t_nomenclatures WHERE cd_nomenclature = 'CMR_OBS_TYPE_2', 'all','all');

CREATE OR REPLACE VIEW ref_nomenclatures.v_statut_bio
 AS
 SELECT ctn.regne,
    ctn.group2_inpn,
    n.id_nomenclature,
    n.mnemonique,
    n.label_default AS label,
    n.definition_default AS definition,
    n.id_broader,
    n.hierarchy
   FROM ref_nomenclatures.t_nomenclatures n
     LEFT JOIN ref_nomenclatures.cor_taxref_nomenclature ctn ON ctn.id_nomenclature = n.id_nomenclature
     LEFT JOIN ref_nomenclatures.bib_nomenclatures_types t ON t.id_type = n.id_type
  WHERE t.mnemonique::text = 'CMR_OBSERVATION_TYPE'::text AND n.active = true;
