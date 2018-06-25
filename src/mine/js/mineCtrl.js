//兑换
angular.module('starter.mineCtrl', ['mine.services'])

  .controller('mineCtrl', ['$scope', '$rootScope', 'mineIndexService', '$state','$stateParams', function($scope, $rootScope, mineIndexService, $state,$stateParams) {
    $rootScope.nowModule = { index: 5 };
    $scope.iSelectActiveTab = mineIndexService.feature;
    /*$scope.click = (feature) => {
      mineIndexService.feature = feature;
    };*/
    if ($stateParams.editAccount) {
      $scope.iSelectActiveTab = 2;
    }
    $scope.activeTab = (tabIndex) => {
      if (tabIndex === 0) {
        $scope.iSelectActiveTab = 0;
        $state.go('modules.mine.shopSets');
      }
      else if (tabIndex === 1) {
        $scope.iSelectActiveTab = 1;
        $state.go('modules.mine.shopAccount');
      }
      else if (tabIndex === 2) {
        $scope.iSelectActiveTab = 2;
        $state.go('modules.mine.accountSets');
      }
    };
  }]);

