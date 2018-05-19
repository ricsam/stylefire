(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.stylefire = {})));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    var hasRAF = typeof window !== 'undefined' && window.requestAnimationFrame !== undefined;
    var prevTime = 0;
    var onNextFrame = hasRAF
        ? function (callback) { return window.requestAnimationFrame(callback); }
        : function (callback) {
            var currentTime = Date.now();
            var timeToCall = Math.max(0, 16.7 - (currentTime - prevTime));
            prevTime = currentTime + timeToCall;
            setTimeout(function () { return callback(prevTime); }, timeToCall);
        };

    function createRenderStep(startRenderLoop) {
        var functionsToRun = [];
        var functionsToRunNextFrame = [];
        var numThisFrame = 0;
        var isProcessing = false;
        var i = 0;
        return {
            cancel: function (callback) {
                var indexOfCallback = functionsToRunNextFrame.indexOf(callback);
                if (indexOfCallback !== -1) {
                    functionsToRunNextFrame.splice(indexOfCallback, 1);
                }
            },
            process: function () {
                isProcessing = true;
                _a = [functionsToRunNextFrame, functionsToRun], functionsToRun = _a[0], functionsToRunNextFrame = _a[1];
                functionsToRunNextFrame.length = 0;
                numThisFrame = functionsToRun.length;
                for (i = 0; i < numThisFrame; i++) {
                    functionsToRun[i]();
                }
                isProcessing = false;
                var _a;
            },
            schedule: function (callback, immediate) {
                if (immediate === void 0) { immediate = false; }
                startRenderLoop();
                var addToCurrentBuffer = immediate && isProcessing;
                var buffer = addToCurrentBuffer ? functionsToRun : functionsToRunNextFrame;
                if (buffer.indexOf(callback) === -1) {
                    buffer.push(callback);
                    if (addToCurrentBuffer) {
                        numThisFrame = functionsToRun.length;
                    }
                }
            },
        };
    }

    var HAS_PERFORMANCE_NOW = typeof performance !== 'undefined' && performance.now !== undefined;
    var willRenderNextFrame = false;
    function startRenderLoop() {
        if (willRenderNextFrame)
            return;
        willRenderNextFrame = true;
        onNextFrame(processFrame);
    }
    var frameStart = createRenderStep(startRenderLoop);
    var frameUpdate = createRenderStep(startRenderLoop);
    var frameRender = createRenderStep(startRenderLoop);
    var frameEnd = createRenderStep(startRenderLoop);
    function processFrame(framestamp) {
        willRenderNextFrame = false;
        frameStart.process();
        frameUpdate.process();
        frameRender.process();
        frameEnd.process();
    }
    var onFrameRender = frameRender.schedule;

    var createStyler = function (_a) {
        var onRead = _a.onRead, onRender = _a.onRender, _b = _a.aliasMap, aliasMap = _b === void 0 ? {} : _b, _c = _a.useCache, useCache = _c === void 0 ? true : _c;
        return function (props) {
            var state = {};
            var changedValues = [];
            var hasChanged = false;
            var setValue = function (unmappedKey, value) {
                var key = aliasMap[unmappedKey] || unmappedKey;
                var currentValue = state[key];
                state[key] = value;
                if (state[key] !== currentValue) {
                    if (changedValues.indexOf(key) === -1) {
                        changedValues.push(key);
                    }
                    if (!hasChanged) {
                        hasChanged = true;
                        onFrameRender(render);
                    }
                }
            };
            function render(forceRender) {
                if (forceRender === void 0) { forceRender = false; }
                if (forceRender || hasChanged) {
                    onRender(state, props, changedValues);
                    hasChanged = false;
                    changedValues.length = 0;
                }
                return this;
            }
            return {
                get: function (unmappedKey) {
                    var key = aliasMap[unmappedKey] || unmappedKey;
                    return (key)
                        ? (useCache && state[key] !== undefined)
                            ? state[key]
                            : onRead(key, props)
                        : state;
                },
                set: function (values, value) {
                    if (typeof values === 'string') {
                        if (value !== undefined) {
                            setValue(values, value);
                        }
                        else {
                            return function (v) { return setValue(values, v); };
                        }
                    }
                    else {
                        for (var key in values) {
                            if (values.hasOwnProperty(key)) {
                                setValue(key, values[key]);
                            }
                        }
                    }
                    return this;
                },
                render: render,
            };
        };
    };

    var CAMEL_CASE_PATTERN = /([a-z])([A-Z])/g;
    var REPLACE_TEMPLATE = '$1-$2';
    var camelToDash = function (str) { return str.replace(CAMEL_CASE_PATTERN, REPLACE_TEMPLATE).toLowerCase(); };
    var setDomAttrs = function (element, attrs) {
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                element.setAttribute(key, attrs[key]);
            }
        }
    };

    var camelCache = new Map();
    var dashCache = new Map();
    var prefixes = ['Webkit', 'Moz', 'O', 'ms', ''];
    var numPrefixes = prefixes.length;
    var testElement;
    var testPrefix = function (key) {
        if (typeof document === 'undefined')
            return;
        testElement = testElement || document.createElement('div');
        for (var i = 0; i < numPrefixes; i++) {
            var prefix = prefixes[i];
            var noPrefix = (prefix === '');
            var prefixedPropertyName = noPrefix ? key : prefix + key.charAt(0).toUpperCase() + key.slice(1);
            if (prefixedPropertyName in testElement.style) {
                camelCache.set(key, prefixedPropertyName);
                dashCache.set(key, "" + (noPrefix ? '' : '-') + camelToDash(prefixedPropertyName));
            }
        }
    };
    var prefixer = (function (key, asDashCase) {
        if (asDashCase === void 0) { asDashCase = false; }
        var cache = asDashCase ? dashCache : camelCache;
        if (!cache.has(key))
            testPrefix(key);
        return cache.get(key) || key;
    });

    var axes = ['', 'X', 'Y', 'Z'];
    var order = ['translate', 'scale', 'rotate', 'skew', 'transformPerspective'];
    var TRANSFORM_ORIGIN_X = 'transformOriginX';
    var TRANSFORM_ORIGIN_Y = 'transformOriginY';
    var transformProps = order.reduce(function (acc, key) {
        return axes.reduce(function (axesAcc, axesKey) {
            axesAcc.push(key + axesKey);
            return axesAcc;
        }, acc);
    }, ['x', 'y', 'z']);
    var transformPropDictionary = transformProps.reduce(function (dict, key) {
        dict[key] = true;
        return dict;
    }, {});
    var isTransformProp = function (key) { return transformPropDictionary[key] === true; };
    var sortTransformProps = function (a, b) { return transformProps.indexOf(a) - transformProps.indexOf(b); };
    var isTransformOriginProp = function (key) { return key === TRANSFORM_ORIGIN_X || key === TRANSFORM_ORIGIN_Y; };

    const clamp = (min, max) => (v) => Math.max(Math.min(v, max), min);
    const contains = (term) => (v) => (typeof v === 'string' && v.indexOf(term) !== -1);
    const createUnitType = (unit) => ({
        test: contains(unit),
        parse: parseFloat,
        transform: (v) => `${v}${unit}`
    });
    const isFirstChars = (term) => (v) => (typeof v === 'string' && v.indexOf(term) === 0);
    const getValueFromFunctionString = (value) => value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));
    const splitCommaDelimited = (value) => typeof value === 'string' ? value.split(/,\s*/) : [value];
    function splitColorValues(terms) {
        const numTerms = terms.length;
        return function (v) {
            const values = {};
            const valuesArray = splitCommaDelimited(getValueFromFunctionString(v));
            for (let i = 0; i < numTerms; i++) {
                values[terms[i]] = (valuesArray[i] !== undefined) ? parseFloat(valuesArray[i]) : 1;
            }
            return values;
        };
    }
    const number = {
        test: (v) => typeof v === 'number',
        parse: parseFloat,
        transform: (v) => v
    };
    const alpha = Object.assign({}, number, { transform: clamp(0, 1) });
    const degrees = createUnitType('deg');
    const percent = createUnitType('%');
    const px = createUnitType('px');
    const scale = Object.assign({}, number, { default: 1 });
    const clampRgbUnit = clamp(0, 255);
    const rgbUnit = Object.assign({}, number, { transform: (v) => Math.round(clampRgbUnit(v)) });
    const rgbaTemplate = ({ red, green, blue, alpha = 1 }) => `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    const rgba = {
        test: isFirstChars('rgb'),
        parse: splitColorValues(['red', 'green', 'blue', 'alpha']),
        transform: ({ red, green, blue, alpha }) => rgbaTemplate({
            red: rgbUnit.transform(red),
            green: rgbUnit.transform(green),
            blue: rgbUnit.transform(blue),
            alpha
        })
    };
    const hslaTemplate = ({ hue, saturation, lightness, alpha = 1 }) => `hsla(${hue}, ${saturation}, ${lightness}, ${alpha})`;
    const hsla = {
        test: isFirstChars('hsl'),
        parse: splitColorValues(['hue', 'saturation', 'lightness', 'alpha']),
        transform: ({ hue, saturation, lightness, alpha }) => hslaTemplate({
            hue: Math.round(hue),
            saturation: percent.transform(saturation),
            lightness: percent.transform(lightness),
            alpha
        })
    };
    const hex = Object.assign({}, rgba, { test: isFirstChars('#'), parse: (v) => {
            let r, g, b;
            if (v.length > 4) {
                r = v.substr(1, 2);
                g = v.substr(3, 2);
                b = v.substr(5, 2);
            }
            else {
                r = v.substr(1, 1);
                g = v.substr(2, 1);
                b = v.substr(3, 1);
                r += r;
                g += g;
                b += b;
            }
            return {
                red: parseInt(r, 16),
                green: parseInt(g, 16),
                blue: parseInt(b, 16),
                alpha: 1
            };
        } });
    const isRgba = (v) => v.red !== undefined;
    const isHsla = (v) => v.hue !== undefined;
    const color = {
        test: (v) => rgba.test(v) || hsla.test(v) || hex.test(v),
        parse: (v) => {
            if (rgba.test(v)) {
                return rgba.parse(v);
            }
            else if (hsla.test(v)) {
                return hsla.parse(v);
            }
            else if (hex.test(v)) {
                return hex.parse(v);
            }
            return v;
        },
        transform: (v) => {
            if (isRgba(v)) {
                return rgba.transform(v);
            }
            else if (isHsla(v)) {
                return hsla.transform(v);
            }
            return v;
        },
    };

    var valueTypes = {
        color: color,
        backgroundColor: color,
        outlineColor: color,
        fill: color,
        stroke: color,
        borderColor: color,
        borderTopColor: color,
        borderRightColor: color,
        borderBottomColor: color,
        borderLeftColor: color,
        borderRadius: px,
        width: px,
        maxWidth: px,
        height: px,
        maxHeight: px,
        top: px,
        left: px,
        bottom: px,
        right: px,
        rotate: degrees,
        rotateX: degrees,
        rotateY: degrees,
        rotateZ: degrees,
        scale: scale,
        scaleX: scale,
        scaleY: scale,
        scaleZ: scale,
        skewX: degrees,
        skewY: degrees,
        distance: px,
        translateX: px,
        translateY: px,
        translateZ: px,
        perspective: px,
        opacity: alpha,
        transformOriginX: percent,
        transformOriginY: percent,
        transformOriginZ: px
    };
    var getValueType = (function (key) { return valueTypes[key]; });

    var aliasMap = {
        x: 'translateX',
        y: 'translateY',
        z: 'translateZ',
        originX: 'transformOriginX',
        originY: 'transformOriginY',
        originZ: 'transformOriginZ'
    };
    var NUMBER = 'number';
    var OBJECT = 'object';
    var COLON = ':';
    var SEMI_COLON = ';';
    var TRANSFORM_ORIGIN = 'transform-origin';
    var TRANSFORM = 'transform';
    var TRANSLATE_Z = 'translateZ';
    var TRANSFORM_NONE = ';transform: none';
    var styleRule = function (key, value) {
        return "" + SEMI_COLON + key + COLON + value;
    };
    function buildStylePropertyString(state, changedValues, enableHardwareAcceleration, blacklist) {
        if (changedValues === void 0) { changedValues = true; }
        if (enableHardwareAcceleration === void 0) { enableHardwareAcceleration = true; }
        var valuesToChange = changedValues === true ? Object.keys(state) : changedValues;
        var propertyString = '';
        var transformString = '';
        var hasTransformOrigin = false;
        var transformIsDefault = true;
        var hasTransform = false;
        var transformHasZ = false;
        var numChangedValues = valuesToChange.length;
        for (var i = 0; i < numChangedValues; i++) {
            var key = valuesToChange[i];
            if (isTransformProp(key)) {
                hasTransform = true;
                for (var stateKey in state) {
                    if (isTransformProp(stateKey) &&
                        valuesToChange.indexOf(stateKey) === -1) {
                        valuesToChange.push(stateKey);
                    }
                }
                break;
            }
        }
        valuesToChange.sort(sortTransformProps);
        var totalNumChangedValues = valuesToChange.length;
        for (var i = 0; i < totalNumChangedValues; i++) {
            var key = valuesToChange[i];
            if (blacklist.has(key))
                continue;
            var isTransformKey = isTransformProp(key);
            var value = state[key];
            var valueType = getValueType(key);
            if (isTransformKey) {
                if ((valueType.default && value !== valueType.default) ||
                    (!valueType.default && value !== 0)) {
                    transformIsDefault = false;
                }
            }
            if (valueType &&
                (typeof value === NUMBER || typeof value === OBJECT) &&
                valueType.transform) {
                value = valueType.transform(value);
            }
            if (isTransformKey) {
                transformString += key + '(' + value + ') ';
                transformHasZ = key === TRANSLATE_Z ? true : transformHasZ;
            }
            else if (isTransformOriginProp(key)) {
                state[key] = value;
                hasTransformOrigin = true;
            }
            else {
                propertyString += styleRule(prefixer(key, true), value);
            }
        }
        if (hasTransformOrigin) {
            propertyString += styleRule(TRANSFORM_ORIGIN, (state.transformOriginX || 0) + " " + (state.transformOriginY ||
                0) + " " + (state.transformOriginZ || 0));
        }
        if (hasTransform) {
            if (!transformHasZ && enableHardwareAcceleration) {
                transformString += TRANSLATE_Z + "(0)";
            }
            propertyString += styleRule(TRANSFORM, transformIsDefault ? TRANSFORM_NONE : transformString);
        }
        return propertyString;
    }

    var SCROLL_LEFT = 'scrollLeft';
    var SCROLL_TOP = 'scrollTop';
    var scrollValues = new Set([SCROLL_LEFT, SCROLL_TOP]);
    var cssStyler = createStyler({
        onRead: function (key, _a) {
            var element = _a.element, preparseOutput = _a.preparseOutput;
            var valueType = getValueType(key);
            if (isTransformProp(key)) {
                return valueType ? valueType.default || 0 : 0;
            }
            else if (scrollValues.has(key)) {
                return element[key];
            }
            else {
                var domValue = window
                    .getComputedStyle(element, null)
                    .getPropertyValue(prefixer(key, true)) || 0;
                return preparseOutput && valueType && valueType.parse
                    ? valueType.parse(domValue)
                    : domValue;
            }
        },
        onRender: function (state, _a, changedValues) {
            var element = _a.element, enableHardwareAcceleration = _a.enableHardwareAcceleration;
            element.style.cssText += buildStylePropertyString(state, changedValues, enableHardwareAcceleration, scrollValues);
            if (changedValues.indexOf(SCROLL_LEFT) !== -1)
                element.scrollLeft = state.scrollLeft;
            if (changedValues.indexOf(SCROLL_TOP) !== -1)
                element.scrollTop = state.scrollTop;
        },
        aliasMap: aliasMap,
        uncachedValues: scrollValues
    });
    var css = (function (element, props) {
        return cssStyler(__assign({ element: element, enableHardwareAcceleration: true, preparseOutput: true }, props));
    });

    var ZERO_NOT_ZERO = 0.0000001;
    var percentToPixels = function (percent, length) {
        return (percent / 100) * length + 'px';
    };
    var build = function (state, dimensions, isPath, pathLength) {
        var hasTransform = false;
        var hasDashArray = false;
        var props = {};
        var dashArrayStyles = isPath ? {
            pathLength: '0',
            pathSpacing: "" + pathLength
        } : undefined;
        var scale = state.scale !== undefined ? state.scale || ZERO_NOT_ZERO : state.scaleX || 1;
        var scaleY = state.scaleY !== undefined ? state.scaleY || ZERO_NOT_ZERO : scale || 1;
        var transformOriginX = dimensions.width * ((state.originX || 50) / 100) + dimensions.x;
        var transformOriginY = dimensions.height * ((state.originY || 50) / 100) + dimensions.y;
        var scaleTransformX = -transformOriginX * (scale * 1);
        var scaleTransformY = -transformOriginY * (scaleY * 1);
        var scaleReplaceX = transformOriginX / scale;
        var scaleReplaceY = transformOriginY / scaleY;
        var transform = {
            translate: "translate(" + state.translateX + ", " + state.translateY + ") ",
            scale: "translate(" + scaleTransformX + ", " + scaleTransformY + ") scale(" + scale + ", " + scaleY + ") translate(" + scaleReplaceX + ", " + scaleReplaceY + ") ",
            rotate: "rotate(" + state.rotate + ", " + transformOriginX + ", " + transformOriginY + ") ",
            skewX: "skewX(" + state.skewX + ") ",
            skewY: "skewY(" + state.skewY + ") "
        };
        for (var key in state) {
            if (state.hasOwnProperty(key)) {
                var value = state[key];
                if (isTransformProp(key)) {
                    hasTransform = true;
                }
                else if (isPath && (key === 'pathLength' || key === 'pathSpacing') && typeof value === 'number') {
                    hasDashArray = true;
                    dashArrayStyles[key] = percentToPixels(value, pathLength);
                }
                else if (isPath && key === 'pathOffset') {
                    props['stroke-dashoffset'] = percentToPixels(-value, pathLength);
                }
                else {
                    props[camelToDash(key)] = value;
                }
            }
        }
        if (hasDashArray) {
            props['stroke-dasharray'] = dashArrayStyles.pathLength + ' ' + dashArrayStyles.pathSpacing;
        }
        if (hasTransform) {
            props.transform = '';
            for (var key in transform) {
                if (transform.hasOwnProperty(key)) {
                    var defaultValue = (key === 'scale') ? '1' : '0';
                    props.transform += transform[key].replace(/undefined/g, defaultValue);
                }
            }
        }
        return props;
    };

    var valueTypes$1 = {
        fill: color,
        stroke: color,
        scale: scale,
        scaleX: scale,
        scaleY: scale,
        opacity: alpha,
        fillOpacity: alpha,
        strokeOpacity: alpha
    };
    var getValueType$1 = (function (key) { return valueTypes$1[key]; });

    var svgStyler = createStyler({
        onRead: function (key, _a) {
            var element = _a.element;
            if (!isTransformProp(key)) {
                return element.getAttribute(key);
            }
            else {
                var valueType = getValueType$1(key);
                return valueType ? valueType.default : 0;
            }
        },
        onRender: function (state, _a, changedValues) {
            var dimensions = _a.dimensions, element = _a.element, isPath = _a.isPath, pathLength = _a.pathLength;
            setDomAttrs(element, build(state, dimensions, isPath, pathLength));
        },
        aliasMap: {
            x: 'translateX',
            y: 'translateY',
            background: 'fill'
        }
    });
    var svg = (function (element) {
        var _a = element.getBBox(), x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        var props = {
            element: element,
            dimensions: { x: x, y: y, width: width, height: height },
            isPath: false
        };
        if (element.tagName === 'path') {
            props.isPath = true;
            props.pathLength = element.getTotalLength();
        }
        return svgStyler(props);
    });

    var viewport = createStyler({
        useCache: false,
        onRead: function (key) {
            return key === 'scrollTop' ? window.pageYOffset : window.pageXOffset;
        },
        onRender: function (_a) {
            var _b = _a.scrollTop, scrollTop = _b === void 0 ? 0 : _b, _c = _a.scrollLeft, scrollLeft = _c === void 0 ? 0 : _c;
            return window.scrollTo(scrollLeft, scrollTop);
        }
    });

    var HEY_LISTEN = 'Hey, listen! ';
    var invariant = function () { };
    if (process.env.NODE_ENV !== 'production') {
        invariant = function (check, message) {
            if (!check) {
                throw new Error(HEY_LISTEN.toUpperCase() + message);
            }
        };
    }

    var cache = new WeakMap();
    var createDOMStyler = function (node, props) {
        var styler;
        if (node instanceof HTMLElement) {
            styler = css(node, props);
        }
        else if (node instanceof SVGElement) {
            styler = svg(node);
        }
        else if (typeof window !== 'undefined' && node === window) {
            styler = viewport(node);
        }
        invariant(styler !== undefined, 'No valid node provided. Node must be HTMLElement, SVGElement or window.');
        cache.set(node, styler);
        return styler;
    };
    var getStyler = function (node, props) {
        return cache.has(node) ? cache.get(node) : createDOMStyler(node, props);
    };
    function index (nodeOrSelector, props) {
        var node = typeof nodeOrSelector === 'string'
            ? document.querySelector(nodeOrSelector)
            : nodeOrSelector;
        return getStyler(node, props);
    }

    exports.default = index;
    exports.createStylerFactory = createStyler;
    exports.buildStyles = buildStylePropertyString;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
