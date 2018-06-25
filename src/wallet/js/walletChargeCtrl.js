//兑换
angular.module('starter.walletCharge', [])

  .controller('walletChargeCtrl', ['$scope', '$rootScope', 'Ajax', '$state', 'locals', 'walletIndexService', 'walletService', 'walletVerifyService', 'PicMethods', '$cordovaToast', function($scope, $rootScope, Ajax, $state, locals, walletIndexService, walletService, walletVerifyService, PicMethods, $cordovaToast) {
    const userRights = locals.getObject('userRights');
    $scope.showLastPic = false;  //显示没有更多的图片
    $scope.allCharges = [];   //保存所有充值提现申请
    /**
     * [申请充值的彩友分页]
     * @type {[type]}
     */
    const moreChargeApply = $scope.moreChargeApply = {
      moredata: true, //是否还有待显示数据
      eachOrder: [], //每次请求返回数据
      params: {
        type: 1,
        status: 0,
        pageNumber: 1,
        pageSize: 20,
      },
      loadMore: async() => {
        try {
          if (moreChargeApply.moredata === true) {
            let params = moreChargeApply.params;
            let response = await Ajax.sendTo(url + '/bill/getList', locals.get('token'), { params });
            console.log(response);
            if (response.data.length === moreChargeApply.params.pageSize) {
              $scope.allCharges = moreChargeApply.eachOrder = moreChargeApply.eachOrder.concat(response.data);
              //给每个充值申请加上一个状态,判断是否当前点击
              for (let [index, singleCharge] of $scope.allCharges.entries()) {
                singleCharge.nowClick = false; //当前点击的状态
                singleCharge.afterDoneCharge = ''; //加一个是否已经充值的状态
              }
              moreChargeApply.params.pageNumber += 1;
            } else if ((response.data.length !== 0) && (response.data.length <= moreChargeApply.params.pageSize)) {
              $scope.allCharges = moreChargeApply.eachOrder = moreChargeApply.eachOrder.concat(response.data);
              //给每个充值申请加上一个状态,判断是否当前点击
              for (let [index, singleCharge] of $scope.allCharges.entries()) {
                singleCharge.nowClick = false; //当前点击的状态
                singleCharge.afterDoneCharge = ''; //加一个是否已经充值的状态
              }
              $scope.showLastPic = true;
              moreChargeApply.moredata = false;
            } else if (response.data.length === 0) {
              $scope.showLastPic = true;
              moreChargeApply.moredata = false;
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }
        } catch (error) { error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error); }
      }
    };

    if (walletIndexService.feature === 'charge') {
      $scope.view = walletService.featureChoose('charge');
      moreChargeApply.params.type = 1;
    } else if (walletIndexService.feature === 'withdraw') {
      $scope.view = walletService.featureChoose('withdraw');
      moreChargeApply.params.type = 2;
    }

    /**
     * 点击显示充值金额审核
     * @param  {number} index 索引
     * @return {[type]}       [description]
     */
    $scope.showVerify = async(index) => {
      if (userRights.rechargeAudit.check === false && walletIndexService.feature === 'charge') {
        $cordovaToast.showShortCenter('您没有审核充值的权限');
        return;
      } else if (userRights.cashAudit.check === false && walletIndexService.feature === 'withdraw') {
        $cordovaToast.showShortCenter('您没有审核提现的权限');
        return;
      }
      //点击的时候当前点击的样式变化
      for (let singleCharge of $scope.allCharges) {
        singleCharge.nowClick = false;
      }
      $scope.allCharges[index].nowClick = true;
      try {
        let params = {
          id: $scope.allCharges[index].id
        };
        let response = await Ajax.sendTo(url + '/bill/getInfo', locals.get('token'), { params })
        console.log(response);
        response.data.createDate = response.data.createDate.slice(0, 10); //只需要年月日
        response.data.index = index; //为子controller充值完成时emit索引
        walletService.eachChargeDetail = response.data;
        console.log(walletService.eachChargeDetail)
        /*$rootScope.passEachCharge = response.data;
        $rootScope.passEachCharge.createDate = $rootScope.passEachCharge.createDate.slice(0, 10); //只需要年月日
        $rootScope.passEachCharge.index = index; //为子controller充值完成时emit索引
        console.log($rootScope.passEachCharge);*/
        $state.go('modules.wallet.charge.verify', { id: $scope.allCharges[index].id });
      } catch (error) { error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error); }
    };

    /**
     * 子controller emit充值完成,充值彩友列表状态变为 '已充值'
     * @param  {[type]} event  默认参数
     * @param  {number} index) 索引
     * @return {[type]}        [description]
     */
    $scope.$on('chargeAuditSucceed', function(event, chargeEmit) {
      let alertInfo;
      if (walletIndexService.feature === 'charge') {
        alertInfo = walletVerifyService.featureChoose('charge')
      } else if (walletIndexService.feature === 'withdraw') {
        alertInfo = walletVerifyService.featureChoose('withdraw')
      }
      switch (chargeEmit.afterDoneCharge) {
        case 'agree':
          $scope.allCharges[chargeEmit.index].afterDoneCharge = alertInfo.alertText1
          break;
        case 'edit':
          $scope.allCharges[chargeEmit.index].afterDoneCharge = alertInfo.alertText2
          break;
        case 'reject':
          $scope.allCharges[chargeEmit.index].afterDoneCharge = alertInfo.alertText3
          break;
      }
    });

    $scope.chargeToCust = () => {
      if (userRights.recharge.check === false && walletIndexService.feature === 'charge') {
        $cordovaToast.showShortCenter('您没有发起充值的权限');
        return;
      } else if (userRights.cash.check === false && walletIndexService.feature === 'withdraw') {
        $cordovaToast.showShortCenter('您没有发起提现的权限');
        return;
      }
      $state.go('modules.wallet.charge.toCustomer');
    }

    //接收到充值推送
    $scope.$on('haveChargeApply', function(event, billId) {
      console.log('充值子级');
      console.log(billId);
      if ($rootScope.nowModule.index === 2 && walletIndexService.feature === 'charge') {
        let addPushChargeParams = {
          pageNumber: 1,
          pageSize: 20,
          billId
        }
        walletService.addPushCharge(addPushChargeParams, false).then(function(response) {
          console.log(response)
          $scope.$apply(function () {
          $scope.allCharges.push(response)
          })
          console.log($scope.allCharges)
        })
      }
    });
    //接收到提现推送
    $scope.$on('haveWithdrawApply', function(event, billId) {
      console.log('提现子级');
      console.log(billId);
      if ($rootScope.nowModule.index === 2 && walletIndexService.feature === 'withdraw') {
        let addPushChargeParams = {
          pageNumber: 1,
          pageSize: 20,
          billId
        }
        walletService.addPushCharge(addPushChargeParams, false).then(function(response) {
          $scope.$apply(function () {
            $scope.allCharges.push(response)
          })
          console.log($scope.allCharges)
        })
      }
    });
  }]);
