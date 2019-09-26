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
        schema: [],
        messages: {
            lodashMapToNative: 'Use native JavaScript map function'
        }
    },
    create: function(context) {
        function isArray(node, nodeName) {
            let isArray = false;
            let scope = context.getScope(node);
            while (!scope.set.get(node.name)) {
                scope = scope.upper;
            }
            const variable = scope.set.get(node.name);
            for (let definition of variable.defs) {
                if (definition.name.name === nodeName) {
                    return definition.node.init.type === 'ArrayExpression';
                }
            }
            return isArray;
        }

        function needsFix(node) {
            return node.type === 'ArrayExpression' || node.type === 'CallExpression' || (node.type === 'Identifier' && isArray(node, node.name));
        }
        return {
            MemberExpression(node) {
                const { parent } = node;
                const arg1 = parent.arguments[0];
                if (node.object.name === '_' && node.property.name === 'map' && parent.arguments.length === 2 && needsFix(arg1)) {
                    context.report({
                        node: parent,
                        messageId: 'lodashMapToNative',
                        fix: function(fixer) {
                            const sourceCode = context.getSourceCode();
                            const arr = sourceCode.getText(parent.arguments[0]);
                            const cb = sourceCode.getText(parent.arguments[1]);
                            if (arg1.type === 'CallExpression') {
                                return fixer.replaceText(
                                    parent,
                                    `\nvar ${arg1.callee.name}Result = ${arg1.callee.name}();\nArray.isArray(${arg1.callee.name}Result) ? ${arg1.callee.name}Result.map(${cb}) : _.map(${arg1.callee.name}Result, ${cb})`
                                );
                            }
                            return fixer.replaceText(parent, `${arr}.map(${cb})`);
                        }
                    });
                }
            }
        };
    }
};
