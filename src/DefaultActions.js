import axios from 'axios'

export default {
    find (context, params = {})
    {
        delete params.ids
        return context.dispatch('findMany', {ids: [params.id], ...params})
    },

    findAll (context, params)
    {},

    findMany (context, params = {})
    {
        return axios.get(context.state.vuexConfig.uri)
    },

    create (context, params)
    {},

    createMany (context, params)
    {},

    update (context, params)
    {},

    updateMany (context, params)
    {},

    replace (context, params)
    {},

    delete (context, params)
    {},

    deleteMany (context, params)
    {},
}
