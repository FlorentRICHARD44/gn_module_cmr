from flask import Blueprint, current_app, request
from geonature.utils.env import DB
from geonature.utils.utilssqlalchemy import json_resp
from pypnusershub.db.models import User
from .repositories import ModulesRepository, SiteGroupsRepository, SitesRepository, VisitsRepository, IndividualsRepository, ObservationsRepository, ConfigRepository
from .models import TModuleComplement, TSiteGroup, TSite, TVisit, TIndividual, TObservation
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

@blueprint.route('/module/<module_name>', methods=['PUT'])
@json_resp
def update_module(module_name):
    data = request.json
    mod_repo = ModulesRepository()
    return mod_repo.update_one(module_name, json_to_data(data, TModuleComplement))


#############################
# SITEGROUPS ROUTES
#############################

# Save a site group
@blueprint.route('/sitegroup', methods=['PUT'])
@json_resp
def save_sitegroup():
    data = request.json
    sitegroup_repo = SiteGroupsRepository()
    if data['id_sitegroup']:
        return sitegroup_repo.update_one(data)
    else:
        return sitegroup_repo.create_one(data)


# Get the list of site groups by module
@blueprint.route('/module/<int:id_module>/sitegroups', methods=['GET'])
@json_resp
def get_all_sitegroups_by_module(id_module):
    sitegroup_repo = SiteGroupsRepository()
    return sitegroup_repo.get_all_filter_by(TSiteGroup.id_module, id_module)
    
# Get the geometries of site groups by module
@blueprint.route('/module/<int:id_module>/sitegroups/geometries', methods=['GET'])
@json_resp
def get_all_sitegroups_by_module_geometries(id_module):
    sitegroup_repo = SiteGroupsRepository()
    return sitegroup_repo.get_all_geometries_filter_by(TSiteGroup.id_module, id_module)

# Get one site group by its id
@blueprint.route('/sitegroup/<int:id_sitegroup>', methods=['GET'])
@json_resp
def get_one_sitegroup(id_sitegroup):
    sitegroup_repo = SiteGroupsRepository()
    return sitegroup_repo.get_one(TSiteGroup.id_sitegroup, id_sitegroup)

# Get geometries for a site group
@blueprint.route('/sitegroup/<int:id_sitegroup>/geometries', methods=['GET'])
@json_resp
def get_one_sitegroup_geometries(id_sitegroup):
    sitegroup_repo = SiteGroupsRepository()
    return sitegroup_repo.get_geometry(TSiteGroup.id_sitegroup == id_sitegroup)


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
        return site_repo.update_one(data)
    else:
        return site_repo.create_one(data)

# Get the list of sites by module
@blueprint.route('/module/<int:id_module>/sites', methods=['GET'])
@json_resp
def get_all_sites_by_module(id_module):
    site_repo = SitesRepository()
    return site_repo.get_all_filter_by(TSite.id_module, id_module)

# Get the list of sites by site group
@blueprint.route('/sitegroup/<int:id_sitegroup>/sites', methods=['GET'])
@json_resp
def get_all_sites_by_sitegroup(id_sitegroup):
    site_repo = SitesRepository()
    return site_repo.get_all_filter_by(TSite.id_sitegroup, id_sitegroup)

# Get one site
@blueprint.route('/site/<int:id_site>', methods=['GET'])
@json_resp
def get_one_site(id_site):
    site_repo = SitesRepository()
    return site_repo.get_one(TSite.id_site, id_site)


#############################
# VISITS ROUTES
#############################

# Get list of visits by site
@blueprint.route('/site/<int:id_site>/visits', methods=['GET'])
@json_resp
def get_all_visits_by_site(id_site):
    visit_repo = VisitsRepository()
    return visit_repo.get_all_filter_by(TVisit.id_site, id_site)

# Get one visit
@blueprint.route('/visit/<int:id_visit>', methods=['GET'])
@json_resp
def get_one_visit(id_visit):
    visit_repo = VisitsRepository()
    return visit_repo.get_one(TVisit.id_visit, id_visit)

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
        return visit_repo.update_one(data)
    else:
        return visit_repo.create_one(data)


#############################
# INDIVIDUALS ROUTES
#############################

# Get the list of individuals by module
@blueprint.route('/module/<int:id_module>/individuals', methods=['GET'])
@json_resp
def get_all_individuals_by_module(id_module):
    ind_repo = IndividualsRepository()
    return ind_repo.get_all_filter_by(TSite.id_module, id_module)

# Get list of individuals by site group
@blueprint.route('/sitegroup/<int:id_sitegroup>/individuals', methods=['GET'])
@json_resp
def get_all_individuals_by_sitegroup(id_sitegroup):
    ind_repo = IndividualsRepository()
    return ind_repo.get_all_by_sitegroup(id_sitegroup)

# Get list of individuals by site
@blueprint.route('/site/<int:id_site>/individuals', methods=['GET'])
@json_resp
def get_all_individuals_by_site(id_site):
    ind_repo = IndividualsRepository()
    return ind_repo.get_all_by_site(id_site)

# Get one individual
@blueprint.route('/individual/<int:id_individual>', methods=['GET'])
@json_resp
def get_one_individual(id_individual):
    ind_repo = IndividualsRepository()
    return ind_repo.get_one(TIndividual.id_individual, id_individual)

# Save an individual
@blueprint.route('/individual', methods=['PUT'])
@json_resp
def save_individual():
    data = request.json
    ind_repo = IndividualsRepository()
    if data['id_individual']:
        return ind_repo.update_one(data)
    else:
        return ind_repo.create_one(data)


#############################
# OBSERVATIONS ROUTES
#############################

# Get one observation
@blueprint.route('/observation/<int:id_observation>', methods=['GET'])
@json_resp
def get_one_observation(id_observation):
    obs_repo = ObservationsRepository()
    return obs_repo.get_one(TObservation.id_observation, id_observation)

# Get all observations of one visit
@blueprint.route('/visit/<int:id_visit>/observations', methods=['GET'])
@json_resp
def get_all_observations_of_a_visit(id_visit):
    obs_repo = ObservationsRepository()
    return obs_repo.get_all_filter_by(TObservation.id_visit, id_visit)

# Get all observations of one individual
@blueprint.route('/individual/<int:id_individual>/observations')
@json_resp
def get_all_observations_of_an_individual(id_individual):
    obs_repo = ObservationsRepository()
    return obs_repo.get_all_filter_by(TObservation.id_individual, id_individual)

# Save an observation
@blueprint.route('/observation', methods=['PUT'])
@json_resp
def save_observation():
    data = request.json
    obs_repo = ObservationsRepository()
    if data['id_observation']:
        return obs_repo.update_one(data)
    else:
        return obs_repo.create_one(data)
