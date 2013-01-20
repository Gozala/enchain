# enchain

[![Build Status](https://secure.travis-ci.org/Gozala/enchain.png)](http://travis-ci.org/Gozala/enchain)


[![Browser support](http://ci.testling.com/Gozala/enchain.png)](http://ci.testling.com/Gozala/enchain)


There are cases when you may prefer method chaining API over plain functions.
Libraries like [jQuery][] and [underscore][] include chaining facilities with
them to address these use cases, although chaining is different problem and
can (and there for should) be solved separately. Enchain solves just a chaining
problem so libraries can concentrate on their actual problems and let users
figure how they wanna chain them.

## API

```js
var enchain = require("enchain")
var reducers = require("reducers")
var chain = enchain(reducers)


chain([ 1, 2, 3, 4, 5, 6 ]).
  map(function(x) { return x + 1 }).
  filter(function(x) { return x % 2 }).
  concat([ "a", "b" ]).
  into([]).
  valueOf() // will return actual value rather then chainable DSL

// => [ 3, 5, 7, 'a', 'b' ]
```

Note that result of each method call is a chainable DSL, and in order to
get actual result `.valueOf()` needs to be called. Although second set of
functions maybe provided to make `valueOf()` call implicit:

```js
var enchain = require("enchain")
var reducers = require("reducers")
var chain = enchain(reducers, {
  print: reducers.print,
  fold: reducers.fold
})

chain([ 1, 2, 3, 4, 5, 6 ]).
  map(function(x) { return x + 1 }, 3).
  filter(function(x) { return x % 2 }).
  fold(function(x, y) { return x + y }, 0)

// => 15
```

## Install

    npm install enchain

[underscore]:http://documentcloud.github.com/underscore/
[jQuery]:http://jquery.com/
[reducers]:https://github.com/Gozala/reducers
