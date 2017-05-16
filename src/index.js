const lamu = require('lamu')({
  lineSpacing: 1,
  separator: '=>'
})

const most = require('most')
const delay = require('delay')

const time = (fn, id) => {
  const start = process.hrtime()
  const result = fn(id)
  const [sec, nano] = process.hrtime(start)
  return [sec*1000*100000 + nano, result]
}

const race = (name, fn, s=10000, p=10, r=10) => {
  const log = lamu.log({label: name, text: 'In progres...'})

  most.periodic(r).take(p-1)
    .scan(
      (c) => c + 1, 0
    )
    .chain(
      (p) => most.periodic(r).take(s-1)
        .scan(
          (c) => c + 1, 0
        )
        .map(
          (n) => time(fn, n, p)
        )
    )
    .scan(
      ([sum, n], [value]) => [sum + value, n + 1], [0, 0]
    )
    .map(
      ([sum, n]) => [sum/n, n]
    )
    .map(
      ([avg, n]) => [avg, Math.round(1000*100000 / avg), Math.floor(n/(p*s)*100), n]
    )
    .observe(
      ([avg, count, perc, n]) => lamu.update(log, {color: 'cyan', text: `${count} op/s [avg: ${avg/10000}ms] ${perc}%`})
    )
    .then(
      () => lamu.update(log, {color: 'green'})
    )
}


const arr = [5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]

const ramda = require('ramda')
const underscore = require('underscore')
const lodash = require('lodash')
const fast = require('fast.js')

const ramda_fun = (arr) => {
  return ramda.map((v) => v*v, arr)
}

const underscore_fun = (arr) => {
  return underscore.map(arr, (v) => v*v)
}

const fast_fun = (arr) => {
  return fast.map(arr, (v) => v*v)
}

const lodash_fun = (arr) => {
  return lodash.map(arr, (v) => v*v)
}

const native_i_fun = (arr0) => {
  const arr = []
  for (var i = 0; i < arr0.length; i++) {
    arr[i] = arr0[i]*arr0[i]
  }
  return arr;
}

const native_in_fun = (arr0) => {
  const arr = []
  for (var i in arr0) {
    arr[i] = arr0[i]*arr0[i]
  }
  return arr;
}

race('underscore_fun', (n) => underscore_fun([5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]))
race('ramda_fun', (n) => ramda_fun([5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]))
race('fast_fun', (n) => fast_fun([5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]))
race('lodash_fun', (n) => lodash_fun([5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]))
race('native_i_fun', (n) => native_i_fun([5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]))
race('native_in_fun', (n) => native_in_fun([5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]))
