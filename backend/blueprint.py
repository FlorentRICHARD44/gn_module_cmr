from flask import Blueprint, current_app, request
from geonature.utils.env import DB
from geonature.utils.utilssqlalchemy import json_resp
from .repositories import ModulesRepository, SitesRepository, ConfigRepository
from .models import TModuleComplement, TSite
from .utils.transform import data_to_json

blueprint = Blueprint('cmr', __name__)


#############################
# TEST ROUTES
#############################

# Just a simple test
@blueprint.route('/test', methods=['GET', 'POST'])
def test():
    return 'It works'


#############################
# MODULES ROUTES
#############################

# Get the list of all CMR modules
@blueprint.route('/modules', methods=['GET'])
@json_resp
def get_modules():
    mod_repo = ModulesRepository()
    modules = mod_repo.get_all()
    cfg_repo = ConfigRepository()
    for module in modules:
        module['config'] = cfg_repo.get_module_config(module['module_code'])
    return modules

# Get the details of one CMR module
@blueprint.route('/module/<module_name>', methods=['GET'])
@json_resp
def get_specific_module(module_name):
    mod_repo = ModulesRepository()
    module = mod_repo.get_one(module_name, TModuleComplement.module_code)
    cfg_repo = ConfigRepository()
    module['config'] = cfg_repo.get_module_config(module['module_code'])
    module['forms'] = cfg_repo.get_module_forms_config(module['module_code'])
    return module

#############################
# SITES ROUTES
#############################

# Save a site
@blueprint.route('/site', methods=['PUT'])
@json_resp
def save_site():
    data = request.json
    site_repo = SitesRepository()
    if data['id_site']:
        pass  # TODO use the merge
        return {}
    else:  # TODO use generic function to transform data
        json_data = {}
        keys_to_pop = []
        for k in data.keys():
            if not hasattr(TSite, k):
                json_data[k] = data[k]
                keys_to_pop.append(k)
        for k in keys_to_pop:
            data.pop(k, None)
        data['data'] = json_data
        return site_repo.create_one(data)

# Get the list of sites by module
@blueprint.route('/module/<int:id_module>/sites', methods=['GET'])
@json_resp
def get_all_sites_by_module(id_module):
    site_repo = SitesRepository()
    data = site_repo.get_all_filter_by(TSite.id_module, id_module)
    return [data_to_json(d) for d in data]

# Get one site
@blueprint.route('/site/<int:id_site>', methods=['GET'])
@json_resp
def get_one_site(id_site):
    site_repo = SitesRepository()
    data = site_repo.get_one(TSite.id_site, id_site)
    return data_to_json(data)
