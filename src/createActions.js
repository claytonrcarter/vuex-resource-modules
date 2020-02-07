import axios from 'axios'

function getActionProperty(actionConfig, object) {
    return (
        object[actionConfig.name] ||
        object[actionConfig.single ? 'one' : 'many'] ||
        object.default
    )
}

/**
 * The actual function that is called for each action. It's behavior changes
 * based on the config of each action as well as the whole module.
 *
 * @param  Object actionConfig configuration for this action (see resourceActionConfigs)
 * @param  Object context      Vuex action context
 * @param  Object params       params passed to the action via dispatch()
 * @return Promise
 */
function performActionWithCallback(actionConfig, context, params) {
    let moduleConfig = context.state.config
    let uri = moduleConfig.uriProvider(actionConfig.name, params, moduleConfig)
    let thenCallback = getActionProperty(
        actionConfig,
        moduleConfig.thenCallbacks
    )
    let serialize = getActionProperty(actionConfig, moduleConfig.serializers)
    let catchCallback = getActionProperty(
        actionConfig,
        moduleConfig.catchCallbacks
    )

    let serializedParams = serialize(params)

    if (moduleConfig.debug)
        console.log(
            'VuexResourceModule',
            `${moduleConfig.resource}/${actionConfig.name}`,
            actionConfig.method.toUpperCase(),
            uri,
            serializedParams,
        )

    let _axios = moduleConfig.useGlobalAxios ? window.axios : axios

    let promise =
        actionConfig.method === 'get' || actionConfig.method === 'delete'
            ? _axios[actionConfig.method](uri, { params: serializedParams })
            : _axios[actionConfig.method](uri, serializedParams)

    return promise
        .then(thenCallback(context, params, actionConfig.name, moduleConfig))
        .catch(catchCallback(context, params, actionConfig.name, moduleConfig))
}

// prettier-ignore
const resourceActionConfigs = [
    {name: 'find',       method: 'get',     single: true},
    {name: 'findAll',    method: 'get',     single: false},
    {name: 'findMany',   method: 'get',     single: false},
    {name: 'create',     method: 'post',    single: true},
    {name: 'createMany', method: 'post',    single: false},
    {name: 'update',     method: 'patch',   single: true},
    {name: 'updateMany', method: 'patch',   single: false},
    {name: 'replace',    method: 'put',     single: true},
    {name: 'delete',     method: 'delete',  single: true},
    {name: 'deleteMany', method: 'delete',  single: false},
]

export default function createActions(config) {
    var actions = {}
    var actionConfigs = resourceActionConfigs

    if (config.only) {
        actionConfigs = actionConfigs.filter(actionConfig =>
            config.only.includes(actionConfig.name)
        )
    } else if (config.except) {
        actionConfigs = actionConfigs.filter(
            actionConfig => !config.except.includes(actionConfig.name)
        )
    }

    actionConfigs.forEach(actionConfig => {
        actions[actionConfig.name] = function(context, params = {}) {
            return performActionWithCallback(actionConfig, context, params)
        }
    })

    return actions
}
