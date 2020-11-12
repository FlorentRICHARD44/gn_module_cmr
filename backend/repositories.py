import json
import os
from flask import current_app
from geonature.utils.env import DB
from geonature.core.gn_commons.models import TMedias, TModules
from geonature.core.gn_meta.models import TDatasets
from pypnusershub.db.models import User
from geonature.core.ref_geo.models import LAreas, LiMunicipalities
from sqlalchemy import distinct, func, String, Date, or_, and_, text
from sqlalchemy.orm import joinedload, subqueryload
from sqlalchemy.orm.relationships import RelationshipProperty
from sqlalchemy.inspection import inspect
from sqlalchemy.ext.hybrid import hybrid_property
from geoalchemy2.shape import from_shape
from shapely.geometry import asShape
from .models import TModuleComplement, TSiteGroup, TSite, TVisit, TIndividual, TObservation
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
        """
        Return all items where filter_column = value.
        """
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
        data = self.model.from_dict(data)
        DB.session.add(data)
        DB.session.commit()
        return data.to_dict()
    
    def create_all(self, datas):
        """
        Create list of new items.
        """
        new_datas = []
        for data in datas:
            new_datas.append(self.model.from_dict(data))
        DB.session.add_all(new_datas)
        DB.session.commit()
        return [data.to_dict() for data in new_datas]
    
    def update_one(self, data):
        """
        Update an existing item.
        """
        data = self.model.from_dict(data)
        DB.session.merge(data)
        DB.session.commit()
        return data.to_dict()

    def delete_one(self, attribute, identifier):
        """
        Delete one item if exists.
        """
        q = DB.session.query(self.model).filter(attribute == identifier)
        data = q.one_or_none()
        if data is not None:
            DB.session.delete(data)
            DB.session.commit()
        return {"success":True}
    
    def _compute_additional_filter_params(self, query, params):
        """
        Method to add some filters in a given query according params.
        Special cases managed:
        * normal column (text with "like" date min/max, observers, dataset, boolean)
        * json column ( text with "like" )
        """
        for k,v in params.items():
            # Check suffix to manage date min/max
            suffix = None
            if k.endswith('_minfilter') or k.endswith('_maxfilter'):
                suffix = k[-10:]
                k = k[0:-10]
            
            # Check if attribute is a column or a JSON
            if hasattr(self.model, k):  # can be a column attribute

                # Check if attribute is a relationship or a normal column
                if isinstance(getattr(self.model, k).property, RelationshipProperty):
                    if str(getattr(self.model, k).property.entity.class_) == "<class 'pypnusershub.db.models.User'>":
                        conditions = ()
                        for val in v.split(','):
                            conditions = conditions + (getattr(self.model, k).any(id_role=val),)
                        query = query.filter(or_(*conditions))
                    elif str(getattr(self.model, k).property.entity.class_) == "<class 'geonature.core.gn_meta.models.TDatasets'>":
                        query = query.filter(getattr(self.model, k).has(id_dataset=v))

                else:
                    if suffix == '_minfilter':
                        query = query.filter(getattr(self.model, k) != None)
                        query = query.filter(getattr(self.model, k) >= v)
                    elif suffix == '_maxfilter':
                        query = query.filter(getattr(self.model, k) != None)
                        query = query.filter(getattr(self.model, k) <= v)
                    elif str(getattr(self.model, k).property.columns[0].type) == 'BOOLEAN':
                        query = query.filter(getattr(self.model, k).is_(True if v == "true" else False))
                    else: 
                        query = query.filter(getattr(self.model, k).ilike('%{}%'.format(v)))
            else:  # or can be an attribute inside json column
                if suffix == '_minfilter':
                    query = query.filter(text("CAST(CAST(" + self.model.__table__.fullname + ".data#>>'{" + k + "}' as varchar) as date) >= CAST('" + v + "' as date)"))
                elif suffix == '_maxfilter':
                    query = query.filter(text("CAST(CAST(" + self.model.__table__.fullname + ".data#>>'{" + k + "}' as varchar) as date) <= CAST('" + v + "' as date)"))
                else:
                    query = query.filter(self.model.data[k].cast(String).ilike('%{}%'.format(v)))
        return query


class BaseGeomRepository(BaseRepository):
    """
    Second level of generic repository with geometries methods.
    """
    def get_geometry(self, filter):
        """
        Get details of one item with geometry, as GeoJSON
        """
        q = DB.session.query(self.model, func.ST_AsGEOJSON(self.model.geom)).filter(filter)
        (data,geom) = q.one()
        return [data.to_geojson(geom)]

    def get_all_geometries_filter_by(self, filter_column, value):
        """
        Get list of details with their geometries, as GeoJSON.
        """
        q = DB.session.query(self.model, func.ST_AsGEOJSON(self.model.geom)).filter(filter_column == value)
        return [data.to_geojson(geom) for (data, geom) in q.all()]


class ModulesRepository(BaseRepository):
    """
    Repository for the CMR Modules. Access to database.
    """
    def __init__(self):
        super().__init__(TModuleComplement)

    def create_one(self, module):
        """
        Override creation for module installation.
        """
        DB.session.add(module)
        DB.session.commit()
        return module

    def update_one(self, module_code, data):
        """
        Update an existing module, override because need only to update few informations.
        """
        module_to_update = DB.session.query(self.model).filter(TModuleComplement.module_code == module_code).one()
        module_to_update.data = data['data']  # Update the JSONB column "data"
        medias_list = []
        if data['medias']:
            medias = (
                DB.session.query(TMedias).filter(
                    TMedias.id_media.in_([m['id_media'] for m in data['medias']])
                    ).all()
            )
            for m in medias:
                medias_list.append(m)
        module_to_update.medias = medias_list
        DB.session.merge(module_to_update)
        DB.session.commit()
        return module_to_update.to_dict()


class SiteGroupsRepository(BaseGeomRepository):
    """
    Repository for the CMR SiteGroup. Access to database.
    """
    def __init__(self):
        super().__init__(TSiteGroup)

    def get_all_geometries_filter_by_params(self, filter_column, value, params):
        """
        Get the list of sitegroup and geometry with filter. Computes some statistics about child objects.
        Returns details as GeoJSON.
        """
        result = []
        q = DB.session.query(TSiteGroup, 
                            func.ST_AsGEOJSON(self.model.geom), 
                            func.count(distinct(TSite.id_site)), 
                            func.count(distinct(TObservation.id_observation)),
                            func.count(distinct(TObservation.id_individual))).join(
                    TSite, (TSite.id_sitegroup == TSiteGroup.id_sitegroup), isouter=True).join(
                    TVisit, (TVisit.id_site == TSite.id_site), isouter=True).join(
                    TObservation, (TObservation.id_visit == TVisit.id_visit), isouter=True).filter(filter_column == value)
        q = self._compute_additional_filter_params(q, params)
        q = q.group_by(TSiteGroup.id_sitegroup)
        data = q.all()
        for (item, geom, count_site, count_observation, count_individual) in data:
            r = item.to_geojson(geom)
            r['properties']['nb_site'] = count_site
            r['properties']['nb_observations'] = count_observation
            r['properties']['nb_individuals'] = count_individual
            result.append(r)
        return result
    
    def sitegroup_contains_site(self, id_sitegroup, geom):
        """
        Checks if a sitegroup geometry contains another geometry.
        """
        q = DB.session.query(func.ST_Contains(TSiteGroup.geom, 
                                            func.ST_SetSRID(func.ST_GeomFromGeoJSON(json.dumps(geom)), 
                                                        4326))).filter(
                TSiteGroup.id_sitegroup == id_sitegroup)
        return q.one()
    
    def _find_municipalities(self, geom):
        """
        Get the name of municipalities that contains a sitegroup.
        """
        q = DB.session.query(LiMunicipalities).join(
            LAreas, (LAreas.id_area == LiMunicipalities.id_area)).filter(
                func.ST_Intersects(func.ST_Transform(LAreas.geom, 4326), 
                                func.ST_SetSRID(func.ST_GeomFromGeoJSON(json.dumps(geom)), 4326)))
        return q.all()
    
    def compute_data_from_municipality_area(self, params, data):
        """
        If some params are to be computed from municipality area, compute them here.
        """
        munis = self._find_municipalities(data['geom'])
        for key, value in params.items():  # initialize variable list
            data[key] = []
        for muni in munis:
            for key, value in params.items():
                data[key].append(getattr(muni,value))
        for key, value in params.items():  # ensure unique values and sorted
            data[key] = sorted(list(set(data[key])))
        return data


class SitesRepository(BaseGeomRepository):
    """
    Repository for the CMR Sites. Access to database.
    """
    def __init__(self):
        super().__init__(TSite)

    def get_all_filter_by(self, filter_attribute, value):
        """
        Overrides the predefined method to add some statistics count.
        """
        result = []
        q = DB.session.query(TSite, 
                func.count(distinct(TVisit.id_visit)),
                func.count(distinct(TObservation.id_observation)),
                func.count(distinct(TObservation.id_individual))).join(
                    TVisit, (TVisit.id_site == TSite.id_site), isouter=True).join(
                    TObservation, (TObservation.id_visit == TVisit.id_visit), isouter=True).filter(
            filter_attribute == value).group_by(TSite.id_site)
        data = q.all()
        for (item, count_visit, count_observation, count_individual) in data:
            r = item.to_dict()
            r['nb_visit'] = count_visit
            r['nb_observations'] = count_observation
            r['nb_individuals'] = count_individual
            result.append(r)
        return result

    def get_all_geometries_filter_by(self, filter_column, value, params):
        """
        Overrides the predefined method to add some statistics count.
        """
        result = []
        q = DB.session.query(TSite, 
                func.ST_AsGEOJSON(TSite.geom), 
                func.count(distinct(TVisit.id_visit)),
                func.count(distinct(TObservation.id_observation)),
                func.count(distinct(TObservation.id_individual))).join(
                    TVisit, (TVisit.id_site == TSite.id_site), isouter=True).join(
                    TObservation, (TObservation.id_visit == TVisit.id_visit), isouter=True).filter(filter_column == value)
        q = self._compute_additional_filter_params(q, params)
        q = q.group_by(TSite.id_site)
        data = q.all()
        for (item, geom, count_visit, count_observation, count_individual) in data:
            r = item.to_geojson(geom)
            r['properties']['nb_visit'] = count_visit if count_visit is not None else 0
            r['properties']['nb_observations'] = count_observation if count_observation is not None else 0
            r['properties']['nb_individuals'] = count_individual if count_individual is not None else 0
            result.append(r)
        return result


class VisitsRepository(BaseRepository):
    """
    Repository for the CMR Visits. Access to database.
    """
    def __init__(self):
        super().__init__(TVisit)
    
    def get_all_filter_by(self, filter_column, value, params):
        q = DB.session.query(self.model).filter(filter_column == value)
        q = self._compute_additional_filter_params(q, params)
        return [d.to_dict() for d in q.all()]


class IndividualsRepository(BaseRepository):
    """
    Repository for the CMR Individuals. Access to database.
    """
    def __init__(self):
        super().__init__(TIndividual)

    def get_all_geometries_filter_by(self, filter, params):
        """
        Get the observation and position of all observations made on a sitegroup.
        This permits to link all the positions of individuals.
        """
        result = []
        q = DB.session.query(TObservation, func.ST_AsGEOJSON(TSite.geom)).join(
            TVisit, (TVisit.id_visit == TObservation.id_visit)).join(
            TSite, (TSite.id_site == TVisit.id_site)).join(
            TIndividual, (TIndividual.id_individual == TObservation.id_individual)).filter(filter)
        q = self._compute_additional_filter_params(q, params)
        for (site, geom) in q.all():
            r = site.to_geojson(geom)
            r['object_type'] = 'observation'
            result.append(r)
        return result

    def get_all_by_site(self, id_site, params):
        """
        Get all the visits by site, with filter params.
        """
        result = []
        q = DB.session.query(self.model, func.count(TObservation.id_observation)).join(
            TObservation, (TObservation.id_individual == TIndividual.id_individual), isouter=True).join(
            TVisit, (TVisit.id_visit == TObservation.id_visit), isouter=True).filter(
                TVisit.id_site == id_site)
        for k,v in params.items():
            if hasattr(TIndividual, k):  # can be a column attribute
                q = q.filter(getattr(TIndividual,k).ilike('%{}%'.format(v)))
            else:  # or can be an attribute inside json column
                q = q.filter(TIndividual.data[k].cast(String).ilike('%{}%'.format(v)))
        q = q.group_by(TIndividual.id_individual)
        data = q.all()
        for (item, count) in data:
            r = item.to_dict()
            r['nb_observations'] = count  # replace the overall nb_observations by nb observations on the site.
            result.append(r)
        return result


class ObservationsRepository(BaseRepository):
    """
    Repository for the CMR Observations. Access to database.
    """
    def __init__(self):
        super().__init__(TObservation)

    def get_all_geometries_filter_by(self, filter_column, value):
        q = DB.session.query(self.model, func.ST_AsGEOJSON(TSite.geom)).join(
            TVisit, (TVisit.id_visit == self.model.id_visit)).join(
            TSite, (TSite.id_site == TVisit.id_site)).filter(filter_column == value)
        return [data.to_geojson(geom) for (data, geom) in q.all()]

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
        for item in ['module','sitegroup','site','visit','individual','observation']:
            form_config[item] = self._build_form_from_its_json(module_name, item)
        return form_config


class GnModuleRepository(BaseRepository):
    def __init__(self):
        super().__init__(TModules)
    
    def check_exists(self, module_code):
        """
        Checks if a module exists.
        Return True if exists else False
        """
        q = DB.session.query(self.model).filter(TModules.module_code == module_code)
        d = q.one_or_none()
        return d is not None
