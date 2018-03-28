module.exports = {
    "extends": "standard",
    globals: {
	    "axios": true,
        'jest': true,
        'describe': true,
        'fdescribe': true,
        'it': true,
        'fit': true,
        'expect': true,
        'beforeEach': true,
        'afterEach': true,
        'afterAll': true,
    },
    rules: {
        "brace-style": ["off", "allman", { "allowSingleLine": true }],
        "indent": ["warn", 4, { 'ObjectExpression': 'first',
                                 'ArrayExpression': 'first',
                                 'CallExpression': { arguments: 'first'},
                                 'MemberExpression': 'off',
                                 "ignoredNodes": ["ConditionalExpression"]
                               }],
        "key-spacing": ["error", { "mode": "minimum" }],
        "comma-dangle": ["warn", "only-multiline"],
        "space-unary-ops": ["warn", { "overrides": { "!": true, "!!": true }}],
        "padded-blocks": "off",
        "no-multiple-empty-lines": ["warn", {"max": 2}],
        // "operator-linebreak": ["error", "after", { "overrides": { "||": "before", "&&": "before" } }],
        "no-multi-spaces": ["warn", { ignoreEOLComments: true }],
    },
};
