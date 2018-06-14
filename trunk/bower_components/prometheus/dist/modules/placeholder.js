/**
 * prometheus - 普罗米修斯
 * @author 
 * @version v1.0.8
 * @link 
 * @license MIT
 */
define(["angular"],function(e,n){"use strict";var r,t;r="placeholder",t={},e.module("Placeholder",[]).directive("placeholder",["$document","$timeout",function(a,o){function u(e){return e&&"password"===e.toLowerCase()}return e.forEach(["INPUT","TEXTAREA"],function(e){t[e]=a[0].createElement(e)[r]===n}),{require:"?^ngModel",restrict:"A",compile:function(e,n){return function(e,n,a,l){var s,c;s=a[r+"Class"]||r,c=t[n[0].nodeName];var i=a[r];n.bind("blur",function(){var e;e=n.val(),e||(n.addClass(s),c&&o(function(){n.val(i)},1))}),n.bind("focus",function(){c&&n.hasClass(s)&&n.val()===i&&n.val(""),n.removeClass(s)}),c&&l.$formatters.unshift(function(e){return u(n.prop("type"))?e:e?(n.removeClass(s),e):(n.addClass(s),i)})}}}}])});