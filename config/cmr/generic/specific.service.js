/**
 * Fonction d'initialisation du formulaire de site group
 * @param FormGroup form  Le formulaire de sitegroup
 */
export function initSitegroup(form) {
    return {};
}

/**
 * Fonction d'initialisation du formulaire de site.
 * @param FormGroup form le formulaire de site 
 * @param SiteGroup sitegroup le sitegroup pour lequel est créé le site.
 */
export function initSite(form, sitegroup) {
    return {};
}
/*
 * Exemple d'utilisation pour activer/desactiver un champ en fonction de la valeur d'un autre.
 export function initSite(form, sitegroup) {
  let piege = form.get('piege_type');
  let date_pose = form.get('date_pose');
  piege.valueChanges.subscribe( value => {
    if (["Verveux simple","Verveux double","Nasse","Cage-piège"].indexOf(value) > -1) {
      date_pose.enable();
    } else {
      date_pose.disable();
      date_pose.setValue(undefined);
    }
  });
  return {};
}
 */

/**
 * Fonction d'initialisation du formulaire de visite.
 * @param FormGroup form le formulaire de visite.
 * @param Site site le site pour lequel la visite est créée. Reste à undefined si la visite est créée en lot.
 */
export function initVisit(form, site) {
    return {};
}
/*
 * Exemple d'utilisation pour initialiser la date de visite à la date du jour:
 export function initVisit(form, site) {
    return {
        date: (new Date()).toISOString()
    };
} 
 */

/**
 * Fonction d'initialisation du formulaire d'observation
 * @param FormGroup form Le premier formulaire
 * @param Array formGroups la liste des formulaires en group (collapse)
 * @param Visit visit la visite pour laquelle est créée l'observation.
 * @param Individual individual  l'individu observé
 */
export function initObservation(form, formGroups, visit, individual) {
    return {}
}
/*
* Exemple d'utilisation pour :
  * désactiver un champ en fonction d'une valeur de l'individu
  * Activer / Désactiver un champ en fonction d'un autre champ dans un groupe de champ
  * initialiser des valeurs de l'observation en fonction de valeur de la visite.
  * 
export function initObservation(form, formGroups, visit, individual) {
    if (individual.sexe != 'Femelle') {
        form.get('etat_femelle').disable();
    }
    for (let fg of formGroups) {
        if (fg['form'].get('analyse_comp_type_prelevement')) {
            fg['form'].get('analyse_comp_type_prelevement').valueChanges.subscribe(
                value => {
                    if (!value || value.indexOf('Autre') == -1) {
                        fg['form'].get('analyse_comp_type_prelevement_autre').disable();
                    } else {
                        fg['form'].get('analyse_comp_type_prelevement_autre').enable();
                    }
                }
            )
        }
    }
    return {
        date_capture: visit.date,
        date_relache: visit.date
    };
}
*/

/**
 * Fonction d'initialisation du formulaire d'individu'
 * @param FormGroup form  Le formulaire de l'individu
 */
export function initIndividual(form) {
    return {};
}
