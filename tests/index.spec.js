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


    it('accepts custom callbacks', (done) => {
        // get single resource
        // build URI from config and input
        // calls a custom callback afterward
        let config = {
            callbacks: {
                find: jest.fn()
            }
        }

        let module = new VuexResourceModule('resources', {}, config)
        let store = new Vuex.Store(module)

        store.dispatch('find', {id: 1}).then(args => {
            expect(config.callbacks.find).toHaveBeenCalled()
            done()
        })
    })

})
