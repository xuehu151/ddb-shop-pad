//兑换
angular.module('starter.mineShopSetsCtrl', ['mine.services'])
  .controller('mineShopSetsCtrl', ['$scope', '$rootScope', 'mineIndexService', 'mineShopSetsService', '$ionicModal', '$ionicActionSheet', 'singlePicMethods', '$ionicLoading', 'locals', 'addBefore','$cordovaToast', function($scope, $rootScope, mineIndexService, mineShopSetsService, $ionicModal, $ionicActionSheet, singlePicMethods, $ionicLoading, locals, addBefore,$cordovaToast) {
    /**
     * uploadImgTotal 确定上传图片的地址
     * $scope.imgUrlTotal 本地图片的路径
     */
    let shopInfo = locals.getObject('shopPerformance');
    $scope.shopSetsView = shopInfo.RequestShopInformation;
    console.log($scope.shopSetsView);
    $scope.shopImgSrc = $rootScope.shopImgSrc || './common/img/noShopImg.svg'; //彩店设置首页的彩店图片
    let initialUploadImgTotal = {
      shopImg: $rootScope.shopImgSrc,
      qq: $scope.shopSetsView.qqTouchQRCode,
      qqMoney: $scope.shopSetsView.qqQRCode,
      wechat: $scope.shopSetsView.wechatTouchQRCode,
      wechatMoney: $scope.shopSetsView.weChatQRCode,
      alipay: $scope.shopSetsView.alipayTouchQRCode,
      alipayMoney: $scope.shopSetsView.alipayQRCode
    }; //初始的上传图片状态
    let uploadImgTotal = initialUploadImgTotal; //用于上传图片的数组
    $scope.imgUrlTotal = { shopImg: $rootScope.shopImgSrc || './common/img/noShopImg.svg', qq: '', qqMoney: '', wechat: '', wechatMoney: '', alipay: '', alipayMoney: '' };
    let newDay = new Date(); //用于初始化营业时间modal
    let whetherOnDelegate = true; //是否委托
    if ($scope.shopSetsView.status === 1) {
      whetherOnDelegate = true;
    } else if ($scope.shopSetsView.status === 2) {
      whetherOnDelegate = false;
    }
    $scope.operations = {
      //修改彩店信息
      description: $scope.shopSetsView.description,
      name: $scope.shopSetsView.name,
      address: $scope.shopSetsView.address,
      number: $scope.shopSetsView.number,
      phone: $scope.shopSetsView.phone,
      //修改对外联系方式
      qq: $scope.shopSetsView.qq,
      wechat: $scope.shopSetsView.wechat,
      alipay: $scope.shopSetsView.alipay,
      bankCard: $scope.shopSetsView.bankCard,
      whetherOnSale: !$scope.shopSetsView.status, //彩店是否营业
      whetherOnDelegate, //彩店是否委托
      //营业时间修改
      startTime: new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate(), $scope.shopSetsView.startTime.split(':')[0], $scope.shopSetsView.startTime.split(':')[1]),
      endTime: new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate(), $scope.shopSetsView.endTime.split(':')[0], $scope.shopSetsView.endTime.split(':')[1]),
      password: '',
    };

    /**
     * 彩店信息修改
     */
    //彩店介绍修改modal弹出
    $scope.openEditIntroModal = () => {
      $scope.operations.password = '';
      $scope.editIntroModal.show();
    };
    //确认修改彩店介绍
    $scope.confirmEditIntro = () => {
      let params = {
        description: $scope.operations.description,
        name: $scope.operations.name,
        number: $scope.operations.number,
        address: $scope.operations.address,
        shopImg: uploadImgTotal.shopImg,
        ManagePassword: $scope.operations.password,
      };
      mineShopSetsService.AjaxUpdateShopInformation(params, 'editIntroModal');
    };
    /**
     * 定义照片上传后要做的事情
     * @param  {object} response 上传成功后返回的response
     * @param  {string} imageUrl 本地图片地址
     * @param  {string} which     上传的是什么东西的图片或二维码
     * @return {[type]}          [description]
     */
    function afterUploadDo(response, imageUrl, which) {
      if (response.error === '0') {
        uploadImgTotal[which] = response.data; //push图片上传成功后返回的服务器中图片地址
        $scope.imgUrlTotal[which] = imageUrl; //push本地路径,渲染本地照片
        console.log(uploadImgTotal);
        console.log($scope.imgUrlTotal);
        $ionicLoading.hide();
      } else {
        $cordovaToast.showShortCenter(response.info);
      }
    }
    /**
     * 拍照或选择照片
     */
    $scope.showAction = function() {
      let hideSheet = $ionicActionSheet.show({
        buttons: [{
          text: '拍照'
        }, {
          text: '从相册选择'
        }],
        titleText: '请选择',
        cancelText: '取消',
        cancel: function() {
          return true;
        },
        buttonClicked: function(index) {
          if (index === 0) {
            singlePicMethods.takePhoto(afterUploadDo,'shopImg');
          } else if (index === 1) {
            singlePicMethods.pickImage(afterUploadDo, 'shopImg');
          }
          hideSheet();
        }
      });
    };
    //大图
    $scope.showLargeUploadImg = (imgSrc) => {
      $scope.uploadImgSrc = imgSrc;
      $scope.modalQr.show(); //modal框的形式展现
    };
    //彩店介绍修改modal关闭
    $scope.closeEditIntroModal = () => {
      $scope.editIntroModal.hide();
    };

    /**
     * 对外联系方式修改
     */
    //对外联系方式modal弹出
    $scope.openContactWaysModal = () => {
      $scope.operations.password = '';
      $scope.contactWaysModal.show();
    };
    //上传二维码
    $scope.uploadQr = (which) => {
      singlePicMethods.pickImage(afterUploadDo, which);
    };
    //点击图标显示二维码大图
    $scope.showLargeQr = (whichQrUrl) => {
      console.log(whichQrUrl)
      if (whichQrUrl) {

        $scope.modalQrcode.show();
        $scope.uploadImgSrc = whichQrUrl;
      }
    };

    //确认修改对外联系方式
    $scope.confirmContactWays = () => {
      if ($scope.operations.phone.length === 11 || $scope.operations.phone.length === 0) {
        console.log($scope.operations);
        console.log(uploadImgTotal);
        let params = {
          phone: $scope.operations.phone,
          qq: $scope.operations.qq,
          qqTouchQRCode: uploadImgTotal.qq,
          weChat: $scope.operations.wechat,
          wechatTouchQRCode: uploadImgTotal.wechat,
          alipay: $scope.operations.alipay,
          alipayTouchQRCode: uploadImgTotal.alipay,
          ManagePassword: $scope.operations.password,
        };
        mineShopSetsService.AjaxUpdateShopInformation(params, 'contactWaysModal');
      } else {
        $cordovaToast.showShortCenter('请填写11位正确手机号码');
      }
    };
    //对外联系方式modal关闭
    $scope.closeContactWaysModal = () => {
      $scope.operations.password = '';
      $scope.contactWaysModal.hide();
    };

    /**
     * 彩店是否营业选择
     */
    //彩店营业时间modal弹出
    $scope.openOnSaleTimeModal = () => {
      $scope.operations.password = '';
      $scope.onSaleTimeModal.show();
    };
    //确认修改营业选择
    $scope.confirmChooseSaling = () => {
      let shopStatus = 0;
      console.log($scope.operations.whetherOnSale);
      if ($scope.operations.whetherOnSale) {
        shopStatus = 0;
      } else if (!$scope.operations.whetherOnSale && $scope.operations.whetherOnDelegate) {
        shopStatus = 1;
      } else if (!$scope.operations.whetherOnSale && !$scope.operations.whetherOnDelegate) {
        shopStatus = 2;
      }
      let params = {
        status: shopStatus,
        ManagePassword: $scope.operations.password,
      };
      mineShopSetsService.AjaxUpdateShopInformation(params, 'onSaleTimeModal').then(function () {
        $scope.$emit('editOnSaleStatusSuc');
      });
    };
    //彩店营业时间modal关闭
    $scope.closeOnSaleTimeModal = () => {
      $scope.operations.whetherOnSale = !$scope.shopSetsView.status
      $scope.onSaleTimeModal.hide();
    };

    //非营业时间修改modal弹出
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
      mineShopSetsService.AjaxUpdateShopInformation(params, 'editSaleTimeModal');
    };
    //非营业时间修改modal关闭
    $scope.closeEditSaleTimeModal = () => {
      $scope.editSaleTimeModal.hide();
    };

    /**
     * 提交收款方式选择
     */
    //收款方式选择modal弹出
    $scope.openMoneyWaysModal = () => {
      $scope.operations.password = '';
      $scope.moneyWaysModal.show();
    };
    //确认提交收款方式选择
    $scope.confirmMoneyWays = () => {
      console.log(uploadImgTotal);
      let params = {
        bankCard: $scope.operations.bankCard,
        ManagePassword: $scope.operations.password,
        qqQRCode: uploadImgTotal.qqMoney,
        weChatQRCode: uploadImgTotal.wechatMoney,
        alipayQRCode: uploadImgTotal.alipayMoney,
      };
      mineShopSetsService.AjaxUpdateShopInformation(params, 'moneyWaysModal');
    };
    //收款方式选择modal关闭
    $scope.closeMoneyWaysModal = () => {
      $scope.moneyWaysModal.hide();
    };

    //修改成功,关闭弹框
    $scope.$on('mineOperationsSuc', function(event, which) {
      // $cordovaToast.showShortCenter('修改成功');
      console.log($scope.imgUrlTotal);
      console.log(uploadImgTotal);
      if (which === 'editIntroModal') {
        $scope.shopImgSrc = $rootScope.shopImgSrc = $scope.imgUrlTotal.shopImg;
        $scope.shopSetsView.description = $scope.operations.description;
        $scope.shopSetsView.name = $scope.operations.name;
        $scope.shopSetsView.number = $scope.operations.number;
        $scope.shopSetsView.address = $scope.operations.address;
      } else if (which === 'contactWaysModal') {
        $scope.shopSetsView.phone = $scope.operations.phone;
        $scope.shopSetsView.qq = $scope.operations.qq;
        $scope.shopSetsView.qqTouchQRCode = uploadImgTotal.qq;
        $scope.shopSetsView.wechat = $scope.operations.wechat;
        $scope.shopSetsView.wechatTouchQRCode = uploadImgTotal.wechat;
        $scope.shopSetsView.alipay = $scope.operations.alipay;
        $scope.shopSetsView.alipayTouchQRCode = uploadImgTotal.alipay;
      } else if (which === 'onSaleTimeModal') {
        $scope.shopSetsView.status = $scope.operations.whetherOnSale ? 0 : 1;
      } else if (which === 'editSaleTimeModal') {
        $scope.shopSetsView.startTime = addBefore.addHour0($scope.operations.startTime);
        $scope.shopSetsView.endTime = addBefore.addHour0($scope.operations.endTime);
      } else if (which === 'moneyWaysModal') {
        $scope.shopSetsView.qqQRCode = uploadImgTotal.qqMoney;
        $scope.shopSetsView.wechatQRCode = uploadImgTotal.wechatMoney;
        $scope.shopSetsView.alipayQRCode = uploadImgTotal.alipayMoney;
        $scope.shopSetsView.bankCard = $scope.operations.bankCard;
      }

      locals.setObject('shopPerformance', shopInfo);
      console.log(locals.getObject('shopPerformance'));
      uploadImgTotal = initialUploadImgTotal; //成功后清除
      $scope[which].hide();
    });

    //关闭上传的大图modal
    $scope.closeLargeImgModal = () => {
      $scope.modalQr.hide();
    };

    //彩店介绍修改modal配置
    $ionicModal.fromTemplateUrl('editIntroModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.editIntroModal = modal;
    });
    //修改对外联系方式modal配置
    $ionicModal.fromTemplateUrl('contactWaysModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.contactWaysModal = modal;
    });
    //彩店营业时间modal配置
    $ionicModal.fromTemplateUrl('onSaleTimeModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.onSaleTimeModal = modal;
    });
    //营业时间修改modal配置
    $ionicModal.fromTemplateUrl('./common/template/editSaleTimeModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.editSaleTimeModal = modal;
    });
    //收款方式选择modal配置
    $ionicModal.fromTemplateUrl('moneyWaysModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.moneyWaysModal = modal;
    });
    //点击显示upload大图的mordal窗口配置
    $ionicModal.fromTemplateUrl('common/template/largeImgModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalQr = modal;
    });
    //点击显示二维码大图的mordal窗口配置
    $ionicModal.fromTemplateUrl('common/template/qrImgModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalQrcode = modal;
    });

    $scope.$on('modal.hidden', function() {
        $scope.uploadImgSrc = '';
      });
  }]);
