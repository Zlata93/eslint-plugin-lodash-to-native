# eslint-plugin-lodash-to-native
Плагин для eslint, который заменяет метод map из библиотеки lodash на нативную функцию map

## Установка и Подключение
* установить в проект eslint `npm i --save-dev eslint`
* установить данный плагин `npm i --save-dev https://github.com/Zlata93/eslint-plugin-lodash-to-native.git`
* в конфиге eslint - `.eslintrc.js` - подключить плагин:
```javascript
"plugins": [
  "lodash-to-native"
],
"rules": {
  "lodash-to-native/map": "warn"
},
```

## Описание функционала
* Если при вызове явно указан литерал массива, то плагин заменяет лодэшовский вызов map на нативный:
```javascript
_.map([1, 2, 3], fn)
```
заменяется на
```js
[1, 2, 3].map(fn)
```
* Если при вызове передана переменная, которая объявлена в этом же файле и является массивом, то замена происходит так же, без проверки.
* Если в качестве первого аргумента передан вызов функции и результат вызова map не присваивается в переменную (не стоит справа от знака "="), то замена просиходит сследующим образом:
```javascript
_.map(someFunc(), fn)
```
заменяется на
```js
var somFuncResult = someFunc();
Array.isArray(someFuncResult) ? someFuncResult.map(fn) : _.map(someFuncResult, fn)
```
* В любом другом случае:
```javascript
_.map(collection, fn)
```
заменяется на
```js
Array.isArray(collection) ? collection.map(fn) : _.map(collection, fn)
```
* Если `_` был переопределён, то правило не сработает после переопределения
```javascript
var m1 = _.map([], fn); // здесь сработает
_ = {map: () => []};
var m2 = _.map([], fn); // здесь сработает
```
