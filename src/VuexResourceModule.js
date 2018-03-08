import DefaultActions from './DefaultActions'

export default class VuexResourceModule {

    constructor (resource, inputModule = {}, config = {})
    {

        let defaultConfig = {
            uriProvider: uriProvider,
            callbacks: {},
            serializers: {
                default: data => {
                    delete data.id
                    delete data.ids
                    return data
                }
            },
            normalizers: {}
        }

        config = Object.assign({}, defaultConfig, config)

        config.resource = resource
        config.baseUri = `${config.prefix ? '/' + config.prefix : ''}/${config.resource}`

        this.namespaced = inputModule.namespaced || true
        this.state = Object.assign({config}, inputModule.state)
        this.getters = Object.assign({}, inputModule.getters)
        this.mutations = Object.assign({}, inputModule.mutations)
        this.actions = Object.assign({}, DefaultActions, inputModule.actions)
        this.modules = inputModule.modules
    }
}

const uriProvider = function (actionName, params, config)
{
    if (actionName === 'findAll' || actionName === 'create' || actionName === 'createMany') {
        return config.baseUri
    }

    let ids = params.ids || [params.id]
    return config.baseUri + '/' + ids.join(',')
}
