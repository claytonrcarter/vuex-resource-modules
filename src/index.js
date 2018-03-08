import DefaultActions from './DefaultActions'

export default class VuexResourceModule {

    constructor (resource, inputModule = {}, config = {})
    {

        let defaultConfig = {
            uriProvider: uriProvider,
            callbacks: {},
        }

        config = Object.assign({}, defaultConfig, config)

        config.resource = resource
        config.baseUri = `${config.prefix ? '/' + config.prefix : ''}/${config.resource}`

        this.state = Object.assign({config}, inputModule.state)
        this.getters = Object.assign({}, inputModule.getters)
        this.mutations = Object.assign({}, inputModule.mutations)
        this.actions = Object.assign({}, DefaultActions, inputModule.actions)
    }
}

const uriProvider = function (actionName, params, config)
{
    if (actionName === 'findAll' || actionName === 'create' || actionName === 'createMany') {
        return config.baseUri
    }

    return config.baseUri + '/' + (params.id || params.ids.join(','))
}
