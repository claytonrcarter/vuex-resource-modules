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

// in your "widgets" module, import vuex-resource-modules and then use
// VuexResourceModule constructor to create a "RESTful" vuex module with
// actions for `find`, `findAll`, etc.
import VuexResourceModule from `vuex-resource-modules`;
export default new VuexResourceModule('widget');


// store.js

// these are needed to setup a basic Vuex store
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

// now import your "widgets" module and add it to the store
import widgets from './widgets';
export default new Vuex.Store({
    modules: {
        widgets
    }
});


// app.js

// import your store (which includes the "widgets" module)
import store from './store'

// The store is ready to go, and you use all of the following actions:

// Send a GET request to /widgets/1
store.dispatch('widgets/find', {id: 1})

// Or a GET request to /widgets
store.dispatch('widgets/findAll') 

// This will GET /widgets/2,3,4
store.dispatch('widgets/findMany', {ids: [2, 3, 4]}) 

// How about a POST request to /widgets with data: {prop: 'value'}
store.dispatch('widgets/create', {prop: 'value'}) 

// Or a PATCH to /widgets/1,2 with {prop: 'value'}
store.dispatch('widgets/updateMany', {ids: [1, 2], prop: 'value'}) 

// and there's more!
```

`VuexResourceModule` defines the following actions. You can add to or override these as you please. See [Actions](#actions) for more information about each.
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
    * example: `store.dispatch('widgets/find', {id: 1})`
* `findAll` - GET `/widgets`
    * required: *none*
    * all input properties will be passed to axios as query parameters
    * example: `store.dispatch('widgets/findAll')`
* `findMany` - GET `/widgets/1,2,3` - accepts an object with an array of `ids`
    * required: `{ids: (array of int|string)}`
    * all other input properties will be passed to axios as query parameters
    * example: `store.dispatch('widgets/findMany', {ids: [2, 3, 4]})`
* `create` - POST `/widgets` - accepts an object with properties and values
    * required: *none*
    * all input properties will be passed to axios as request data
    * example: `store.dispatch('widgets/create', {title: '...', content: '...', tags: ['a tag', 'etc']})`
* `createMany` - POST `/widgets` - accepts an array of objects with properties and values
    * required: array of Objects
    * all inputs will be passed to axios as request data
    * example: `store.dispatch('widgets/createMany', [{...}, {...}, etc...])`
    * useful if your API can create multiple records at once
* `update` - PATCH `/widgets/1` or `/widgets/1,2,3` - accepts an `id` or `ids`
    * required: `{id: (int|string)}` or `{ids: (array of int|string)}`
    * all other input properties will be passed to axios as query parameters
    * example: `store.dispatch('widgets/update', {id: 1, key: 'new value'})`
    * example: `store.dispatch('widgets/update', {ids: [1, 2], key: 'new value'})`
    * useful if your API allows you to update a record, or update multiple records with the same data
* `updateMany` - PATCH `/widgets`
    * required: array of Objects
    * all inputs will be passed to axios as request data
    * example: `store.dispatch('widgets/updateMany', [{id: 1, key: 'new value'}, {id: 2, key: 'a different value'}])`
    * useful if your API allows you to update multiple records at the same time, each with different data. You would probably have to include an `id` or other identification with each Object
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
Subresources are inherently less configurable than regular resources. At present,
`prefix` and `serializers.default` will all be discarded from the subresource
configuration if they are encountered. (As well as several non-public API items.)

Furthermore, we will use the `uriProvider` of the **base** resource to generate
the URI prefix for it's subresources. Because of this, be careful how you use
`this` (if you do) in any custom uriProviders you define.


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
Allows you to configure how the responses are processed when axios is done with them. This is an object whose property names are action names (ie, `findAll` or `update`) and whose values are functions. Each function receives the same arguments as Vuex actions, as well as the name of the action and the VuexResourceModule config, and each function must return a callback suitable for being passed to `.then()`.  You can also specify `one`, `many` and `default` callbacks (see `serializers` FMI).  For example:
```js
const insertOrUpdateManyWidgetsCallback = (context, params, actionName, config) => {
    return response => {
        console.log(`Success in ${config.resource}/${actionName}!`) // => "Success in widgets/updateMany"
        context.commit('insertOrUpdateManyWidgets', response.widgets, {root: true})
        return response
    }
}
const thenCallbacks = {
    findMany: insertOrUpdateManyWidgetsCallback,
    findAll: insertOrUpdateManyWidgetsCallback,
    updateMany: insertOrUpdateManyWidgetsCallback,
    deleteMany: ({commit}, params, actionName, config) => {
        return response =>
        {
            commit('removeManyWidgets', params.ids, {root: true})
            return response
        }
    }
}
```


**`catchCallbacks`** (Object)  
Allows you to configure how error responses are processed when axios encounters them. This is an object whose property names are action names (ie, `findAll` or `update`) and whose values are functions. Each function receives the same arguments as the `thenCallbacks`, and each function must return a callback suitable for being passed to `.catch()`.  You can also specify `one`, `many` and `default` callbacks (see `serializers` FMI).
```js
const thenCallbacks = {
    update: ({commit}, params, actionName, config) => {
        return error =>
        {
            console.log(`Uh oh! Error in ${config.resource}/${actionName}!`)
        }
    }
}
```


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


**`debug`** (Boolean, default: false)  
Print some debugging statements.


**`logErrors`** (Boolean, default: true)  
Print error messages in the default catchCallback, even if `debug` is `false`


**`useGlobalAxios`** (Boolean, default: false)  
Use `window.axios` instead of importing axios directly from `node_modules`. This is useful
if you have setup any global axios configuration that you would like to use in 
this module.



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
In particular, there is is still some inconsistency with some of the action
conventions that may be subject to change.

## TODO
* the "Another Example" needs to illustrate more config options
* consider adding normalizers, for processing responses before they're handed to the `.then()` callbacks
