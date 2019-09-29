var rule = require("../../../lib/rules/map");
var RuleTester = require("eslint").RuleTester;

var ruleTester = new RuleTester();

ruleTester.run('map', rule, {
    valid: [
        '_.map({ "a": 4, "b": 8 }, function(n) { return n*n; });',
        '_.map(1+2, function(n) { return n*n; });',
        '[1,2,3].map(function(n) { return n*n; });',
        'var obj = { "a": 4, "b": 8 }; _.map(obj, function(n) { return n*n; });',
        'var arr = [1,2,3]; arr.map(function(n) { return n*n; });',
        '_ = {}; _.map([4, 8], function(n) { return n*n; });'
    ],
    invalid: [
        {
            code: '_.map([4, 8], function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'lodashMapToNative'
                }
            ],
            output: '[4, 8].map(function(n) { return n*n; });'
        },
        {
            code: 'var arr = [1,2,3]; _.map(arr, function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'lodashMapToNative'
                }
            ],
            output: 'var arr = [1,2,3]; arr.map(function(n) { return n*n; });'
        },
        {
            code: 'function getArr() { return [1,2,3]; } _.map(getArr(), function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'lodashMapToNative'
                }
            ],
            output:
                `function getArr() { return [1,2,3]; } \nvar getArrResult = getArr();\nArray.isArray(getArrResult) ? getArrResult.map(function(n) { return n*n; }) : _.map(getArrResult, function(n) { return n*n; });`
        },
        {
            code: 'function getObj() { return { "a": 4, "b": 8 }; } _.map(getObj(), function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'lodashMapToNative'
                }
            ],
            output:
                `function getObj() { return { "a": 4, "b": 8 }; } \nvar getObjResult = getObj();\nArray.isArray(getObjResult) ? getObjResult.map(function(n) { return n*n; }) : _.map(getObjResult, function(n) { return n*n; });`
        },
        {
            code: 'function getArr() { return [1,2,3]; } var res = _.map(getArr(), function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'lodashMapToNative'
                }
            ],
            output:
                `function getArr() { return [1,2,3]; } var res = Array.isArray(getArr()) ? getArr().map(function(n) { return n*n; }) : _.map(getArr(), function(n) { return n*n; });`
        },
        {
            code: '_.map(1 || [], function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'lodashMapToNative'
                }
            ],
            output:
                `Array.isArray(1 || []) ? (1 || []).map(function(n) { return n*n; }) : _.map(1 || [], function(n) { return n*n; });`
        },
        {
            code: '_.map(1 + 2 === 3 ? [] : {}, function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'lodashMapToNative'
                }
            ],
            output:
                `Array.isArray(1 + 2 === 3 ? [] : {}) ? (1 + 2 === 3 ? [] : {}).map(function(n) { return n*n; }) : _.map(1 + 2 === 3 ? [] : {}, function(n) { return n*n; });`
        },
        {
            code: 'var res = {} || []; _.map(res, function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'lodashMapToNative'
                }
            ],
            output: 'var res = {} || []; Array.isArray(res) ? res.map(function(n) { return n*n; }) : _.map(res, function(n) { return n*n; });'
        },
        {
            code: '_.map([4, 8], function(n) { return n*n; }); _ = {}; _.map([4, 8], function(n) { return n*n; });',
            errors: [
                {
                    messageId: 'lodashMapToNative'
                }
            ],
            output: '[4, 8].map(function(n) { return n*n; }); _ = {}; _.map([4, 8], function(n) { return n*n; });'
        }
    ]
});
