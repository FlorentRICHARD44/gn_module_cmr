import os
from flask import current_app
from geonature.utils.env import DB
from sqlalchemy.orm import joinedload, subqueryload
from sqlalchemy.inspection import inspect
from sqlalchemy.ext.hybrid import hybrid_property
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
        return [m.to_dict() for m in q.all()]
    
    def get_all_filter_by(self, filter_column, value):
        q = DB.session.query(self.model).filter(filter_column == value)
        return [d.to_dict() for d in q.all()]
    
    def get_one(self, identifier, attribute):
        """
        Get one item, using a value (identifier) and the attribute which shall be unique.
        """
        q = DB.session.query(self.model).filter(attribute == identifier)
        data = q.one_or_none()
        return data.to_dict() if data else None

    def create_one(self, data):
        """
        Create a new item.
        """
        data = self.model(**data)
        DB.session.add(data)
        DB.session.commit()
        return data.to_dict()

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
        for i in q:
            print(i)
        return [d.to_dict() for d in q.all()]
    
    def get_all_filter_by(self, filter_column, value):
        q = DB.session.query(self.model).filter(filter_column == value)
        return [d.to_dict() for d in q.all()]

    def get_one(self, identifier, attribute):
        q = DB.session.query(self.model).filter(attribute == identifier)
        data = q.one_or_none()
        return data.to_dict()
        #result['nb_visits'] = data.nb_visits  # TODO find a generic way to extract hybrid_property
        #return result

class VisitsRepository(BaseRepository):
    """
    Repository for the CMR Visits. Access to database.
    """
    def __init__(self):
        super().__init__(TVisit)

    def get_one(self, identifier, attribute):
        """
        Get one item, using a value (identifier) and the attribute which shall be unique.
        """
        result = super().get_one(identifier,attribute)
        if result is not None and result['id_site'] is not None:
            result['site'] = DB.session.query(TSite).filter(TSite.id_site == result['id_site']).one().to_dict()
        return result

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
    
    def _build_form_from_its_json(self, module_name, obj_name):
        """
        Reads the json file for an object in "generic" and in sub-module.
        """
        form = get_json_config_from_file(
                    os.path.join(get_config_path(), 'generic', obj_name + '.json'))
        form.update(get_json_config_from_file(
                    os.path.join(get_config_path(), module_name, obj_name + '.json')))
        # Build fields from generic and specific
        form['fields'] = form['generic']
        if 'specific' in form:
            form['fields'].update(form['specific'])
        form.pop('generic', None)
        form.pop('specific', None)
        return form

    def get_module_forms_config(self, module_name):
        """
        Get the configuration of each form for a module
        """
        form_config = {}
        module_code = module_name if module_name else 'generic'
        form_config['site'] = self._build_form_from_its_json(module_name, 'site')
        form_config['visit'] = self._build_form_from_its_json(module_name, 'visit')
        return form_config
