"use strict";

/*jshint camelcase:false*/

require('./lc-issue/lc-issue.js')
require('./lc-cover/lc-cover.js')

var rootCommons = require('commons')

var app = angular.module('add-form-m', [
  'ui.router',
  'rootApp',
  'kanmii-underscore',
  'customer',
  'search-detailed-or-uploaded-form-m',
  'form-m-service',
  'lc-cover',
  'lc-issue',
  'lc-bid-request',
  'confirmation-dialog'
])

app.config(rootCommons.interpolateProviderConfig)

app.config(formMStateURLConfig)

formMStateURLConfig.$inject = ['$stateProvider']

function formMStateURLConfig($stateProvider) {
  $stateProvider
    .state('form_m.add', {
      kanmiiTitle: 'Add form M',

      params: {detailedFormM: null, showSummary: null},

      views: {
        addFormM: {
          templateUrl: require('lcAppCommons').buildUrl('form-m/add-form-m/add-form-m.html'),

          controller: 'AddFormMStateController as addFormMState'
        }
      }
    })
}

app.controller('AddFormMStateController', AddFormMStateController)

AddFormMStateController.$inject = [
  'getTypeAheadCustomer',
  'getTypeAheadCurrency',
  'SearchDetailedOrUploadedFormMService',
  'kanmiiUnderscore',
  'formatDate',
  'xhrErrorDisplay',
  'formMAttributesVerboseNames',
  'FormM',
  '$timeout',
  '$filter',
  '$stateParams',
  'resetForm2',
  '$state',
  '$scope',
  'LcBidRequest'
]

function AddFormMStateController(getTypeAheadCustomer, getTypeAheadCurrency, SearchDetailedOrUploadedFormMService,
  kanmiiUnderscore, formatDate, xhrErrorDisplay, formMAttributesVerboseNames, FormM, $timeout, $filter, $stateParams,
  resetForm2, $state, $scope, LcBidRequest) {
  var vm = this

  vm.detailedFormM = angular.copy($stateParams.detailedFormM)
  $stateParams.detailedFormM = null

  /*
   *@param {angular.form} the HTML fieldSet element for form M cover
   */
  var coverForm

  /*
   *@param {angular.form} the HTML fieldSet element for form M issues
   */
  var issuesForm

  initialize()
  function initialize(form) {
    if (vm.detailedFormM) initDetailedFormM()
    else {
      $scope.updateAddFormMTitle()
      vm.formM = {
        date_received: new Date()
      }

      vm.fieldsEdit = {
        number: false,
        currency: false,
        applicant: false,
        date_received: false,
        amount: false
      }

      vm.closedIssues = []
      vm.nonClosedIssues = []
      vm.existingBids = []
    }

    vm.showEditBid = false
    vm.showBidForm = false
    vm.searchFormM = {}
    initFormMSavingIndicator()

    if (form) {
      form.$setPristine()
      form.$setUntouched()
    }

    /*
     *@param {angular.form.model} the form M cover model
     */
    vm.cover = null

    /*
     *@param {angular.form.model} bid model that we want to create for the form M
     */
    vm.bid = {}

    /*
     *@param {angular.form.model} the form M issues model
     */
    vm.issues = []

    vm.nonClosedIssues = []
  }

  function initDetailedFormM() {
    vm.formM = {
      date_received: new Date(vm.detailedFormM.date_received),
      number: vm.detailedFormM.number,
      applicant: vm.detailedFormM.applicant_data,
      currency: vm.detailedFormM.currency_data,
      amount: Number(vm.detailedFormM.amount),
      goods_description: vm.detailedFormM.goods_description,
      form_m_issues: vm.detailedFormM.form_m_issues,
      url: vm.detailedFormM.url,
      covers: vm.detailedFormM.covers
    }

    $scope.updateAddFormMTitle(vm.formM)

    LcBidRequest.getPaginated({mf: vm.formM.number}).$promise.then(function(data) {
      if (data.count) {
        var results = data.results

        if (results.length) vm.existingBids = results
      }
    })

    vm.fieldsEdit = {
      number: true,
      currency: true,
      applicant: true,
      date_received: true,
      amount: true
    }

  }

  function initFormMSavingIndicator() {
    var summary = $stateParams.showSummary
    $stateParams.showSummary = null

    if (summary) {
      vm.savingFormMIndicator = summary
      vm.formMIsSaving = true

      $timeout(function() {
        vm.formMIsSaving = false
      }, 120000)
    }

    else {
      vm.savingFormMIndicator = 'Creating New Form M...........please wait'
      vm.formMIsSaving = false
    }
  }

  vm.onCoverChanged = function onCoverChanged(cover, form) {
    vm.cover = cover
    coverForm = form
  }

  vm.onIssuesChanged = function onIssuesChanged(issues, form) {
    vm.issues = issues
    issuesForm = form
  }

  vm.onNonClosedIssuesChanged = function onNonClosedIssuesChanged(issues) {
    vm.nonClosedIssues = issues
  }

  vm.enableFieldEdit = function enableFieldEdit(field) {
    vm.fieldsEdit[field] = vm.detailedFormM ? !vm.fieldsEdit[field] : false
  }

  vm.validators = {
    applicant: {
      test: function() {
        return kanmiiUnderscore.isObject(vm.formM.applicant)
      }
    },

    currency: {
      test: function() {
        return kanmiiUnderscore.isObject(vm.formM.currency)
      }
    }
  }

  vm.disableSubmitBtn = disableSubmitBtn
  function disableSubmitBtn() {
    if ($scope.newFormMForm.$invalid) return true

    if (coverForm && coverForm.$invalid) return true

    if ($scope.bidForm.$invalid) return true

    if (issuesForm && issuesForm.$invalid) return true

    if (vm.showEditBid) return true

    var compared = compareDetailedFormMWithForm()
    if (!compared) return false

    if (kanmiiUnderscore.all(compared)) {
      if (!kanmiiUnderscore.isEmpty(vm.bid)) return false
      if (vm.cover && !kanmiiUnderscore.isEmpty(vm.cover)) return false
      return !vm.issues.length
    }

    return false
  }

  vm.reset = reset
  function reset(addFormMForm) {
    vm.detailedFormM = null

    resetForm2(addFormMForm, [
      {
        form: $scope.newFormMForm, elements: ['applicant', 'currency']
      }
    ])

    initialize()
  }

  vm.getApplicant = getTypeAheadCustomer
  vm.getCurrency = getTypeAheadCurrency

  vm.datePickerFormat = 'dd-MMM-yyyy'
  vm.datePickerIsOpen = false
  vm.openDatePicker = function openDatePicker() {
    vm.datePickerIsOpen = true
  }

  vm.getUploadedFormM = function getUploadedFormM() {
    vm.detailedFormM = null
    initialize()

    SearchDetailedOrUploadedFormMService.searchWithModal().then(function(data) {
      if (data.detailed) {
        vm.detailedFormM = data.detailed
        initDetailedFormM()

      } else {
        var formM = data.uploaded
        vm.searchFormM = formM
        vm.formM.number = formM.mf

        getTypeAheadCurrency(formM.ccy).then(function(ccy) {
          vm.formM.currency = ccy[0]
        })
      }
    })
  }

  vm.submit = function submit(formM) {
    var formMToSave = angular.copy(formM)

    formMToSave.applicant = formMToSave.applicant.url
    formMToSave.currency = formMToSave.currency.url
    formMToSave.date_received = formatDate(formMToSave.date_received)

    if (!kanmiiUnderscore.isEmpty(vm.bid)) {
      formMToSave.goods_description = vm.bid.goods_description
      formMToSave.bid = {amount: vm.bid.amount}
    }

    if (vm.issues.length) formMToSave.issues = vm.issues

    if (vm.cover && !kanmiiUnderscore.isEmpty(vm.cover)) {
      formMToSave.cover = {
        amount: vm.cover.amount,
        cover_type: vm.cover.cover_type[0]
      }
    }

    if (!vm.detailedFormM) new FormM(formMToSave).$save(formMSavedSuccess, formMSavedError)

    else {
      if (kanmiiUnderscore.all(compareDetailedFormMWithForm())) {
        formMToSave.do_not_update = 'do_not_update'
        formMToSave.applicant_data = vm.formM.applicant
        formMToSave.currency_data = vm.formM.currency
      }
      formMToSave.id = vm.detailedFormM.id
      new FormM(formMToSave).$put(formMSavedSuccess, formMSavedError)
    }

    function formMSavedSuccess(data) {
      var summary = showFormMMessage() + showIssuesMessage()

      if (data.bid) {
        summary += '\n\nBid Amount     : ' + data.currency_data.code + ' ' + $filter('number')(data.bid.amount, 2)
      }

      if (data.cover) data.covers.push(data.cover)

      $state.go('form_m.add', {detailedFormM: data, showSummary: summary})
    }

    function formMSavedError(xhr) {
      initFormMSavingIndicator()
      xhrErrorDisplay(xhr, formMAttributesVerboseNames)
    }
  }

  $scope.showFormMMessage = showFormMMessage
  function showFormMMessage() {
    var number = $filter('number')(vm.formM.amount, 2)
    var header = vm.formM.applicant.name + ' - ' + vm.formM.number + ' - ' + vm.formM.currency.code + ' ' + number
    return header + '\n\nForm M Number : ' + vm.formM.number + '\n' +
           'Value         : ' + vm.formM.currency.code + ' ' +
           number + '\n' +
           'Applicant     : ' + vm.formM.applicant.name
  }

  $scope.showIssuesMessage = showIssuesMessage
  function showIssuesMessage() {
    if (!vm.nonClosedIssues.length) return ''

    var issuesText = '\n\n\nPlease note the following issues which must be \n' +
                     'regularized before the LC ' +
                     'request can be treated:\n'
    var index = 1

    kanmiiUnderscore.each(vm.nonClosedIssues, function(issue) {
      issuesText += ('(' + index++ + ') ' + vm.formatIssueText(issue.issue.text) + '\n')
    })

    return issuesText
  }

  vm.formatIssueText = function(text) {
    return text.replace(/:ISSUE$/i, '')
  }

  function compareDetailedFormMWithForm() {
    if (!vm.detailedFormM) return false

    return {
      number: vm.formM.number && angular.equals(vm.formM.number, vm.detailedFormM.number),

      date_received: angular.equals(vm.formM.date_received, new Date(vm.detailedFormM.date_received)),

      amount: vm.formM.amount && angular.equals(vm.formM.amount, Number(vm.detailedFormM.amount)),

      currency: vm.formM.currency && (vm.formM.currency.code === vm.detailedFormM.currency_data.code),

      applicant: vm.formM.applicant && (vm.formM.applicant.name === vm.detailedFormM.applicant_data.name)
    }
  }
}

require('./lc-bid/lc-bid.js')
