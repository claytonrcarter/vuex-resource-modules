import DefaultActions from './DefaultActions'

export default class VuexResourceModule {

    constructor (resource, inputModule = {})
    {
        let vuexConfig = {
            resource,
        }

        vuexConfig.uri = '/' + vuexConfig.resource

        this.state = Object.assign({vuexConfig}, inputModule.state)
        this.getters = Object.assign({}, inputModule.getters)
        this.mutations = Object.assign({}, inputModule.mutations)
        this.actions = Object.assign(DefaultActions, inputModule.actions)
    }
}
