export default {
    get (url)
    {
        return Promise.resolve({url})
    },

    post (url, params)
    {
        return Promise.resolve({url, params})
    },

    patch (url, params)
    {
        return Promise.resolve({url, params})
    },

    put (url, params)
    {
        return Promise.resolve({url, params})
    },

    delete (url)
    {
        return Promise.resolve({url})
    }
}
