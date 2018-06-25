//兑换
angular.module('starter.loginCtrl', ['starter.services'])
  .controller('loginCtrl', ['$scope', 'Ajax', '$ionicPopover', '$state', 'locals', '$rootScope', '$cordovaToast', '$ionicModal', 'jpushService', 'PicMethods', '$timeout', '$location', function($scope, Ajax, $ionicPopover, $state, locals, $rootScope, $cordovaToast, $ionicModal, jpushService, PicMethods, $timeout, $location) {
    let pathUrl = $location.path().split('/');
    console.log(pathUrl[2]);
    console.log(locals.getObject('loginAccount'));
    if (pathUrl[2] === 'fromExitLogin') {
      $scope.userLogin = {
        phone: locals.getObject('loginAccount').phone,
        password: '',
      };
      $scope.selectRemberPass = false;
    } else {
      $scope.userLogin = {
        phone: locals.getObject('loginAccount').phone,
        password: locals.getObject('loginAccount').password,
      }
      $scope.selectRemberPass = locals.getObject('loginAccount').selectRemberPass; //是否记住密码
    }

    $scope.whetherWrong = false; //密码错误,控制弹框
    $scope.forgetParams = { phone: void 0, verifyCode: void 0, resetPassword1: '', resetPassword2: '' };

    if ($scope.selectRemberPass === true) {
      autoLogin($scope.userLogin)
    }

    async function autoLogin(data) {
      let response = await Ajax.sendTo(url + '/auth/login', '', { data });
      locals.setObject('userInfo', response.data.customer);
      locals.set('token', response.data.token);
      locals.setObject('userRights', response.data.roles);

      //极光推送设置标签
      let tags = [];
      tags.push(response.data.customer.id);
      console.log(tags);
      jpushService.setTagsAndAlias(tags);

      $state.go('modules.home.index');
      //获取彩店信息
      getShopInfo().then(function() {
        console.log(locals.getObject('shopPerformance'));
        $state.go('modules.home.index');
      })
    }

    //清空账户密码
    $scope.deleteLogin = (which) => {
      which === 'phone' ? $scope.userLogin.phone = '' : $scope.userLogin.password = '';
    };
    //点击登录
    $scope.login = async() => {
      console.log(window.JPush)
      if ($scope.userLogin.phone && $scope.userLogin.password) {
        try {
          let data = {
            phone: $scope.userLogin.phone,
            password: $scope.userLogin.password
          };
          let response = await Ajax.sendTo(url + '/auth/login', '', { data });
          console.log(response);
          locals.setObject('userInfo', response.data.customer);
          locals.set('token', response.data.token);
          locals.setObject('userRights', response.data.roles);

          //检测是否更改了登录账户,更改了就得删除local保存的推送信息
          $rootScope.whetherHadChangeAccount = $scope.userLogin.phone === locals.getObject('loginAccount').phone ? false : true;

          //极光推送设置标签
          let tags = [];
          tags.push(response.data.customer.id);
          console.log(tags);
          jpushService.setTagsAndAlias(tags);

          //保存账号密码
          let account = {};
          if ($scope.selectRemberPass === true) {
            account = {
              phone: $scope.userLogin.phone,
              password: $scope.userLogin.password,
              selectRemberPass: true,
            };
            locals.setObject('loginAccount', account);
          } else {
            account = {
              phone: $scope.userLogin.phone,
              password: '',
              selectRemberPass: false,
            };
            locals.setObject('loginAccount', account);
          }

          //获取彩店信息
          getShopInfo()

        } catch (error) {
          console.log(error)
          $scope.loginError = error.info
          $scope.$apply(function() {
            $scope.whetherWrong = true;
          })
        }
      } else {
        $cordovaToast.showShortCenter('请输入用户名或密码');
      }
    }

    // 添加对回调函数的监听
    // document.addEventListener("jpush.setAlias", jpushService.onTagsWithAlias, false);
    document.addEventListener("jpush.setTags", jpushService.onTagsWithAlias, false);

    //彩店首页信息
    async function getShopInfo() {
      try {
        let response = await Ajax.sendTo(url + '/home/RequestHomeInformation', locals.get('token'));
        console.log(response);
        $scope.shopName = response.data.RequestShopInformation.name;
        locals.setObject('shopPerformance', response.data);
        $state.go('modules.home.index');
      } catch (error) {
        error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
      }
    };

    //点击忘记密码
    $scope.forgetPassword = () => {
      $scope.isForget = true;
    }
    //发送验证码
    $scope.sendVerifyCode = async() => {
      let params = {
        phone: $scope.forgetParams.phone,
      };
      try {
        let response = await Ajax.sendTo(url + '/auth/sendCode', '', { params })
        console.log(response);
        $cordovaToast.showShortCenter('已发送验证码,请稍等');
      } catch (error) {
        error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
      }
    }
    //确认修改密码
    $scope.confirmResetLoginPass = async() => {
      if ($scope.forgetParams.resetPassword1 !== $scope.forgetParams.resetPassword2) {
        $cordovaToast.showShortCenter('两次输入的密码不一致,请重新输入');
        return;
      }
      let params = {
        verificationCode: $scope.forgetParams.verifyCode,
        passWord: $scope.forgetParams.resetPassword2,
        phone: $scope.forgetParams.phone,
      };
      //18888888888
      try {
        let response = await Ajax.sendTo(url + '/auth/forgotPassword', '', { params })
        console.log(response);
        $scope.$apply(function() {
          $cordovaToast.showShortCenter('重置密码成功');
          $scope.isForget = false;
        })
      } catch (error) {
        error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
      }
    };

    $scope.closeForgetModal = () => {
      $scope.isForget = false;
    }
  }]);
