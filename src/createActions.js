import axios from 'axios'

const getDefaultErrorHandler = function (actionName, resourceName)
{
    return error => console.log('Caught error in VuexResourceModule', `${resourceName}/${actionName}`, error)
}

const performActionWithCallback = function (actionConfig, context, params)
{
    let moduleConfig = context.state.config
    let uri = moduleConfig.uriProvider(actionConfig.name, params, moduleConfig)
    let callback = moduleConfig.callbacks[actionConfig.name]
    let serialize = moduleConfig.serializers[actionConfig.name] ||
                    moduleConfig.serializers[actionConfig.single ? 'one' : 'many'] ||
                    moduleConfig.serializers.default
    // let normalize = moduleConfig.normalizers[actionConfig.name] ||
    //                 moduleConfig.normalizers[actionConfig.single ? 'one' : 'many'] ||
    //                 moduleConfig.normalizers.default
    let catchCallback = moduleConfig.catchCallbacks[actionConfig.name]
    let defaultCatchCallback = getDefaultErrorHandler(actionConfig.name, moduleConfig.resource)


    let serializedParams = serialize(params)

    if (moduleConfig.debug) {
        console.log(actionConfig.name, moduleConfig.resource, serializedParams, uri)
    }

    let promise = actionConfig.method === 'get' || actionConfig.method === 'delete'
                  ? axios[actionConfig.method](uri, { params: serializedParams })
                  : axios[actionConfig.method](uri, serializedParams)

    return promise.then(callback ? callback(context, params) : response => response)
                  .catch(catchCallback ? catchCallback(defaultCatchCallback) : defaultCatchCallback)

    // return callback
    //        ? promise.then(callback(context, params))
    //                 .catch(catchCallback ? catchCallback() : getDefaultErrorHandler(actionConfig.name, moduleConfig.resource))
    //        : promise
}


const resourceActions = [
    {name: 'find',       method: 'get',   single: true},
    {name: 'findAll',    method: 'get',   single: false},
    {name: 'findMany',   method: 'get',   single: false},
    {name: 'create',     method: 'post',  single: true},
    {name: 'createMany', method: 'post',  single: false},
    {name: 'update',     method: 'patch', single: true},
    {name: 'updateMany', method: 'patch', single: false},
    {name: 'replace',    method: 'put',   single: true},
    {name: 'delete',     method: 'delete',   single: true},
    {name: 'deleteMany', method: 'delete',   single: false},
]

export default function createActions (config) {

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
