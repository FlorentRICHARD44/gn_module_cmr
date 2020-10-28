/**
 * Class object to initialize all module objects.
 */
export class Module {
    public id_module;
    public module_label = "";
    public module_code = "";
    public medias: [];
    public config = {
        disclaimer: false,
        disclaimer_text: [],
        welcome: "",
        use_sitegroup: false
    };
    public forms = {
        module: {
            fields: [],
            display_properties: [],
            display_list: []
        },
        site: {
            medias: [],
            label:"",
            label_plural:"",
            fields: [],
            display_properties:[],
            display_list: [],
            geometry_types: [],
            check_site_within_sitegroup: false,
            properties_to_keep_when_chaining: [],
            search_filters: []
        },
        sitegroup : {
            medias: [],
            label:"", 
            label_plural:"",
            fields: [],
            display_properties:[],
            display_list: [],
            geometry_types: [],
            search_filters: []
        },
        individual : {
            medias: [],
            label:"", 
            label_plural:"",
            fields: [],
            display_properties:[],
            display_list: [],
            search_filters: []
        },
        visit : {
            label:"", 
            label_plural:"",
            fields: [],
            display_properties:[],
            display_list: [],
            properties_to_keep_when_chaining: [],
            search_filters: []
        },
        observation : {
            medias: [],
            label:"", 
            label_plural:"",
            fields: [],
            groups: [],
            display_properties:[],
            display_list: [],
            individual_historic_display_list:[],
            individual_histogram_items: []
        },
    }
    public constructor() {}
}