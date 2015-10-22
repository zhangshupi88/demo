/*! lunar.js v1.1.0 | (c) 2014 @toddmotto | https://github.com/toddmotto/lunar */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    root.lunar = factory();
  }
})(this, function () {

  'use strict';

  var lunar = {};

  lunar.hasClass = function (elem, name) {
    return new RegExp('(\\s|^)' + name + '(\\s|$)').test(elem.getAttribute('class'));
  };

  lunar.addClass = function (elem, name) {
    !lunar.hasClass(elem, name) && elem.setAttribute('class', (!!elem.getAttribute('class') ? elem.getAttribute('class') + ' ' : '') + name);
  };

  lunar.removeClass = function (elem, name) {
    var remove = elem.getAttribute('class').replace(new RegExp('(\\s|^)' + name + '(\\s|$)', 'g'), '$2');
    lunar.hasClass(elem, name) && elem.setAttribute('class', remove);
  };

  lunar.toggleClass = function (elem, name) {
    lunar[lunar.hasClass(elem, name) ? 'removeClass' : 'addClass'](elem, name);
  };

  return lunar;

});


$('document').ready(function () {
    var checkmark = $('.checkmark');
   // var checkmark = document.querySelector('.checkmark');

    checkmark.click(function () {
     // this.classList.add("checked");
      lunar.toggleClass(this, 'checked');
    // $(this).css('transform', 'scale(.5)');
     // $( this ).addClass( "checked" );
      console.log('clicked');
    
  });
   
});