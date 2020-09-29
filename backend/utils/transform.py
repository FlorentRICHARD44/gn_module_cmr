# This module contains various generic methods to help in data transformation.

def data_to_json(data):
    """
    Extract data attributes from JSONB column to set as "normal" attribute.
    """
    if data is not None and 'data' in data and data['data'] is not None:
        for (k,v) in data['data'].items():
            data[k] = v
        data.pop('data')
    return data

def json_to_data(data, model):
    """
    Set every "normal" attribute that is not a column to JSONB column.
    """
    json_data = {}
    keys_to_pop = []
    for k in data.keys():
        if not hasattr(model, k):
            json_data[k] = data[k]
            keys_to_pop.append(k)
    for k in keys_to_pop:
        data.pop(k, None)
    data['data'] = json_data
    return data
