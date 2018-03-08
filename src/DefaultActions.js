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


export default {
    find (context, params)
    {
        return performActionWithCallback('find', 'get', params, context.state.config)
    },

    findAll (context, params = {})
    {
        return performActionWithCallback('findAll', 'get', params, context.state.config)
    },

    findMany (context, params)
    {
        return performActionWithCallback('findMany', 'get', params, context.state.config)
    },

    create (context, params)
    {
        return performActionWithCallback('create', 'post', params, context.state.config)
    },

    createMany (context, params)
    {
        return performActionWithCallback('createMany', 'post', params, context.state.config)
    },

    update (context, params)
    {
        return performActionWithCallback('update', 'patch', params, context.state.config)
    },

    updateMany (context, params)
    {
        return performActionWithCallback('updateMany', 'patch', params, context.state.config)
    },

    replace (context, params)
    {
        return performActionWithCallback('replace', 'put', params, context.state.config)
    },

    delete (context, params)
    {
        return performActionWithCallback('delete', 'get', params, context.state.config)
    },

    deleteMany (context, params)
    {
        return performActionWithCallback('deleteMany', 'get', params, context.state.config)
    },
}
