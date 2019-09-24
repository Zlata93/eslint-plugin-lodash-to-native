/**
 * @fileoverview Rule to replace lodash _.map method with native map method where possible
 * @author Zlata Kotlova
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        type: "suggestion",

        docs: {
            description: "replace lodash _.map method with native map method where possible",
            category: "Best Practices",
            recommended: false,
            // url: "https://eslint.org/docs/rules/no-extra-semi" // My Documentation
        },
        fixable: "code",
        schema: [], // no options
        messages: {
            map: 'Use native JavaScript map function'
        }
    },
    create: function(context) {
        return {
            MemberExpression(node) {
                const parent = node.parent;
                if (node.object.name === '_' && node.property.name === 'map' && parent.arguments[0].type === 'ArrayExpression') {
                    context.report({
                        node,
                        messageId: 'map',
                        fix: function(fixer) {
                            // ._map(arr, cb) ==> arr.map(cb)
                            const sourceCode = context.getSourceCode();
                            const arr = sourceCode.getText(parent.arguments[0]);
                            const cb = sourceCode.getText(parent.arguments[1]);
                            return fixer.replaceText(parent, `${arr}.map(${cb})`);
                        }
                    });
                }
            }
        };
    }
};
