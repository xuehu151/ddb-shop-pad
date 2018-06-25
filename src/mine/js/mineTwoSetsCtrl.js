//兑换
angular.module('starter.mineTwoSetsCtrl', ['mine.services'])

  /*.controller('mineDelegateSetsCtrl', ['$scope', '$rootScope', 'mineIndexService', '$state', function($scope, $rootScope, mineIndexService, $state) {

  }])*/
  .controller('mineShopAccountCtrl', ['$scope', '$rootScope', 'mineShopAccountService', '$state', 'Ajax', 'locals', 'dateCheck', function($scope, $rootScope, mineShopAccountService, $state, Ajax, locals, dateCheck) {
    $scope.showLastPic = false;   //显示没有更多的图片
    let now = new Date();
    $scope.search = {
      // startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20),
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 179),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1),
    };

    let shopInfo = locals.getObject('shopPerformance');
    $scope.shopSetsView = shopInfo.RequestShopInformation;
    $scope.allShopAccountData = [];
    $scope.allStatus = mineShopAccountService.allStatus; //状态

    /**
     * [全部下单明细分页]
     * @type {[type]}
     */
    const moreShopAccount = $scope.moreShopAccount = {
      moredata: true, //是否还有待显示数据
      eachOrder: [], //每次请求返回数据
      alter: false, //用于解决切换列表的时候会有两次相同的ajax请求的bug
      params: {
        pageNumber: 1,
        pageSize: 15,
        startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
        endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
      },
      loadMore: async function() {
        try {
          if (moreShopAccount.moredata === true && moreShopAccount.alter === false) {
            let params = moreShopAccount.params;
            let response = await Ajax.sendTo(url + '/bill/getShopBillList', locals.get('token'), { params })
            console.log(response);
            if (response.data.length === moreShopAccount.params.pageSize) {
              $scope.allShopAccountData = moreShopAccount.eachOrder = moreShopAccount.eachOrder.concat(response.data);
              $scope.allShopAccountData = mineShopAccountService.addStatusChina($scope.allShopAccountData);
              moreShopAccount.params.pageNumber += 1;
            } else if ((response.data.length !== 0) && (response.data.length <= moreShopAccount.params.pageSize)) {
              $scope.allShopAccountData = moreShopAccount.eachOrder = moreShopAccount.eachOrder.concat(response.data);
              $scope.allShopAccountData = mineShopAccountService.addStatusChina($scope.allShopAccountData);
              $scope.showLastPic = true;
              moreShopAccount.moredata = false;
            } else if (response.data.length === 0) {
              $scope.showLastPic = true;
              moreShopAccount.moredata = false;
              // $cordovaToast.showShortCenter('已加载全部订单');
            }
            moreShopAccount.alter = false
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      }
    };
    //查询时间段
    $scope.searchDetail = () => {
      if (dateCheck.whetherInMonth($scope.search.startDate, 179)) {
        moreShopAccount.params = {
          pageNumber: 1,
          pageSize: 15,
          startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
          endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
        };
        $scope.showLastPic = false;
        moreShopAccount.moredata = true;
        moreShopAccount.alter = false;
        moreShopAccount.eachOrder.length = 0;
        $scope.allShopAccountData.length = 0;
        moreShopAccount.loadMore()
        moreShopAccount.alter = true;
      }
    }

    //检测是否3个月内
    $scope.whetherInMonth = () => {
      dateCheck.whetherInMonth($scope.search.startDate, 179)
    }

    //筛选充值还是委托扣费
    $scope.filterStatus = (status) => {
      moreShopAccount.params = {
        pageNumber: 1,
        pageSize: 15,
        startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
        endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
        status : status === '充值'? 1 : 2,
      };
      moreShopAccount.moredata = true;
      moreShopAccount.alter = false;
      moreShopAccount.eachOrder.length = 0;
      $scope.allShopAccountData.length = 0;
      moreShopAccount.loadMore()
      moreShopAccount.alter = true;
    }
  }])
  .controller('mineAccountSetsCtrl', ['$scope', '$ionicModal', 'mineIndexService', 'mineAccountService', 'locals', 'Ajax', '$cordovaToast', '$state', function($scope, $ionicModal, mineIndexService, mineAccountService, locals, Ajax, $cordovaToast, $state) {
    $scope.operations = { password: '', realName: '', phone: '', editPassword1: '', editPassword2: '', verifyCode: '', verifyCode2: '' };
    $scope.userInfo = locals.getObject('userInfo');
    console.log($scope.userInfo);
    //开启修改手机号的账户名的modal
    $scope.openAccountNameModal = () => {
      $scope.operations.password = '';
      $scope.operations.phone = '';
      $scope.operations.realName = '';
      $scope.editAccountNameModal.show();
    };
    //确认修改账户
    $scope.confirmEditAccount = () => {
      let params = {
        payPassword: $scope.operations.password,
        realName: $scope.operations.realName,
        phone: $scope.operations.phone,
        verificationCode: $scope.operations.verifyCode,
      };
      mineAccountService.AjaxEditAccount(params);
    };
    //修改账户成功
    $scope.$on('editAccountSuc', function() {
      $cordovaToast.showShortCenter('修改成功');
      $scope.editAccountNameModal.hide();
      if ($scope.operations.phone) {
        $scope.userInfo.phone = $scope.operations.phone;
      }
      if ($scope.operations.realName) {
        $scope.userInfo.realName = $scope.operations.realName;
      }
      locals.setObject('userInfo', $scope.userInfo);
      $scope.$emit('editRealNameSuc');
    });

    //开启修改密码的modal
    $scope.openEditPasswordModal = (which) => {
      $scope.nowEditPass = which;
      $scope.oView = mineAccountService.getFeature(which);
      $scope.operations.verifyCode2 = '';
      $scope.operations.editPassword1 = '';
      $scope.operations.editPassword2 = '';
      $scope.editPasswordModal.show();
    };
    //检测输入密码是否相同
    $scope.checkWhetherSame = () => {
      if ($scope.operations.editPassword1 !== $scope.operations.editPassword2) {
        $cordovaToast.showShortCenter('两次输入的密码不一致,请重新输入');
      }
    };
    //确认修改密码
    $scope.confirmEditPassword = () => {
      if ($scope.operations.editPassword1 !== $scope.operations.editPassword2) {
        $cordovaToast.showShortCenter('两次输入的密码不一致,请重新输入');
        return;
      }
      let password = $scope.nowEditPass === 'login' ? 'password' : 'payPassword';
      let params = {
        [password]: $scope.operations.editPassword2,
        verificationCode: $scope.operations.verifyCode2,
      };
      mineAccountService.AjaxEditPassword(params);
    };

    //修改密码成功
    $scope.$on('editPasswordSuc', function() {
      $cordovaToast.showShortCenter('修改密码成功');
      $scope.editPasswordModal.hide();
      $scope.operations.editPassword2 = $scope.operations.editPassword1 = '';
    });

    //发送验证码
    $scope.sendVerifyCode = async() => {
      let params = {
        phone: $scope.operations.phone,
      };
      try {
        let response = await Ajax.sendTo(url + '/ownSetUp/sendCode', locals.get('token'), { params })
        console.log(response);
        $cordovaToast.showShortCenter.showShortCenter('已发送验证码,请稍等').then(function() {

        }, function(error) {
          $cordovaToast.showShortCenter(error);
        });
      } catch (error) {
        error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
      }
    }

    $scope.exitLogin = () => {
      let account = {
        phone: locals.getObject('loginAccount').phone,
        password: '',
        selectRemberPass: false,
      };
      window.JPush.cleanTags({ sequence: 1 },
        (result) => {
          var sequence = result.sequence
          console.log(result)
        }, (error) => {
          var sequence = error.sequence
          var errorCode = error.code
          console.log(error)
        })
      $scope.$emit('exitLogin');
      locals.setObject('loginAccount', account);
      $state.go('login', { fromWhich: 'fromExitLogin' })
    }


    //修改账户名mordal窗口配置
    $ionicModal.fromTemplateUrl('editAccountNameModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.editAccountNameModal = modal;
    });

    /*$scope.openLoginPasswordModal = () => {
      $scope.resetLoginPassword.show();
    };*/

    /*//重置登录密码mordal窗口配置
    $ionicModal.fromTemplateUrl('resetLoginPassword.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.resetLoginPassword = modal;
    });*/
    //修改密码mordal窗口配置
    $ionicModal.fromTemplateUrl('editOperationPassword.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.editPasswordModal = modal;
    });
  }]);
