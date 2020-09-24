from geonature.utils.utilssqlalchemy import serializable
from geonature.utils.env import DB
from sqlalchemy.dialects.postgresql import JSONB, UUID
from uuid import uuid4
from geoalchemy2 import Geometry
from geonature.core.gn_commons.models import TModules

SCHEMA_NAME = 'gn_cmr'


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


@serializable
class TVisit(DB.Model):
    """
    A visit of a site with 0 or more observations of individuals
    """
    __tablename__ = 't_visit'
    __table_args__ = {'schema': SCHEMA_NAME}
    id_visit = DB.Column(DB.Integer, primary_key=True)
    uuid_visite = DB.Column(UUID(as_uuid=True), default=uuid4)
    id_site = DB.Column(DB.Integer)
    data = DB.Column(JSONB)
    comments = DB.Column(DB.Unicode)
    date = DB.Column(DB.DateTime)
    no_observation = DB.Column(DB.Boolean)


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
