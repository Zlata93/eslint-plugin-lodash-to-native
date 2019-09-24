var rule = require("../../../lib/rules/map");
var RuleTester = require("eslint").RuleTester;

var ruleTester = new RuleTester();

ruleTester.run('map', rule, {
    valid: [
        '_.map({ \'a\': 4, \'b\': 8 }, function(n) { return n*n; });',
        '[1,2,3].map(function(n) { return n*n; });'
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
        }
    ]
});
