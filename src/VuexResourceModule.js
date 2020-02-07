import createActions from './createActions'
import pluralize from 'pluralize'

export default class VuexResourceModule {
    constructor(resource, inputModule = {}, config = {}) {
        //
        // setup our defaults
        //
        let defaultConfig = {
            resource,
            prefix: undefined,
            idKey: 'id',
            idProvider: params =>
                params[pluralize.plural(this.state.config.idKey)] || [
                    params[this.state.config.idKey]
                ],
            prefixProvider: (actionName, params, config) =>
                this.state.config.prefix ? '/' + this.state.config.prefix : '',
            baseUriProvider: (actionName, params, config) =>
                `${this.state.config.prefixProvider(
                    actionName,
                    params,
                    config
                )}/${this.state.config.resource}`,
            uriProvider: this.uriProvider.bind(this), // bind() this to VuexResourceModule, not defaultConfig
            only: undefined,
            except: undefined,
            debug: false,
            logErrors: true,
            useGlobalAxios: false,

            thenCallbacks: {
                default: (
                    context,
                    params,
                    actionName,
                    moduleConfig
                ) => response => {
                    if (moduleConfig.debug)
                        console.log(
                            'VuexResourceModules',
                            `${moduleConfig.resource}/${actionName}`,
                            'using default (noop) thenCallback'
                        )
                    return response
                }
            },
            catchCallbacks: {
                default: (
                    context,
                    params,
                    actionName,
                    moduleConfig
                ) => error => {
                    if (moduleConfig.debug || moduleConfig.logErrors)
                        console.log(
                            'Caught error in VuexResourceModule',
                            `${moduleConfig.resource}/${actionName}`,
                            error
                        )
                    throw error
                }
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

        //
        // wrap any uriProvider so we can fall back to the defaults
        //
        if (config.uriProvider) {
            let customProvider = config.uriProvider
            config.uriProvider = (actionName, params, wrappedConfig) =>
                customProvider(actionName, params, wrappedConfig) ||
                this.uriProvider(actionName, params, wrappedConfig)
        }

        //
        // build the config, overwriting defaults with anything provided
        //
        config = this.mergeConfig(config, defaultConfig)

        //
        // build the module, merging our pieces with anything provided
        //
        this.namespaced = inputModule.namespaced || true
        this.state = Object.assign({ config }, inputModule.state)
        this.getters = Object.assign({}, inputModule.getters)
        this.mutations = Object.assign({}, inputModule.mutations)
        this.actions = Object.assign(
            {},
            createActions({ only: config.only, except: config.except }),
            inputModule.actions
        )
        this.modules = inputModule.modules

        //
        // setup any nested modules
        //
        if (this.modules) {
            for (let module in this.modules) {
                module = this.modules[module]
                if (module instanceof VuexResourceModule) {

                    let resourceIdKey = `${pluralize.singular(
                        this.state.config.resource
                    )}_${this.state.config.idKey}`

                    //
                    // stash *this* modules idProvider (as _idProvider), then
                    // install a new one (again on *this* module, not the
                    // submodule) that also looks for <resource>_<idKey> as well
                    // whatever behavior is provided by the default idProvider
                    //
                    this.state.config._idProvider = this.state.config.idProvider
                    this.state.config.idProvider = params => {
                        let ids = params[pluralize.plural(resourceIdKey)] || [
                            params[resourceIdKey]
                        ]

                        return ids.length
                            ? ids
                            : this.state.config._idProvider(params)
                    }

                    //
                    // install *this* modules uriProvider as the submodule's prefixProvider
                    //
                    module.state.config.prefixProvider = this.state.config.uriProvider

                    //
                    // stash the default serializer (as _default), then install
                    // a new default serializer that removes the idKey we just
                    // generated (eg `subresource_id`)
                    //
                    module.state.config.serializers._default =
                        module.state.config.serializers.default
                    module.state.config.serializers.default = data => {
                        let serialized = Object.assign(
                            {},
                            module.state.config.serializers._default(data)
                        )
                        delete serialized[resourceIdKey]
                        delete serialized[resourceIdKey + 's']
                        return serialized
                    }
                }
            }
        }
    }

    mergeConfig(inputConfig, defaultConfig) {
        let newConfig = {}
        for (let property in defaultConfig) {
            newConfig[property] = !inputConfig.hasOwnProperty(property)
                ? defaultConfig[property]
                : Object.getPrototypeOf(inputConfig[property]) ===
                  Object.prototype
                ? Object.assign(
                      {},
                      defaultConfig[property],
                      inputConfig[property]
                  )
                : inputConfig[property]
        }
        return newConfig
    }

    uriProvider(actionName, params, config) {
        let baseUri = this.state.config.baseUriProvider(
            actionName,
            params,
            config
        )

        if (
            actionName === 'findAll' ||
            actionName === 'create' ||
            actionName === 'createMany'
        ) {
            return baseUri
        }

        return baseUri + '/' + this.state.config.idProvider(params).join(',')
    }
}
