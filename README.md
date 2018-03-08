# VuexResourceModules

A super-simple way to implement REST modules in Vuex. All
RESTful actions are defined out of the box, all returning axios
response Promises. If you API is well-behaved, little to no
configuration is needed. If not, lots of configuration options
let you control everything.

Convention over configuration!

## Example
```javascript
// widgets.js
import VuexResourceModule from `vuex-resource-modules`;

export default new VuexResourceModule('widget');


// store.js
import Vue from 'vue';
import Vuex from 'vuex';
import widgets from './widgets';
Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        widgets
    }
});


// app.js
import store from './store'

// GET /widgets/1
store.dispatch('widgets/find', {id: 1})

// GET /widgets
store.dispatch('widgets/findAll') 

// GET /widgets/2,3,4
store.dispatch('widgets/findMany', {ids: [2, 3, 4]}) 

// POST /widgets with {prop: 'value'}
store.dispatch('widgets/create', {prop: 'value'}) 

// PATCH /widgets/1,2 with {prop: 'value'}
store.dispatch('widgets/updateMany', {ids: [1, 2], prop: 'value'}) 

// and there's more!
```

## Configuration
The constructor for `VuexResourceModule` takes three arguments:
* `resource` (String; *required*) - the name of the resource in the URL
* `module` (Object; *optional*) - a Vuex module definition. All actions defined in this module (if any) will override the defaults from `VuexResourceModule`
* `config` (Object; *optional*) - a configuration object to change the default behaviors of `VuexResourceModule`


#### `module`
This should be an object suitable for use as a Vuex module, in the format:
```javascript
{
    namespaced,
    state,
    getters,
    mutations,
    actions,
    modules
}
```
If you don't specify `namespaced`, we default it to true. We add all of our default REST actions to `actions`, but we won't overwrite any that you provide. This way you can override any of the actions. We also add a `config` property to the `state`. We don't alter `getters` or `mutations`.

#### `config`
This is an object containing configurations that affect how `VuexResourceModule` behaves. You can modify its properties listed below to customize things to suit your needs.

**`prefix`** (String)  
any URL prefix you may need. For example, `{prefix: 'api/v1'}` would generate URLs like `/api/v1/widgets`

**`uriProvider`** (Function)  
a function that takes three arguments: 
* `actionName` (ie, `findAll` or `updateMany`)
* `params` as passed into the `dispatch()` call
* `config` (ie this object)
For example:
```js
const uriProvider = function (actionName, params, config)
{
    if (actionName === 'find') {
        return '/widget/' + params.slug
    }
    // ...
}
```

**`callbacks`** (Object)  
Allows you to configure how the responses are processed. This is
an object whose property names are action names (ie, `findAll` or `updateMany`) and whose values are functions. Each function receives the same arguments as Vuex actions and must return a callback suitable for being passed to `.then()`.  For example:
```js
const insertOrUpdateManyWidgetsCallback = (context, params) => {
    return response => {
        context.commit('insertOrUpdateManyWidgets', response.widgets, {root: true})
        return response
    }
}
const callbacks = {
    findMany: insertOrUpdateManyWidgetsCallback,
    findAll: insertOrUpdateManyWidgetsCallback,
    updateMany: insertOrUpdateManyWidgetsCallback,
    deleteMany: ({commit}, params) => response =>
    {
        commit('removeManyWidgets', params.ids, {root: true})
        return response
    }
}
```

**`serializers`** (Object)  
Allows you to configure how the input parameters are processed before being included in the request. This is an object whose property names are action names (ie, `findAll` or `updateMany`) and whose values are functions. Each function receives the input parameters as their only argument and must return an object suitable for being included in the request.  
In addition to the action serializers, you may also define serializers for `default`, `one` and `many`. If an action serializer is defined (for example: `{serializers: {findAll: data => ...}}`), then it will be used for that action. If there is no action serializer defined, then the appropriate `one` or `many` serializer will be used. (`one` is used for single resource requests: `create`, `update`, etc, while `many` is used for multi-resource requests: `createMany`, `updateMany`, etc). If none of these are defined, the `default` serializer will be used. You may define your own `default` serializer. If you don't, we provide one that simply removes `id` and `ids` from the input parameters.


# Another (More or Less Real) Example
```js
import VuexResourceModule from 'vuex-resource-modules'
import sortBy from 'lodash/sortBy'
import route from '../../../route'


const uriProvider = function (actionName, params, config)
{
    if (actionName === 'findMany') {
        return route('api.widgets.show', { widgets: params.ids.join(',') })
    }
    if (actionName === 'update') {
        return route('api.planting.update', { planting: params.id })
    }
    if (actionName === 'updateMany') {
        return route('api.widgets.update', { widgets: params.ids.join(',') })
    }
    if (actionName === 'deleteMany') {
        return route('api.widgets.delete', { widgets: params.ids.join(',') })
    }
}


const insertOrUpdateManyWidgetsCallback = ({commit}, params) => response =>
{
    if (process.env.NODE_ENV === 'development') {
        console.log(`updating ${response.data.widgets.length} widgets and ${response.data.actions.length} actions`)
    }
    commit('insertOrUpdateManyCropActions', response.data.actions, { root: true })
    commit('insertOrUpdateManywidgets', response.data.widgets, { root: true })
    return response
}


const callbacks = {
    findMany: insertOrUpdateManyWidgetsCallback,
    findAll: insertOrUpdateManyWidgetsCallback,
    updateMany: insertOrUpdateManyWidgetsCallback,
    deleteMany: ({commit}, params) => response =>
    {
        commit('removeManywidgets', params.ids, {root: true})
        commit('setSelectedIds', [], {root: true})
        return response
    },
}

const state = {}
const getters = {}
const mutations = {}
const actions = {


    findAllUpdated ({ dispatch, rootState }, params = {})
    {
        var mostRecent = sortBy(rootState.widgets, ['updated_at']).pop()
        if (mostRecent) {
            params['updated-since'] = mostRecent.updated_at
        }
        return dispatch('findAll', params)
    },


    updateSelected ({ dispatch, rootState }, params = {})
    {
        params.ids = rootState.selectedIds

        return dispatch('updateMany', params)
    },


    deleteSelected ({ dispatch, rootState }, params = {})
    {
        params.ids = rootState.selectedIds

        return dispatch('deleteMany', params)
    },


    duplicateMany ({commit}, params)
    {
        var uri = route('api.widgets.copy',
                        {
                            widgets: params.ids.join(',')
                        })

        return axios.post(uri)
                    .then(insertOrUpdateManywidgetsCallback({commit}, params))
                    .then(response => {
                        commit('setSelectedIds', response.data.widgets.map(p => parseInt(p.id)), { root: true })
                        return response
                    })
                    
    },


    duplicateSelected ({dispatch, rootState})
    {
        return dispatch('duplicateMany', {ids: rootState.selectedIds})
    },
}


var module = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
    // modules: {}
}

var config = {
    uriProvider,
    callbacks
}

export default new VuexResourceModule('widgets', module, config)
```


## TODO
* if config.uriProvider doesn't generate a match, run it through the default one
* should be able to specify `callbacks` like we can `serializers`, with `default`, `one` and `many`
* consider adding normalizers, for processing responses before they're handed to the `.then()` callbacks
