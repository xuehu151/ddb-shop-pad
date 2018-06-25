//兑换
angular.module('starter.ordersCtrl', [])

  .controller('ordersCtrl', ['$scope', '$rootScope', 'Ajax', 'locals','$cordovaToast', function($scope, $rootScope, Ajax, locals,$cordovaToast) {
    $scope.whetherOutput = true;
    $rootScope.nowModule = { index: 1 };
    if (locals.get('iSelectActiveTab') == 2 ) {
      $scope.iSelectActiveTab = 0;
    } else {
    $scope.iSelectActiveTab = locals.get('iSelectActiveTab') || 0; //切换tab
    }
    //如果是从客户模块进入的
    if (locals.get('whetherFromClientToAllOrder') === 'true') {
      $scope.iSelectActiveTab = 2;
      locals.set('whetherFromClientToAllOrder','false')
    }
    console.log($scope.iSelectActiveTab)
    locals.set('iSelectActiveTab', $scope.iSelectActiveTab);
    //获取每个彩种待处理的订单数量
    async function getNeedToAmount() {
      try {
        let response = await Ajax.sendTo(url + '/order/getPending', locals.get('token'), { closeLoading: false })
        console.log(response);
        $scope.dlt = response.data.dlt;
        $scope.zc = response.data.zucai;
      } catch (error) {
        error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
      }
    };
    getNeedToAmount();

    $scope.activeTab = (num) => {
      $scope.iSelectActiveTab = num;
      $scope.whetherOutput = num !== 2 ? true : false;
      false;
      locals.set('iSelectActiveTab', num);
      $rootScope.$broadcast('changeActiveTab', num)
    };

    //快捷出票
    $scope.quickOutput = () => {
      $scope.$broadcast('quickOutput')
    }

    $scope.$on('send', function() {
      $scope.whetherOutput = false;
    });
    $scope.$on('output', function() {
      $scope.whetherOutput = true;
    });
    $scope.$on('gotoAllOrder', function() {
      console.log(11)
      $scope.iSelectActiveTab = 2;
      $scope.whetherOutput = false;
    });
    //出票或派奖成功,角标-1;
    $scope.$on('outputSuc', function(event, iSelectTab,[amount] = [1]) {
      adjustAmount(iSelectTab,amount)
    });
    $scope.$on('sendtSuc', function(event, iSelectTab) {
      adjustAmount(iSelectTab,1)
    });

    $scope.$on('haveBigLotteryOutputApply', function(){
      $scope.$apply(function () {
        $scope.dlt+=1;
        console.log('父级')
      })
    });
    $scope.$on('haveFootballOutputApply', function(){
      $scope.$apply(function () {
        $scope.zc+=1;
      })
    });
    function adjustAmount(iSelectTab,amount) {
      if (iSelectTab === 0 && $scope.dlt>0) {
        $scope.$apply(function () {
          $scope.dlt-=amount;
        })
      } else if (iSelectTab === 1 && $scope.zc>0) {
        $scope.$apply(function () {
          $scope.zc-=amount;
        })
      }
    }
  }]);
