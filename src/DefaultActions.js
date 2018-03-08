import axios from 'axios'

const performActionWithCallback = function (actionName, method, params, config)
{
    let uri = config.uriProvider(actionName, params, config)
    let callback = config.callbacks[actionName]

    delete params.id
    delete params.ids

    let promise = method === 'get' || method === 'delete'
                  ? axios[method](uri)
                  : axios[method](uri, params)

    return callback ? promise.then(callback) : promise
}


const resourceActions = [
    {action: 'find',       method: 'get'},
    {action: 'findAll',    method: 'get'},
    {action: 'findMany',   method: 'get'},
    {action: 'create',     method: 'post'},
    {action: 'createMany', method: 'post'},
    {action: 'update',     method: 'patch'},
    {action: 'updateMany', method: 'patch'},
    {action: 'replace',    method: 'put'},
    {action: 'delete',     method: 'get'},
    {action: 'deleteMany', method: 'get'},
]

var actions = {}

resourceActions.forEach(val => {
    actions[val.action] = function (context, params = {})
    {
        return performActionWithCallback(val.action, val.method, params, context.state.config)
    }
})

export default actions
