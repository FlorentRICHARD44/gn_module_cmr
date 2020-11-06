Configuration du module de CMR
==============================

Organisation des fichiers de configuration
------------------------------------------

- ``config contient`` les fichiers classique de configuration d'un module GeoNature
    - ``cmr``
        - ``generic`` Contient la configuration minimale générique de la CMR commune à tous les sous-modules
        - ``mon_module_specific`` Détaille la configuration spécifique à un sous-module de CMR à renommer avec le nom de votre sous-module. Pour le créer vous pouvez copier-coller le dossier ``generic``

dans chaque partie, on retrouve les dossiers et fichiers suivants:

- ``backend`` Dossier contenant des fichiers pour la génération d'une fiche individu en PDF.
    - ``static`` 
        - ``css`` Dossier contenant le style CSS à appliquer à la fiche individu
        - ``images`` Dossier contenant les images à insérer dans le template de la fiche individu
    - ``templates`` Dossier contenant le template HTML de la fiche individu
- ``data`` Dossier contenant les fichiers SQL de vue à exécuter pour créer certaines vues
- ``images`` Dossier contenant toutes les images pouvant être utilisées dans le sous-module. Il doit au moins contenir l'image du sous-module sous le nom "cmr.jpg"
- ``config.json`` Fichier de configuration générale du sous-module
- ``individual.json`` Fichier de configuration des éléments relatifs à un individu (formulaire, listes, ...)
- ``module.json`` Fichier de configuration des éléments relatifs au sous-module (formulaire)
- ``observation.json`` Fichier de configuration des éléments relatifs à une observation (formulaire, liste, historique, ...)
- ``site.json`` Fichier de configuration des éléments relatifs à un site (formulaire, liste, ...)
- ``sitegroup.json`` Fichier de configuration des éléments relatifs à un groupe de site (formulaire, liste, ...)
- ``visit.json`` Fichier de configuration des éléments relatifs à une visite (formulaire, liste, ...)
- ``specific.service.js`` Fichier JavaScript permettant une gestion spécifique des différents formulaires (initialisation des champs, interactions entre champs)


Détails de chaque fichier de configuration
------------------------------------------

Voici le détail des configuration dans les fichiers JSON. Attention à bien respecter la synthaxe des fichiers.

config.json
"""""""""""

**Paramètres:**

- ``"disclaimer"``: si ``true`` affiche un message d'avertissement à l'utilisateur lorsqu'il rentre dans le sous-module. si ``"false"`` n'affiche rien
- ``"disclaimer_text"``: le texte d'avertissement affiché à l'utilisateur si "disclaimer"="true". Ce paramètre est une liste dont chaque élément est une nouvelle ligne.
- ``"welcome"``: Message de bienvenue dans la page d'accueil du sous-module
- ``"use_sitegroup"``: si ``true``, le sous-module utilisera les groupes de site.

**Exemple:**

.. code-block:: json-object
   {
      "disclaimer" : true,
      "disclaimer_text": [
        "La Cistude d'Europe est une espèce protégée,",
        "sa manipulation requiert une autorisation spécifique (CERFA n°131616*01).",
        "",
        "Avez-vous connaissance de la réglementation?"
      ],
      "welcome": "Bienvenue dans le module de saisie de la CMR Cistude",
      "use_sitegroup": true
   }

Autres fichiers de configuration json
"""""""""""""""""""""""""""""""""""""

Les autres fichiers de configuration json permettent de définir:
- les champs utilisés dans les formulaires
- les champs affichés dans les tableaux
- les champs affichés dans une liste de propriété
- diverses configurations spécifiques.
- les noms utilisés pour nommer chaque objet (individu, sitegroup, site, visit, observation). Tout le monde n'utilisant pas toujours les mêmes termes, chaque sous-module peut ainsi avoir son propre vocabulaire avec une valeur au singulier ``"label"`` et une valeur au pluriel ``"label_plural"``.

Ils fonctionnent sur le même principe:
- dans le dossier "generic" on configure un comportement générique à tous les sous-modules de CMR.
- dans ce dossier "generic", le paramètre "generic" liste tous les champs qui seront disponibles dans les formulaires. On y définit également tous les Label de certains champs calculés pour qu'ils apparaissent dans les tableaux.
- dans le dossier du sous-module, si le paramètre "generic" est défini, alors il écrase la définition des champs du dossier "generic". Attention à ne pas supprimer un champ obligatoire.
- dans le dossier du sous-module, le paramètre "specific" permet de lister les champs additionnels qui seront ajoutés au formulaire.

**Définition des champs:**

Voir la définition des champs de formulaire dynamique dans la documentation de GeoNature.
On définit pour chaque champ: son type (type_widget), son label (attribut_label), si il est requis (required) et différents autres paramètres selon le type de widget.

**Exemple 1:**

.. code-block:: json-object
   :name: generic/module.json
     "generic": {
         "comments": {
            "type_widget": "textarea",
            "attribut_label": "Commentaires",
            "required": false
         }
      }
   
Fichier mon_module_cmr/module.json
.. code-block:: json-object
   :name: mon_module_cmr/module.json
     "specific": {
         "mon_champ_perso": {
            "type_widget": "select",
            "attribut_label": "Champ perso",
            "values": ["Valeur 1", "Valeur 2"]
            "required": true
         }
      }
Dans cet exemple, il y aura 2 champs dans le formulaire: un champ "Commentaires" et un champ "Champ perso".


**Exemple 2:**

.. code-block:: json-object
   :name: generic/module.json
     "generic": {
         "entite": {
            "type_widget": "text",
            "attribut_label": "Entité",
            "required": true
         },
         "nom_administrateur": {
            "type_widget": "text",
            "attribut_label": "Administré par",
            "required": true
         },
         "comments": {
            "type_widget": "textarea",
            "attribut_label": "Commentaires",
            "required": false
         }
      }

.. code-block:: json-object
   :name: mon_module_cmr/module.json
   "generic": {
         "entite": {
            "type_widget": "text",
            "attribut_label": "Entité",
            "required": true
         },
         "comments": {
            "type_widget": "textarea",
            "attribut_label": "Commentaires",
            "required": true
         }
     },
     "specific": {
         "mon_champ_perso": {
            "type_widget": "select",
            "attribut_label": "Champ perso",
            "values": ["Valeur 1", "Valeur 2"]
            "required": true
         }
      }
Dans cet exemple, il y aura 3 champs dans le formulaire: un champ "Entité" (obligatoire), un champ "Commentaires" (qui devient obligatoire) et un champ "Champ perso". Le champ "Administré par" ne sera pas utilisé pour ce sous-module.


module.json
"""""""""""

Ce fichier permet de configurer les champs additionnels utilisé dans l'onglet "Module" de la page d'accueil du sous-module.

**Paramètres:**

- ``"display_properties"``: liste des champs qui seront affiché à l'utilisateur.
- ``"generic"/"specific"``: définition des champs du formulaire module (accessible uniquement à un administrateur).


individual.json
"""""""""""""""

Ce fichier permet de configurer tout ce qui concerne un individu (formulaire, tableaux, liste de propriété, ...).

**Paramètres:**

- ``"label"``: Label utilisé pour l'individu au singulier
- ``"label_plural"``: Label utilisé pour l'individu au pluriel
- ``"search_filters"``: Champs utilisé pour le filtre de recherche par individus
- ``"display_properties"``: Champs affichés dans la liste des propriétés d'un individu
- ``"display_list"``: Champs utilisés dans les colonnes d'un tableau d'individus. 
   - Pour chaque colonne, indiquer le nom du champ ``"field"`` et la largeur de la colonne en pixel ``"width"``. 
   - il est aussi possible de renseigner l'alignement avec ``"align"`` ("left", "center" ou "right", aligné à gauche par défaut).
- ``"properties_to_keep_when_chaining"``: dans le formulaire, si l'utilisateur enchaîne les créations, les champs listés dans ce paramètre seront pré-rempli avec les valeurs précédentes à chaque réinitialisation de formulaire.
- ``"generic"/"specific"``: définition des champs du formulaire individu   

**Champs calculés:**

Les champs calculés suivants sont disponibles pour être affiché dans les colonnes ou propriétés d'un individu.

- ``"nb_observations"``: Nombre total d'observation de l'individu.
- ``"last_visit_date"``: Date de dernière observation de l'individu.

sitegroup.json
""""""""""""""

Ce fichier permet de configurer tout ce qui concerne un groupe de sites (formulaire, tableaux, liste de propriété, ...).
Il doit être présent même si le sous-module n'utilise pas les groupes de sites.

**Paramètres:**

- ``"label"``: Label utilisé pour le groupe de site au singulier
- ``"label_plural"``: Label utilisé pour le groupe de site au pluriel
- ``"search_filters"``: Champs utilisé pour le filtre de recherche par groupe de site
- ``"display_properties"``: Champs affichés dans la liste des propriétés d'un groupe de site
- ``"display_list"``: Champs utilisés dans les colonnes d'un tableau de groupes de sites.
   - Pour chaque colonne, indiquer le nom du champ ``"field"`` et la largeur de la colonne en pixel ``"width"``. 
   - il est aussi possible de renseigner l'alignement avec ``"align"`` ("left", "center" ou "right", aligné à gauche par défaut).
- ``"properties_to_keep_when_chaining"``: dans le formulaire, si l'utilisateur enchaîne les créations, les champs listés dans ce paramètre seront pré-rempli avec les valeurs précédentes à chaque réinitialisation de formulaire.
- ``"generic"/"specific"``: définition des champs du formulaire groupe de site
- ``"geometry_types"``: types de géométries à utiliser pour dessiner le groupe de site. Valeurs possible: "Point", "LineString", "Polygon". Seul le polygon est recommandé car il permet de contrôler que tous les sites créés sont inclus dans le polygone.
- ``"use_batch_visit_creation"``: si ``true`` affiche un bouton permettant de créer une visite pour tous les sites sélectionnés.

**Champs calculés:**

Les champs calculés suivants sont disponibles pour être affiché dans les colonnes ou propriétés d'un groupe de site.
- ``"nb_sites"``: nombre de sites sur ce groupe de site.
- ``"nb_observations"``: nombre d'observations ayant eu lieu sur ce groupe de site
- ``"nb_individuals"``: nombre d'individus observés sur ce groupe de site

site.json
"""""""""

Ce fichier permet de configurer tout ce qui concerne un site (formulaire, tableaux, liste de propriété, ...).

**Paramètres:**

- ``"label"``: Label utilisé pour le site au singulier
- ``"label_plural"``: Label utilisé pour le site au pluriel
- ``"search_filters"``: Champs utilisé pour le filtre de recherche par site
- ``"display_properties"``: Champs affichés dans la liste des propriétés d'un site
- ``"display_list"``: Champs utilisés dans les colonnes d'un tableau de sites.
   - Pour chaque colonne, indiquer le nom du champ ``"field"`` et la largeur de la colonne en pixel ``"width"``. 
   - il est aussi possible de renseigner l'alignement avec ``"align"`` ("left", "center" ou "right", aligné à gauche par défaut).
- ``"properties_to_keep_when_chaining"``: dans le formulaire, si l'utilisateur enchaîne les créations, les champs listés dans ce paramètre seront pré-rempli avec les valeurs précédentes à chaque réinitialisation de formulaire.
- ``"generic"/"specific"``: définition des champs du formulaire site
- ``"geometry_types"``: types de géométries à utiliser pour dessiner le site. Valeurs possible: "Point", "LineString", "Polygon"
- ``"check_site_within_sitegroup"``: si le module utilise des groupes de sites et si ce paramètre est à ``true`` le système vérifie que la géométrie du site créé est bien dans la géométrie du groupe de site. Si ce paramètre est à ``"false"`` il n'y a pas de vérification.
- ``"batch_visit_display_list"``: Liste des colonnes de site à afficher dans la popup de création de visite pour tous les sites.

**Champs calculés:**

Les champs calculés suivants sont disponibles pour être affiché dans les colonnes ou propriétés d'un site.

- ``"nb_visits"``: nombre de visites ayant eu lieu sur ce site.
- ``"nb_observations"``: nombre d'observations ayant eu lieu sur ce site
- ``"nb_individuals"``: nombre d'individus observés sur ce site


visit.json
""""""""""

Ce fichier permet de configurer tout ce qui concerne une visite (formulaire, tableaux, liste de propriété, ...).

**Paramètres:**

- ``"label"``: Label utilisé pour la visite au singulier
- ``"label_plural"``: Label utilisé pour la visite au pluriel
- ``"search_filters"``: Champs utilisé pour le filtre de recherche par visite
- ``"display_properties"``: Champs affichés dans la liste des propriétés d'une visite
- ``"display_list"``: Champs utilisés dans les colonnes d'un tableau de visites.
   - Pour chaque colonne, indiquer le nom du champ ``"field"`` et la largeur de la colonne en pixel ``"width"``. 
   - il est aussi possible de renseigner l'alignement avec ``"align"`` ("left", "center" ou "right", aligné à gauche par défaut).
- ``"properties_to_keep_when_chaining"``: dans le formulaire, si l'utilisateur enchaîne les créations, les champs listés dans ce paramètre seront pré-rempli avec les valeurs précédentes à chaque réinitialisation de formulaire.
- ``"generic"/"specific"``: définition des champs du formulaire visite

**Champs calculés:**

Les champs calculés suivants sont disponibles pour être affiché dans les colonnes ou propriétés d'une visite.

- ``"nb_observations"``: nombre d'observations ayant eu lieu pendant cette visite

observation.json
""""""""""""""""

Ce fichier permet de configurer tout ce qui concerne une observation (formulaire, tableaux, liste de propriété, ...).

**Paramètres:**

- ``"label"``: Label utilisé pour l'observation au singulier
- ``"label_plural"``: Label utilisé pour l'observation au pluriel
- ``"display_properties"``: Champs affichés dans la liste des propriétés d'une observation
- ``"display_list"``: Champs utilisés dans les colonnes d'un tableau d'observations.
   - Pour chaque colonne, indiquer le nom du champ ``"field"`` et la largeur de la colonne en pixel ``"width"``. 
   - il est aussi possible de renseigner l'alignement avec ``"align"`` ("left", "center" ou "right", aligné à gauche par défaut).
- ``"properties_to_keep_when_chaining"``: dans le formulaire, si l'utilisateur enchaîne les créations, les champs listés dans ce paramètre seront pré-rempli avec les valeurs précédentes à chaque réinitialisation de formulaire.
- ``"generic"/"specific"``: définition des champs du formulaire observation
- ``"groups"``: ce paramètre permet de définir des groupes de champs par thème dans le formulaire pour en améliorer la visibilité. A l'affichage, chaque groupe est un panneau rétractable.
   - ``"label"``: le titre du groupe
   - ``"fields"``: Définition des champs du groupe, de la même façon que les champs de formulaire classique définis dans "generic"/"specific"
   - ``"defaults"``:
      - ``"opened"``: ``true`` pour que le panneau du groupe soit ouvert par défault. ``false`` pour qu'il soit fermé par défaut.
   - ``"yesno_field"``: Si présent, tous les champs de ce groupe peuvent être activés/désactivés avec un bouton radio "Oui"/"Non". Pour cela il faut mettre en premier dans les champs du groupe un widget de type "radio" en donner le nom ici.
   - ``"yesno_yesvalue"``: Si le "yesno_field" est présent, donner ici la valeur considérée comme un "Oui"
- ``"individual_histogram_items"``: liste des champs utilisé pour créer les courbes d'évolution dans les détails de l'individu. Chaque champ créé une nouvelle courbe
   - ``"field"`` : le nom du champ à utiliser
   - ``"color"`` : la couleur à utiliser pour la courbe. Utiliser une valeur HTML/CSS (https://www.w3schools.com/cssref/css_colors_legal.asp) 

**Champs calculés:**

Aucun champ calculé pour l'observation.

specific.service.js
"""""""""""""""""""

Ce fichier permet de définir des comportements spécifiques pour chaque formulaire (initialisation du formulaire et/ou inter-dépendence de champs).

Les fonctions suivantes doivent être impérativement présentes:

.. code-block:: javascript
   export function initSitegroup(form) {
      return {};
   }
   
Cette fonction initialise le formulaire de groupe de site. L'objet retourné sera utilisé pour initialiser les champs qui y sont remplis.
L'objet "form" définit le FormGroup. Pour récupérer un champ, vous pouvez faire un ``form.get('nomduchamp')``

.. code-block:: javascript
   export function initSite(form, sitegroup) {
      return {};
   }
   
Cette fonction initialise le formulaire de site. L'objet retourné sera utilisé pour initialiser les champs qui y sont remplis.
L'objet "form" définit le FormGroup. Pour récupérer un champ, vous pouvez faire un ``form.get('nomduchamp')``
L'objet "sitegroup" est passé en paramètre si vous voulez en récupérer des valeurs.

.. code-block:: javascript
   export function initVisit(form, site) {
      return {};
   }
   
Cette fonction initialise le formulaire de visite. L'objet retourné sera utilisé pour initialiser les champs qui y sont remplis.
L'objet "form" définit le FormGroup. Pour récupérer un champ, vous pouvez faire un ``form.get('nomduchamp')``
L'objet "site" est passé en paramètre si vous voulez en récupérer des valeurs (site.sitegroup vous donnera les valeurs du groupe de site si nécessaire).

.. code-block:: javascript
   export function initObservation(form, formGroups, visit, individual) {
      return {};
   }
   
Cette fonction initialise le formulaire de l'observation. L'objet retourné sera utilisé pour initialiser les champs qui y sont remplis.
L'objet "form" définit le FormGroup. Pour récupérer un champ, vous pouvez faire un ``form.get('nomduchamp')``
L'objet "formGroup" définit la liste des FormGroup de chaque groupe de champs, vous pouvez itérer sur chacun et récupérer un champ de la manière suivante

.. code-block:: javascript
   for (let fg of formGroups) {
        if (fg['form'].get('analyse_comp_type_prelevement')) {
            // Votre action sur ce champ...
        }
   }
   
L'objet "visit" est passé en paramètre si vous voulez en récupérer des valeurs (visit.site et visit.site.sitegroup vous donnera les valeurs du site et du groupe de site si nécessaire).
L'objet "individual" est passé en paramètre si vous voulez en récupérer des valeurs.


.. code-block:: javascript
   export function initIndividual(form) {
      return {};
   }
   
Cette fonction initialise le formulaire de l'individu. L'objet retourné sera utilisé pour initialiser les champs qui y sont remplis.
L'objet "form" définit le FormGroup. Pour récupérer un champ, vous pouvez faire un ``form.get('nomduchamp')``


Vues SQL
--------

Mettre un fichier "cmr.sql" dans data/ et qui contient les requêtes pour créer des vues spécifiques.
Le dossier "generic" contient la vue minimale ainsi qu'un exemple avec une vue plus complexe pour afficher les champs additionnels.

Vue "Observations par groupe de site"
"""""""""""""""""""""""""""""""""""""

Nommer la vue "gn_cmr.v_cmr_sitegroup_observations_nomdusousmodule" en remplaçant "nomdusousmodule" par le nom de votre sous-module.
Cette vue est utilisée pour l'export de toutes les observations d'un groupe de site.
Elle contient des informations sur le groupe de site, les sites, toutes les visites (y compris dans observations), les observations et les individus observés.


Templates de Rapport
--------------------

Pour les rapports PDF, il faut créer un template de rapport personnalisé.
Le template se compose:

- d'un fichier HTML (qui définit la structure et le contenu du rapport)
- d'un fichier CSS (qui définit le style du rapport)
- éventuellement d'images qui seront insérées dans le rapport

Ces fichiers sont répartis dans plusieurs sous-dossiers

- backend: le dossier principal
   - templates: le dossier contenant le fichier HTML
   - static:
      - css: le dossier contenant le fichier css
      - images: le dossier contenant la/les image(s)


Notions génériques
""""""""""""""""""

**Format page**

Il est défini dans le fichier CSS, dans la balise ``@page``

**En-tête et Pied de page**

Il est possible de définir une en-tête dans une balise HTML ``<div class="header">`` et un pied de page dans une balise HTML ``<div class="footer">``. 
Ainsi ils seront répété à chaque page. Attention à définir correctement la taille de la marge dans le CSS (dans la balise ``@page``) et les positions des header/footer toujours dans le CSS pour éviter les superpositions avec le contenu de la page.

**Police**

La police de caractère est définie dans le fichier CSS.
Il est également possible d'utiliser plusieurs police via l'utilisation de règles CSS sur une balise HTML ou une classe

**Images**

Toutes les images doivent être rangées dans le dossier backend/static/images.
Attention à fixer la grandeur des images dans le HTML/CSS ou au moins leur grandeur maximale pour éviter que l'image soit trop grande.

**Style**

Tout le style peut être redéfini via l'utilisation de règles CSS sur une balise HTML ou une classe


Rapport "Fiche Individu"
""""""""""""""""""""""""

Ce rapport permet de créer une fiche pour l'individu.
Le fichier template HTML doit s'appeler ``fiche_individu.html``
Le fichier CSS doit d'appeler ``fiche_individu_template.css``
Ce rapport peut contenir:

- Les informations de l'individu
- L'historique des observations de l'individu
- Une carte affichant tous les géométries des captures de l'individu (zone de la carte selon le placement fait par l'utilisateur dans l'application)
- Les médias photos de l'individu et de ses observations
