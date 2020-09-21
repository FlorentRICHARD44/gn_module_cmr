from flask import Blueprint, current_app
from geonature.utils.env import DB
from geonature.utils.utilssqlalchemy import json_resp
from .repositories import ModulesRepository, ConfigRepository

blueprint = Blueprint('cmr', __name__)

# TEST ROUTES
@blueprint.route('/test', methods=['GET', 'POST'])
def test():
    return 'It works'

# CONFIG ROUTES
@blueprint.route('/config/<module_name>', methods=['GET'])
@json_resp
def get_module_config(module_name):
    repo = ConfigRepository()
    return repo.get_module_config(module_name)

# MODULES ROUTES
@blueprint.route('/modules', methods=['GET'])
@json_resp
def get_modules():
    mod_repo = ModulesRepository()
    modules = mod_repo.get_all()
    cfg_repo = ConfigRepository()
    for module in modules:
        module['config'] = cfg_repo.get_module_config(module['module_code'])
    return modules

@blueprint.route('/module/<module_name>', methods=['GET'])
@json_resp
def get_specific_module(module_name):
    repo = ModulesRepository()
    return repo.get_one(module_name)
