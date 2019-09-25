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
            map: 'Use native JavaScript map function'
        }
    },
    create: function(context) {
        function findProgram(node) {
            let { parent } = node;
             while (parent.type !== 'Program') {
                 parent = parent.parent;
             }
             return parent;

        }

        function isReturnValArray(program, nodeName) {
            let isArray = false;
            for (let elem of program.body) {
                if (elem.type === 'FunctionDeclaration') {
                    if (elem.id.name === nodeName) {
                        for (let item of elem.body.body) {
                            if (item.type === 'ReturnStatement') {
                                return item.argument.type === 'ArrayExpression';
                            }
                        }
                    }
                }
            }
            return isArray;
        }

        function isVarArray(node, nodeName) {
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

        function isArray(node) {
            if (node.type === 'ArrayExpression') {
                return true;
            } else if (node.type === 'Identifier') {
                return isVarArray(node, node.name);
            } else if (node.type === 'CallExpression') {
                return isReturnValArray(findProgram(node), node.callee.name);
            } else {
                return false;
            }
        }
        return {
            MemberExpression(node) {
                const { parent } = node;
                if (node.object.name === '_' && node.property.name === 'map' && isArray(parent.arguments[0])) {
                    context.report({
                        node: parent,
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
