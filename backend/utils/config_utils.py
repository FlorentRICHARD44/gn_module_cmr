import json
import os
from geonature.utils.errors import GeoNatureError


CONFIG_PATH = os.path.dirname(os.path.abspath(__file__)) + '/../../config/cmr'

def get_config_path():
    return CONFIG_PATH

def get_json_config_from_file(filepath, result_default={}):
    """
    Reads the configuration from a json file
    """
    config = result_default
    try:
        if os.path.exists(filepath):
            with open(filepath) as f:
                config = json.load(f)
    except Exception as e:
        raise GeoNatureError("Module CMR - Config - error in file {}: {}"
                        .format(filepath, str(e)))
    return config
