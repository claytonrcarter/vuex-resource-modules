import VuexResourceModule from '../src'
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
Vue.config.productionTip = false

jest.mock('axios')
var axios = require('axios')

describe('Vuex Resource Module', () => {

    beforeEach(() => {
        jest.resetModules()
    })

    it('returns a valid Vuex module', () => {
        let module = new VuexResourceModule('')
        expect(module.state).toBeDefined()
        expect(module.getters).toBeDefined()
        expect(module.mutations).toBeDefined()
        expect(module.actions).toBeDefined()
    })


    it('allows you to provide your own module state', () => {
        let input = {state: { prop: 'value' }}
        let module = new VuexResourceModule('', input)
        expect(module.state.prop).toBe('value')
    })


    describe('actions', () => {

        it('returns a module with all the resource actions', () => {
            let module = new VuexResourceModule('')
            expect(module.actions.find).toBeDefined()
            expect(module.actions.findAll).toBeDefined()
            expect(module.actions.findMany).toBeDefined()
            expect(module.actions.create).toBeDefined()
            expect(module.actions.createMany).toBeDefined()
            expect(module.actions.update).toBeDefined()
            expect(module.actions.updateMany).toBeDefined()
            expect(module.actions.replace).toBeDefined()
            expect(module.actions.delete).toBeDefined()
            expect(module.actions.deleteMany).toBeDefined()
        })


        it('creates only the actions you specify via `only`', () => {
            let module = new VuexResourceModule('', {}, {only: ['find', 'delete']})

            expect(module.actions.find).toBeDefined()
            expect(module.actions.delete).toBeDefined()

            expect(module.actions.findAll).not.toBeDefined()
            expect(module.actions.updateMany).not.toBeDefined()
        })


        it('doesnt create actions you specify via `except`', () => {
            let module = new VuexResourceModule('', {}, {except: ['find', 'delete']})

            expect(module.actions.find).not.toBeDefined()
            expect(module.actions.delete).not.toBeDefined()

            expect(module.actions.findAll).toBeDefined()
            expect(module.actions.updateMany).toBeDefined()
        })


        it('the resource actions return promises', (done) => {
            let module = new VuexResourceModule('')
            let store = new Vuex.Store(module)

            store.dispatch('findAll').then(args => {
                expect(true).toBeTruthy()
                done()
            })
        })


        it('allows you to provide your own module actions', (done) => {
            let module = new VuexResourceModule(
                '',
                {
                    actions: {
                        find () {
                            expect(true).toBeTruthy()
                            done()
                        }
                    }
                })
            let store = new Vuex.Store(module)
            store.dispatch('find')
        })

    })


    describe('URIs', () => {

        it('builds uris from the resource name', (done) => {
            let module = new VuexResourceModule('resources')
            let store = new Vuex.Store(module)

            store.dispatch('find', {id: 1}).then(args => {
                expect(args.url).toBe('/resources/1')
                done()
            })
        })


        it('uses prefixes', (done) => {
            let config = { prefix: 'prefix' }
            let module = new VuexResourceModule('resources', {}, config)
            let store = new Vuex.Store(module)

            store.dispatch('findAll').then(args => {
                expect(args.url).toBe('/prefix/resources')
                done()
            })
        })

        it('can override the default URI provider', (done) => {
            let config = {
                uriProvider: (actionName, params, config) => {
                    if (actionName === 'findAll') {
                        return 'fake-uri'
                    }
                }
            }
            let module = new VuexResourceModule('resources', {}, config)
            let store = new Vuex.Store(module)

            store.dispatch('findAll').then(args => {
                expect(args.url).toBe('fake-uri')
                done()
            })
        })


        it('falls back to default URI provider if no match is returned by custom provider', (done) => {
            let config = {
                uriProvider: (actionName, params, config) => {
                    if (actionName === 'findAll') {
                        return 'fake-uri'
                    }
                }
            }
            let module = new VuexResourceModule('resources', {}, config)
            let store = new Vuex.Store(module)

            store.dispatch('create').then(args => {
                expect(args.url).not.toBe('fake-uri')
                expect(args.url).toBe('/resources')
                done()
            })
        })

    })


    describe('callbacks', () => {

        it('accepts custom callbacks', (done) => {
            let mock = jest.fn()
            let config = {
                callbacks: {
                    find: () => response => mock()
                }
            }

            let module = new VuexResourceModule('', {}, config)
            let store = new Vuex.Store(module)

            store.dispatch('find', {id: 1}).then(args => {
                expect(mock).toHaveBeenCalled()
                done()
            })
        })

    })


    describe('error callbacks', () => {

        it('accepts custom error callbacks', (done) => {

            axios.default.get
                 .mockImplementationOnce(url => Promise.reject(new Error(url)))

            let mock = jest.fn()
            let config = {
                catchCallbacks: {
                    find: (defaultCatchCallback) => error => mock()
                }
            }

            let module = new VuexResourceModule('', {}, config)
            let store = new Vuex.Store(module)

            store.dispatch('find', {id: 1})

            setTimeout(() => {
                expect(mock).toHaveBeenCalled()
                done()
            }, 0)
        })

    })


    describe('serializers', () => {

        var config

        beforeEach(() => {
            config = {
                serializers: {
                    default: jest.fn(),
                    create: jest.fn(),
                    one: jest.fn(),
                }
            }
        })

        it('uses default serializer if nothing more specific is defined', (done) => {

            let module = new VuexResourceModule('', {}, config)
            let store = new Vuex.Store(module)

            store.dispatch('createMany', {prop: 'value'}).then(args => {
                expect(config.serializers.default).toHaveBeenCalled()
                expect(config.serializers.one).not.toHaveBeenCalled()
                expect(config.serializers.create).not.toHaveBeenCalled()
                done()
            })
        })


        it('uses action serializer if defined', (done) => {


            let module = new VuexResourceModule('', {}, config)
            let store = new Vuex.Store(module)

            store.dispatch('create', {prop: 'value'}).then(args => {
                expect(config.serializers.create).toHaveBeenCalled()
                expect(config.serializers.default).not.toHaveBeenCalled()
                expect(config.serializers.one).not.toHaveBeenCalled()
                done()
            })
        })


        it('uses singule/plural serializer if nothing more specific is defined', (done) => {

            let module = new VuexResourceModule('', {}, config)
            let store = new Vuex.Store(module)

            store.dispatch('update', {prop: 'value'}).then(args => {
                expect(config.serializers.one).toHaveBeenCalled()
                expect(config.serializers.create).not.toHaveBeenCalled()
                expect(config.serializers.default).not.toHaveBeenCalled()
                done()
            })
        })

    })


    describe('nested resources', () => {

        it('doest do anything to regular submodules', () => {
            let resources = new VuexResourceModule('resources', {modules: {submodule: {state: {}}}})

            expect(resources.modules.submodule.state.config).not.toBeDefined()
            expect(resources.modules.submodule instanceof VuexResourceModule).not.toBeTruthy()
        })

        it('recognizes nested resources', () => {
            let subresources = new VuexResourceModule('subresourcess')
            let resources = new VuexResourceModule('resources', {modules: {subresources}})

            expect(resources.modules.subresources.state.config).toBeDefined()
            expect(resources.modules.subresources instanceof VuexResourceModule).toBeTruthy()
        })

        it('builds uris from the resource name', (done) => {
            let module = new VuexResourceModule('resources')
            let store = new Vuex.Store(module)

            store.dispatch('find', {id: 1}).then(args => {
                expect(args.url).toBe('/resources/1')
                done()
            })
        })

        it('creates URIs for nested resources', (done) => {
            let subresources = new VuexResourceModule('subresources')
            let resources = new VuexResourceModule('resources', {modules: {subresources}})

            let store = new Vuex.Store(resources)
            store.dispatch('subresources/find', {id: 1, subresource_id: 2})
                 .then(args => {
                     expect(args.url).toBe('/resources/1/subresources/2')
                     done()
                 })
        })

    })


})
