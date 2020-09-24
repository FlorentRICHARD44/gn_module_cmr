import os
from flask import current_app
from geonature.utils.env import DB
from .models import TModuleComplement, TSite, TVisit
from .utils.config_utils import get_json_config_from_file, get_config_path


class BaseRepository:
    """
    Base repository to make some generic requests
    """
    def __init__(self, model):
        self.model = model
    
    def get_all(self):
        """
        Return all items corresponding to the model
        """
        q = DB.session.query(self.model)
        return [m.as_dict() for m in q.all()]
    
    def get_all_filter_by(self, filter_column, value):
        q = DB.session.query(self.model).filter(filter_column == value)
        return [d.as_dict() for d in q.all()]
    
    def get_one(self, identifier, attribute):
        """
        Get one item, using a value (identifier) and the attribute which shall be unique.
        """
        q = DB.session.query(self.model).filter(attribute == identifier)
        data = q.one_or_none()
        return data.as_dict() if data else None

    def create_one(self, data):
        """
        Create a new item.
        """
        data = self.model(**data)
        DB.session.add(data)
        DB.session.commit()
        return data.as_dict()

class ModulesRepository(BaseRepository):
    """
    Repository for the CMR Modules. Access to database.
    """
    def __init__(self):
        super().__init__(TModuleComplement)


class SitesRepository(BaseRepository):
    """
    Repository for the CMR Sites. Access to database.
    """
    def __init__(self):
        super().__init__(TSite)

    def get_all_filter_by_module_and_dataset(self, id_module, id_dataset):
        q = DB.session.query(self.model).filter(TSite.id_module == id_module).filter(TSite.id_dataset == id_dataset)
        return [d.as_dict() for d in q.all()]

class VisitsRepository(BaseRepository):
    """
    Repository for the CMR Visits. Access to database.
    """
    def __init__(self):
        super().__init__(TVisit)

class ConfigRepository:
    """
    Repository for configuration in json files.
    """
    def get_module_config(self, module_name):
        """
        Get the configuration of the module.
        """
        module_code = module_name if module_name else 'generic'
        return get_json_config_from_file(
                    os.path.join(get_config_path(),module_name,'config.json'))
    
    def get_module_forms_config(self, module_name):
        """
        Get the configuration of each form for a module
        """
        form_config = {}
        module_code = module_name if module_name else 'generic'
        form_site = get_json_config_from_file(
                    os.path.join(get_config_path(), 'generic', 'site.json'))
        form_site.update(get_json_config_from_file(
                    os.path.join(get_config_path(), module_name, 'site.json')))
        # Build fields from generic and specific
        form_site['fields'] = form_site['generic']
        if 'specific' in form_site:
            form_site['fields'].update(form_site['specific'])
        form_site.pop('generic', None)
        form_site.pop('specific', None) 
        form_config['site'] = form_site
        return form_config
