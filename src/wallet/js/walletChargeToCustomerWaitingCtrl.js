//兑换
angular.module('starter.walletChargeToCustomerWaiting', [])

  .controller('walletChargeToCustomerWaitingCtrl', ['walletToCustomerWaitingService','$scope', function(walletToCustomerWaitingService,$scope) {
    $scope.oView = walletToCustomerWaitingService.featureChoose();
  }]);
