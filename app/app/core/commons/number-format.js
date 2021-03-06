"use strict";

var rootApp = angular.module('rootApp')

rootApp.directive('numberFormat', ['$filter', function ($filter) {

  function link($scope, $elm, attrs, ngModelCtrl) {
    if (!ngModelCtrl) return

    var REGEXP = new RegExp(",", 'g')

    ngModelCtrl.$render = function render() {
      $elm.val($filter('number')(ngModelCtrl.$viewValue, 2))
    }

    ngModelCtrl.$parsers.push(function numberParser(viewValue) {
      var replaced = viewValue.replace(REGEXP, '')
      return viewValue ? Number(replaced) : ''
    })

    function valueChangeListener() {
      var value, filteredVal

      value = $elm.val()

      if (!value) return

      value = value.replace(REGEXP, '')

      filteredVal = $filter('number')(value, 2)
      $elm.val(filteredVal)
      ngModelCtrl.$setViewValue(filteredVal)
    }

    $elm.bind('focusout', valueChangeListener);

    function keypressListener(event) {
      var key;
      key = event.which;

      // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
      // This lets us support copy and paste too
      if (key === 0 || key === 8 || (15 < key && key < 19) || (37 <= key && key <= 40)) return

      // ignore all other keys which we do not need
      if (String.fromCharCode(key) !== ',' && String.fromCharCode(key) !== '.' && !(48 <= key && key <= 57)) return
    }

    $elm.bind('keypress', keypressListener);
  }

  return {require: '?ngModel', link: link, restrict: 'A'};
}]);
