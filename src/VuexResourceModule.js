import DefaultActions from './DefaultActions'
import pluralize from 'pluralize'

export default class VuexResourceModule {

    constructor (resource, inputModule = {}, config = {})
    {

        let defaultConfig = {
            callbacks: {},
            idKey: 'id',
            getIds: (params) => params[pluralize.plural(this.state.config.idKey)] || [params[this.state.config.idKey]],
            getPrefix: (actionName, params, config) => this.state.config.prefix ? '/' + this.state.config.prefix : '',
            getBaseUri: (actionName, params, config) => `${this.state.config.getPrefix(actionName, params, config)}/${this.state.config.resource}`,
            uriProvider: (actionName, params, config) => {
                let baseUri = this.state.config.getBaseUri(actionName, params, config)

                if (actionName === 'findAll' || actionName === 'create' || actionName === 'createMany') {
                    return baseUri
                }

                return baseUri + '/' + this.state.config.getIds(params).join(',')
            },
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

        config = Object.assign({}, defaultConfig, config)

        config.resource = resource

        this.namespaced = inputModule.namespaced || true
        this.state = Object.assign({config}, inputModule.state)
        this.getters = Object.assign({}, inputModule.getters)
        this.mutations = Object.assign({}, inputModule.mutations)
        this.actions = Object.assign({}, DefaultActions, inputModule.actions)
        this.modules = inputModule.modules

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
}
