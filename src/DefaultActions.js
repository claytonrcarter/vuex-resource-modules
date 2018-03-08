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
    let normalize = moduleConfig.normalizers[actionConfig.name] ||
                    moduleConfig.normalizers[actionConfig.single ? 'one' : 'many'] ||
                    moduleConfig.normalizers.default

    let serializedParams = serialize(params)

    if (moduleConfig.debug) {
        console.log(actionConfig.name, moduleConfig.resource, serializedParams, uri)
    }

    let promise = actionConfig.method === 'get' || actionConfig.method === 'delete'
                  ? axios[actionConfig.method](uri, { params: serializedParams })
                  : axios[actionConfig.method](uri, serializedParams)

    return callback
           ? promise.then(callback(context, params))
                    .catch(getDefaultErrorHandler(actionConfig.name, moduleConfig.resource))
           : promise
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

var actions = {}

resourceActions.forEach(actionConfig => {
    actions[actionConfig.name] = function (context, params = {})
    {
        return performActionWithCallback(actionConfig, context, params)
    }
})

export default actions
