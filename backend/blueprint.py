from flask import Blueprint, current_app, request
from geonature.utils.env import DB
from geonature.utils.utilssqlalchemy import json_resp
from pypnusershub.db.models import User
from .repositories import ModulesRepository, SitesRepository, VisitsRepository, IndividualsRepository, ConfigRepository
from .models import TModuleComplement, TSite, TVisit, TIndividual
from .utils.transform import data_to_json, json_to_data

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
    else:
        return site_repo.create_one(json_to_data(data, TSite))

# Get the list of sites by module and optionally dataset
@blueprint.route('/module/<int:id_module>/sites', methods=['GET'])
@blueprint.route('/module/<int:id_module>/dataset/<int:id_dataset>/sites', methods=['GET'])
@json_resp
def get_all_sites_by_module_and_dataset(id_module, id_dataset=None):
    site_repo = SitesRepository()
    if id_dataset:
        data = site_repo.get_all_filter_by_module_and_dataset(id_module, id_dataset)
    else:
        data = site_repo.get_all_filter_by(TSite.id_module, id_module)
    return [data_to_json(d) for d in data]

# Get one site
@blueprint.route('/site/<int:id_site>', methods=['GET'])
@json_resp
def get_one_site(id_site):
    site_repo = SitesRepository()
    data = site_repo.get_one(TSite.id_site, id_site)
    return data_to_json(data)


#############################
# VISITS ROUTES
#############################

# Get list of visits by site
@blueprint.route('/site/<int:id_site>/visits', methods=['GET'])
@json_resp
def get_all_visits_by_site(id_site):
    visit_repo = VisitsRepository()
    data = visit_repo.get_all_filter_by(TVisit.id_site, id_site)
    return [data_to_json(d) for d in data]

# Get one visit
@blueprint.route('/visit/<int:id_visit>', methods=['GET'])
@json_resp
def get_one_visit(id_visit):
    visit_repo = VisitsRepository()
    data = visit_repo.get_one(TVisit.id_visit, id_visit)
    return data_to_json(data)

# Save a visit
@blueprint.route('/visit', methods=['PUT'])
@json_resp
def save_visit():
    data = request.json
    visit_repo = VisitsRepository()
    observers_list = []
    if data['observers']:
        observers = (
                DB.session.query(User).filter(
                    User.id_role.in_(data['observers'])
                    ).all()
            )
        for o in observers:
            observers_list.append(o)
    data['observers'] = observers_list
    if data['id_visit']:
        pass  # TODO use the merge
        return {}
    else:
        return visit_repo.create_one(json_to_data(data, TVisit))


#############################
# INDIVIDUALS ROUTES
#############################

# Get the list of individuals by module and optionally dataset
@blueprint.route('/module/<int:id_module>/individuals', methods=['GET'])
@blueprint.route('/module/<int:id_module>/dataset/<int:id_dataset>/individuals', methods=['GET'])
@json_resp
def get_all_individuals_by_module_and_dataset(id_module, id_dataset=None):
    ind_repo = IndividualsRepository()
    if id_dataset:
        data = ind_repo.get_all_filter_by_module_and_dataset(id_module, id_dataset)
    else:
        data = ind_repo.get_all_filter_by(TSite.id_module, id_module)
    return [data_to_json(d) for d in data]

# Get one individual
@blueprint.route('/individual/<int:id_individual>', methods=['GET'])
@json_resp
def get_one_individual(id_individual):
    ind_repo = IndividualsRepository()
    data = ind_repo.get_one(TIndividual.id_individual, id_individual)
    return data_to_json(data)

# Save an individual
@blueprint.route('/individual', methods=['PUT'])
@json_resp
def save_individual():
    data = request.json
    ind_repo = IndividualsRepository()
    if data['id_individual']:
        pass  # TODO use the merge
        return {}
    else:
        return ind_repo.create_one(json_to_data(data, TIndividual))
