//兑换
angular.module('starter.walletIndexCtrl', ['wallet.services'])

  .controller('walletIndexCtrl', ['$scope', 'walletIndexService', '$state', 'locals', function($scope, walletIndexService, $state, locals) {
    let userRights = locals.getObject('userRights');
    console.log(userRights[0]);
    $scope.doWallet = (type) => {

      walletIndexService.feature = type;
      $state.go('modules.wallet.charge', { type });
    };

    $scope.goRecords = (type) => {
      walletIndexService.feature = type;
      $state.go('modules.wallet.charge.records', { type });
    };
  }]);
