/*
 * This file is part of JustLib project
 * 
 * File: JustLib.js
 * Author: Jaroslav Louma
 * File Created: 2019-06-14T18:18:58+02:00
 * Last Modified: 2022-08-16T02:37:06+02:00
 * 
 * Copyright (c) 2019 - 2021 Jaroslav Louma
 */

// @ts-check

"use strict";

/**
 * @typedef {Function} JL
 * @param {HTMLElement|string} root Root Element of HTML Selector
 * @param {string} [selector] HTML Selector
 * @param {number} [index=-1] Index of element
 * @returns {HTMLElement|HTMLElement[]}
 */


/* ========= Maths ========= */

var _angle_precision = 8;

/**
 * Converts Degrees to Radians.
 * @param {number} deg Degrees
 * @returns {number}
 */
function deg2rad(deg) {
	return (deg * Math.PI) / 180;
}

/**
 * Converts Radians to Degrees.
 * @param {number} rad Degrees
 * @returns {number}
 */
function rad2deg(rad) {
	return (rad * 180) / Math.PI;
}

/**
 * Converts Decimal number to Binnary number.
 * @param {string} dec Decimal number
 * @returns {string}
 */
function dec2bin(dec) {
	return parseInt(dec, 10).toString(2);
}

/**
 * Converts Binnary number to Decimal number.
 * @param {string} bin Binnary number
 * @returns {number}
 */
function bin2dec(bin) {
	return parseInt(bin, 2);
}

/**
 * Returns Exponent of Power (3^x=9 => 2).
 * @param {number} power Final power
 * @param {number} base Power base
 * @returns {number}
 */
function getExponent(power, base) {
	return Math.log(power) / Math.log(base);
}

/**
 * Returns sine of the angle.
 * @param {number} angle Angle to be processed
 * @returns {number}
 */
function fastSin(angle) {
	angle %= TWO_PI;
	if(angle < 0) angle += TWO_PI;
	return ANGLES.sin[Math.round(((angle * 180) / Math.PI) * _angle_precision)];
}

/**
 * Returns cosine of the angle.
 * @param {number} angle Angle to be processed
 * @returns {number}
 */
function fastCos(angle) {
	angle %= TWO_PI;
	if(angle < 0) angle += TWO_PI;
	return ANGLES.cos[Math.round(((angle * 180) / Math.PI) * _angle_precision)];
}

/* ========== DOM ========== */

/**
 * Checks whether HTML Element has Class.
 * @param {HTMLElement} elm HTML Element
 * @param {string} cls Class
 * @returns {boolean}
 */
function hasClass(elm, cls) {
	if(!elm || typeof elm.className !== "string") return false;
	return arrContains(elm.className.split(" "), cls);
}

/**
 * Toggles Class of HTML Element.
 * @param {HTMLElement} elm HTML Element
 * @param {string} cls Class
 * @param {boolean} state set/reset
 * @returns {boolean}
 */
function toggleClass(elm, cls, state = undefined) {
	if(typeof elm === "undefined" || !(elm instanceof HTMLElement)) return false; //throw new TypeError(elm + " is not valid HTML element");
	if((hasClass(elm, cls) && state == true) || (!hasClass(elm, cls) && state == false)) return state;
	if(elm.classList) elm.classList.toggle(cls);
	else {
		//IE fix
		var classes = elm.className.split(" ");
		var i = classes.indexOf(cls);

		if(i >= 0) classes.splice(i, 1);
		else {
			classes.push(cls);
			elm.className = classes.join(" ");
		}
	}
	return hasClass(elm, cls);
}

/**
 * Returns Array of parent nodes of HTML Element.
 * @param {HTMLElement} elm HTML Element
 * @returns {HTMLElement[]}
 */
function getPath(elm) {
	var path = [];
	while(elm = /** @type {HTMLElement} */(elm.parentNode)) {
		if(elm.tagName.toLowerCase() === "html") break;
		path.push(elm);
	}
	return path.reverse();
}

// eslint-disable-next-line valid-jsdoc
/**
 * @type {
		((selector: string) => Element | Element[]) &
		((selector: string, index: number) => Element) &
		((selector: string, index: true) => Element[]) &
		((root: HTMLElement, selector: string) => Element | Element[]) &
		((root: HTMLElement, selector: string, index: number) => Element) &
		((root: HTMLElement, selector: string, index: true) => Element[])
  }
 */
var JL = function(root, selector, index) {
	if(typeof index === "undefined") index = -1;

	if(typeof root === "string") {
		var elm = document.querySelectorAll(root);
		index = selector;
	} else {
		if(!(root instanceof HTMLElement)) throw new TypeError(`'root' is not valid HTMLElement`);
		if(typeof selector !== "string") throw new TypeError(`'selector' is not a HTML selector`);

		var elm = root.querySelectorAll(selector);
	}
	if(index === true) return [...elm];
	if(!elm.length) return undefined;
	else if(elm.length == 1) return elm[0];
	else if(index > -1) return elm[index];
	else return [...elm];
};

/**
 * @deprecated Use `JL(...)` instead
 */
var get = JL;

function setCSSproperty(elm, property, value) {
	var prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"];
	for(var i = 0; i < prefixes.length; i++) {
		elm.style[prefixes[i] + property] = value;
	}
	return value;
}

function setCSSvariable(name, value, elm = document.documentElement) {
	elm.style.setProperty("--" + name, value);
	return value;
}

function encodeHTML(text) {
	var node = document.createElement("span");
	node.innerText = text;
	return node.innerHTML;
}

function decodeHTML(html) {
	var node = document.createElement("span");
	node.innerHTML = html;
	return node.innerText;
}

function getAttributes(elm) {
	var obj = {};
	var atts = elm.attributes;
	for(var att of atts) obj[att.nodeName] = att.nodeValue;
	return obj;
}

function getElementPosition(elm) {
	var off = elm.getBoundingClientRect();
	return new Vector(off.left, off.top);
}

function getElementDimensions(elm) {
	var off = elm.getBoundingClientRect();
	return new Dimensions(off.width, off.height /*off.left*/);
}

function cloneElement(node, style = true) {
	var clone = node.cloneNode(true);
	if(style) clone.style.cssText = document.defaultView.getComputedStyle(node, "").cssText;
	return clone;
}

/**
 * 
 * @param {HTMLElement} elm Target element
 * @param {number} minimal 
 * @param {number} axis 0 - Both axis, 1 - X axis, 2 - Y axis (default = 2)
 * @returns {boolean}
 */
function isElementInView(elm, minimal = 1, axis = 2) {
	var pos = getElementPosition(elm);
	var dim = getElementDimensions(elm);
	minimal = clamp(minimal, 0, 1);

	if(axis != 0 && axis != 1 && axis != 2) throw new TypeError(axis + " is not valid axis");

	var isX = pos.x + dim.w * (1 - minimal) > 0 && pos.x + dim.w * minimal < window.innerWidth;
	var isY = pos.y + dim.h * (1 - minimal) > 0 && pos.y + dim.h * minimal < window.innerHeight;

	if(axis == 0 && isX && isY) return true;
	else if(axis == 1 && isX) return true;
	else if(axis == 2 && isY) return true;
	return false;
}

/**
 * Returns scroll position of HTML Body element from top in pixels
 * @returns {number} Scroll position in pixels
 */
function getScrollTop() {
	return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function enterFullscreen(elm = window.document.body) {
	if(elm.requestFullscreen) {
		elm.requestFullscreen();
	} else if(elm["mozRequestFullScreen"]) {
		/* Firefox */
		elm["mozRequestFullScreen"]();
	} else if(elm["webkitRequestFullscreen"]) {
		/* Chrome, Safari & Opera */
		elm["webkitRequestFullscreen"]();
	} else if(elm["msRequestFullscreen"]) {
		/* IE/Edge */
		elm["msRequestFullscreen"]();
	} else return false;
}

function isFullscreen() {
	if(window.innerHeight == screen.height) return true;
	else return false;
}

function exitFullscreen() {
	if(document.exitFullscreen) {
		document.exitFullscreen();
	} else if("mozCancelFullScreen" in document) {
		document["mozCancelFullScreen"]();
	} else if("webkitExitFullscreen" in document) {
		document["webkitExitFullscreen"]();
	} else if("msExitFullscreen" in document) {
		document["msExitFullscreen"]();
	} else return false;
}

function isTouchscreen() {
	if(("ontouchstart" in window) || navigator.maxTouchPoints > 0 || navigator["msMaxTouchPoints"] > 0 || ("DocumentTouch" in window && document instanceof DocumentTouch)) return true;
	else return false;
}

/* ======= Universal ======= */

/**
 * Parses query string as object
 * @param {string} string Query string
 * @returns {Object} Query string object
 */
function getQueryParameters(string = window.location.search) {
	var obj = {};
	var params = string.split(/[?&]+/);

	for(var param of params) {
		if(!param) continue;

		var o = param.split("=");
		obj[o[0]] = o[1];
	}

	return obj;
}

/**
 * Converts number from one range to another.
 * @param {number} x Number to be mapped.
 * @param {number} fromMin Starting range of the input number.
 * @param {number} fromMax Ending range of the input number.
 * @param {number} [toMin=0] Starting range of output number (Default: 0).
 * @param {number} [toMax=1] Ending range of output number (Default: 1).
 * @returns {number}
 */
function map(x, fromMin, fromMax, toMin = 0, toMax = 1) {
	return (
		(x * toMax - x * toMin - fromMin * toMax + fromMin * toMin) /
		(fromMax - fromMin) +
		toMin
	);
}

/**
 * Converts number from one range to another.
 * @param {number} x Number to be clamped.
 * @param {number} [min=0] Minimal number (Default: 0).
 * @param {number} [max=1] Maximal number (Default: 1).
 * @returns {number}
 */
function clamp(x, min = 0, max = 1) {
	return x < min ? min : x > max ? max : x;
}

/**
 * Wraps number around specified range.
 * @param {number} x Number to be wrapped.
 * @param {number} [min=0] Minimal number (Default: 0).
 * @param {number} [max=1] Maximal number (Default: 1).
 * @param {boolean} [includeMax=true] (Default: true).
 * @returns {number}
 */
function wrap(x, min = 0, max = 1, includeMax = true) {
	if(includeMax) max += 1;

	const d = max - min;
	return ((x - min) % d + d) % d + min;
}

/**
 * @deprecated Use `clamp(...)` instead
 */
var fit = clamp;

/**
 * Checks whether Array contains Element.
 * @deprecated Use native `Array.prototype.includes(...)`
 * @param {Array} arr Number to be mapped.
 * @param {any} elm Starting range of the input number.
 * @returns {boolean}
 */
function arrContains(arr, elm) {
	for(var i = 0; i < arr.length; i++) {
		if(arr[i] == elm) return true;
		else continue;
	}
	return false;
}

function shuffleArray(o) {
	for(var j, x, i = o.length; i; j = ~~(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
}

/**
 * Returns index of element in 2D Array.
 * @param {Array} arr Number to be mapped.
 * @param {any} elm Starting range of the input number.
 * @returns {[number, number] | -1}
 */
function indexOf(arr, elm) {
	for(var i = 0; i < arr.length; i++) {
		for(var j = 0; j < arr[i].length; j++)
			if(arr[i][j] == elm) return [i, j];
	}
	return -1;
}

/**
 * 
 * @param {string} html 
 * @returns {ChildNode | NodeListOf<ChildNode>}
 */
function parseHTML(html) {
	var template = document.createElement("template");
	template.innerHTML = html.trim();
	var elms = template.content.childNodes;
	return elms.length == 1 ? elms[0] : elms;
}

// eslint-disable-next-line valid-jsdoc
/**
 * 
 * @deprecated Use native `String.prototype.matchAll(...)` instead
 * @param {string | RegExp} text 
 * @param {RegExp} regex 
 * @param {(match: RegExpExecArray) => void} callback 
 * @returns {number} Last index
 */
function loopRegex(text, regex, callback) {
	if(text instanceof RegExp) [regex, text] = [text, regex];

	var i = 0,
		flags = regex.flags,
		match;

	if(flags.indexOf("g") < 0) regex = new RegExp(regex, flags + "g");
	while((match = regex.exec(/** @type {string} */(text))) != null) {
		if(i > 10000) throw new Error("Infinite loop");
		callback(match);
		i++;
	}
	return i;
}

function objectDeepMerge(target, source, isMergingArrays = false) {
	target = (obj => {
		let cloneObj;
		try {
			cloneObj = JSON.parse(JSON.stringify(obj));
		} catch(err) {
			// If the stringify fails due to circular reference, the merge defaults
			//   to a less-safe assignment that may still mutate elements in the target.
			// You can change this part to throw an error for a truly safe deep merge.
			cloneObj = Object.assign({}, obj);
		}
		return cloneObj;
	})(target);


	if(!Object.isObject(target) || !Object.isObject(source)) return source;

	Object.keys(source).forEach(key => {
		const targetValue = target[key];
		const sourceValue = source[key];

		if(Array.isArray(targetValue) && Array.isArray(sourceValue))
			if(isMergingArrays) {
				target[key] = targetValue.map((x, i) => sourceValue.length <= i
					? x
					: objectDeepMerge(x, sourceValue[i], isMergingArrays));
				if(sourceValue.length > targetValue.length) {
					target[key] = target[key].concat(sourceValue.slice(targetValue.length));
				}
			} else {
				target[key] = targetValue.concat(sourceValue);
			}
		else if(Object.isObject(targetValue) && Object.isObject(sourceValue)) {
			target[key] = objectDeepMerge(Object.assign({}, targetValue), sourceValue, isMergingArrays);
		} else target[key] = sourceValue;
	});

	return target;
}

function insertAt(text, index, addText) {
	return [text.slice(0, index), addText, text.slice(index)].join("");
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function setCursorPos(elm, position) {
	if(elm.createTextRange) {
		var range = elm.createTextRange();
		range.move("character", position);
		range.select();
	} else {
		if(elm.selectionStart) {
			elm.focus();
			elm.setSelectionRange(position, position);
		} else elm.focus();
	}
}

function getDevice(mobile = 370, tablet = 768) {
	var w = window.innerWidth;
	if(w <= mobile) return 2;
	//Mobile
	else if(w <= tablet) return 1;
	//Tablet
	else return 0; //Desktop
}

function setCookie(cname, cvalue, exdays = 0) {
	var expires = "";
	if(exdays > 0) {
		var d = new Date();
		d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
		expires = "expires=" + d.toUTCString() + ";";
	}
	document.cookie = cname + "=" + cvalue + ";" + expires + "path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(";");
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while(c.charAt(0) == " ") c = c.substring(1);
		if(c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}

function delCookie(cname) {
	document.cookie = cname + "=;expires=Wed; 01 Jan 1970";
}

function generateUniqueID(length) {
	var pattern = "1234567890abcdefghijklmnopqrstuvwxyz",
		buffer = "";
	for(var i = 0; i < length; i++) {
		var ch = pattern.charAt(Math.random() * pattern.length);
		buffer += Math.random() > .5 ? ch : ch.toUpperCase();
	}
	return buffer;
}

/**
 * @deprecated Use `generateUniqueID(...)` instead
 */
var getUniqueID = generateUniqueID;

/**
 * Returns random number between given numbers or between 0 and given number.
 * @param {number} min Minimal number.
 * @param {number} [max=undefined] Maximal number.
 * @param {boolean} [round=true]
 * @returns {number}
 */
function random(min, max = undefined, round = true) {
	var ran = 0;
	if(max == undefined) ran = Math.random() * min;
	else ran = Math.random() * (max - min) /* + 1*/ + min;
	return round ? ~~ran : ran;
}

function randomGaussian(min, max, skew = 1) {
	let u = 0,
		v = 0;
	while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	while(v === 0) v = Math.random();
	let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

	num = num / 10.0 + 0.5; // Translate to 0 -> 1
	if(num > 1 || num < 0) num = randomGaussian(min, max, skew); // resample between 0 and 1 if out of range
	num = Math.pow(num, skew); // Skew
	num *= max - min; // Stretch to fill range
	num += min; // offset to min
	return num;
}

/**
 * Returns distance between two Vectors.
 * @param {Vector} v1 Minimal number.
 * @param {Vector} v2 Maximal number.
 * @returns {number}
 */
function distance(v1, v2) {
	return v1.z && v2.z ?
		Math.hypot(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z) :
		Math.hypot(v2.x - v1.x, v2.y - v1.y);
}

/**
 * Returns angle between two Vectors.
 * @param {Vector} v1 Minimal number.
 * @param {Vector} v2 Maximal number.
 * @returns {number}
 */
function angle(v1, v2) {
	return Math.atan2(v2.y - v1.y, v2.x - v1.x);
}

/**
 * Converts HEXa color to RGBa.
 * @deprecated Use `new Color(...).toString("rgba")` instead
 * @param {string} b HEXa color prefixed with "#".
 * @returns {string}
 */
function hexa2rgba(b) {
	var c = b.match(/#(.{2})(.{2})(.{2})(.{2})/);
	if(!c) throw new Error("Correct format: #rrggbbaa");
	var d = "";
	for(var i = 1; i < 4; i++)
		d += (i == 1 ? "" : ",") + parseInt("0x" + c[i]);
	return "rgba(" + d + "," + (~~((parseInt("0x" + c[4]) / 255) * 100) / 100 + "").slice(1) + ")";
}

/**
 * Parses color string to Color object
 * @deprecated Use `new Color(...)` instead
 * @param {string} color HEXa color prefixed with "#".
 * @returns {Color}
 */
function parseColor(color) {
	if(color.startsWith("#")) {
		//Hexadecimal
		color = hexa2rgba((color + "00").slice(0, 9));
	}
	var ch = color.split(",").map(elm => {
		return +elm.match(/[0-9.]+/)[0];
	});
	return new Color(ch[0], ch[1], ch[2], ch[3] || 1);
}

/**
 * Returns shortened size with units.
 * @param {number} s Size in bytes.
 * @returns {string}
 */
function getFormattedSize(s) {
	if(s < 1024) return s + "B";
	else if(s < 1048576) return (s / 1024).toFixed(2) + "kB";
	else if(s < 1073741824) return (s / 1048576).toFixed(2) + "MB";
	else return (s / 1073741824).toFixed(2) + "MB";
}

/**
 * Returns shortened time with units.
 * @param {number} t Time in milliseconds.
 * @returns {string}
 */
function getFormattedTime(t) {
	if(t < 1000) return t + "ms";
	else if(t < 60000) return (t / 1000).toFixed(2) + "s";
	else if(t < 3600000) return (t / 60000).toFixed(2) + "m";
	else return (t / 3600000).toFixed(2) + "h";
}

function fixDigits(number, digits = 2, preverse = false) {
	if(number.toString().length >= digits && preverse) return number.toString();
	var zeros = "";
	for(var i = 0; i < digits; i++) zeros += "0";
	return (zeros + number).slice(-digits);
}

/**
 * Synchronous timeout.
 * @param {number} time Time in milliseconds.
 * @returns {boolean} Always true
 */
function sleep(time) {
	var t = new Date().getTime() + time;
	while(new Date().getTime() < t);
	return true;
}

/**
 * Asynchronous timeout.
 * @async
 * @param {number} time Time in milliseconds.
 * @returns {Promise}
 */
function timeout(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}

// eslint-disable-next-line valid-jsdoc
/**
 * Create iterable key-value pairs.
 * @template T
 * @param {T} iterable Iterable Object, Array or any other value.
 * @returns {T extends Array | String ? [number, T[number]][] : [number, keyof T, T[keyof T]][]} Iterator
 * @example
 * iterate([4, 5, 6]);           // [[0, 4], [1, 5], [2, 6]]
 * iterate([]);                  // []
 * iterate({a: 4, b: 5, c: 6});  // [[0, "a", 4], [1, "b", 5], [2, "c", 6]]
 * iterate({});                  // []
 * iterate("bar");               // [[0, "b"], [1, "a"], [2, "r"]]
 * iterate(11);                  // [[0, 11]]
 * iterate(true);                // [[0, true]]
 * iterate(false);               // [[0, false]]
 * iterate(null);                // []
 * iterate(undefined);           // []
 */
function iterate(iterable) {
	if(iterable === undefined || iterable === null) return [];
	else if(typeof iterable === "string") return /** @type {any} */([...iterable].map((char, i) => [i, char]));
	else if(iterable instanceof Array) return /** @type {any} */(iterable.map((value, i) => [i, value]));
	else if(iterable.constructor === Object) return /** @type {any} */(Object.entries(iterable).map(([key, value], i) => [i, key, value]));
	else return /** @type {any} */([[0, iterable]]);
}

// eslint-disable-next-line valid-jsdoc
/**
 * Zips multiple iterators
 * @template A, B, C, D, E
 * @param {[A[]?, B[]?, C[]?, D[]?, E[]?]} iterables
 * @returns {[A[number], B[number], C[number], D[number], E[number]][]} Iterator
 * @example
 * zip(["John", "Charles", "Mike"], ["Jenny", "Christy", "Monica"]); //[["John", "Jenny"], ["Charles", "Christy"], ["Mike", "Monica"]]
 * zip([1, "a"], [2, "b"], [3]) //[1, 2, 3] -> "c" is missing
 */
function zip(...iterables) {
	var iterator = [];
	var len = Math.min(...iterables.map(e => e.length));

	if(iterables.length == 0) return iterator;

	for(var i = 0; i < len; i++) {
		iterator[i] = [];
		for(var j = 0; j < iterables.length; j++) {
			iterator[i][j] = iterables[j][i];
		}
	}

	return /** @type {any} */(iterator);
}

/**
 * Create iterable range array.
 * @param {number} [start=0] Starting number of the sequence. Default value is 0
 * @param {number} [stop] Ending number of the sequence.
 * @param {number} [step=1] difference between each number in the result. Default value is 1
 * @returns {number[]} Iterable Array object with given range.
 */
function range(start = 0, stop = undefined, step = 1) {
	var array = new Array();

	if(typeof stop === "undefined") {
		stop = start;
		start = 0;
	}

	for(var i = start; i < stop; i += step) array[i] = i;

	return array;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Uniquifies input value.
 * 
 * If the input value `x` is `Iterable` it eliminates duplicates from a list.
 * If the input value `x` is `Object` literal it creates shallow copy of the Object.
 * If the input value `x` is primitive it will be returned unchanged.
 * 
 * Special case: If the input value `x` is `string` it is splitted into char array and duplicates are removed.
 * @template T
 * @param {T} x Any value (should be Iterable (Array or String) or Object literal)
 * @return {T extends string ? string[] : T} 
 * @example
 * const o = {foo: "bar"};
 * 
 * uniquify(0);             // 0
 * uniquify(8);             // 8
 * uniquify(true);          // true
 * uniquify(false);         // false
 * uniquify(null);          // null
 * uniquify(undefined);     // undefined
 * uniquify("");            // []
 * uniquify("test");        // ["t", "e", "s"]
 * uniquify([1, 2, 3]);     // [1, 2, 3] != x
 * uniquify([1, 2, 3, 2, 3, 3, 1]);  // [1, 2, 3]
 * uniquify([o, {"baz":"fab"}, o]);  // [{"foo":"bar"} == o, {"baz":"fab"}]
 * uniquify([{"boo":"faz"}, {"boo":"faz"}]);  // [{"boo":"faz"}, {"boo":"faz"}] != x
 * uniquify(o);             // {"foo":"bar"} != o
 * uniquify({"bar":"baz"}); // {"bar":"baz"} != x
 */
function uniquify(x) {
	if(x === null || x === undefined) return /** @type {any} */(x);
	if(x[Symbol.iterator]) return /** @type {any} */([...new Set(/** @type {any} */(x))]);
	if(x.constructor === Object) {
		const obj = /** @type {any} */({});
		for(const key in x) obj[key] = x[key];
		return obj;
	}
	return /** @type {any} */(x);
}


function copyToClipboard(text) {
	var node = document.createElement("textarea");
	node.value = text;
	node.style.top = "0";
	node.style.left = "0";
	node.style.position = "fixed";

	JL("body", 0).appendChild(node);
	node.focus();
	node.select();

	document.execCommand("copy");

	node.remove();
}

const HIGHLIGHTER = {
	COMMENT: "#888888",
	REGEX: "#e46f6f",
	NUMBER: "#c88dff",
	STRING: "#ffe484",
	TEMPLATE_CODE: "#71b0ff",
	NAME: "#c0ff00",
	DATA_TYPE: "#00ffc4",
	IMPORT: "#ed0082",
	CONTROL: "#ed0082",
	CONSTANT: "#ff0073",
	CONDITIONAL: "#ed0082",
	FUNCTION: "#ff904d",
	ARITHMETIC: "#ffffff",
	STORAGE: "#5ea6e8",
	KEYWORD: "#ed0082",
	VARIABLE: "#b9e7ff",
	ENUM: "#58c5d8",
	INDENT: "#505050",
	SELECTION: "#0089ac",
	SELECTED_LINE: "#353535",
	LINE_NUMBER: "#808080",
	BACKGROUND: "#262626"
};

/**
 * Highlighter options
 * @typedef {Object} HighlightOptions
 * @prop {number} [tabSize=4] Size of indent tab
 * @prop {boolean} [indentLines=true] Add indent lines
 * @prop {boolean} [wrapLines=false] Wrap lines if container is small
 * @prop {boolean} [lineNumbers=true] Add line numbers
 * @prop {boolean} [style=true] Include CSS in result
 * @prop {boolean} [colorVariables=true] Colors as variables (can be then changed through CSS)
 * @prop {number} [fontSize=14] Font size
 * @prop {number} [lineHeight=18] Line Height
 * @prop {boolean} [allowSelection=true] Allow line selection
 * @prop {boolean} [debug=true] Toggle debugging mode
 */

// eslint-disable-next-line valid-jsdoc
/**
 * Highlight input code as HTML
 * @param {string} str Input code
 * @param {HighlightOptions} options Highlighter options 
 * @param {(error: Error, originalString: string) => void} onerror Error event callback
 * @return {string} Highlighted input code
 */
function Highlight(str, {
	tabSize = 4,
	indentLines = true,
	wrapLines = false,
	lineNumbers = true,
	style = true,
	colorVariables = true,
	fontSize = 14,
	lineHeight = 18,
	allowSelection = true,
	debug = false
} = {}, onerror = null) {
	var Colors = {
		/*"(\\w+)": "red",*/
		/*"(\\/\\/.*?(?:\\\\n|\\n|$)|\\/\\*(?:.|\\n|\\r)*?\\*\\/)": "COMMENT",*/
		"(\\/\\/.*?(?:\\n|$)|\\/\\*(?:.|\\n|\\r)*?\\*\\/)": "COMMENT",
		"(?<!\\w)(?<!\\w)(\\/(?:\\\\\\/|.)*?\\/[gmixsuXUAJD]*)(?!\\w)(?!\\s\\w)": "REGEX",
		"(?:^|[^a-zA-Z0-9_$])(?:\\+|-)?((?:0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][0-1]+)|(?:\\d+\\.|\\.)?\\d+)(?:e(?:\\+|-)?\\d+)?)": "NUMBER",
		"(\".*?\"(?<!\\\\\")|'.*?'(?<!\\\\'))": "STRING",
		/*"(?:`|})((?:.|\\n)*?)(?:`|\\${)(?<!\\\\`)": "#ffe484", //broken*/
		/*"(`)": "#ffe484",*/
		"(`(?:.|\\n|\\r\\n)*?`)(?<!\\\\`)": "STRING", //`
		"(?:`|}).*?(\\${)": "TEMPLATE_CODE",
		"(}).*?(?:`|\\${)": "TEMPLATE_CODE",
		"(?:new|class)\\s+([^0-9]\\w+)": "NAME",
		"(?:extends)\\s+([^0-9]\\w+)": "DATA_TYPE",
		"(?:^|[^a-zA-Z0-9_$])(Function|Number|Integer|Float|Boolean|public|private|signed|unsigned|console|Math|Date|Object|String|Array)(?!\\w)": "DATA_TYPE",
		"(?:\\*|\\w)\\s(as)\\s.": "IMPORT",
		"(?:^|[^a-zA-Z0-9_$])(?:import.*?)(from)(?!\\w)": "IMPORT",
		"(?:^|[^a-zA-Z0-9_$])(new|else|try|case|break|continue|return|default|throw|with|yield|await|import|#include|#define)(?!\\w)": "KEYWORD",
		"(?:^|[^a-zA-Z0-9_$])(true|false|Infinity|NaN|null|undefined)(?!\\w)": "CONSTANT",
		"(?:^|[^a-zA-Z0-9_$])(var|let|const|this|function|super|debugger|delete|export|async|constructor|of|in|typeof|instanceof|int|long|float|double|char|bool|void|static|class|extends|=&gt;)(?!\\w)": "STORAGE",
		"(?:^|[^a-zA-Z0-9_$])(document)(?!\\w)": "ENUM",
		"(?:^|[^a-zA-Z0-9_$])(for|while|do|if|eval|catch|switch)(\\s*|)(\\(|{)": "CONDITIONAL",
		"([A-Za-z_$][A-Za-z0-9_$]*)\\s*(?:\\(|\\?\\.\\(|=\\s*(?:async)?\\s*(?:function|\\(|\\w+\\s*&gt;))": "FUNCTION",
		"(?:^|[^a-zA-Z0-9_$])([A-Z_$][A-Z0-9_$]*)(?!^|[a-zA-Z0-9_$])": "ENUM",
		"(&gt;|&lt;)": "ARITHMETIC",
		"([(){}\\[\\]+\\-*?%.:,;&|^!<>=~/])": "ARITHMETIC",
		/*"(Number|Integer|Float|Boolean|String)(<\/a>| )(.*?)[(){}\\[\\]+\\-*?%.:,;&|^!<>=]==>2": "#ff5729",*/
		/*"(\\.|^| |${charGroup0})*([A-Za-z_]\w*?)(\\.|^| |${charGroup0})==>2": "#ff9234"*/
	};

	var positions = [];

	var originalString = str;
	var failed = false;

	str = str.replace(/(>)/g, "&gt;");
	str = str.replace(/(<)/g, "&lt;");

	//console.log(str);

	try {

		for(var regex in Colors) {
			let index = 0;
			var id = (regex.match(/==>([0-9])*$/) || "")[1];
			if(id) {
				index = +id;
				regex = regex.replace(/==>[0-9]*$/, "");
			}

			// regex = regex.replace(/\${(.*?)}/gm, (match, variable) => {
			// 	return defaults[variable];
			// });

			var regexp = new RegExp(regex, "gm");
			if(debug) console.log(regexp);

			//console.log(regexp, str);
			//console.log(regexp.test(str));

			str.replace(regexp, (match, ...groups) => {
				//if(match.match(/(&gt;|&lt;)/)) return;

				if(debug) console.log(match);

				var offset = groups[groups.length - 2];
				var group = groups[index];

				var start = match.indexOf(group);
				var end = start + group.length;

				var before = match.substring(0, start);
				var after = match.substring(end, match.length);

				var pos = offset + before.length;

				var color = Colors[`${regex}${id ? "==>" + id : ""}`];

				positions.push([pos, color, pos + group.length]);

				return match;
			});
		}

		positions.sort((a, b) => {
			return a[0] - b[0];
		});

		var offset = 0;
		var Start = -1;
		var End = -1;

		for(var position of positions) {
			var start = position[0];
			var color = position[1];
			var end = position[2];

			if(start < End) {
				//console.log(true);
				continue;
			}

			Start = start;
			End = end;

			var code = str;
			var pos0 = start + offset;

			var text0 = `<span style="color: var(--${color})">`;
			var text1 = "</span>";

			var pos1 = text0.length + end + offset;

			//var sub = text0 + str.substring(pos0, pos1) + text1;

			//str = str.slice(0, pos0 - text0.length) + sub + str.slice(pos1 + text1.length);

			str = str.slice(0, pos0) + text0 + str.slice(pos0);
			str = str.slice(0, pos1) + text1 + str.slice(pos1);

			offset += text0.length + text1.length;
		}

		//console.log(str);
		//console.log(str.match(/(<span style=".*?">)((?:.|\r\n)*?)(<\/span>)/gmi));
		str = str.replace(/(<span style=".*?">)((?:.|\r\n)*?)(<\/span>)/gim, (match, text0, sub, text1) => {
			if(sub.indexOf("\n") == -1) return match;

			//console.log(sub);
			sub = sub.replace(/\n/gm, `${text1}\n${text0}`);
			//console.log(sub);

			return text0 + sub + text1;
		});

	} catch(e) {
		if(onerror) onerror(e, originalString);
		failed = true;
		//return originalString;
		//throw "Update your browser!";
	}

	//console.log(str);

	const TAB = range(tabSize).reduce(prev => prev + "&nbsp;", "");
	const INDENT = "<span class=\"highlight-indent\"></span>";
	const BR = "<br>";

	str = str.replace(/\t/g, TAB/*"&nbsp;&nbsp;&nbsp;&nbsp;"*/);
	str = str.replace(/  /g, "&nbsp;&nbsp;");
	//str = str.replace(/ {2}/g, "&nbsp;&nbsp;");
	//str = str.replace(/\n/g, "&nbsp;&nbsp;");

	var tabRegex = new RegExp("((&nbsp;){" + tabSize + "})", "g");
	var indentRegex = new RegExp("(<pre>|&nbsp;)((&nbsp;){" + tabSize + "})", "g");

	var lines = str.split("\n");
	for(var i = 0; i < lines.length; i++) {
		if(!lines[i].length || !(lines[i].length == 1 && lines[i] == "\r")) continue;
		var tabs = "";
		//console.log(i, ((lines[i - 1] || "").match(tabRegex) || "").length, lines[i]);
		for(var j = 0; j < ((lines[i - 1] || "").match(tabRegex) || "").length; j++) tabs += TAB;//"&nbsp;&nbsp;&nbsp;&nbsp;";
		lines[i] = tabs;
		if(debug) console.log(i, lines[i]);
	}
	str = lines.join("\n");

	//str = str.replace(/(&nbsp;{4})/g, '$1<a style="border-left:1px solid grey"></a>');

	//str = str.replace(/(\r\n|\n|\r)/g, "<br>");
	var lines = str.split("\n");

	for(var i = 0; i < lines.length; i++) {
		const lineNumber = lineNumbers ? `<td class="highlight-line"><div class="highlight-div">${i + 1}</div></td>` : "";
		lines[i] = `<tr class="highlight-tr">${lineNumber}<td class="highlight-code"><pre class="highlight-pre" ${failed ? 'style="color: white;"' : ""}>${lines[i].replace(/\r/g, "") || "<br>"}</pre></td></tr>`;

		if(indentLines) {
			if(debug) console.log(lines[i]);
			//var tabs = (lines[i].match(/<pre>(&nbsp;)*/) || [""])[0].split(/&nbsp;/).length - 1;
			//lines[i] = lines[i].replace(indentRegex, '$1<span style="border-left:1px solid #505050;position:absolute;height: 19px;"></span>$2');
			lines[i] = lines[i].replace(/(<pre.*?>|<span style=".*?">)((?:&nbsp;)+|<br>)/, (match, before, tabs) => {
				const isEmptyLine = tabs == BR;
				let len = 0;

				if(isEmptyLine && lines[i - 1]) {
					len = (lines[i - 1].split(INDENT).length - 1) * tabSize;
				} else {
					len = tabs.split(/&nbsp;/).length - 1;
				}

				const indent = (INDENT + TAB).repeat(len / tabSize);
				const remain = "&nbsp;".repeat(len % tabSize);
				const newLine = isEmptyLine && len == 0 ? BR : "";
				//var indent = range(0, len - len % tabSize, tabSize).reduce(prev => prev + INDENT + TAB, "");
				//var remain = range(len % tabSize).reduce(prev => prev + "&nbsp;", "");

				return before + indent + remain + newLine;
			});
			if(debug) console.log(lines[i]);
			//((&nbsp;){4})(?=<pre>|&nbsp;)
		}
	}


	var css = `.highlight-main *[class*="highlight"] {
		margin: 0;
		padding: 0;
		box-sizing: border-box !important;
	}
	.highlight-main {
		display: inline-block;
		width: 100%;
		height: 100%;
		padding: 5px 0;
		color: var(--VARIABLE);
		font-family: monospace;
		font-size: var(--font-size);
		line-height: var(--line-height);
		white-space: nowrap;
		overflow: auto;
		cursor: default;
		background-color: var(--BACKGROUND);
	}
	.highlight-main .highlight-line {
		width: 30px;
		margin: 0 20px 0 10px;
		color: var(--LINE_NUMBER);
		text-align: center;
		vertical-align: top;
		user-select: none;
	}
	.highlight-main .highlight-line div {
		text-align: right;
	}
	.highlight-main tr {
		display: block;
		height: var(--line-height);
		border: none;
		background: transparent;
	}
	.highlight-main[line-wrap="true"] tr {
		min-height: var(--line-height);
		height: auto;
	}
	.highlight-main td {
		display: inline-block;
		/*display: inline-table;*/
		width: 100%;
		height: var(--line-height);
		border: none;
		background: transparent;
	}
	.highlight-main[line-wrap="true"] td {
		min-height: var(--line-height);
		height: auto;
	}
	.highlight-main pre {
		position: relative;
		height: var(--line-height);
	}
	.highlight-main[line-wrap="true"] pre {
		min-height: var(--line-height);
		height: auto;
		white-space: pre-wrap;
	}
	.highlight-main .highlight-indent {
		border-left: 1px solid #505050;
		position: absolute;
		height: var(--line-height);
	}
	.highlight-main tr.selected pre {
		box-shadow: 0 0 0 1px var(--SELECTED_LINE), inset 0 0 0 1px var(--SELECTED_LINE);
	}
	.highlight-main *::-moz-selection {
		background: var(--SELECTION);
	}
	.highlight-main *::selection {
		background: var(--SELECTION);
	}`;

	var js = `toggleClass(get(this, '.selected'), 'selected', false); toggleClass(event.path.filter(e => e.tagName && e.tagName.toLowerCase() == 'tr')[0], 'selected', true);`;

	return (`
		<div 
			class="highlight-main"
			line-wrap="${wrapLines}"
			style="
				--line-height: ${lineHeight}px;
				--font-size: ${fontSize}px;
				${colorVariables ? HIGHLIGHTER.reduce((prev, {key, value}) => prev + "--" + key + ": " + value + ";\n", "") : ""}
			"
			${allowSelection ? 'onmousedown="' + js + '"' : ""}
		>
			${style ? '<style class="highlight-style">' + css + "</style>" : ""}
			<table class="highlight-table">${lines.join("")}</table>
		</div>
	`)
		.replace(/\s{2,}/g, " ")
		.replace(/(\n|\r)/g, "")
		.trim();
}
Highlight.getColorVariablesCSS = function() {
	return HIGHLIGHTER.reduce((prev, {key, value}) => prev + "--" + key + ": " + value + ";\n", "");
};

class Matrix {
	/**
	 * Useful to store Matrix data. Class contains methods to make operations with another Matrices.
	 * @param {number | Array<number[]>} matrix Array matrix or Number of rows.
	 * @param {number} cols Number of columns.
	 */
	constructor(matrix /*rows*/, cols = undefined) {
		if(typeof matrix === "object") {
			/**
			 * @type {Array<number[]>}
			 */
			this.matrix = matrix.map(e => e.slice());

			/**
			 * @type {number}
			 */
			this.rows = matrix.length;

			/**
			 * @type {number}
			 */
			this.cols = matrix[0].length;
		} else if(typeof matrix === "number" && cols) {
			this.rows = matrix;
			this.cols = cols;

			this.matrix = [];
			for(var i = 0; i < this.rows; i++) {
				this.matrix.push([]);
				for(var j = 0; j < this.cols; j++) {
					this.matrix[i][j] = 0;
				}
			}
		}
	}

	/**
	 * Multiplies Matrix with another Matrix or Number.
	 * @param {Matrix} matrix Matrix or Number.
	 * @param {boolean} [hadamard=false]
	 * @returns {Matrix}
	 */
	mult(matrix, hadamard = false) {
		var isMat = matrix instanceof Matrix;
		var mMat = isMat ? matrix : this;
		var mat = new Matrix(this.rows, mMat.cols);

		if(hadamard) {
			if(this.rows != matrix.rows || this.cols != matrix.cols) {
				console.warn("[JustLib] Columns and rows of matrices are not equal! (Hadamard Product)");
				return undefined;
			}
			for(var i = 0; i < this.rows; i++) {
				for(var j = 0; j < this.cols; j++) {
					mat.matrix[i][j] = this.matrix[i][j] * matrix.matrix[i][j];
				}
			}
			return mat;
		}

		if(isMat && this.cols != matrix.rows) {
			console.warn("[JustLib] Columns and rows of matrices are not equal!");
			return undefined;
		}

		for(var i = 0; i < this.rows; i++) {
			for(var j = 0; j < mMat.cols; j++) {
				var sum = 0;
				if(isMat) {
					for(var k = 0; k < this.cols; k++) {
						sum += this.matrix[i][k] * matrix.matrix[k][j];
					}
				} else if(typeof matrix === "number") {
					sum = this.matrix[i][j] * matrix;
				} else {
					console.warn(`[JustLib] Invalid type of parameter "${typeof matrix}", only supported are Numbers and Matrices!`);
					return undefined;
				}
				mat.matrix[i][j] = sum;
			}
		}
		return mat;
	}

	/**
	 * Adds Matrix to another Matrix.
	 * @param {Matrix} matrix Matrix.
	 * @returns {Matrix}
	 */
	add(matrix) {
		var mat = new Matrix(this.rows, this.cols);
		if(!(matrix instanceof Matrix) || this.rows != matrix.rows || this.cols != matrix.cols) return undefined;

		for(var i = 0; i < this.rows; i++) {
			for(var j = 0; j < this.cols; j++) {
				mat.matrix[i][j] = this.matrix[i][j] + matrix.matrix[i][j];
			}
		}

		return mat;
	}

	/**
	 * Substracts Matrix from another Matrix.
	 * @param {Matrix} matrix Matrix.
	 * @returns {Matrix}
	 */
	sub(matrix) {
		var mat = new Matrix(this.rows, this.cols);
		if(!(matrix instanceof Matrix) ||
			this.rows != matrix.rows ||
			this.cols != matrix.cols
		)
			return undefined;

		for(var i = 0; i < this.rows; i++) {
			for(var j = 0; j < this.cols; j++) {
				mat.matrix[i][j] = this.matrix[i][j] - matrix.matrix[i][j];
			}
		}
		return mat;
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Calls callback function on each element of Matrix, and returns result matrix.
	 * @param {(value: number, x: number, y: number, thisArg: Matrix)} callback Callback function.
	 * @returns {Matrix} Result matrix.
	 */
	map(callback) {
		var mat = new Matrix(this.rows, this.cols);
		for(var i = 0; i < this.rows; i++) {
			for(var j = 0; j < this.cols; j++) {
				mat.matrix[i][j] = callback(this.matrix[i][j], j, i, this);
			}
		}
		return mat;
	}

	/**
	 * Transposes the Matrix. New Matrix is returned.
	 * @returns {Matrix} New transposed Matrix.
	 */
	transpose() {
		var mat = new Matrix(this.cols, this.rows);
		for(var i = 0; i < this.rows; i++) {
			for(var j = 0; j < this.cols; j++) {
				mat.matrix[j][i] = this.matrix[i][j];
			}
		}
		return mat;
	}

	/**
	 * Sets each value to random number in given range.
	 * @param {number} from Range from.
	 * @param {number} to Range to.
	 */
	randomize(from = -1, to = 1) {
		for(var i = 0; i < this.rows; i++) {
			for(var j = 0; j < this.cols; j++) {
				this.matrix[i][j] = random(from, to, false);
			}
		}
	}

	/**
	 * Creates copy of matrix.
	 * @returns {Matrix} new Matrix.
	 */
	copy() {
		return new Matrix(this.matrix);
	}

	/**
	 * Transforms Matrix into 1D array.
	 * @returns {number[]} new Array.
	 */
	toArray() {
		var array = [];
		for(var i = 0; i < this.rows; i++) {
			for(var j = 0; j < this.cols; j++) {
				array[this.rows * j + i] = this.matrix[i][j];
			}
		}
		return array;
	}

	/**
	 * Transforms Matrix into Vector object.
	 * @returns {Vector} Vector object.
	 */
	toVector() {
		if(this.cols != 1) throw new Error("Cannot convert non Nx1 Matrix into Vector!");
		return new Vector(
			this.matrix[0][0],
			this.matrix[1][0],
			this.matrix[2][0]
		);
	}

	/**
	 * Prints Matrix into console as table.
	 */
	print() {
		console.table(this.matrix);
	}
}

/**
 * A class to describe a Vector up to 3 dimensions.
 *
 * @class Vector
 */
class Vector {
	/**
	 * Creates an instance of Vector.
	 * @param {number} [x=0] X component of the vector.
	 * @param {number} [y=0] Y component of the vector.
	 * @param {number} [z=0] Z component of the vector.
	 * @param {number} [angle=0] (Deprecated) Additional component of vector. (Has nothing to do with the actual angle of the vector.)
	 * @memberof Vector
	 */
	constructor(x = 0, y = 0, z = 0, angle = 0) {
		/**
		 * X component of the vector.
		 * @type {number}
		 */
		this.x = +x || 0;

		/**
		 * Y component of the vector.
		 * @type {number}
		 */
		this.y = +y || 0;

		/**
		 * Z component of the vector.
		 * @type {number}
		 */
		this.z = +z || 0;

		/**
		 * Additional component of vector. (Has nothing to do with the actual angle of the vector.)
		 * @deprecated This property should not be used because of it misleading name.
		 * @type {number}
		 */
		this.angle = +angle || 0;
	}

	/**
	 * Adds Vector to current Vector.
	 * @param {Vector} vector
	 * @return {this} 
	 * @memberof Vector
	 */
	add(vector) {
		this.x += vector.x;
		this.y += vector.y;
		this.z += vector.z;

		return this;
	}

	/**
	 * Substracts Vector from current Vector.
	 * @param {Vector} vector
	 * @return {this} 
	 * @memberof Vector
	 */
	sub(vector) {
		this.x -= vector.x;
		this.y -= vector.y;
		this.z -= vector.z;

		return this;
	}

	/**
	 * Multiplies current Vector by scalar.
	 * @param {number} n
	 * @return {this} 
	 * @memberof Vector
	 */
	mult(n) {
		this.x *= n;
		this.y *= n;
		this.z *= n;

		return this;
	}

	/**
	 * Divides current Vector by scalar.
	 * @param {number} n
	 * @return {this} 
	 * @memberof Vector
	 */
	div(n) {
		this.x /= n;
		this.y /= n;
		this.z /= n;

		return this;
	}

	/**
	 * Inverts current Vector.
	 * @return {this} 
	 * @memberof Vector
	 */
	invert() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;

		return this;
	}

	/**
	 * Calculates dot product of current Vector and given Vector.
	 * @param {Vector} vector
	 * @return {number} 
	 * @memberof Vector
	 */
	dot(vector) {
		return this.x * vector.x + this.y * vector.y + this.z * vector.z;
	}

	/**
	 * Calculates a Vector composed of the cross product between current Vector and given Vector.
	 * @param {Vector} vector
	 * @return {Vector} 
	 * @memberof Vector
	 */
	cross(vector) {
		return new Vector(
			this.y * vector.z - this.z * vector.y,
			this.z * vector.x - this.x * vector.z,
			this.x * vector.y - this.y * vector.x
		);
	}

	/**
	 * Calculates the magnitude (length) of current Vector.
	 * @return {number} 
	 * @memberof Vector
	 */
	mag() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	/**
	 * Normalizes current Vector.
	 * @return {this} 
	 * @memberof Vector
	 */
	normalize() {
		const m = this.mag();

		if(m != 0 && m != 1) {
			this.x /= m;
			this.y /= m;
			this.z /= m;
		}

		return this;
	}

	/**
	 * Sets the magnitude of current Vector.
	 * @param {number} length
	 * @return {this} 
	 * @memberof Vector
	 */
	setMag(length) {
		this.normalize();
		this.mult(length);

		return this;
	}

	/**
	 * Creates a new Vector instance initialized with the same components as current Vector.
	 * @return {Vector} 
	 * @memberof Vector
	 */
	copy() {
		return new Vector(this.x, this.y, this.z, this.angle);
	}

	/**
	 * Calculates the distance from current vector to a given vector.
	 * @param {Vector} vector
	 * @return {number} 
	 * @memberof Vector
	 */
	distanceTo(vector) {
		return Math.hypot(vector.x - this.x, vector.y - this.y, vector.z - this.z);
	}

	/**
	 * Checks if the components of the current Vector are equal to components of another Vector.
	 * @param {Vector} vector
	 * @return {boolean} 
	 * @memberof Vector
	 */
	isEqual(vector) {
		return this.x == vector.x && this.y == vector.y && this.z == vector.z;
	}

	/**
	 * Converts current Vector into {size}X1 matrix
	 * @param {number} [size=4] Number of components to include in the matrix. (Fourth component is always 1.)
	 * @return {Matrix} 
	 * @memberof Vector
	 */
	toMatrix(size = 4) {
		return new Matrix([
			[this.x],
			[this.y],
			[this.z],
			[1]
		].slice(0, size));
	}

	/**
	 * Converts current Vector into 1D array.
	 * @param {number} [size=3] Number of components to include in the array. (Fourth component is always 1.)
	 * @return {Array<number>} 
	 * @memberof Vector
	 */
	toArray(size = 3) {
		return [this.x, this.y, this.z, 1].slice(0, size);
	}

	/**
	 * Converts current Vector into string representation.
	 * @return {string} String represented as "[x, y, z]".
	 * @memberof Vector
	 */
	toString() {
		return `[${this.x}, ${this.y}, ${this.z}]`;
	}

	/**
	 * Creates a new Vector instance from given angle(s).
	 * @static
	 * @param {number} theta
	 * @param {number} [phi=0]
	 * @return {Vector}
	 * @memberof Vector
	 */
	static fromAngle(theta, phi = 0) {
		return new Vector(
			Math.cos(theta) * Math.cos(phi),
			Math.sin(theta) * Math.cos(phi),
			Math.sin(phi)
		);
	}

	/**
	 * Creates a new Vector instance from given array.
	 * @static
	 * @param {Array<number>} array
	 * @return {Vector} 
	 * @memberof Vector
	 */
	static fromArray(array) {
		return new Vector(array[0] || 0, array[1] || 0, array[2] || 0);
	}

	/**
	 * Creates a random vector.
	 * @static
	 * @param {boolean} [unit=true] If `true`, vector will be normalized, otherwise all components will be random numbers between 0 and 1.
	 * @param {RandomGenerator} [rng=null] Random generator to use. If not provided, a JavaScript built-in random generator will be used.
	 * @return {Vector} 
	 * @memberof Vector
	 */
	static random(unit = true, rng = null) {
		if(unit) {
			return rng ?
				Vector.fromAngle(rng.next() * TWO_PI, rng.next() * TWO_PI) :
				Vector.fromAngle(Math.random() * TWO_PI, Math.random() * TWO_PI);
		} else {
			return rng ?
				new Vector(rng.next(), rng.next(), rng.next()) :
				new Vector(Math.random(), Math.random(), Math.random());
		}
	}
}


class Dimensions {
	constructor(width = 0, height = 0, depth = 0, radius = 0) {
		this.w = width;
		this.h = height;
		this.d = depth;
		this.r = radius;
	}

	copy() {
		return new Dimensions(this.w, this.h, this.d, this.r);
	}
}

/**
 * @deprecated Use `Dimensions` instead
 */
var Dimension = Dimensions;

class Color {

	/**
	 * Creates an instance of Color.
	 * @param {number | Color} [red=0]
	 * @param {number} [green=red]
	 * @param {number} [blue=red]
	 * @param {number} [alpha=1]
	 * @memberof Color
	 */
	constructor(red = 0, green = 0, blue = 0, alpha = 1) {
		if(red instanceof Color) {
			//Copy
			this.r = +red.r;
			this.g = +red.g;
			this.b = +red.b;
			this.a = +red.a;
		} else if(isNaN(red) && typeof red === "string") {
			//Parse
			var color = Color.parse(red);

			this.r = color.r;
			this.g = color.g;
			this.b = color.b;
			this.a = color.a;
		} else {
			//Create new
			this.r = +red;
			this.g = typeof green === "undefined" ? +red : +green;
			this.b = typeof blue === "undefined" ? +red : +blue;
			this.a = +alpha;
		}
	}

	/**
	 * Calculates the luminance of the color.
	 * @return {number} Normalized luminance (in range 0 - 1).
	 * @memberof Color
	 */
	getLuminance() {
		return 0.2126 * this.r / 255 + 0.7152 * this.g / 255 + 0.0722 * this.b / 255;
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Calls a defined callback function on each color channel, and returns new Color object that contains the results.
	 * @param {(value: number, channel: string, thisArg: Color) => number} callback A function that accepts up to three arguments. The map method calls the callbackfn function one time for each color channel.
	 * @param {boolean} [alpha=false] Decide to use also alpha channel.
	 * @returns {Color} new Color object
	 */
	map(callback, alpha = false) {
		var c = new Color(this);
		c.r = callback(c.r, "r", this);
		c.g = callback(c.g, "g", this);
		c.b = callback(c.b, "b", this);
		if(alpha) c.a = callback(c.a, "a", this);
		return c;
	}

	applyFilter(red, green, blue) {
		red = 255 - red;
		green = 255 - green;
		blue = 255 - blue;
		var avg = (this.r + this.g + this.b) / 3;
		if(this.r > red || this.g > green || this.g > blue) {
			this.r = avg;
			this.g = avg;
			this.b = avg;
		}
		return true;
	}

	/**
	 * Copies current values from Color object to new Color object
	 * @returns {Color} copied color
	 */
	copy() {
		return new Color(this.r, this.g, this.b, this.a);
	}

	/**
	 * Returns a string representing the color using specified format
	 * Supported formats: RGB, RGBA, HEX, HEXA
	 * Default format: RGBA
	 * @param {"RGB" | "RGBA" | "HEX" | "HEXA"} [format="RGBA"]
	 * @returns {string} color
	 */
	toString(format = "RGBA") {
		switch(format.toLowerCase()) {
			case "rgb":
				return `rgb(${this.r}, ${this.g}, ${this.b})`;
			case "rgba":
				return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
			case "hex":
				return `#${fixDigits(this.r.toString(16))}${fixDigits(this.g.toString(16))}${fixDigits(this.b.toString(16))}`;
			case "hexa":
				return `#${fixDigits(this.r.toString(16))}${fixDigits(this.g.toString(16))}${fixDigits(this.b.toString(16))}${fixDigits(this.a.toString(16))}`;
			default:
				throw new TypeError(`Invalid color format '${format}'`);
		}
	}

	/**
	 * Transforms Color into Vector
	 * @returns {Vector} Color represented as Vector
	 */
	toVector() {
		return new Vector(this.r, this.g, this.b);
	}

	/**
	 * Parses color string
	 * Supported formats: RGB, RGBA, HEX, HEXA, HLS, HSLA
	 * @param {string} string color string
	 * @returns {Color} parsed color
	 */
	static parse(string) {
		var color = string.toString().toLowerCase();

		//HEX
		if(color.startsWith("#")) {
			const components = color.slice(1).split("");

			//Add alpha channel
			if(components.length == 3) components.push("f");
			else if(components.length == 6) components.push("f", "f");

			//Convert to RRGGBBAA
			if(components.length == 4) {
				for(var i = 0; i < 8; i += 2) components.splice(i, 0, components[i]);
			}

			//Convert to RGBA
			if(components.length == 8) {
				var c = [];
				for(var i = 2; i <= 8; i += 2) c.push(parseInt("0x" + components.slice(i - 2, i).join("")));

				return new Color(c[0], c[1], c[2], c[3] / 255);
			} else throw new TypeError(string + " is not a valid HEX color");
		} else if(color.startsWith("rgb")) {
			//RGB
			var match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);

			if(match) {
				var r = clamp(+match[1], 0, 255);
				var g = clamp(+match[2], 0, 255);
				var b = clamp(+match[3], 0, 255);
				var a = clamp(+match[4], 0, 255);

				if(isNaN(a)) a = 1;

				return new Color(r, g, b, a);
			} else throw new TypeError(string + " is not a valid RGBA format");
		} else if(color.startsWith("hsl")) {
			//HSL
			var match = color.match(/hsla?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)(%?),\s*(\d+(?:\.\d+)?)(%?)(?:,\s*(\d+(?:\.\d+)?))?\)/);

			if(match) {
				var h = +match[1] % 360;
				var s = clamp(+match[2] / (match[3] ? 100 : 1), 0, 1);
				var l = clamp(+match[4] / (match[5] ? 100 : 1), 0, 1);
				var a = clamp(+match[6], 0, 1);

				var r = 0, g = 0, b = 0;

				if(isNaN(a)) a = 1;

				var func = (i, h, min, max) => {
					if(i == 0) return 255;
					else if(i == 1) return map(h, min, max, 255, 0);
					else if(i == 2) return 0;
					else if(i == 3) return 0;
					else if(i == 4) return map(h, min, max, 0, 255);
					else if(i == 5) return 255;
				};

				//Hue
				for(var i = 0; i < 6; i++) {
					var min = i * 60;
					var max = (i + 1) * 60;

					if(h >= min && h <= max) {
						r = func((i + 0) % 6, h, min, max);
						g = func((i + 4) % 6, h, min, max);
						b = func((i + 2) % 6, h, min, max);
						break;
					}
				}

				return new Color(r, g, b, a)
					.map(e => map(s, 0, 1, 128, e)) //Saturation
					.map(e => map(l, 0.5, l > 0.5 ? 1 : 0, e, l > 0.5 ? 255 : 0)) //Lightness
					.map(e => Math.round(e));
			} else throw new TypeError(string + " is not a valid HSLA format");
		} else throw new TypeError(string + " is not a valid color type");
	}

	/**
	 * Generate random number according to pamarameters. Positive argument means color component greater than entered argument and lower means less than argument.
	 * @param {number} red Red component of color
	 * @param {number} green Green component of color
	 * @param {number} blue Blue component of color
	 * @returns {Color} Random color
	 * @example
	 * //returns random colors from 128 to 255
	 * Color.random(128, 128, 128);
	 * @example
	 * //returns random colors from 0 to 128
	 * Color.random(-128, -128, -128);
	 */
	static random(red = 0, green = red, blue = green) {
		var r = red < 0 ? random(0, -red) : random(red, 255);
		var g = green < 0 ? random(0, -green) : random(green, 255);
		var b = blue < 0 ? random(0, -blue) : random(blue, 255);

		return new Color(r, g, b, 1);
	}
}

class ComplexNumber {
	/**
	 * Creates new Complex Number object.
	 * @param {string | Array<number | string, number | string>} number String to parse complex number.
	 * @param {string} sign Imaginary unit indicator
	 */
	constructor(number, sign = "i") {
		/* Parse */
		var r, i;

		if(typeof number === "string") {
			number = number.replace(/\s/g, "").replace(/−/g, "-");

			i = (number.match(new RegExp(`[+\\-]?(?:[a-z0-9.]+[${sign}]|[${sign}][a-z0-9.]+)`, "")) || "0")[0];
			r = number.replace(i, "") || "0";

			i = i == sign ? "1" : i.replace(sign, "");
		} else if(number instanceof Array) {
			r = number[0].toString();
			i = number[1].toString();
		} else throw new TypeError(number + " is not a valid complex number");

		/* Init */

		/**
		 * Real part of the number
		 * @type {string}
		 */
		this.r = r;

		/**
		 * Imaginary part of the number
		 * @type {string}
		 */
		this.i = i;

		/**
		 * Imaginary part identifier (usually `i` or `j`)
		 * @type {string}
		 */
		this.sign = sign;

		/**
		 * Distance of number from origin
		 * @type {number}
		 */
		this.distance = Math.hypot(+this.r, +this.i);

		/**
		 * Angle between origin and number
		 * @type {number}
		 */
		this.angle = Math.atan(+this.i / +this.r);
	}

	/**
	 *
	 * @param {ComplexNumber} x
	 * @return {ComplexNumber} 
	 * @memberof ComplexNumber
	 */
	add(x) {
		if(this.sign != x.sign) throw new TypeError("Cannot add two numbers with different imaginary numbers");

		var r = +this.r + +x.r;
		var c = +this.i + +x.i;

		return new ComplexNumber([r.toString(), c.toString()], this.sign);
	}

	/**
	 *
	 * @param {ComplexNumber} x
	 * @return {ComplexNumber} 
	 * @memberof ComplexNumber
	 */
	sub(x) {
		if(this.sign != x.sign) throw new TypeError("Cannot subtract two numbers with different imaginary numbers");

		var r = +this.r - +x.r;
		var c = +this.i - +x.i;

		return new ComplexNumber([r.toString(), c.toString()], this.sign);
	}

	/**
	 *
	 * @param {ComplexNumber} x
	 * @return {ComplexNumber} 
	 * @memberof ComplexNumber
	 */
	mult(x) {
		if(this.sign != x.sign) throw new TypeError("Cannot multiply two numbers with different imaginary numbers");

		var r = +this.r * +x.r - +this.i * +x.i;
		var c = +this.r * +x.i + +this.i * +x.r;

		return new ComplexNumber([r.toString(), c.toString()], this.sign);
	}

	/**
	 *
	 * @param {ComplexNumber} x
	 * @return {ComplexNumber} 
	 * @memberof ComplexNumber
	 */
	div(x) {
		if(this.sign != x.sign) throw new TypeError("Cannot divide two numbers with different imaginary numbers");

		var r = +this.r * +x.r + +this.i * +x.i;
		var c = +this.i * +x.r - +this.r * +x.i;
		var d = +x.r * +x.r + +x.i * +x.i;

		return new ComplexNumber([r + "/" + d, c + "/" + d], this.sign);
	}

	/**
	 *
	 * @param {"a" | "t" | "e"} form
	 * @return {string} 
	 * @memberof ComplexNumber
	 */
	toString(form = "a") {
		if(form == "a") return `${this.r}${this.i.replace(/^([^+\-])/, " + $1")}${this.sign}`;
		else if(form == "t") return `${this.distance.toFixed(2)} * (cos(${~~rad2deg(this.angle)}°) + ${this.sign} * sin(${~~rad2deg(this.angle)}°))`;
		else if(form == "e") return `${this.distance.toFixed(2)} * e^(${this.sign} * ${~~rad2deg(this.angle)}°)`;
		else throw new TypeError("Unknown number form. Supported a = algebraic, t = trigonometric, e = exponential");
	}
}

class EventListener {
	constructor() {
		this.listeners = [];

		/**
		 * @alias EventListener.addEventListener
		 */
		this.on = this.addEventListener;
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Add event handler for specific event
	 * @param {string} type Event type
	 * @param {(event: EventListener.Event) => void} callback Event callback
	 * @returns {EventListener.Listener} Event listener object
	 */
	addEventListener(type, callback) {
		var listener = new EventListener.Listener(type, callback);
		this.listeners.push(listener);
		return listener;
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Fires a specific event
	 * @param {string} type Event type
	 * @param {Object<string, any> | EventListener.Event} [data={}] Custom event data
	 * @param {(event: EventListener.Event) => T} [callback=null] Default action handler
	 * @returns {Promise<T | undefined>} Returned value of the callback function
	 * @template T
	 */
	async dispatchEvent(type, data = {}, callback = null) {
		//Setup Event Object
		const defaultData = {
			type: type,
			time: new Date(),
			defaultPreventable: !!callback
		};

		/** @type {EventListener.Event} */
		let eventObject;

		//Add data to an object
		if(data instanceof EventListener.Event) {
			//Assign Event Object
			eventObject = data;
			eventObject.type = type;

			//Add default data
			for(const prop in defaultData) {
				if(prop in eventObject) continue;
				eventObject[prop] = defaultData[prop];
			}
		} else {
			//Create new Event Object
			eventObject = new EventListener.Event(defaultData, data);
		}

		//Run all listener's callbacks
		const promises = [];

		for(var listener of this.listeners) {
			if(eventObject.isStopped) break;
			if(listener.type != type) continue;

			eventObject.hasListener = true;

			if(eventObject.async && !eventObject.parallel) await listener.callback(eventObject);
			else promises.push(listener.callback(eventObject));
		}

		if(eventObject.async && eventObject.parallel) await Promise.all(promises);
		if(!eventObject.defaultPrevented && typeof callback === "function") return callback(eventObject);
		else return undefined;
	}

	/**
	 * Removes event handler
	 * @param {EventListener.Listener} listener Event listener returned by EventListener.addEventListener()
	 * @returns {boolean} Returns true if listener was removed successfully
	 */
	removeEventListener(listener) {
		for(var elm of this.listeners) {
			if(elm != listener) continue;
			this.listeners.splice(this.listeners.indexOf(listener), 1);
			return true;
		}
		return false;
	}
}
EventListener.Event = class Event {
	constructor(...data) {
		this.type = undefined;
		this.time = new Date();
		this.defaultPreventable = false;
		this.defaultPrevented = false;
		this.isStopped = false;
		this.hasListener = false;
		this.async = false;
		this.parallel = false;

		//Add data to Event Object
		let hasParallelOption = false;
		for(const obj of data) {
			if(typeof obj !== "object") throw new TypeError("Expected object instead got " + obj);
			for(const property in obj) {
				this[property] = obj[property];
				if(property == "parallel") hasParallelOption = true;
			}
		}

		//In case there is no parallel option set, set it to `true` as default
		if(this.async && !hasParallelOption) this.parallel = true;
	}

	preventDefault() {
		if(this.defaultPreventable) this.defaultPrevented = true;
		else throw new Error("Event " + this.type + " is not default preventable!");
	}

	stopPropagation() {
		this.isStopped = true;
	}

	reset() {
		this.time = new Date();
		this.defaultPrevented = false;
		this.isStopped = false;
		this.hasListener = false;
	}
};
EventListener.Listener = class Listener {
	constructor(type, callback) {
		this.type = type;
		this.callback = callback;
	}
};

class EventListenerStatic {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Add event handler for specific event
	 * @param {string} type Event type
	 * @param {(event: EventListener.Event) => void} callback Event callback
	 * @returns {EventListener.Listener} Event listener object
	 */
	static addEventListener(type, callback) {
		var listener = new EventListener.Listener(type, callback);
		this.listeners.push(listener);
		return listener;
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Fires a specific event
	 * @param {string} type Event type
	 * @param {Object<string, any> | EventListener.Event} [data={}] Custom event data
	 * @param {(event: EventListener.Event) => T} [callback=null] Default action handler
	 * @returns {Promise<T | undefined>} Returned value of the callback function
	 * @template T
	 */
	static async dispatchEvent(type, data = {}, callback = null) {
		//Setup Event Object
		const defaultData = {
			type: type,
			time: new Date(),
			defaultPreventable: !!callback
		};

		/** @type {EventListener.Event} */
		let eventObject;

		//Add data to an object
		if(data instanceof EventListener.Event) {
			//Assign Event Object
			eventObject = data;
			eventObject.type = type;

			//Add default data
			for(const prop in defaultData) {
				if(prop in eventObject) continue;
				eventObject[prop] = defaultData[prop];
			}
		} else {
			//Create new Event Object
			eventObject = new EventListener.Event(defaultData, data);
		}

		//Run all listener's callbacks
		const promises = [];

		for(var listener of this.listeners) {
			if(eventObject.isStopped) break;
			if(listener.type != type) continue;

			eventObject.hasListener = true;

			if(eventObject.async && !eventObject.parallel) await listener.callback(eventObject);
			else promises.push(listener.callback(eventObject));
		}

		if(eventObject.async && eventObject.parallel) await Promise.all(promises);
		if(!eventObject.defaultPrevented && typeof callback === "function") return callback(eventObject);
		else return undefined;
	}

	/**
	 * Removes event handler
	 * @param {EventListener.Listener} listener Event listener returned by EventListener.addEventListener()
	 * @returns {boolean} Returns true if listener was removed successfully
	 */
	static removeEventListener(listener) {
		for(var elm of this.listeners) {
			if(elm != listener) continue;
			this.listeners.splice(this.listeners.indexOf(listener), 1);
			return true;
		}
		return false;
	}
}
EventListenerStatic.listeners = [];

/**
 * @alias EventListenerStatic.addEventListener
 */
EventListenerStatic.on = EventListenerStatic.addEventListener;

/**
 * Seedable random number generator.
 */
class RandomGenerator {
	constructor(seed = ~~(Math.random() * 2147483647)) {
		this.setSeed(seed);
		this.initialSeed = this.currentSeed;

		/** @type {((bound: number) => number) & ((origin: number, bound: number) => number)} */
		this.nextInt;
	}

	/**
	 * Set seed of generator.
	 * @param {number} seed Seed of sequence, must be an integer!
	 * @returns {number} seed.
	 */
	setSeed(seed) {
		if(typeof seed !== "number") throw new TypeError("Seed " + seed + " is not valid number");
		if((seed = seed % 2147483647) <= 0) seed += 2147483646;

		return (this.currentSeed = seed);
	}

	/**
	 * Generates next floating point number in sequence.
	 * @returns {number} Random number in sequence (in range [0.0, 1.0]).
	 */
	next() {
		return (((this.currentSeed = (this.currentSeed * 16807) % 2147483647) - 1) / 2147483646);
	}

	/**
	 * Generates next floating point number in sequence.
	 * @param {number} origin
	 * @param {number} [bound]
	 * @returns {number} Random number in sequence (in range [0.0, bound-1] or [origin, bound]).
	 */
	nextFloat(origin, bound) {
		if(bound == undefined) {
			return this.next() * origin;
		}

		return this.next() * (bound - origin + 1) + origin;
	}

	/**
	 * Generates next integer in sequence.
	 * @param {number} origin
	 * @param {number} [bound]
	 * @returns {number} Random number in sequence (in range [0, bound-1] or [origin, bound]).
	 */
	nextInt(origin, bound) {
		return ~~this.nextFloat(origin, bound);
	}

	/**
	 * Generates next random boolean in sequence.
	 * @returns {boolean} Random boolean.
	 */
	nextBoolean() {
		return this.next() < 0.5;
	}

	/**
	 * Shuffles input array elements randomly
	 * @template T
	 * @param {T[]} array
	 * @return {T[]} 
	 * @memberof RandomGenerator
	 */
	shuffle(array) {
		let length = array.length;

		while(length) {
			const index = this.nextInt(length--);
			const temp = array[length];

			array[length] = array[index];
			array[index] = temp;
		}

		return array;
	}

	/**
	 * Picks random element from array
	 * @template T
	 * @param {T[]} array Input array
	 * @returns {T} Random element from array
	 * @memberof RandomGenerator
	 */
	choice(array) {
		return array[this.nextInt(array.length)];
	}

	/**
	 * Generates a random number fitting a Gaussian distribution
	 * @param {number} min Lower bound of distribution
	 * @param {number} max Upper bound of distribution
	 * @param {number} [skew=1] Distribution skew
	 * @return {number} Random number in gaussian distribution
	 * @memberof RandomGenerator
	 */
	gaussian(min, max, skew = 1) {
		let u = 0, v = 0;
		while(u === 0) u = this.next();
		while(v === 0) v = this.next();

		let num = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) / 10 + 0.5;
		if(num > 1 || num < 0) num = this.gaussian(min, max, skew);

		return Math.pow(num, skew) * (max - min) + min;
	}
}

/**
 * Allows to create area for dropping files and data
 */
class DropArea extends EventListener {
	/**
	 * Creates area to drop data
	 * @param {HTMLElement} rootNode Droppable area
	 */
	constructor(rootNode) {
		super();

		/**
		 * @type {
				((event: 'drop', callback: (event: EventListener.Event) => void) => EventListener.Listener) &
				((event: 'focus', callback: (event: EventListener.Event) => void) => EventListener.Listener) &
				((event: 'blur', callback: (event: EventListener.Event) => void) => EventListener.Listener) &
				((event: 'dragenter', callback: (event: EventListener.Event) => void) => EventListener.Listener) &
				((event: 'dragover', callback: (event: EventListener.Event) => void) => EventListener.Listener) &
				((event: 'dragleave', callback: (event: EventListener.Event) => void) => EventListener.Listener) 
			}
		*/
		this.on;

		this.root = rootNode;
		this.counter = 0;

		const events = ["dragenter", "dragover", "dragleave", "drop"];
		const focusEvents = ["dragenter", "dragover"];
		const blurEvents = ["dragleave", "drop"];

		events.forEach(event => {
			this.root.addEventListener(event, e => {
				e.preventDefault();
				e.stopPropagation();

				var isFirst = !this.counter;

				if(event == "dragenter") this.counter++;
				if(event == "dragleave" || event == "drop") this.counter--;
				if(this.counter && !isFirst) return;

				const EventData = {
					target: this.root,
				};

				if(event == "drop") EventData.dataTransfer = e.dataTransfer;
				if(focusEvents.includes(event)) this.dispatchEvent("focus", EventData);
				if(blurEvents.includes(event)) this.dispatchEvent("blur", EventData);

				this.dispatchEvent(event, EventData);
			}, false);
		});
	}
}

function createSlider(
	output,
	min = 0,
	max = 100,
	step = 1,
	value = (min + max) / 2,
	elm = get("body"),
	cls = "slider"
) {
	var isSelector = typeof elm === "string";
	var node = isSelector ? get(elm) : document.createElement("input");
	var label = document.createElement("span");
	console.log(node, elm);
	node.type = "range";
	node.min = min;
	node.max = max;
	node.step = step;
	node.value = value;
	node.className = isSelector ? "" : cls;
	label.innerText = value;
	label.className = "sliderLabel_" + cls;
	if(!isSelector) {
		elm.appendChild(node);
		//elm.appendChild(document.createElement("br"));
	}
	(isSelector ? node.parentNode : elm).appendChild(label);
	var call = function() {
		label.innerText = node.value;
		if(typeof output === "string") eval(output + "=" + node.value);
		else if(typeof output === "function") output(+node.value);
		else throw new Error("[JustLib] Slider: Unknown output");
	};
	node.addEventListener("change", call);
	node.addEventListener("input", call);
	return true;
}

function createWindow(url, title, options = {}, center = false) {
	var offsetX = window.screenLeft || window.screenX || 0;
	var offsetY = window.screenTop || window.screenY || 0;

	var width = window.outerWidth || screen.width;
	var height = window.outerHeight || screen.height;

	var left = (width - options.width) / 2 + offsetX;
	var top = (height - options.height) / 2 + offsetY;

	if(center) {
		options.left = left;
		options.top = top;
	}

	var win = window.open(
		url,
		title,
		options
			.reduce((prev, {key, value}) => prev + `${key}=${value},`, "")
			.slice(0, -1)
	);

	if(window.focus && win) win.focus();

	return win;
}


let HIDDEN, VISIBILITY_CHANGE;
if(typeof document !== "undefined") {
	if(typeof document.hidden !== "undefined") {
		// Opera 12.10 and Firefox 18 and later support
		HIDDEN = "hidden";
		VISIBILITY_CHANGE = "visibilitychange";
	} else if(typeof document["msHidden"] !== "undefined") {
		HIDDEN = "msHidden";
		VISIBILITY_CHANGE = "msvisibilitychange";
	} else if(typeof document["webkitHidden"] !== "undefined") {
		HIDDEN = "webkitHidden";
		VISIBILITY_CHANGE = "webkitvisibilitychange";
	}
}
/* ==== Modifing defaults ==== */

/**
 * Remove diacritics from the string
 * @returns {string} New string without diacritics
 */
String.prototype["removeAccents"] = function() {
	return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Capitalize the string
 * @returns {string} New string with first letter capital
 */
String.prototype["capitalize"] = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

try {
	Object.defineProperty(Object.prototype, "reduce", {
		// eslint-disable-next-line valid-jsdoc
		/**
		 * Equivalent of Array.prototype.reduce
		 *
		 * Calls the specified callback function for all the key-value pairs in a object. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
		 *
		 * @deprecated Use Object.reduce(object, callbackfn, initialValue) instead
		 * @param {(previousValue: any, currentValue: {key: string, value: any}, currentIndex: number, object: Object) => any} callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each key-value pair in the object.
		 * @param {any} initialValue  If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of value of the first key-value pair in the object.
		 * @return {any} Accumulated result.
		 * @example
		 * //Sum of all values in object
		 * var object = {apples: 14, oranges: 8, bananas: 23};	//Our object
		 * object.reduce((prev, curr) => prev + curr.value);	//45
		 * @example
		 * //Parse object as URL query string
		 * var object = {apples: 14, oranges: 8, bananas: 23};	//Our object
		 * object.reduce((prev, {key, value}, i) => {	//We can use object deconstruction for key-value pair
		 * 	var curr = `${i ? "&" : ""}${key}=${value}`;	//If the call is first, don't put "&" at start (we put there "?")
		 * 	return prev + curr;	//Return new string
		 * }, "?");	//Start with "?"
		 */
		value: function(callbackfn, initialValue = Object.values(this)[0]) {
			var keys = Object.keys(this);
			var previousValue = initialValue;
			var currentIndex;
			var object = this;

			if(typeof callbackfn !== "function")
				throw new TypeError(callbackfn + " is not a function");
			if(typeof initialValue === "undefined" && !keys.length)
				throw new TypeError("Reduce of empty object with no initial value");

			for(currentIndex = +(initialValue == Object.values(this)[0]); currentIndex < keys.length; currentIndex++) {
				var key = keys[currentIndex];
				var value = object[key];
				previousValue = callbackfn(
					previousValue,
					{key, value},
					currentIndex,
					object
				);
			}

			return previousValue;
		},
		writable: true,
		enumerable: false
	});
} catch(e) { }

try {
	Object.defineProperty(Object, "reduce", {
		// eslint-disable-next-line valid-jsdoc
		/**
		 * Equivalent of Array.prototype.reduce for Object keys and values
		 *
		 * Calls the specified callback function for all the key-value pairs in a object. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
		 *
		 * @param {Object} o Target object to reduce.
		 * @param {(previousValue: any, currentValue: [key: string, value: any], currentIndex: number, object: Object) => any} callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each key-value pair in the object.
		 * @param {any} [initialValue]  If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of value of the first key-value pair in the object.
		 * @return {any} Accumulated result.
		 * @example
		 * //Sum of all values in object
		 * const object = {apples: 14, oranges: 8, bananas: 23};	//Our object
		 * Object.reduce(object, (prev, [key, value]) => prev + value);	//45
		 * @example
		 * //Parse object as URL query string
		 * const object = {apples: 14, oranges: 8, bananas: 23};  //Our object
		 * Object.reduce(object, (prev, [key, value], i) => {   //We can use object destruction for key-value pair
		 * 	return prev + `${i ? "&" : ""}${key}=${value}`;	//If the call is first, don't put "?" at start (we put there "&")
		 * }, "?");	//Start with "?"
		 */
		value: function(o, callbackfn, initialValue = Object.values(o)[0]) {
			const keys = Object.keys(o);
			let previousValue = initialValue;

			if(typeof callbackfn !== "function")
				throw new TypeError(callbackfn + " is not a function");
			if(typeof initialValue === "undefined" && !keys.length)
				throw new TypeError("Reduce of empty object with no initial value");

			for(let currentIndex = +(initialValue == Object.values(o)[0]); currentIndex < keys.length; currentIndex++) {
				const key = keys[currentIndex];
				const value = o[key];

				previousValue = callbackfn(
					previousValue,
					[key, value],
					currentIndex,
					o
				);
			}

			return previousValue;
		},
		writable: true
	});
} catch(e) { }

try {
	Object.defineProperty(Array.prototype, "toMatrix", {
		value: function() {
			var mat = new Matrix(this.length, 1);
			for(var i = 0; i < mat.rows; i++) {
				mat.matrix[i][0] = this[i];
			}
			return mat;
		},
		writable: false,
	});
} catch(e) { }

try {
	Object.defineProperty(Object, "isObject", {
		value: function(o) {
			return o && typeof o === "object";
		},
		writable: false,
	});
} catch(e) { }


(function() {
	try {
		var eventCallback = null;
		Object.defineProperty(window, "onbackbuttononce", {
			set: function(callback) {
				eventCallback = callback;
				if(typeof callback !== "function") return eventCallback = null;

				const href = window.location.href;

				window.history.replaceState({href: href}, document.title, window.location.pathname + "#backbutton");
				window.history.pushState(null, document.title, href);

				return callback;
			},
			get: function() {
				return eventCallback;
			}
		});
		Object.defineProperty(window, "onbackbutton", {
			set: function(callback) {
				const func = e => {
					callback(e);
					window["onbackbuttononce"] = func;
				};

				window["onbackbuttononce"] = func;
				window["onbackbuttononce"];

				return callback;
			},
			get: function() {
				return eventCallback;
			}
		});
		window.addEventListener("popstate", function(e) {
			if(window.location.hash == "#backbutton") {
				window.history.replaceState(null, document.title, e.state.href);
				if(eventCallback) eventCallback(e);
				else window.history.go(-1);
			}
		}, false);
	} catch(e) { }
})();


/* ======= Constants ======= */
const PI = Math.PI;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;
const ONE_DEG = PI / 180;
const sqrt = Math.sqrt;
const pow = Math.pow;
const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;
const log = Math.log;
const abs = Math.abs;
const ANGLES = {
	sin: new Float32Array(360 * _angle_precision),
	cos: new Float32Array(360 * _angle_precision),
};
const SCROLL_SMOOTH_CENTER = {behavior: "smooth", block: "center", inline: "center"};
const SCROLL_SMOOTH_TOP = {behavior: "smooth", top: 0};
const TRANSPARENT = new Color(0, 0, 0, 0);
const COLLISION = {
	/**
	 * 
	 * @param {Vector} o1 Object1
	 * @param {Dimensions} d1 Dimensions of object1
	 * @param {Vector} o2 Object2
	 * @param {Dimensions} d2 Dimensions of object2
	 * @returns {boolean} State of collision
	 */
	rectangle: function(o1, d1, o2, d2) {
		if(
			o1.x < o2.x + d2.w &&
			o1.x + d1.w > o2.x &&
			o1.y < o2.y + d2.h &&
			o1.y + d1.h > o2.y
		) return true;
		return false;
	},
	circle: null,
	polygon: null,
	box: null,
	sphere: null,
};
const FILE_READER = {
	readAsArrayBuffer: function(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsArrayBuffer(blob);
		});
	},
	readAsBinaryString: function(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsBinaryString(blob);
		});
	},
	readAsDataURL: function(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	},
	readAsText: function(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsText(blob);
		});
	}
};

/* ===== Initialization ===== */

(() => {
	for(var i = 0; i < 360 * _angle_precision; i++) {
		ANGLES.sin[i] = Math.sin((i * Math.PI) / (180 * _angle_precision));
		ANGLES.cos[i] = Math.cos((i * Math.PI) / (180 * _angle_precision));
	}
})();

if(typeof module !== "undefined") {
	module.exports = {
		Color,
		ComplexNumber,
		Dimension,
		Dimensions,
		EventListener,
		EventListenerStatic,
		Matrix,
		RandomGenerator,
		DropArea,
		Vector,

		deg2rad,
		rad2deg,
		dec2bin,
		bin2dec,
		getExponent,
		fastSin,
		fastCos,
		hasClass,
		toggleClass,
		getPath,
		get,
		setCSSproperty,
		setCSSvariable,
		encodeHTML,
		decodeHTML,
		getAttributes,
		getElementPosition,
		getElementDimensions,
		cloneElement,
		isElementInView,
		getScrollTop,
		enterFullscreen,
		isFullscreen,
		exitFullscreen,
		isTouchscreen,
		getQueryParameters,
		map,
		fit,
		clamp,
		wrap,
		arrContains,
		shuffleArray,
		indexOf,
		parseHTML,
		loopRegex,
		objectDeepMerge,
		insertAt,
		isPowerOf2,
		setCursorPos,
		getDevice,
		setCookie,
		getCookie,
		delCookie,
		getUniqueID,
		generateUniqueID,
		random,
		randomGaussian,
		distance,
		angle,
		hexa2rgba,
		parseColor,
		getFormattedSize,
		getFormattedTime,
		fixDigits,
		sleep,
		timeout,
		iterate,
		zip,
		range,
		uniquify,
		copyToClipboard,
		Highlight,
		createSlider,
		createWindow,

		HIDDEN,
		VISIBILITY_CHANGE,
		COLLISION,
		FILE_READER,
		PI,
		HALF_PI,
		TWO_PI,
		ONE_DEG,
		sqrt,
		pow,
		sin,
		cos,
		tan,
		log,
		abs,
		ANGLES,
		TRANSPARENT,
		SCROLL_SMOOTH_CENTER,
		SCROLL_SMOOTH_TOP
	};
}