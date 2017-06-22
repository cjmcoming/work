(function (factory) {
    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global);

    if (typeof define === 'function' && define.amd) {
        define(['exports'], function (exports) {
            root.CJM = factory(root, exports);
        });
    } else if (typeof exports !== 'undefined') {
        factory(root, exports);
    } else {
        root.CJM = factory(root, {});
    }
} (function(root, CJM) {

    CJM.extend = function(obj, newProperties) {
        var key;
        for(key in newProperties) {
            if(newProperties.hasOwnProperty(key)) {
                obj[key] = newProperties[key];
            }
        }
        return obj;
    };

    CJM.extend(CJM, {
        fn: new Function(), //供全局引用的空函数
        toRadian : Math.PI / 180,
        inherit: function(childClass, parentClass) { //通过原型实现的类继承
            var Constructor = new Function();
            Constructor.prototype = parentClass.prototype;
            childClass.prototype = new Constructor();
            childClass.prototype.constructor = childClass;
            childClass.superclass = parentClass.prototype;
            if(childClass.prototype.constructor == Object.prototype.constructor) {
                childClass.prototype.constructor = parentClass;
            }
        },
        call: function(func, scope) { //通过闭包实现的事件代理
            scope = scope || window;
            if(arguments.length > 2) {
                var args = Array.prototype.slice.call(arguments, 2);
                return function() {
                    return func.apply(scope, args);
                }
            } else {
                return function() {
                    return func.call(scope);
                }
            }
        },
        getRandomNum: function(min, max) {
            return Math.floor( (max - min + 1) * Math.random() ) + min;
        },
        getRandomColor: function () {
            return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6);
        },
        fixed0: function(n) {
            return Math.round(n);
        },
        fixed2: function(n) {
            return Math.round(n * 100) / 100;
        }
    });

    // --------------------------------------------------------------------全局update
    var components = [];
    var isUpdating = false;
    var lastTime = 0;

    function globalUpdate() {
        isUpdating = true;
        var _len = components.length, i;
        if (_len === 0) {
            isUpdating = false;
            return;
        }

        var _now = now();
        var _time = _now - lastTime;
        lastTime = _now;
        for (i = _len - 1; i >= 0; i--) {
            if (tweens[i] && !tweens[i]._update(_time)) {
                var _tween = tweens.splice(i, 1)[0];
                if (_tween.onUpdate) _tween.onUpdate.apply(_tween, _tween.onUpdateParams);
                if (_tween.onEnd) _tween.onEnd.apply(_tween, _tween.onEndParams);
                _tween.target = null;
            }
        }

        requestFrame(globalUpdate);
    }

    var Component = function(cfg) {
        this.x = 0; //绘制时的x轴位置
        this.y = 0; //绘制时的y轴位置
        this.width = 0; //宽度
        this.height = 0; //高度
        this.alpha = 1; //透明度
        this.rotation = 0; //旋转角度
        this.flipX = false; //水平翻转
        this.flipY = false; //垂直翻转
        this.scaleX = 1; //水平缩放
        this.scaleY = 1; //垂直缩放
        this.visible = true; //显示状态 read only
        CJM.extend(this, cfg); //扩展属性
    }
    //事件定义
    Component.prototype.ondestory = CJM.fn; //销毁
    DisplayObject.prototype.onshow = CJM.fn; //显示
    DisplayObject.prototype.onhide = CJM.fn; //隐藏
    DisplayObject.prototype.onupdate = CJM.fn; //状态更新
    DisplayObject.prototype.onrender = CJM.fn; //渲染
    DisplayObject.prototype.ondraw = CJM.fn; //在画布上绘制


    //组件销毁
    Component.prototype.destory = function() {
        this.ondestory();
        this.ondestory = this.onshow = this.onhide = this.onupdate = this.onrender = this.ondraw = null;
    }
    CJM.Component = Component;

    return CJM;

} ) )