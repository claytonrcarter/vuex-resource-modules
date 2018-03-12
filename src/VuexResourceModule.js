import createActions from './DefaultActions'
import pluralize from 'pluralize'

export default class VuexResourceModule {

    constructor (resource, inputModule = {}, config = {})
    {

        // setup our defaults
        let defaultConfig = {
            resource,
            callbacks: {},
            idKey: 'id',
            getIds: (params) => params[pluralize.plural(this.state.config.idKey)] || [params[this.state.config.idKey]],
            getPrefix: (actionName, params, config) => this.state.config.prefix ? '/' + this.state.config.prefix : '',
            getBaseUri: (actionName, params, config) => `${this.state.config.getPrefix(actionName, params, config)}/${this.state.config.resource}`,
            uriProvider: this.uriProvider.bind(this), // bind() this to VuexResourceModule, not defaultConfig
            serializers: {
                default: data => {
                    let serialized = Object.assign({}, data)
                    delete serialized.id
                    delete serialized.ids
                    return serialized
                }
            },
            normalizers: {}
        }


        // wrap any uriProvider so we can fall back to the defaults
        if (config.uriProvider) {
            let customProvider = config.uriProvider
            config.uriProvider =
                (actionName, params, wrappedConfig) => customProvider(actionName, params, wrappedConfig) ||
                                                       this.uriProvider(actionName, params, wrappedConfig)
        }


        // build the config, overwriting defaults with anyting provided
        config = Object.assign({}, defaultConfig, config)


        // build the module, including our pieces with anything provided
        this.namespaced = inputModule.namespaced || true
        this.state = Object.assign({config}, inputModule.state)
        this.getters = Object.assign({}, inputModule.getters)
        this.mutations = Object.assign({}, inputModule.mutations)
        this.actions = Object.assign({}, createActions({only: config.only, except: config.except}), inputModule.actions)
        this.modules = inputModule.modules


        // setup any nested modules
        if (this.modules) {
            for (let module in this.modules) {
                module = this.modules[module]
                if (module instanceof VuexResourceModule) {
                    module.state.config.idKey = `${pluralize.singular(module.state.config.resource)}_${module.state.config.idKey}`
                    module.state.config.getPrefix = this.state.config.uriProvider
                }
            }
        }
    }


    uriProvider (actionName, params, config)
    {
        let baseUri = this.state.config.getBaseUri(actionName, params, config)

        if (actionName === 'findAll' || actionName === 'create' || actionName === 'createMany') {
            return baseUri
        }

        return baseUri + '/' + this.state.config.getIds(params).join(',')
    }

}
