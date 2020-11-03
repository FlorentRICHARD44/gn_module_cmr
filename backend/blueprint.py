import datetime as dt
import os
import zipfile
from flask import Blueprint, current_app, request, render_template
from geojson import FeatureCollection
from utils_flask_sqla.generic import serializeQuery
from utils_flask_sqla_geo.generic import GenericTableGeo
from utils_flask_sqla.response import to_csv_resp, to_json_resp
from geonature.utils.errors import GeonatureApiError
from geonature.utils.env import DB, ROOT_DIR
from geonature.utils.utilssqlalchemy import json_resp
from pypnusershub.db.models import User
from sqlalchemy import text
from werkzeug.exceptions import NotFound
from .repositories import ModulesRepository, SiteGroupsRepository, SitesRepository, VisitsRepository, IndividualsRepository, ObservationsRepository, ConfigRepository
from .models import TModuleComplement, TSiteGroup, TSite, TVisit, TIndividual, TObservation
from .utils.transform import data_to_json, json_to_data

from flask import send_from_directory
import geonature.utils.filemanager as fm
from pathlib import Path
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

    # Before to save, read the config and compute some data from municipality area (optional).
    mod_repo = ModulesRepository()
    module = mod_repo.get_one(TModuleComplement.id_module, data['id_module'])
    cfg_repo = ConfigRepository()
    sitegroup_cfg = cfg_repo._build_form_from_its_json(module['module_code'], 'sitegroup')
    if sitegroup_cfg['compute_data_from_municipality_area']:
        sitegroup_repo.compute_data_from_municipality_area(sitegroup_cfg['compute_data_from_municipality_area'], data)

    # Save data
    if data['id_sitegroup']:
        return sitegroup_repo.update_one(data)
    else:
        return sitegroup_repo.create_one(data)

# Get the geometries of site groups by module with filter
@blueprint.route('/module/<int:id_module>/sitegroups', methods=['GET'])
@json_resp
def get_all_sitegroups_by_module_geometries_filtered(id_module):
    sitegroup_repo = SiteGroupsRepository()
    return sitegroup_repo.get_all_geometries_filter_by_params(TSiteGroup.id_module, id_module, request.args.to_dict())

# Get geometries for a site group
@blueprint.route('/sitegroup/<int:id_sitegroup>/geometries', methods=['GET'])
@json_resp
def get_one_sitegroup_geometries(id_sitegroup):
    sitegroup_repo = SiteGroupsRepository()
    return sitegroup_repo.get_geometry(TSiteGroup.id_sitegroup == id_sitegroup)

# Check if sitegroup contains site (geometry check)
@blueprint.route('/sitegroup/<int:id_sitegroup>/containssite', methods=['POST'])
@json_resp
def check_if_sitegroup_contains_site(id_sitegroup):
    sitegroup_repo = SiteGroupsRepository()
    contains_site = sitegroup_repo.sitegroup_contains_site(id_sitegroup, request.json)
    return {"contains_site": contains_site[0]}

# export CSV all observations
@blueprint.route('/module/<module_code>/sitegroup/<int:id_sitegroup>/<type>', methods=['GET'])
def export_all_observations_by_sitegroup(module_code, id_sitegroup, type):
    view = GenericTableGeo(
        tableName="v_cmr_sitegroup_observations_" + module_code , 
        schemaName="gn_cmr", 
        engine=DB.engine,
        geometry_field="geom",
        srid=4326
    )
    columns = view.tableDef.columns
    q = DB.session.query(*columns).filter(text('id_sitegroup='+ str(id_sitegroup)))
    data = q.all()
    filename = dt.datetime.now().strftime("%Y_%m_%d_%Hh%Mm%S")

    if type == 'csv':
        return to_csv_resp(
            filename,
            data=serializeQuery(data, q.column_descriptions),
            separator=";",
            columns=[db_col.key for db_col in columns if db_col.key != 'geom'],
        )
    elif type == 'geojson':
        results = FeatureCollection([view.as_geofeature(d, columns=columns) for d in data])
        return to_json_resp(results, as_file=True, filename=filename, indent=4, extension='geojson')
    elif type == 'shp':
        try:
            fm.delete_recursively(
                str(ROOT_DIR / "backend/static/shapefiles"), excluded_files=[".gitkeep"]
            )
            db_cols = [db_col for db_col in view.db_cols if db_col.key in columns]
            dir_path = str(ROOT_DIR / "backend/static/shapefiles")
            view.as_shape(
                db_cols=db_cols, data=data, dir_path=dir_path, file_name=filename
            )

            return send_from_directory(dir_path, filename + ".zip", as_attachment=True)

        except GeonatureApiError as e:
            message = str(e)

        return render_template(
            "error.html",
            error=message,
            redirect=current_app.config["URL_APPLICATION"] + "/#/cmr",
        )
    else:
        raise NotFound("type export not found")


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

# Get the list of geometries for sites by module with filter
@blueprint.route('/module/<int:id_module>/sites', methods=['GET'])
@json_resp
def get_all_sites_geometries_by_module(id_module):
    site_repo = SitesRepository()
    return site_repo.get_all_geometries_filter_by(TSite.id_module, id_module, request.args.to_dict())

# Get the list of sites geometries by site group with filter
@blueprint.route('/sitegroup/<int:id_sitegroup>/sites', methods=['GET'])
@json_resp
def get_all_sites_geometries_by_sitegroup(id_sitegroup):
    site_repo = SitesRepository()
    return site_repo.get_all_geometries_filter_by(TSite.id_sitegroup, id_sitegroup, request.args.to_dict())

# Get geometries for a site
@blueprint.route('/site/<int:id_site>/geometries', methods=['GET'])
@json_resp
def get_one_site_geometries(id_site):
    site_repo = SitesRepository()
    return site_repo.get_geometry(TSite.id_site == id_site)


#############################
# VISITS ROUTES
#############################

# Get list of visits by site
@blueprint.route('/site/<int:id_site>/visits', methods=['GET'])
@json_resp
def get_all_visits_by_site(id_site):
    visit_repo = VisitsRepository()
    return visit_repo.get_all_filter_by(TVisit.id_site, id_site, request.args.to_dict())

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

@blueprint.route('/visits', methods=['POST'])
@json_resp
def create_visits_in_batch():
    data = request.json
    visit_repo = VisitsRepository()
    for d in data['visits']:
        observers_list = []
        if d['observers']:
            observers = (
                DB.session.query(User).filter(
                    User.id_role.in_(d['observers'])
                    ).all()
            )
            for o in observers:
                observers_list.append(o)
        d['observers'] = observers_list
    result = visit_repo.create_all(data['visits'])
    return {'visits': result}


#############################
# INDIVIDUALS ROUTES
#############################

# Get the list of individuals by module
@blueprint.route('/module/<int:id_module>/individuals', methods=['GET'])
@json_resp
def get_all_individuals_by_module(id_module):
    ind_repo = IndividualsRepository()
    return ind_repo.get_all_filter_by(TIndividual.id_module, id_module)

# Get position of each individual capture/recapture by module using filters
@blueprint.route('/module/<int:id_module>/individuals/filtered', methods=['GET'])
@json_resp
def get_all_individuals_geometries_by_module(id_module):
    ind_repo = IndividualsRepository()
    return ind_repo.get_all_geometries_filter_by(TSite.id_module == id_module, request.args.to_dict())

# Get list of individuals by site group
@blueprint.route('/sitegroup/<int:id_sitegroup>/individuals', methods=['GET'])
@json_resp
def get_all_individuals_by_sitegroup(id_sitegroup):
    ind_repo = IndividualsRepository()
    return ind_repo.get_all_geometries_filter_by(TSite.id_sitegroup == id_sitegroup, request.args.to_dict())

# Get list of individuals by site
@blueprint.route('/site/<int:id_site>/individuals', methods=['GET'])
@json_resp
def get_all_individuals_by_site(id_site):
    ind_repo = IndividualsRepository()
    return ind_repo.get_all_by_site(id_site, request.args.to_dict())

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

@blueprint.route('/module/<module_code>/ficheindividual/<int:id_individual>', methods=['POST'])
def get_fiche_individu(module_code, id_individual):
    ind_repo = IndividualsRepository()
    individual = ind_repo.get_one(TIndividual.id_individual, id_individual)
    df = {}
    df['module_code'] = module_code
    df['individual'] = individual
    df['medias'] = []
    for media in individual['medias']:
            if media['media_path'].split('.')[-1].lower() in ['png', 'jpg','jpeg','bmp', 'svg']:
                media['media_path'] = str(ROOT_DIR / 'backend/') + '/' + media['media_path']
                df['medias'].append(media)
    obs_repo = ObservationsRepository()
    observations = obs_repo.get_all_filter_by(TObservation.id_individual, id_individual)
    df['observations'] = observations
    for obs in observations:
        for media in obs['medias']:
            if media['media_path'].split('.')[-1].lower() in ['png', 'jpg','jpeg','bmp', 'svg']:
                media['media_path'] = str(ROOT_DIR / 'backend/') + '/' + media['media_path']
                media['obs_visit_date'] = obs['visit']['date']
                df['medias'].append(media)
    df['map_image'] = request.json['map']
    date = dt.datetime.now().strftime("%d/%m/%Y")

    df["footer"] = {
        "url": current_app.config["URL_APPLICATION"] + "/#/cmr/module/" +module_code + "/individual/" + str(id_individual),
        "date": date,
    }
    pdf_file = fm.generate_pdf("cmr/" + module_code + "/fiche_individu.html", df, "fiche_individu_" + individual['identifier'].replace(' ', '_') + ".pdf")
    pdf_file_posix = Path(pdf_file)
    return send_from_directory(str(pdf_file_posix.parent), pdf_file_posix.name, as_attachment=True)

@blueprint.route('/individual/<int:id_individual>/export/medias', methods=['GET'])
def export_media_for_an_individual(id_individual):
    ind_repo = IndividualsRepository()
    individual = ind_repo.get_one(TIndividual.id_individual, id_individual)

    filename = 'export_individual_' + str(id_individual) + '_' + dt.datetime.now().strftime("%Y_%m_%d_%Hh%Mm%S")
    
    #on crée le dossier s'il n'existe pas
    dir_path = str(ROOT_DIR / "backend/static/medias/exports")
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    #on le clean
    fm.delete_recursively(dir_path)
    featureCollection = []

    zip_path = dir_path + "/" + filename + ".zip"
    zp_file = zipfile.ZipFile(zip_path, mode="w")

    # Add media for the individual
    for media in individual['medias']:
        if media['media_path'] is not None:
            file_path = str(ROOT_DIR / "backend/" ) + "/" +  media['media_path']
            if os.path.exists(file_path):
                zp_file.write(file_path, os.path.basename(file_path))
    
    # Add media for all the observations of the individual
    obs_repo = ObservationsRepository()
    observations = obs_repo.get_all_filter_by(TObservation.id_individual, id_individual)
    for obs in observations:
        for media in obs['medias']:
            if media['media_path'] is not None:
                file_path = str(ROOT_DIR / "backend/" ) + "/" +  media['media_path']
                if os.path.exists(file_path):
                    zp_file.write(file_path, os.path.basename(file_path))

    zp_file.close()
    return send_from_directory(dir_path, filename + ".zip", as_attachment=True)


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

# Get all observations geometries of one individual
@blueprint.route('/individual/<int:id_individual>/observations/geometries')
@json_resp
def get_all_observations_geometries_of_an_individual(id_individual):
    obs_repo = ObservationsRepository()
    return obs_repo.get_all_geometries_filter_by(TObservation.id_individual, id_individual)

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
