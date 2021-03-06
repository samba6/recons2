"use strict";

var app = angular.module('customer')

app.controller('CustomerModalCtrl', CustomerModalCtrl)
CustomerModalCtrl.$inject = [
  'resetForm',
  '$element',
  'close',
  'Branch',
  'xhrErrorDisplay'
]
function CustomerModalCtrl(resetForm, element, close, Branch, xhrErrorDisplay) {
  var vm = this
  vm.customer = {}
  vm.revealNewBranchForm = revealNewBranchForm
  vm.dismissNewBranchForm = dismissNewBranchForm

  vm.close = closeModal
  function closeModal() {
    close()
  }

  vm.reset = reset
  function reset(form) {
    vm.customer = {}
    resetForm(form, element, '.form-control')
  }

  vm.submitCustomer = injectCustomer
  function injectCustomer(customer) {
    close(customer)
  }

  vm.getBranch = getBranch
  function getBranch(branchParam) {
    return Branch.query({filter: branchParam}).$promise
  }

  vm.createNewBranch = createNewBranch
  function createNewBranch(newBranch) {
    if (!newBranch) return

    Branch.save(newBranch).$promise.then(newBranchedSavedSuccess, newBranchedSavedError)

    function newBranchedSavedSuccess(data) {
      vm.customer.branch = data
      dismissNewBranchForm()
    }

    function newBranchedSavedError(xhr) {
      xhrErrorDisplay(xhr, {code: 'Branch code', name: 'Branch Name'});
    }
  }

  var $addNewCustomerContainer = element.find('.add-new-customer-container')
  var $addCustomerFormCtrl = element.find('.add-customer-form-control')
  var $newBranchContainer = element.find('.new-branch-form-container')

  function dismissNewBranchForm() {
    $newBranchContainer.hide()
    $addCustomerFormCtrl.show()
    $addNewCustomerContainer.removeClass('ui-widget-overlay ui-front').find('.form-control').each(function() {
      $(this).prop('disabled', false)
    })
  }

  function revealNewBranchForm() {
    $addCustomerFormCtrl.hide()
    $newBranchContainer.show()
    $addNewCustomerContainer.addClass('ui-widget-overlay ui-front').find('.form-control').each(function() {
      $(this).prop('disabled', true)
    })
  }
}

app.directive('addCustomer', addCustomerDirective)

addCustomerDirective.$inject = ['ModalService', '$parse', 'ToggleDimElement']

function addCustomerDirective(ModalService, $parse, ToggleDimElement) {
  return {
    restrict: 'A',
    link: function(scope, elm, attributes, self) {

      elm.css({cursor: 'pointer'}).bind('click', showModal)

      function showModal() {
        ModalService.showModal({
          template: require('./add-customer2.html'),
          controller: 'CustomerModalCtrl as customerModal'

        }).then(function(modal) {
          var parentEl = $parse(attributes.dimParent)(scope.$parent)

          function executeAfterDim() {
            parentEl.find('.form-control').each(function() {
              var $el = $(this)
              $el.prop('disabled', !$el.prop('disabled'))
            })
          }

          modal.element.dialog({
            dialogClass: 'no-close',

            title: 'Add Customer',

            modal: true,

            minWidth: 600,

            //minHeight: 450,

            open: function() {
              if (parentEl) ToggleDimElement.dim(parentEl, executeAfterDim)
            },

            close: function() {
              if (parentEl) ToggleDimElement.unDim(parentEl, executeAfterDim)
            }
          })

          modal.close.then(function(customer) {
            if (customer && angular.isObject(customer)) {
              self.addCustomer(customer)
            }

            if (parentEl) ToggleDimElement.unDim(parentEl, executeAfterDim)
          })
        })
      }
    },

    controller: 'AddCustomerDirectiveCtrl as addCustomer',

    scope: {},

    bindToController: {
      newCustomer: '=addedNewCustomer',
      customerAdded: '&onCustomerAdded'
    }
  }
}

app.controller('AddCustomerDirectiveCtrl', AddCustomerDirectiveCtrl)

AddCustomerDirectiveCtrl.$inject = ['Customer', 'xhrErrorDisplay']

function AddCustomerDirectiveCtrl(Customer, xhrErrorDisplay) {
  var vm = this
  vm.customer = {}
  vm.addCustomer = addCustomer

  function addCustomer(customerObj) {
    Customer.save(customerObj).$promise.then(newCustomerSaveSuccess, newCustomerSaveError)

    function newCustomerSaveSuccess(data) {
      vm.newCustomer = data
      vm.customerAdded({customer: data})
    }

    function newCustomerSaveError(xhr) {
      xhrErrorDisplay(xhr);
    }
  }
}
