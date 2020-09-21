from flask import Blueprint
from geonature.utils.env import DB
from geonature.utils.utilssqlalchemy import json_resp
from .repositories import ModulesRepositories

blueprint = Blueprint('cmr', __name__)

@blueprint.route('/test', methods=['GET', 'POST'])
def test():
    return 'It works'

@blueprint.route('/modules', methods=['GET'])
@json_resp
def get_modules():
    repo = ModulesRepositories()
    return repo.get_all()
