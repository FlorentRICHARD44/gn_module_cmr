from geonature.utils.utilssqlalchemy import serializable
from geonature.utils.env import DB
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.hybrid import hybrid_property
from uuid import uuid4
from geoalchemy2 import Geometry
from geonature.core.gn_commons.models import TModules
from pypnusershub.db.models import User

from .utils.transform import data_to_json

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
    type_observation = DB.Column(DB.Integer)
    data = DB.Column(JSONB)
    comments = DB.Column(DB.Unicode)

    def to_dict(self):
        data = self.as_dict()
        if self.visit:
            data['visit_id'] = self.visit.id_visit
            data['visit_date'] = self.visit.to_dict()['date']
            data["site_name"] = self.visit.site.name if self.visit.site else None
        return data_to_json(data)


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
    id_site = DB.Column(DB.Integer, foreign_key="TSite.id_site")
    observations = DB.relationship(TObservation, primaryjoin=(id_visit == TObservation.id_visit), foreign_keys=[TObservation.id_visit], lazy="joined")

    @hybrid_property
    def nb_observations(self):
        return len(self.observations) if self.observations else 0

    def to_dict(self):
        data = self.as_dict()
        data['site_name'] = self.site.name if self.site else None
        data['observers'] = [o.as_dict() for o in self.observers]
        data['nb_observations'] = self.nb_observations
        return data_to_json(data)


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
    id_dataset = DB.Column(DB.Integer)
    visits = DB.relationship(TVisit, 
            primaryjoin=(id_site == TVisit.id_site),
            foreign_keys=[TVisit.id_site],
            lazy="joined")

    @hybrid_property
    def nb_visits(self):
        return len(self.visits) if self.visits else 0

    def to_dict(self):
        data = self.as_dict()
        data['nb_visits'] = self.nb_visits
        return data_to_json(data)

TVisit.site = DB.relationship(TSite,
        primaryjoin=(TVisit.id_site == TSite.id_site),
        foreign_keys=[TSite.id_site],
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
    id_dataset = DB.Column(DB.Integer)

    def to_dict(self):
        return data_to_json(self.as_dict())

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
