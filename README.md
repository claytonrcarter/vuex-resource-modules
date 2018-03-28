# VuexResourceModules

A super-simple way to implement REST modules in Vuex. All
RESTful actions are defined out of the box, all returning axios
response Promises. 

Convention over configuration! If your API is well-behaved, little to no
configuration is needed. If not, lots of configuration options
let you control everything.

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

`VuexResourceModule` defines the following actions. You can add to or override these as you please.
* `find`
* `findAll`
* `findMany`
* `create`
* `createMany`
* `update`
* `updateMany`
* `replace`
* `delete`
* `deleteMany`

(These are based on the APIs of Ember.Data, JS-Data and Eloquent.)



## Installation

Install:
```sh
npm install --save vuex-resource-modules
```

Test:
```sh
npm run test
```

Use:
```js
import VuexResourceModule from `vuex-resource-modules`;
// or
const VuexResourceModule = require(`vuex-resource-modules`);

// then ...
export default new VuexResourceModule('resource');

// or
const module = { /* ... */ }
const config = { /* ... */ }
export default new VuexResourceModule('resource', module, config);
```


## Actions
All actions accepts a single parameter, just like all Vuex actions. (eg `dispatch('find', {id: 1})`) Except where noted, we assume that it will be an object literal whose properties and values are the request parameters and/or data body.

* `find` - GET `/widgets/1`
    * required: `{id: (int|string)}`
    * all other input properties will be passed to axios as query parameters
* `findAll` - GET `/widgets`
    * required: *none*
    * all input properties will be passed to axios as query parameters
* `findMany` - GET `/widgets/1,2,3` - accepts an object with an array of `ids`
    * required: `{ids: (array of int|string)}`
    * all other input properties will be passed to axios as query parameters
* `create` - POST `/widgets` - accepts an object with properties and values
    * required: *none*
    * all input properties will be passed to axios as request data
* `createMany` - POST `/widgets` - accepts an array of objects with properties and values
    * required: array of Object
    * all inputs will be passed to axios as request data
* `update` - PATCH `/widgets/1` or `/widgets/1,2,3` - accepts an `id`
    * required: `{id: (int|string)}` or `{ids: (array of int|string)}`
    * all other input properties will be passed to axios as query parameters
* `updateMany` - PATCH `/widgets`
    * required: array of Object
    * all inputs will be passed to axios as request data
* `replace` - PUT `/widgets/1`
    * required: `{id: (int|string)}`
    * all other input properties will be passed to axios as query parameters
* `delete` - DELETE `/widgets/1`
    * required: `{id: (int|string)}`
    * all other input properties will be passed to axios as query parameters
* `deleteMany` - DELETE `/widgets/1,2,3`
    * required: `{ids: (array of int|string)}`
    * all other input properties will be passed to axios as query parameters


## Use
The constructor for `VuexResourceModule` takes three arguments:
* `resource` (String; *required*) - the name of the resource in the URL
* `module` (Object; *optional*) - a Vuex module definition. All actions defined in this module (if any) will override the defaults from `VuexResourceModule`
* `config` (Object; *optional*) - a configuration object to change the default behavior of `VuexResourceModule`


#### `resource`
The name of the resource you are using.

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
See the Vuex docs (https://vuex.vuejs.org/en/modules.html) for more info.  
If you don't specify `namespaced`, we default it to true. We add all of our default 
REST actions to `actions`, but we won't overwrite any that you provide so that you 
can override any of them. We also add a `config` property to the `state`. We 
don't alter `getters` or `mutations`.

#### `config`
This is an object containing configurations that affect how `VuexResourceModule` 
behaves. You can modify its properties listed below to customize things to suit 
your needs.


## Nested Resources
Any submodules defined in the input Vuex module that are themselves 
`VuexResourceModule`s will be automatically converted into nested resource 
modules. A nested resource module will define all of the normal actions but will
create URIs based off of the primary resource. The input parameters for the 
actions will use `id` and `ids` to refer to the primary resource, and (eg)
`subresource_id` and `subresource_ids` to refer to the subresources. For example:
```js
let subresources = new VuexResourceModule('subresourcess')
let resources = new VuexResourceModule('resources', {modules: {subresources}})
let store = new Vuex.Store(resources)

// GET /resources/1/subresources/2
store.dispatch('resources/subresources/find', {id: 1, subresource_id: 2})
```

#### Nested Resource Caveats
Custom `uriProvider`s w/i nested resource modules might be difficult to get right.
If you plan to provide a custom `uriProvider` to a nested module, you will have 
to make careful use of `this` if you want the automatic prefixing to work, and it 
might be easier to just return the full URI.


## Configuration
The following properties of the `config` object are recognized.

**`prefix`** (String)  
any URL prefix you may need. For example, `{prefix: 'api/v1'}` would generate URLs like `/api/v1/widgets`

**`uriProvider`** (Function)  
A function that takes three arguments and returns a URI (as a String). If nothing
is matched (the function returns `undefined`), then we will run it through the
default `uriProvider`. This allows you define your own URIs on an action-by-action
basis, while still using the defaults.
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

**`thenCallbacks`** (Object)  
Allows you to configure how the responses are processed when axios is done with them. This is an object whose property names are action names (ie, `findAll` or `update`) and whose values are functions. Each function receives the same arguments as Vuex actions and must return a callback suitable for being passed to `.then()`.  You can also specify `one`, `many` and `default` callbacks (see `serializers` FMI).  For example:
```js
const insertOrUpdateManyWidgetsCallback = (context, params) => {
    return response => {
        context.commit('insertOrUpdateManyWidgets', response.widgets, {root: true})
        return response
    }
}
const thenCallbacks = {
    findMany: insertOrUpdateManyWidgetsCallback,
    findAll: insertOrUpdateManyWidgetsCallback,
    updateMany: insertOrUpdateManyWidgetsCallback,
    deleteMany: ({commit}, params) => {
        return response =>
        {
            commit('removeManyWidgets', params.ids, {root: true})
            return response
        }
    }
}
```


**`catchCallbacks`** (Object)  
Allows you to configure how error responses are processed when axios encounters them. This is an object whose property names are action names (ie, `findAll` or `update`) and whose values are functions. Each function receives the arguments `actionName`, `resourceName`, `defaultCatchCallback`.  You can also specify `one`, `many` and `default` callbacks (see `serializers` FMI).


**`serializers`** (Object)  
Allows you to configure how the input parameters are processed before being included in the request. This is an object whose property names are action names (ie, `findAll` or `updateMany`) and whose values are functions. Each function receives the input parameters as their only argument and must return an object suitable for being included in the request.  
In addition to the action serializers, you may also define serializers for `default`, `one` and `many`. If an action serializer is defined (for example: `{serializers: {findAll: data => ...}}`), then it will be used for that action. If there is no action serializer defined, then the appropriate `one` or `many` serializer will be used. (`one` is used for single resource requests: `create`, `update`, etc, while `many` is used for multi-resource requests: `createMany`, `updateMany`, etc). If none of these are defined, the `default` serializer will be used. You may define your own `default` serializer. If you don't, we provide one that simply removes `id` and `ids` from the input parameters.


**`only`** (Array of Strings)  
If included, only the specified actions will be defined. For example:
```js
// only `widgets/find` and `widgets/delete` will be defined
new VuexResourceModule('widgets', {}, {only: ['find', 'delete']});
```


**`except`** (Array of Strings)  
If included, all actions except those specified will be defined. For example:
```js
// everything except `widgets/find` and `widgets/delete` will be defined
new VuexResourceModule('widgets', {}, {except: ['find', 'delete']});
```


# Another Example
This might be a bit long and involved, but provides a more or less real world use case as an example.
```js
import VuexResourceModule from 'vuex-resource-modules'
import sortBy from 'lodash/sortBy'


const actions = {

    // GET /widgets?updated-since=...
    findAllUpdated ({ dispatch, rootState }, params = {})
    {
        var mostRecent = sortBy(rootState.widgets, ['updated_at']).pop()
        if (mostRecent) {
            params['updated-since'] = mostRecent.updated_at
        }
        return dispatch('findAll', params)
    },


    // update "selected" widgets, using ids from root store
    updateSelected ({ dispatch, rootState }, params = {})
    {
        params.ids = rootState.selectedIds

        return dispatch('updateMany', params)
    },


    // delete "selected" widgets, using ids from root store
    deleteSelected ({ dispatch, rootState }, params = {})
    {
        params.ids = rootState.selectedIds

        return dispatch('deleteMany', params)
    },


    // a custom action not handled or provided by VuexResourceModules
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

}


var module = { actions }

export default new VuexResourceModule('widgets', module)
```

## Caveats
This is still very much a work in progress and should be used at your own risk.
In particular, `createMany` and `updateMany` still need some testing and usage.

## TODO
* the "Another Example" needs to illustrate more config options
* consider adding normalizers, for processing responses before they're handed to the `.then()` callbacks
