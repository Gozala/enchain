"use strict";

var enchain = require("../core")

function descriptor(source) {
  return Object.getOwnPropertyNames(source).reduce(function(result, name) {
    result[name] = Object.getOwnPropertyDescriptor(source, name)
    return result
  }, {})
}

function supplement() {
  var sources = Array.prototype.slice.call(arguments)
  return merge.apply(merge, sources.reverse())
}

function merge() {
  var sources = Array.prototype.slice.call(arguments)
  var whitelist = {}
  sources.forEach(function(source) {
    var properties = source ? descriptor(source) : {}
    Object.keys(properties).forEach(function(name) {
      whitelist[name] = properties[name]
    })
  })
  return Object.create(Object.getPrototypeOf(sources[0]), whitelist)
}

function pick() {
  var names = Array.prototype.slice.call(arguments)
  var source = names.shift()
  var properties = descriptor(source)
  var whitelist = {}
  names.forEach(function(name) {
    whitelist[name] = properties[name]
  })
  return Object.create(Object.getPrototypeOf(source), whitelist)
}

exports["test chaining"] = function(assert) {
  var hash = enchain({ merge: merge, pick: pick })

  var actual = hash({ a: 1, b: 2, c: 3, d: 4 }).
    merge({ x: 12, y: 13 }).
    pick('a', 'b', 'x')

  assert.deepEqual(actual.valueOf(),
                   { a: 1, b: 2, x: 12 },
                   "all chained methods were exected in order")
}

exports["test finalizer"] = function(assert) {
  var hash = enchain({
    merge: merge,
    pick: pick,
    supplement: supplement
  }, {
    value: function(result) {
      return result
    }
  })

  var defaults = hash({}).
    merge({ x: 0, y: 0 })

  assert.deepEqual(defaults.value(), { x: 0, y: 0 }, "defaults are returned")

  var foo = defaults.
    merge({ foo: "foo" }).
    pick("x", "foo")

  assert.deepEqual(foo.value(), { x: 0, foo: "foo" }, "composed further")

  assert.deepEqual(defaults.value(), { x: 0, y: 0 }, "first is unaffected")

  var bar = foo.
    merge({ bar: "bar" })

  assert.deepEqual(bar.value(), { x: 0, foo: "foo", bar: "bar" },
                   "composed further")
}
