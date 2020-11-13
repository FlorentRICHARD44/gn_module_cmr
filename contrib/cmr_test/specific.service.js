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
/**
* Fonction d'initialisation du formulaire de visite.
* @param FormGroup form le formulaire de visite.
* @param Site site le site pour lequel la visite est créée. Reste à undefined si la visite est créée en lot.
*/
export function initVisit(form, site) {
  return {};
}

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

/**
* Fonction d'initialisation du formulaire d'individu'
* @param FormGroup form  Le formulaire de l'individu
*/
export function initIndividual(form) {
  return {};
}
