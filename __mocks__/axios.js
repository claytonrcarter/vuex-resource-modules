export default {
    get:    jest.fn(url => Promise.resolve({url})),
    post:   jest.fn((url, params) => Promise.resolve({url, params})),
    patch:  jest.fn((url, params) => Promise.resolve({url, params})),
    put:    jest.fn((url, params) => Promise.resolve({url, params})),
    delete: jest.fn(url => Promise.resolve({url}))
}
