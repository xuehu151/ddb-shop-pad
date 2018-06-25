//兑换
angular.module('starter.walletChargeToCustomer', [])

  .controller('walletChargeToCustomerCtrl', ['$scope', '$rootScope', 'Ajax', '$ionicPopover', 'locals', '$state', 'walletToCustomerService','$cordovaToast', function($scope, $rootScope, Ajax, $ionicPopover, locals, $state, walletToCustomerService,$cordovaToast) {
    $scope.ownerCharge = { money: void 0, buyerId: '', password: '', remark: '' };
    $scope.oView = walletToCustomerService.featureChoose();
    let shopInfo = locals.getObject('shopPerformance');
    console.log(shopInfo);
    // $scope.useableMoney = shopInfo.RequestShopInformation.money;

    //获取用户列表
    $scope.addChargeCustomer = async() => {
      try {
        let response = await Ajax.sendTo(url + '/auth/getCustomerList', locals.get('token'));
        $scope.allCustomersName = Array.from(response.data, (item) => {
          return {
            nickName: item.nickName,
            buyerId: item.id,
          };
        })
        $scope.userListPopover.show();
      } catch (error) { error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error); }
    };

    //选择充值某个用户
    $scope.chooseThisUser = (index) => {
      $scope.userListPopover.hide();
      $scope.userName = $scope.allCustomersName[index].nickName;
      $scope.ownerCharge.buyerId = $scope.allCustomersName[index].buyerId;
    };

    //确认充值
    $scope.comfirmCharge = async() => {
      try {
        let params = {
          money: $scope.ownerCharge.money*100,
          shopRemark: $scope.ownerCharge.remark,
          payPassword: $scope.ownerCharge.password,
          buyerId: $scope.ownerCharge.buyerId,
        };
        let response = await Ajax.sendTo(url + `/bill/${$scope.oView.httpUrl}`, locals.get('token'), { params });
        $rootScope.nowChargeUser = { userName: $scope.userName, money: $scope.ownerCharge.money };

        $state.go("modules.wallet.charge.toCustomerWaitingInfo",{type:$scope.oView.urlShow});
      } catch (error) {
        error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
      }
    };

    /**
     * [配置用户选择框的popover]
     */
    $ionicPopover.fromTemplateUrl('allCustomers.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.userListPopover = popover;
    });

  }]);
