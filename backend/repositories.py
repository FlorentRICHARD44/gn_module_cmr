import os
from flask import current_app
from geonature.utils.env import DB
from .models import TModuleComplement
from .utils.config_utils import get_json_config_from_file, get_config_path

class ModulesRepository:
    def get_all(self):
        q = DB.session.query(TModuleComplement)
        return [m.as_dict() for m in q.all()]
    
    def get_one(self, module_name):
        q = DB.session.query(TModuleComplement).filter(TModuleComplement.module_code == module_name)
        data = q.one_or_none()
        return data.as_dict() if data else None

class ConfigRepository:
    def get_module_config(self, module_name):
        module_code = module_name if module_name else 'generic'
        module = ModulesRepository().get_one(module_code)
        return get_json_config_from_file(
                    os.path.join(get_config_path(),module_name,'config.json'))
