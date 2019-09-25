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

        function isVarArray(program, varName) {
            let isArray = false;
            program.body.forEach(elem => {
                if (elem.type === 'VariableDeclaration') {
                    elem.declarations.forEach(declaration => {
                        if (declaration.type === 'VariableDeclarator' && declaration.id.name === varName) {
                            isArray = declaration.init.type === 'ArrayExpression';
                        }
                    })
                }
            });
            return isArray;
        }

        function isReturnValArray(program, varName) {
            let isArray = false;
            program.body.forEach(elem => {
                if (elem.type === 'FunctionDeclaration') {
                    if (elem.id.name === varName) {
                        elem.body.body.forEach(item => {
                            if (item.type === 'ReturnStatement') {
                                isArray = item.argument.type === 'ArrayExpression';
                            }
                        });
                    }
                }
            });
            return isArray;
        }

        function isArray(node) {
            if (node.type === 'ArrayExpression') {
                return true;
            } else if (node.type === 'Identifier') {
                return isVarArray(findProgram(node), node.name);
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
                            return fixer.replaceText(parent, parent.type === 'Identifier' ? `Array.isArray(${arr}) ? ${arr}.map(${cb}) : ${sourceCode.getText(parent)}` : `${arr}.map(${cb})`);
                        }
                    });
                }
            }
        };
    }
};
