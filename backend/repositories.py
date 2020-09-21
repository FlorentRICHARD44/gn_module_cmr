from geonature.utils.env import DB
from .models import TModuleComplement

class ModulesRepositories:
    def get_all(self):
        q = DB.session.query(TModuleComplement)
        return q.all().as_dict()