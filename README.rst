Module initié lors de l'atelier développement du workshop GeoNature (24 et 25 septembre 2018).
Le module générique CMR doit permettre d'utiliser des sous-module dédiés à différent protocoles.
Il s'inspire des travaux effectués sur le module https://github.com/PnX-SI/gn_module_monitoring

Mots-clés
---------

Les mots-clés suivants sont utilisés dans ce module. Dans l'application, ils peuvent tous être remplacés par configuration pour faciliter l'utilisation d'un vocabulaire spécifique à chaque sous-module.

- **site** *(site)*: un emplacement plus ou moins large sur lequel seront faites des visites. Il peut être inclus ou non dans un groupe de sites.

    - Sur une CMR sans groupe de site, il peut s'agir d'un point, d'une ligne ou d'un polygone.
    - Sur une CMR dans un groupe de site, il s'agit généralement d'un point précis (piège ou capture manuelle).

- **sitegroup** *(groupe de site)*: un groupe de sites, pouvant être appelé "aire d'étude" par certains. Il est généralement représenté par un polygone.

- **visit** *(visite*): la visite d'un et un seul site, à une date précise par un ou plusieurs opérateurs. La visite peut comporter 0 ou plus observations.
  
  Dans la CMR, c'est la visite qui supporte le jeu de données.

- **individual** *(individu): un individu qui a été capturé (et marqué) lors d'une visite, et qui peut être recapturé lors d'une ou plusieurs visites ultérieures. L'individu contient tous les détails ne changeant pas au fur et à mesure de ses observations.

- **observation** *(observation)*: l'observation d'un individu pendant une visite. L'observation contient tous les détails de l'individu a un instant T. 


Installer le module 
------------------

Se placer dans le répertoire backend de GeoNature et activer le virtualenv

``source venv/bin/activate``

Lancer la commande d'installation

``geonature install_gn_module /home/<MON_CHEMIN_ABSOLUE_VERS_LE_MODULE/ /cmr``


Configuration
-------------
Voir le fichier dans config/README.rst
