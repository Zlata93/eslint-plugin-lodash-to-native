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
        let wasOverriden = false;

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Ищет объявление переменной (узла) и проверяет, является ли переменная массивом
         *
         * @param {ASTNode} node - проверяемый узел
         * @param {string} nodeName - имя переменной
         * @returns {boolean} `true`, если узел является массивом
         */
        function isIdentifierArray(node, nodeName) {
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

        /**
         * Проверяет, является ли тип узла вызовом функции
         *
         * @param {ASTNode} node - проверяемый узел
         * @returns {boolean} `true`, если является
         */
        function isTypeToWrap(node) {
            return node.type === 'CallExpression';
        }

        /**
         * Проверяет, находится ли узел внутри объявления переменной
         * (по сути нужно затем, чтобы понять, присваивается ли результат
         * вызова map переменной)
         *
         * @param {ASTNode} node - проверяемый узел
         * @returns {boolean} `true`, если является
         */
        function isInVarDeclaration(node) {
            return node.parent.type === 'VariableDeclarator';
        }

        /**
         * Проверяет, является ли тип узла переменной и является ли переменная массивом
         *
         * @param {ASTNode} node - проверяемый узел
         * @returns {boolean} `true`, если является
         */
        function isArrayIdentifier(node) {
            return node.type === 'Identifier' && isIdentifierArray(node, node.name);
        }

        /**
         * Проверяет, нужен ли фикс для данного узла
         *
         * @param {ASTNode} node - проверяемый узел
         * @returns {boolean} `true`, если является
         */
        function needsFix(node) {
            return node.type === 'ArrayExpression' || isTypeToWrap(node) || isArrayIdentifier(node);
        }

        /**
         * Проверяет, является ли выражение вызовом метода _.map
         *
         * @param {ASTNode} node - проверяемый узел
         * @returns {boolean} `true`, если является
         */
        function isLodashMapCall(node) {
            return node.object.name === '_' && node.property.name === 'map' && node.parent.arguments.length === 2
        }

        return {
            AssignmentExpression(node) {
                if (node.left.name === '_') {
                    wasOverriden = true;
                }
            },
            MemberExpression(node) {
                const { parent } = node;
                const [ arg1, arg2 ] = parent.arguments;
                if (!wasOverriden && isLodashMapCall(node) && needsFix(arg1)) {
                    context.report({
                        node: parent,
                        messageId: 'lodashMapToNative',
                        fix: function(fixer) {
                            const sourceCode = context.getSourceCode();
                            const arr = sourceCode.getText(arg1);
                            const cb = sourceCode.getText(arg2);
                            const originalCode = sourceCode.getText(parent);
                            if (isTypeToWrap(arg1)) {
                                if (isInVarDeclaration(parent)) {
                                    return fixer.replaceText(
                                        parent, `Array.isArray(${arr}) ? ${arr}.map(${cb}) : ${originalCode}`
                                    );
                                }
                                return fixer.replaceText(
                                    parent,
                                    `\nvar ${arg1.callee.name}Result = ${arr};\nArray.isArray(${arg1.callee.name}Result) ? ${arg1.callee.name}Result.map(${cb}) : _.map(${arg1.callee.name}Result, ${cb})`
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
