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

    it('accepts a Vuex module as input', () => {
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

        store.dispatch('find').then(args => {
            expect(true).toBeTruthy()
            done()
        })
    })

    it('builds uris from the resource name', (done) => {
        let module = new VuexResourceModule('resources')
        let store = new Vuex.Store(module)

        store.dispatch('find').then(args => {
            expect(args.url).toBe('/resources')
            done()
        })
    })

})
