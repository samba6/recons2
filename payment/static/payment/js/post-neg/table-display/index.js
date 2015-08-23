"use strict";

var paymentCommons = require('./../../payment-commons')

angular
  .module('letterOfCreditPayment.post_neg')
  .directive('postNegTableDisplay', postNegTableDisplay)
  .controller('postNegTableDisplayCtrl', postNegTableDisplayCtrl)

function postNegTableDisplay() {

  return {
    restrict: 'E',

    controller: 'postNegTableDisplayCtrl as itfDisplay',

    templateUrl: paymentCommons.buildUrl('post-neg/table-display/table-display.html'),

    scope: {},

    bindToController: {
      caption: '=tableCaption'
    }
  }
}

function postNegTableDisplayCtrl() {
  var vm = this
  vm.css = paymentCommons.buildUrl('post-neg/table-display/table-display.min.css')
}
