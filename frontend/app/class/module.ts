/**
 * Class object to initialize all module objects.
 */
export class Module {
    public id_module;
    public module_label = "";
    public module_code = "";
    public use_sitegroup = false;
    public config = {
        disclaimer: false,
        disclaimer_text: [],
        welcome: ""
    };
    public forms = {
        module: {
            fields: [],
            display_properties: [],
            display_list: []
        },
        site: {
            label:"",
            label_plural:"",
            fields: [],
            display_properties:[],
            display_list: [],
            geometry_types: [],
            properties_to_keep_when_chaining: []
        },
        sitegroup : {
            label:"", 
            label_plural:"",
            fields: [],
            display_properties:[],
            display_list: [],
            geometry_types: []
        },
        individual : {
            label:"", 
            label_plural:"",
            fields: [],
            display_properties:[],
            display_list: []
        },
        visit : {
            label:"", 
            label_plural:"",
            fields: [],
            display_properties:[],
            display_list: [],
            properties_to_keep_when_chaining: []
        },
        observation : {
            label:"", 
            label_plural:"",
            fields: [],
            groups: [],
            display_properties:[],
            display_list: [],
            individual_historic_display_list:[]
        },
    }
    public constructor() {}
}