import VuexResourceModule from '../src'
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
Vue.config.productionTip = false

jest.mock('axios')


describe('Vuex Resource Module', () => {

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


    it('returns a module with the resource actions', () => {
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


    it('builds uris from the resource name', (done) => {
        let module = new VuexResourceModule('resources')
        let store = new Vuex.Store(module)

        store.dispatch('find', {id: 1}).then(args => {
            expect(args.url).toBe('/resources/1')
            done()
        })
    })


    it('accepts config', (done) => {
        let config = {
            prefix: 'prefix'
        }
        let module = new VuexResourceModule('resources', {}, config)
        let store = new Vuex.Store(module)

        store.dispatch('findAll').then(args => {
            expect(args.url).toBe('/prefix/resources')
            done()
        })
    })


    describe('URIs', () => {

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


    describe('serializers', () => {

        var config = {
            serializers: {
                default: jest.fn(),
                create: jest.fn(),
                one: jest.fn(),
            }
        }

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

            jest.resetAllMocks()

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

            jest.resetAllMocks()

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

        it('creates URIs for nested resources', (done) => {
            let subresources = new VuexResourceModule('subresources')
            let resources = new VuexResourceModule('resources', {modules: {subresources}})

            let store = new Vuex.Store(resources)
            store.dispatch('subresources/find', {id: 1, subresource_id: 2}).then(args => {
                expect(args.url).toBe('/resources/1/subresources/2')
                done()
            })
        })

    })


})
