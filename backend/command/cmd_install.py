import click
import os
from flask import Flask
from flask.cli import AppGroup, with_appcontext
from sqlalchemy import text
from geonature.utils.env import DB, ROOT_DIR
from ..models import TModuleComplement
from ..repositories import GnModuleRepository, ModulesRepository
from ..utils.config_utils import get_json_config_from_file, get_config_path

app = Flask(__name__)
cmr_cli = AppGroup('cmr')

@cmr_cli.command('install')
@click.argument('module_config_dir_path')
@click.argument('module_code')
@with_appcontext
def install_cmr_module(module_config_dir_path, module_code):
    """
    Module de CMR: script d'installation d'un sous-module.
    Commande d'installation:
    flask cmr install <module_config_dir_path> <module_code>
    params:
        - module_config_dir_path: chemin absolu vers le module à installer
        - module_code: code à donner au nouveau sous-module
    """
    print('Install module {} for CMR'.format(module_code))

    # Steps:
    # 0. Checks (CMR module exists and sub-module has all required files)
    # 1. Création du sous-module dans gn_common.t_modules et gn_cmr.complements
    # 2. Exécution du SQL
    # 3. Copie / Lien symbolique des fichiers/dossiers


    # Step 0. Checks (CMR module exists, same module code not already exists and sub-module has all required files)
    gn_module_repo = GnModuleRepository()
    if not gn_module_repo.check_exists('CMR'):
        print("Le module principal CMR n'est pas installé. Veuillez l'installer avant d'installer un sous-module")
        return
    
    if gn_module_repo.check_exists(module_code):
        print("Le module {} existe déjà".format(module_code))
        return
    
    if not os.path.exists(module_config_dir_path):
        print("Le chemin donné en paramètre n'existe pas")
    
    files_to_check = [
        'config.json',  # Main config
        'individual.json', 'module.json', 'observation.json', 'site.json', 'sitegroup.json', 'visit.json',  # forms config
        'specific.service.js',  # Specific js
        'cmr.sql',  # SQL to apply
        'cmr.jpg',  # Image sub-module
        'templates', # Dossier et fichiers des templates
        'templates/fiche_individu.html', 'templates/fiche_individu_template_pdf.css',
        'templates/images'
    ]
    missing_file = False
    for f in files_to_check:
        if not os.path.exists(os.path.join(module_config_dir_path, f)):
            print("Fichier de configuration manquant: " + f)
            missing_file = True
    if missing_file:
        return

    # Read and validate the configuration
    cfg = get_json_config_from_file(os.path.join(module_config_dir_path, 'config.json'))
    if 'module_label' not in cfg or 'module_desc' not in cfg:
        print('Paramètres manquants dans la configuration du module: "module_label" et/ou "module_desc"')
        return

    print('Validation OK')

    # Step 1. Création du sous-module dans gn_commons.t_modules et gn_cmr.t_module_complements
    module = TModuleComplement()
    module.module_code = module_code
    module.module_label = cfg['module_label']
    module.module_desc = cfg['module_desc']
    module.module_path = module_code
    module.active_frontend = False
    module.active_backend = False
    mod_repo = ModulesRepository()
    module = mod_repo.create_one(module)
    print("Module ajouté en base de données.")

    # Step 2. Exécution du SQL
    sql_script = module_config_dir_path + '/cmr.sql'
    try:
        DB.engine.execute(text(open(sql_script, 'r').read()
            ).execution_options(autocommit=True)
        )
    except Exception as e:
        print(e)
        print("Erreur dans le script cmr.sql")

    # Step 3. Copie / Lien symbolique des fichiers/dossiers
    symlink(module_config_dir_path, get_config_path() + '/' + module_code)
    # Step 3.1. Image sous-module
    symlink(os.path.join(module_config_dir_path, 'cmr.jpg'), 
        os.path.join(get_config_path(), '..','..', 'frontend', 'assets', module_code + '.jpg')) 
    # Step 3.2. Template
    if not os.path.exists(os.path.join(ROOT_DIR,'backend','templates','cmr')):
      os.mkdir(os.path.join(ROOT_DIR,'backend','templates','cmr'))
    symlink(os.path.join(module_config_dir_path, 'templates'),
        os.path.join(ROOT_DIR,'backend', 'templates','cmr',module_code))


def symlink(path_source, path_dest):
    """
    Create a symlink in filesystem.
    """
    if(os.path.islink(path_dest)):
        print('Suppression du symlink ' + path_dest)
        os.remove(path_dest)
    os.symlink(path_source, path_dest)
