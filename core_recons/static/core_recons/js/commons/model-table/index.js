"use strict";

var app = angular.module('model-table', ['toggle-bg-color', 'kanmii-underscore'])

app.config(require('commons').interpolateProviderConfig)

app.directive('modelTable', modelTableDirective)
function modelTableDirective() {

  return {
    restrict: 'E',
    scope: {},
    bindToController: {
      /**
       * @param {Array} - list of objects that will be displayed in the table row
       */
      modelCollection: '=',

      /**
       * @param {array} - an array of object that will be used to manage the model collection during rendering
       * `
       * [
       *  {
       *   title: 'Some title' - will be displayed in the table header,
       *
       *   tdStyle: an object for ng-style attribute for the td in which model data will sit,
       *
       *   render: function(model){ - a callback that will be used to render the model
       *      var toBeRendered = model.modelKey
       *      return filter ('number')(toBeRendered, 2)
       *     },
       *
       *   modelKey: {string} - if model data does not require special processing, we will access model data via
       *                        this property
       *   }
       *  ]
       * `
       */
      modelManager: '=tableModelManager',

      /**
       * @param {object} - represents the latest model. Angular will create a new row and display the new model on that
       * row. The row will always be pre-pended to the table body. :TODO can we make it selected by default
       */
      newModel: '=',

      /**
       * @param {string} - The table caption
       */
      caption: '=tableCaption',

      /**
       * @param {int} - The pagination size is an integer representing how many links will be rendered for paging
       * through the modelCollection attribute
       */
      paginationSize: '=',

      /**
       * @param {function} - a callback that will be invoked by the parent scope to get fresh model collection. This
       * will most likely be used when user navigates between links. The parent will be given a url it can use
       * to fetch the next model collection. The link url will come from the `pager-nav` directive
       */
      updateCollection: '&',

      /**
       * @param {object} - When the parent fetches new collection objects, the parent will be responsible for generating
       * the properties that will be used to page through the collection. The object is of the form
       * `{
       *    previous: string|null,
       *    count: int,
       *    next: string|null
       * }`
       * See `pager-nav` directive for explanation of the object.
       * :TODO - should the parent render the pager-nav directly rather than have the model table render it?
       */
      pager: '=pagerObject'
    },

    controller: 'ModelTableDirectiveCtrl as modelTable',
    template: require('./model-table.html')
  }
}

app.controller('ModelTableDirectiveCtrl', ModelTableDirectiveCtrl)
ModelTableDirectiveCtrl.$inject = ['$scope', 'pagerNavSetUpLinks', 'kanmiiUnderscore']
function ModelTableDirectiveCtrl(scope, pagerNavSetUpLinks, kanmiiUnderscore) {
  var vm = this
  vm.orderProp = '-created_at'

  function setUpLinks(next, prev, count) {

    var numLinks = Math.ceil(count / vm.paginationSize)

    var linkProperties = pagerNavSetUpLinks(next, prev, numLinks)

    vm.nextPageLink = next
    vm.prevPageLink = prev

    vm.linkUrls = linkProperties.linkUrls
    vm.currentLink = linkProperties.currentLink
  }

  vm.onUpdateCollection = onUpdateCollection
  function onUpdateCollection(linkUrl) {
    vm.updateCollection({linkUrl: linkUrl})
  }

  scope.$watch(function getPager() {return vm.pager}, function updatedPager(pager) {
    if (pager && !kanmiiUnderscore.isEmpty(pager)) {
      setUpLinks(pager.next, pager.previous, pager.count)
    }
  })
}
