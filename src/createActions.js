import axios from 'axios'


function getActionProperty (actionConfig, object)
{
    return object[actionConfig.name] ||
           object[actionConfig.single ? 'one' : 'many'] ||
           object.default
}


function performActionWithCallback (actionConfig, context, params)
{
    let moduleConfig = context.state.config
    let uri = moduleConfig.uriProvider(actionConfig.name, params, moduleConfig)
    let thenCallback = getActionProperty(actionConfig, moduleConfig.thenCallbacks)
    let serialize = getActionProperty(actionConfig, moduleConfig.serializers)
    let catchCallback = getActionProperty(actionConfig, moduleConfig.catchCallbacks)
    let defaultCatchCallback = moduleConfig.catchCallbacks.default

    let serializedParams = serialize(params)

    if (moduleConfig.debug) {
        console.log('VuexResourceModule', moduleConfig.resource, actionConfig.name, serializedParams, uri)
    }

    let _axios = moduleConfig.useGlobalAxios ? window.axios : axios

    let promise = actionConfig.method === 'get' || actionConfig.method === 'delete'
                  ? _axios[actionConfig.method](uri, { params: serializedParams })
                  : _axios[actionConfig.method](uri, serializedParams)

    return promise.then(thenCallback(context, params))
                  .catch(catchCallback(actionConfig.name, moduleConfig.resource, defaultCatchCallback))

}


const resourceActions = [
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


export default function createActions (config)
{

    var actions = {}

    let actionConfigs = config.only ? resourceActions.filter(actionConfig => config.only.includes(actionConfig.name))
                      : config.except ? resourceActions.filter(actionConfig => ! config.except.includes(actionConfig.name))
                      : resourceActions

    actionConfigs.forEach(actionConfig => {
        actions[actionConfig.name] = function (context, params = {})
        {
            return performActionWithCallback(actionConfig, context, params)
        }
    })

    return actions
}
