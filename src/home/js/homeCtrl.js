angular.module('starter.homeCtrl', ['home.services'])
  .controller('homeCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {
    $rootScope.nowModule = { index: 0 }; //模块
  }])
  .controller('homeIndexCtrl', ['$scope', 'locals', '$state', '$ionicModal', 'walletIndexService', 'homeShopSetsService', 'addBefore','$rootScope','PicMethods','$cordovaToast', function($scope, locals, $state, $ionicModal, walletIndexService, homeShopSetsService, addBefore,$rootScope,PicMethods,$cordovaToast) {
    $scope.thisShopInfo = locals.getObject('shopPerformance');   //彩店信息
    $scope.shopSetsView = $scope.thisShopInfo.RequestShopInformation;
    $scope.userInfo = locals.getObject('userInfo');  //账户信息
    $scope.hideStatus = true; //隐藏按钮
    locals.set('bFromHomeSendPrize', 0);
    let newDay = new Date(); //用于初始化营业时间modal
    $scope.operations = {
      //营业时间修改
      startTime: new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate(), $scope.shopSetsView.startTime.split(':')[0], $scope.shopSetsView.startTime.split(':')[1]),
      endTime: new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate(), $scope.shopSetsView.endTime.split(':')[0], $scope.shopSetsView.endTime.split(':')[1]),
      password: '',
    };

    //公告

    console.log(locals.get('token'));
    homeShopSetsService.getPublicNote().then(function(response) {
      $scope.$apply(function () {
        $scope.publicNotes = response.data;
      })
      console.log($scope.publicNotes)
    });

    //跳转到派奖
    $scope.toSendPrize = () => {
      locals.set('bFromHomeSendPrize', 1); //判断是否从Home跳转到派奖页面的,因为派奖是和出票公用同一页面
      $state.go('modules.orders.bigLotteOrders');
    };

    //生成二维码
    (function() {
      new QRCode(document.getElementById('qrcode_1'), $scope.thisShopInfo.QRCodeUrl);
    })();

    let firstClick = true;
    $scope.showBigQr = () => {
      $scope.modalQr.show();

      //生成大二维码
      if (firstClick === true) {
        new QRCode(document.getElementById('qrcode_2'), {
          text: $scope.thisShopInfo.QRCodeUrl,
          width: 500,
          height: 500,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
        new QRCode(document.getElementById('qrcode_3'), {
          text:'http://47.104.29.94:8080/apk/ddb-buyer.apk',
          width: 500,
          height: 500,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      }
      firstClick = false;
    };

    $scope.gotoWalletOperation = (type) => {
      walletIndexService.feature = type;
      $state.go('modules.wallet.charge', { type });
    };
    //修改营业时间
    $scope.openEditSaleTimeModal = () => {
      $scope.operations.password = '';
      $scope.editSaleTimeModal.show();
    };
    //确认非营业时间修改
    $scope.confirmEditSaleTime = () => {
      let params = {
        startTime: addBefore.addHour0($scope.operations.startTime),
        endTime: addBefore.addHour0($scope.operations.endTime),
        ManagePassword: $scope.operations.password,
      };
      homeShopSetsService.AjaxUpdateShopInformation(params, 'editSaleTimeModal');
    };
    //修改营业时间成功,关闭弹框
    $scope.$on('homeOperationsSuc', function(event, which) {
      $cordovaToast.showShortCenter('修改成功');
      // $scope.shopSetsView.startTime = `${$scope.operations.startTime.getHours()}:${$scope.operations.startTime.getMinutes()}`;
      $scope.shopSetsView.startTime = addBefore.addHour0($scope.operations.startTime);
      $scope.shopSetsView.endTime = addBefore.addHour0($scope.operations.endTime);
      locals.setObject('shopPerformance', $scope.thisShopInfo);
      console.log(locals.getObject('shopPerformance'));
      $scope[which].hide();
    });
    //非营业时间修改modal关闭
    $scope.closeEditSaleTimeModal = () => {
      $scope.editSaleTimeModal.hide();
    };

    //跳转到权限管理
    $scope.goClientAssist = () => {
      $state.go('modules.clients', { fromHome: 'fromHome' });
    };


    //大二维码的mordal窗口配置
    $ionicModal.fromTemplateUrl('biggerQR.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalQr = modal;
    });
    //营业时间修改modal配置
    $ionicModal.fromTemplateUrl('./common/template/editSaleTimeModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.editSaleTimeModal = modal;
    });

  }])
  .controller('homePublicCtrl', ['$scope', '$state', 'Ajax', 'locals', '$cacheFactory', function($scope, $state, Ajax, locals, $cacheFactory) {
    $scope.allNotes = []; //所有公告
    /**
     * [申请充值的彩友分页]
     * @type {[type]}
     */
    const morePublicNotes = $scope.morePublicNotes = {
      moredata: true, //是否还有待显示数据
      eachOrder: [], //每次请求返回数据
      params: {
        pageNumber: 1,
        pageSize: 20,
      },
      loadMore: async() => {
        try {
          if (morePublicNotes.moredata === true) {
            let params = morePublicNotes.params;
            let response = await Ajax.sendTo(url + '/home/notice', locals.get('token'), { params });
            if (response.data.length === morePublicNotes.params.pageSize) {
              $scope.allNotes = morePublicNotes.eachOrder = morePublicNotes.eachOrder.concat(response.data);
              //获取日期
              for (let oneNote of $scope.allNotes) {
                oneNote.publicDate = oneNote.updateDate.split(' ')[0]
              }
              morePublicNotes.params.pageNumber += 1;
            } else if ((response.data.length !== 0) && (response.data.length <= morePublicNotes.params.pageSize)) {
              $scope.allNotes = morePublicNotes.eachOrder = morePublicNotes.eachOrder.concat(response.data);
              for (let oneNote of $scope.allNotes) {
                oneNote.publicDate = oneNote.updateDate.split(' ')[0]
              }
              morePublicNotes.moredata = false;
            } else if (response.data.length === 0) {
              morePublicNotes.moredata = false;
            }
            console.log($scope.allNotes);
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }
        } catch (error) { error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error); }
      }
    };

    $scope.checkDetail = (index) => {
      let oneNotesCache = $cacheFactory('oneNotes');
      oneNotesCache.put('note', $scope.allNotes[index]);
      $state.go('modules.home.publicDetail', { index });
    };
  }])
  .controller('homePublicDetailCtrl', ['$scope', '$stateParams', '$cacheFactory', function($scope, $stateParams, $cacheFactory) {
    let index = $stateParams.index;
    let oneNotesCache = $cacheFactory.get('oneNotes');
    $scope.thisNote = oneNotesCache.get('note');
    oneNotesCache.destroy();
  }]);
