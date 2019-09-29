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
            description: "replaces lodash _.map method with native map method where possible",
            category: "Best Practices",
            recommended: false
        },
        fixable: "code",
        schema: [],
        messages: {
            lodashMapToNative: 'Use native JavaScript map function'
        }
    },
    create: function(context) {
        const sourceCode = context.getSourceCode();
        let wasOverriden = false;
        let identifierType = '';

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Ищет объявление переменной (узла) и возвращает ее тип
         *
         * @param {ASTNode} node - проверяемый узел
         * @returns {string} возвращает тип узла
         */
        function getIdentifierType(node) {
            let scope = context.getScope(node);
            while (!scope.set.get(node.name)) {
                scope = scope.upper;
            }
            const variable = scope.set.get(node.name);
            for (let definition of variable.defs) {
                if (definition.name.name === node.name) {
                    return definition.node.init.type;
                }
            }
            return '';
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
         * Проверяет, нужен ли фикс для данного узла
         *
         * @param {ASTNode} node - проверяемый узел
         * @returns {boolean} `true`, если нужен
         */
        function needsFix(node) {
            identifierType = node.type === 'Identifier' ? getIdentifierType(node) : '';
            return node.type !== 'Literal' && node.type !== 'ObjectExpression' &&
                identifierType !== 'ObjectExpression' && node.type !== 'BinaryExpression';
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

        /**
         * Формирует код для фикса
         *
         * @param {ASTNode} node - проверяемый узел
         * @returns {string} - код для фикса
         */
        function getReplacementCode(node) {
            const [arg1, arg2] = node.arguments;
            const arr = sourceCode.getText(arg1);
            const cb = sourceCode.getText(arg2);
            // const originalCode = sourceCode.getText(node);

            let replacementCode = '';

            if (arg1.type === 'ArrayExpression' || identifierType === 'ArrayExpression') {
                replacementCode = `${arr}.map(${cb})`;
            } else if (arg1.type === 'LogicalExpression' || arg1.type === 'ConditionalExpression') {
                replacementCode = `Array.isArray(${arr}) ? (${arr}).map(${cb}) : _.map(${arr}, ${cb})`;
            } else if (arg1.type === 'CallExpression' && !isInVarDeclaration(node)) {
                const varName = `${arg1.callee.name}Result`;
                replacementCode = `\nvar ${varName} = ${arr};\nArray.isArray(${varName}) ? ${varName}.map(${cb}) : _.map(${varName}, ${cb})`;
            } else {
                replacementCode = `Array.isArray(${arr}) ? ${arr}.map(${cb}) : _.map(${arr}, ${cb})`;
            }
            return replacementCode;
        }

        return {
            AssignmentExpression(node) {
                if (node.left.name === '_') {
                    wasOverriden = true;
                }
            },
            MemberExpression(node) {
                const { parent } = node;
                const [ arg1 ] = parent.arguments;
                if (!wasOverriden && isLodashMapCall(node) && needsFix(arg1)) {
                    context.report({
                        node: parent,
                        messageId: 'lodashMapToNative',
                        fix: function(fixer) {
                            return fixer.replaceText(parent, getReplacementCode(parent));
                        }
                    });
                }
            }
        };
    }
};
