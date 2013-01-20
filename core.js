"use strict";

var slicer = Array.prototype.slice

var defineProperties = Object.defineProperties
var keys = Object.keys

var queue = "task-queue@" + module.filename || module.uri

function Transformer(fn) {
  /**
  Creates transformer method. This method will be lazy and will just
  curry task and given params until finalizer method is called. Results
  of this methods represent intermediate states.
  **/
  return function transform() {
    /**
    Returns transformation of in the intermediate state, which will implement
    same API as instance method was called on.
    **/
    var tasks = this[queue].concat([fn, slicer.call(arguments)])
    return new this.constructor(tasks)
  }
}

function Finalizer(fn) {
  /**
  Creates finalizer method. This method is not lazy and it will finalize
  computation by executing all the transformations in order and then passes
  result and rest with rest of the params to `fn`, result is returned back.
  **/
  return function finalize() {
    var tasks = this[queue].concat([fn, slicer.call(arguments)])
    return run(tasks)
  }
}

function run(tasks) {
  /**
  Internal function runs all the tasks and returns result back.
  **/
  var count = tasks.length
  var result = tasks[0]         // First element is initial state
  var index = 1
  while (index < count) {
    // Tasks are queued in pairs of `fn` and curried `params`.
    var fn = tasks[index++]
    var params = tasks[index++]
    // Last result state is passed as first argument to a next task.
    result = fn.apply(fn, [result].concat(params))
  }
  return result
}

function enchain(transformers, finalizers) {
  /**
  Function takes dictionary of transformer functions which take input
  they perform transformation over as a first argument and return back
  transformed output. Transformer functions are usually onces representing
  intermediate results. Calling method of that name will return result
  representing lazy transformation that will contain all the transformation
  methods. Final result can be obtained by calling `.valueOf()` on any
  intermediate result. Optionally second argument, dictionary of finalizer
  functions can be passed. These functions will result in methods similar
  to ones in `transformers` with a difference that they will have implicit
  `.valueOf()` after & there for will finalize computation.
  **/
  finalizers = finalizers || {}
  function Chain(tasks) { this[queue] = tasks }
  Chain.prototype.valueOf = function valueOf() { return run(this[queue]) }
  var names = keys(transformers).concat(keys(finalizers))
  defineProperties(Chain.prototype, names.reduce(function(result, name) {
    result[name] = {
      enumerable: true,
      configurable: false,
      writable: false,
      value: finalizers[name] ? Finalizer(finalizers[name]) :
             Transformer(transformers[name])
    }
    return result
  }, {}))

  return function chain(initial) { return new Chain([initial]) }
}

module.exports = enchain
