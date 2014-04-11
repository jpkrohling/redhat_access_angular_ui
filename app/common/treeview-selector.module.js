var app = angular.module('RedhatAccess.tree-selector', []);

app.controller('TreeViewSelectorCtrl', function ($scope, $http) {
  $scope.name = 'Attachments';
  $scope.attachmentTree = [];
  $scope.init = function () {
    $http({
      method: 'GET',
      url: 'attachments'
    }).success(function (data, status, headers, config) {
      //$scope.attachmentTree = data;
      var tree = new Array();
      parseAttachList(tree, data);
      $scope.attachmentTree = tree;
    }).error(function (data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  };
  $scope.init();
});

app.directive('rhaChoiceTree', function () {
  return {
    template: '<ul><rha-choice ng-repeat="choice in tree"></rha-choice></ul>',
    replace: true,
    transclude: true,
    restrict: 'E',
    scope: {
      tree: '=ngModel'
    }
  };
});

app.directive('rhaChoice', function ($compile) {
  return {
    restrict: 'E',
    templateUrl: 'common/views/treenode.html',
    link: function (scope, elm, attrs) {
      scope.choiceClicked = function (choice) {
        choice.checked = !choice.checked;

        function checkChildren(c) {
          angular.forEach(c.children, function (c) {
            c.checked = choice.checked;
            checkChildren(c);
          });
        }
        checkChildren(choice);
      };
      if (scope.choice.children.length > 0) {
        var childChoice = $compile('<rha-choice-tree ng-show="!choice.collapsed" ng-model="choice.children"></rha-choice-tree>')(scope)
        elm.append(childChoice);
      }
    }
  };
});

app.config(function ($urlRouterProvider) {}).config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('choiceSelector', {
      url: "/treeselector",
      templateUrl: 'common/views/treeview-selector.html'
    })
  }
]);


//Copied from log viewer needs refactoring
function parseAttachList(tree, data) {
  var files = data.split("\n");
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var splitPath = file.split("/");
    returnAttachNode(splitPath, tree, file);
  }
}

function returnAttachNode(splitPath, tree, fullFilePath) {
  if (splitPath[0] != null) {
    if (splitPath[0] != "") {
      var node = splitPath[0];
      var match = false;
      var index = 0;
      for (var i = 0; i < tree.length; i++) {
        if (tree[i].name === node) {
          match = true;
          index = i;
          break;
        }
      }
      if (!match) {
        var blah = new Object();
        blah.checked = isLeafChecked(node);
        blah.name = removeParams(node);
        //blah.roleId = node;
        if (splitPath.length == 1) {
          blah.fullPath = removeParams(fullFilePath);
        }
        blah.children = new Array();
        tree.push(blah);
        index = tree.length - 1;
      }
      splitPath.shift();
      returnAttachNode(splitPath, tree[index].children, fullFilePath);
    } else {
      splitPath.shift();
      returnAttachNode(splitPath, tree, fullFilePath);
    }
  }
}

function removeParams(path) {
  if (path) {
    var split = path.split('?');
    return split[0];
  }
  return path;
}

function isLeafChecked(path) {
  if (path) {
    var split = path.split('?');
    if (split[1]) {
      var params = split[1].split('&');
      for (var i = 0; i < params.length; i++) {
        if (params[i].indexOf("checked=true") != -1) {
          return true;
        }
      }
    }
  }
  return false;
}