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
            display_list: [],
            date_validators: []
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
            search_filters: [],
            date_validators: []
        },
        sitegroup : {
            medias: [],
            label:"", 
            label_plural:"",
            fields: [],
            display_properties:[],
            display_list: [],
            geometry_types: [],
            search_filters: [],
            date_validators: []
        },
        individual : {
            medias: [],
            label:"", 
            label_plural:"",
            fields: [],
            display_properties:[],
            display_list: [],
            search_filters: [],
            date_validators: []
        },
        visit : {
            label:"", 
            label_plural:"",
            fields: [],
            display_properties:[],
            display_list: [],
            properties_to_keep_when_chaining: [],
            search_filters: [],
            mapping_visit_individual_additional_field: false,
            date_validators: []
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
            individual_histogram_items: [],
            date_validators: []
        },
    }
    public constructor() {}
}