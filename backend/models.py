import json
from uuid import uuid4
from geonature.core.gn_meta.models import TDatasets
from geonature.utils.utilssqlalchemy import serializable
from geonature.utils.env import DB
from geoalchemy2.shape import from_shape
from shapely.geometry import asShape
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.hybrid import hybrid_property
from geoalchemy2 import Geometry
from geonature.core.gn_commons.models import TModules
from pypnusershub.db.models import User

from .utils.transform import data_to_json, json_to_data

SCHEMA_NAME = 'gn_cmr'


@serializable
class TObservation(DB.Model):
    """
    The observation of an individual during a visit in a site.
    Contains all the information about this individual at this visit date.
    """
    __tablename__ = 't_observation'
    __table_args__ = {'schema': SCHEMA_NAME}
    id_observation = DB.Column(DB.Integer, primary_key=True)
    id_individual = DB.Column(DB.Integer)
    id_visit = DB.Column(DB.Integer)
    data = DB.Column(JSONB)
    comments = DB.Column(DB.Unicode)

    def to_dict(self):
        data = self.as_dict()
        if self.visit:
            data['visit_id'] = self.visit.id_visit
            data['visit_date'] = self.visit.to_dict()['date']
            data['site_id'] = self.visit.id_site
            if self.visit.site is not None:
                data["site_name"] = self.visit.site.name
                data["sitegroup_id"] = self.visit.site.id_sitegroup
                if self.visit.site.sitegroup is not None:
                    data["sitegroup_name"] = self.visit.site.sitegroup.name
        data["individual_identifier"] = self.individual.to_dict()['identifier'] if self.individual else None
        return data_to_json(data)

    def to_geojson(self, geom):
        """
        Observation has no geom, but used to get all captures of an individual.
        """
        feature = {}
        if geom is not None:
            data = self.to_dict()
            feature['type'] = 'Feature'
            feature['geometry'] = json.loads(geom)
            feature['object_type'] = 'observation'
            feature['id'] = data['id_observation']
            feature['properties'] = data
        return feature

    @staticmethod
    def from_dict(data):
        data = json_to_data(data, TObservation)
        return TObservation(**data)

corVisitObserver = DB.Table('cor_visit_observer', 
    DB.Column("id_visit",
        DB.ForeignKey(SCHEMA_NAME +'.t_visit.id_visit'),
        primary_key=True
    ),
    DB.Column("id_observer",
        DB.ForeignKey('utilisateurs.t_roles.id_role'),
        primary_key=True
    ),
    schema=SCHEMA_NAME
)


@serializable
class TVisit(DB.Model):
    """
    A visit of a site with 0 or more observations of individuals
    """
    __tablename__ = 't_visit'
    __table_args__ = {'schema': SCHEMA_NAME}
    id_visit = DB.Column(DB.Integer, primary_key=True)
    uuid_visit = DB.Column(UUID(as_uuid=True), default=uuid4)
    data = DB.Column(JSONB)
    comments = DB.Column(DB.Unicode)
    date = DB.Column(DB.DateTime)
    observation = DB.Column(DB.Boolean)
    observers = DB.relationship(
        User,
        secondary=corVisitObserver,
        primaryjoin=(corVisitObserver.c.id_visit == id_visit),
        secondaryjoin=(corVisitObserver.c.id_observer == User.id_role),
        foreign_keys=[corVisitObserver.c.id_visit,
                      corVisitObserver.c.id_observer],
    )
    id_dataset = DB.Column(DB.Integer)
    dataset = DB.relationship(TDatasets, primaryjoin=(TDatasets.id_dataset == id_dataset), foreign_keys=[TDatasets.id_dataset],uselist=False)
    id_site = DB.Column(DB.Integer, foreign_key="TSite.id_site")
    observations = DB.relationship(TObservation, primaryjoin=(id_visit == TObservation.id_visit), foreign_keys=[TObservation.id_visit])

    @hybrid_property
    def nb_observations(self):
        return len(self.observations) if self.observations else 0

    def to_dict(self):
        data = self.as_dict()
        data['site_name'] = self.site.name if self.site else None
        data['observers'] = [o.as_dict() for o in self.observers]
        data['nb_observations'] = self.nb_observations
        data['dataset_name'] = self.dataset.dataset_name if self.dataset else None
        return data_to_json(data)

    @staticmethod
    def from_dict(data):
        data = json_to_data(data, TVisit)
        return TVisit(**data)


@serializable
class TSite(DB.Model):
    """
    A site is a place where an individual is captured or recaptured.
    """
    __tablename__ = 't_site'
    __table_args__ = {'schema': SCHEMA_NAME}
    id_site = DB.Column(DB.Integer, primary_key=True)
    name = DB.Column(DB.Unicode)
    comments = DB.Column(DB.Unicode)
    recurrent = DB.Column(DB.Boolean)
    data = DB.Column(JSONB)
    geom = DB.Column(Geometry("GEOMETRY", 4326))
    uuid_site = DB.Column(UUID(as_uuid=True), default=uuid4)
    id_module = DB.Column(DB.Integer)
    id_sitegroup = DB.Column(DB.Integer)
    visits = DB.relationship(TVisit, 
            primaryjoin=(id_site == TVisit.id_site),
            foreign_keys=[TVisit.id_site])

    @hybrid_property
    def nb_visits(self):
        return len(self.visits) if self.visits else 0

    def to_dict(self):
        data = self.as_dict()
        data['nb_visits'] = self.nb_visits
        data['sitegroup'] = self.sitegroup.to_dict() if self.sitegroup else None
        return data_to_json(data)

    def to_geojson(self, geom):
        feature = {}
        if geom is not None:
            data = self.to_dict()
            feature['type'] = 'Feature'
            feature['geometry'] = json.loads(geom)
            feature['object_type'] = 'site'
            feature['id'] = data['id_site']
            feature['properties'] = data
        return feature

    @staticmethod
    def from_dict(data):
        data['geom'] = from_shape(asShape(data['geom']), srid=4326)
        data = json_to_data(data, TSite)
        return TSite(**data)

TVisit.site = DB.relationship(TSite,
        primaryjoin=(TVisit.id_site == TSite.id_site),
        foreign_keys=[TSite.id_site],
        uselist=False)


@serializable
class TSiteGroup(DB.Model):
    """
    A group of TSite.
    """
    __tablename__ = 't_sitegroup'
    __table_args__ = {'schema': SCHEMA_NAME}
    id_sitegroup = DB.Column(DB.Integer, primary_key=True)
    name = DB.Column(DB.Unicode)
    comments = DB.Column(DB.Unicode)
    data = DB.Column(JSONB)
    geom = DB.Column(Geometry("GEOMETRY", 4326))
    uuid_sitegroup = DB.Column(UUID(as_uuid=True), default=uuid4)
    id_module = DB.Column(DB.Integer)
    sites = DB.relationship(TSite,
                primaryjoin=(id_sitegroup == TSite.id_sitegroup),
                foreign_keys=[TSite.id_sitegroup])

    @hybrid_property
    def nb_sites(self):
        return len(self.sites) if self.sites else 0

    def to_dict(self):
        data = self.as_dict()
        data['nb_sites'] = self.nb_sites
        return data_to_json(data)

    def to_geojson(self, geom):
        feature = {}
        if geom is not None:
            data = self.to_dict()
            feature['type'] = 'Feature'
            feature['geometry'] = json.loads(geom)
            feature['object_type'] = 'sitegroup'
            feature['id'] = data['id_sitegroup']
            feature['properties'] = data
        return feature

    @staticmethod
    def from_dict(data):
        data['geom'] = from_shape(asShape(data['geom']), srid=4326)
        data = json_to_data(data, TSiteGroup)
        return TSiteGroup(**data)


TSite.sitegroup = DB.relationship(TSiteGroup,
        primaryjoin=(TSiteGroup.id_sitegroup == TSite.id_sitegroup),
        foreign_keys=[TSiteGroup.id_sitegroup],
        uselist=False)


@serializable
class TIndividual(DB.Model):
    """
    An individual that is captured and maybe recaptured.
    """
    __tablename__ = 't_individual'
    __table_args__ = {'schema': SCHEMA_NAME}
    id_individual = DB.Column(DB.Integer, primary_key=True)
    uuid_individual = DB.Column(UUID(as_uuid=True), default=uuid4)
    identifier = DB.Column(DB.Unicode)
    rfid = DB.Column(DB.Unicode)
    marker = DB.Column(DB.Unicode)
    comments = DB.Column(DB.Unicode)
    data = DB.Column(JSONB)
    id_module = DB.Column(DB.Integer)
    observations = DB.relationship(TObservation, 
            primaryjoin=(TObservation.id_individual == id_individual),
            foreign_keys=[TObservation.id_individual])

    @hybrid_property
    def nb_observations(self):
        return len(self.observations)

    def to_dict(self):
        data = self.as_dict()
        data['nb_observations'] = self.nb_observations
        return data_to_json(data)

    @staticmethod
    def from_dict(data):
        data = json_to_data(data, TIndividual)
        return TIndividual(**data)

TObservation.individual = DB.relationship(TIndividual,
        primaryjoin=(TObservation.id_individual == TIndividual.id_individual),
        foreign_keys=[TIndividual.id_individual],
        uselist=False)
TObservation.visit = DB.relationship(TVisit,
        primaryjoin=(TObservation.id_visit == TVisit.id_visit),
        foreign_keys=[TVisit.id_visit],
        uselist=False)


@serializable
class TModuleComplement(TModules):
    """
    Add some complementary data for the TModules.
    """
    __tablename__ = 't_module_complements'
    __table_args__ = {'schema':'gn_cmr'}
    __mapper_args__ = {'polymorphic_identity':'cmr_module'}

    id_module = DB.Column(
        DB.ForeignKey('gn_commons.t_modules.id_module'),
        primary_key=True,
        nullable=False,
        unique=True
    )
    data = DB.Column(JSONB)
    uuid_module_complement = DB.Column(UUID(as_uuid=True), default=uuid4)
    
    def to_dict(self):
        return data_to_json(self.as_dict())
    
    @staticmethod
    def from_dict(data):
        data = json_to_data(data, TModuleComplement)
        return TModuleComplement(**data)
