/**
 * 这是一些常用的代码片段，以后写demo时候可以直接复制或是参考
 */

// 深拷贝一个对象(简单实现)
function cloneObject(src) {
    var result;
    if (Object.prototype.toString.call(src) == '[object Array]') {
        result = [];
    } else {
        result = {};
    }
    for (var key in src) {
        if (src.hasOwnProperty(key)) {
            if (typeof src[key] === 'object') {
                result[key] = arguments.callee(src[key]);
            } else {
                result[key] = src[key];
            }
        }
    }
    return result;
}

// 类似于Object.assign，实现对象的合并，拷贝,参考jQuery.extend
function assign() {
    var target = arguments[0],
        len = arguments.length,
        deep = false,
        options,
        src,
        clone,
        copy;
    // 最后一个参数传入true则表示合并时采取深拷贝
    if (typeof arguments[len - 1] === 'boolean') {
        deep = arguments[len - 1]
        len--
    }
    for (var i = 1; i < len; i++) {
        if ((options = arguments[i]) != null) {
            for (var name in options) {
                src = target[name]
                copy = options[name]
                if (target === copy) continue
                if (deep && copy) {
                    target[name] = cloneObject(copy)
                } else if (copy !== undefined) {
                    target[name] = copy
                }
            }
        }
    }
    return target
}

// 获取element相对于浏览器窗口的位置，返回一个对象{x, y}
function getPosition(element) {
    var actualLeft = element.offsetLeft,
        currentLeft = element.offsetParent,
        actualTop = element.offsetTop,
        currentTop = element.offsetParent;
    while (currentLeft !== null) {
        actualLeft += currentLeft.offsetLeft;
        currentLeft = currentLeft.offsetParent;
    }
    while (currentTop !== null) {
        actualTop += currentTop.offsetTop;
        currentTop = currentTop.offsetParent;
    }
    return {
        x: actualLeft,
        y: actualTop
    }
}

// 发布订阅模式
function PubSub() {
    this.handers = {};
}
PubSub.prototype = {
    on: function (eventType, handler) {
        if (typeof this.handers[eventType] == 'undefined') {
            this.handers[eventType] = [];
        }
        this.handers[eventType].push(handler);
    },
    emit: function (eventType) {
        let handlerArgs = Array.prototype.slice.call(arguments, 1)
        for (let i = 0; i < this.handers[eventType].length; i++) {
            this.handers[eventType][i].apply(this, handlerArgs);
        }
    }
}


/**
 * ajax简单封装，返回一个promise对象
 * options = {
 *  url:'',
 *  headers:{}
 *  type:'POST',
 *  data:{}
 * }
 * @param options
 */
function ajax(options) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest(),
            url = options.url || '',
            type = url.type || 'GET',
            headers = options.headers
        xhr.open(type, url)
        for (let i in options.headers) {
            xhr.setRequestHeader(i, headers[i]);
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    resolve(xhr.responseText)
                } else {
                    reject(xhr.status)
                }
            }
        }
        xhr.send(options.data || null)
    })
}

// js的流程控制，用队列实现一个lazyman
(function (window) {
    var queue = []

    function next() {
        var fn = queue.shift()
        fn && fn()
    }

    function _LazyMan(name) {
        this.name = name

        var fn = (function (name) {
            return function () {
                console.log('Hi This is'+name)
                next()
            }
        })(name)
        queue.push(fn)
        setTimeout(function () {
            next()
        },0)

    }
    _LazyMan.prototype = {
        sleep:function (s) {
            var fn = (function (time) {
                return function () {
                    setTimeout(function () {
                        next()
                    },time)
                }
            })(s)
            queue.push(fn)
            return this
        },
        eat:function (food) {
            var fn = (function (food) {
                return function () {
                    console.log('Eat'+food)
                    next()
                }
            })(food)
            queue.push(fn)
            return this
        },
        sleepFirst:function (s) {
            var fn = (function (time) {
                return function () {
                    setTimeout(function () {
                        next()
                    },time)
                }
            })(s)
            queue.unshift(fn)
            return this
        }
    }

    function LazyMan(name) {
        return new _LazyMan(name)
    }

    window.LazyMan = LazyMan
})(window)