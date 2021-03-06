// 生成器 生成的是迭代器
// 普通函数执行时 没有停止功能, 生成器函数的特点就是可以暂停
function* read() {
  yield 1; //产出
  yield 2; //产出
  yield 3; //产出
  yield 4; //产出
}

let it = read(); // iterator 迭代器中包含一个next方法

// 迭代器接口 Symbol.iterator
console.log(it.next()); // {value, done} 碰到yield就停止
console.log(it.next()); // {value, done} 碰到yield就停止
console.log(it.next()); // {value, done} 碰到yield就停止
console.log(it.next()); // {value, done} 碰到yield就停止
console.log(it.next()); // {value, done} 碰到yield就停止

let done = false;
while (!done) {
  let obj = it.next();
  done = obj.done;
  console.log(obj.value);
}

// --------------

function* read() {
  let a = yield 1;
  console.log("a" + a);
  let b = yield 2;
  console.log("b" + b);
  let c = yield 3;
  console.log("c" + c);
}

let it = read();
it.next("hello"); // 第一次传参没有意义， 代码执行到yield 1停止了，a还是没有被赋值
it.next("world"); // next传递参数会给上一次的yield的返回值, 这里的world会传递给a, a被赋值为world
it.next("bbb");
it.next("ccc");

// ------------

// generator + promise 解决异步问题
const util = require("util");
const fs = require("fs");
let readFile = util.promisify(fs.readFile);

function* read() {
  let name = yield readFile("./name.txt", "utf8");
  let age = yield readFile(name, "utf8");
  return age;
}

let it = read();
let { value } = it.next(); // 碰到第一个yield， 返回的是promise, 然后我们执行promise.then方法
value.then((data) => {
  let { value } = it.next(data); // 接着往下走，遇到第二个yield, 把data赋值给name, 又返回了一个promise
  value.then((data) => {
    let { value, done } = it.next(data); // 最后一步， return, 把data赋值给age
    console.log(value, done);
  });
});

// ------------------------------
// tj co
const util = require("util");
const fs = require("fs");
let readFile = util.promisify(fs.readFile);

function* read() {
  let name = yield readFile("./name.txt", "utf8");
  let age = yield readFile(name, "utf8");
  return age;
}
// 返回一个promise
function co(it) {
  return new Promise((resolve, reject) => {
    // 异步迭代需要next函数
    function next(r) {
      let { value, done } = it.next(r);
      if (done) {
        resolve(value);
      } else {
        // 如果不是promise就包装一层
        // value.then(data => {
        // 	next(data);
        // }, reject);
        Promise.resolve(value).then((data) => {
          next(data);
        }, reject);
      }
    }
    next();
  });
}

co(read()).then((data) => {
  console.log(data);
});

/* function * test() {
	try {
		yield 100;	
	} catch (error) {
		console.log(error);
	}
}
let it = test();
it.next();
it.throw('hello'); */

// 依次执行生成器， 不停的调用next方法， 将最终结果返回

// ---------------------
// async  编译出来的结果就是generator + co

/* async function test() {// 返回一个promise
	try {
		await new Promise((resolve, reject) => {
			setTimeout(() => {
				reject('hello');
			}, 1000);
		})
	} catch {// es10可以不用写括号
		console.log('error');
	}
}
test();
 */

// async 就相当于是co方法， await就相当于yield， 内部有一个next方法
// test就是generator函数， 相当于执行co(test())返回一个promise，co方法内部有一个next函数
// 1. 执行next，执行到第一个 yield new Promise(), 返回一个promise
// 2. 在promise.then方法中执行next(data),这样就把promise的结果赋值给了r

async function test() {
  // 返回一个promise
  let r = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("hello");
    }, 1000);
  });
  console.log("r", r); // r hello
}

test()
  .then((data) => {
    console.log("data", data); // data undefined
  })
  .catch((err) => {
    console.log("err", err);
  });

("use strict");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}

function test() {
  return _test.apply(this, arguments);
}

function _test() {
  _test = _asyncToGenerator(
    /*#__PURE__*/ regeneratorRuntime.mark(function _callee() {
      var r;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch ((_context.prev = _context.next)) {
            case 0:
              _context.next = 2;
              return new Promise(function (resolve, reject) {
                setTimeout(function () {
                  resolve("hello");
                }, 1000);
              });

            case 2:
              r = _context.sent;
              console.log("r", r); // r hello

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })
  );
  return _test.apply(this, arguments);
}
