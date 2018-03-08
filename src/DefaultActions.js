import axios from 'axios'

const performActionWithCallback = function (actionConfig, params, moduleConfig)
{
    let uri = moduleConfig.uriProvider(actionConfig.name, params, moduleConfig)
    let callback = moduleConfig.callbacks[actionConfig.name]
    let serialize = moduleConfig.serializers[actionConfig.name] ||
                    moduleConfig.serializers[actionConfig.single ? 'one' : 'many'] ||
                    moduleConfig.serializers.default
    let normalize = moduleConfig.normalizers[actionConfig.name] ||
                    moduleConfig.normalizers[actionConfig.single ? 'one' : 'many'] ||
                    moduleConfig.normalizers.default

    params = serialize(params)

    let promise = actionConfig.method === 'get' || actionConfig.method === 'delete'
                  ? axios[actionConfig.method](uri)
                  : axios[actionConfig.method](uri, params)

    return callback ? promise.then(callback) : promise
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
    {name: 'delete',     method: 'get',   single: true},
    {name: 'deleteMany', method: 'get',   single: false},
]

var actions = {}

resourceActions.forEach(actionConfig => {
    actions[actionConfig.name] = function (context, params = {})
    {
        return performActionWithCallback(actionConfig, params, context.state.config)
    }
})

export default actions
