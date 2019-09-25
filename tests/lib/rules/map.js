var rule = require("../../../lib/rules/map");
var RuleTester = require("eslint").RuleTester;

var ruleTester = new RuleTester();

ruleTester.run('map', rule, {
    valid: [
        '_.map({ \'a\': 4, \'b\': 8 }, function(n) { return n*n; });',
        '[1,2,3].map(function(n) { return n*n; });',
        'var obj = { \'a\': 4, \'b\': 8 }; _.map(obj, function(n) { return n*n; });',
        'function getObj() { return { \'a\': 4, \'b\': 8 } } _.map(getObj(), function(n) { return n*n; });'
    ],
    invalid: [
        {
            code: '_.map([4, 8], function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'map'
                }
            ],
            output: '[4, 8].map(function(n) { return n*n; });'
        },
        {
            code: 'var arr = [1,2,3]; _.map(arr, function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'map'
                }
            ],
            output: 'var arr = [1,2,3]; arr.map(function(n) { return n*n; });'
        },
        {
            code: 'function getArr() { return [1,2,3] } _.map(getArr(), function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'map'
                }
            ],
            output: 'function getArr() { return [1,2,3] } getArr().map(function(n) { return n*n; });'
        }
    ]
});
