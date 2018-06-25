angular.module('starter.walletChargeDetail', ['wallet.services'])
  .controller('walletChargeDetailCtrl', ['$scope', '$ionicLoading', 'Ajax', '$ionicPopover',  '$ionicActionSheet', '$cordovaToast', 'PicMethods', '$ionicModal', 'locals', 'walletIndexService', 'walletService', 'walletVerifyService', function($scope, $ionicLoading, Ajax, $ionicPopover, $ionicActionSheet, $cordovaToast, PicMethods, $ionicModal, locals, walletIndexService, walletService, walletVerifyService) {
    //imgArr:上传的图片数组
    let [token, editImgArr, rejectImgArr] = [locals.get('token'), [],
      []
    ];
    $scope.editImagesList = []; //保存渲染的修改图片路径
    $scope.rejectImagesList = []; //保存渲染的拒绝图片路径
    $scope.getApplyRechargeImages = [];//彩民上传的凭证
    $scope.afterOperation = { charge: false, edited: false, rejected: false, done: false }; //充值各操作成功的状态,包括显示、样式、disabled
    $scope.chargeConfirm = false; //表示当前操作同意
    $scope.rejectCharge = false; //表示当前操作拒绝
    $scope.chargeVoucher = false; //凭证的弹框
    $scope.editedCharge = { money: void 0, trueOrFalse: false }; //money修改后的金额,trueOfFalse表示当前操作修改
    $scope.eachChargeDetail = walletService.eachChargeDetail; //父路由点击的订单详情通过service传到子路由
    $scope.submitCharge = { money: $scope.eachChargeDetail.money/100, password: '' }; //提交http请求时候的金额和密码

    $scope.oVerifyView = walletVerifyService.featureChoose();  //渲染页面内容
    /**
     * [点击充值同意,关闭其他的弹框,把密码置为空]
     * @return {[type]} [description]
     */
    $scope.agreeCharge = () => {
      $scope.chargeConfirm = true;
      $scope.editedCharge.trueOrFalse = false;
      $scope.rejectCharge = false;
      $scope.chargeVoucher = false;
      $scope.submitCharge.password = '';
      $scope.popInputPass.show();
    };

    /**
     * [点击修改,关闭其他弹框,把密码置为空]
     * @param  {[object]} $event [阻止冒泡]
     * @return {[type]}        [description]
     */
    $scope.doEditCharge = ($event) => {
      $event.stopPropagation();
      $scope.chargeConfirm = false;
      $scope.chargeVoucher = false;
      $scope.editedCharge.trueOrFalse = !$scope.editedCharge.trueOrFalse;
      $scope.rejectCharge = false;
      $scope.submitCharge.password = '';
    };

    /**
     * [点击修改确认,核对上传图片数量,确认开启输入密码弹框]
     * @return {[type]} [description]
     */
    $scope.confirmEditCharge = () => {
      if ($scope.editImagesList.length > 3) {
        $cordovaToast.showShortCenter('最多上传3张凭证图片,请删除多余图片');
      } else if (!$scope.editedCharge.money) {
        $cordovaToast.showShortCenter('请输入修改的充值金额');
      } else {
        $scope.popInputPass.show();
        $scope.submitCharge.money = $scope.editedCharge.money;
        $scope.editedCharge.trueOrFalse = true;
      }
    };

    /**
     * [点击拒绝,关闭其他弹框]
     * @param  {[object]} $event [取消冒泡]
     * @return {[type]}        [description]
     */
    $scope.doRejectCharge = ($event) => {
      $event.stopPropagation();
      $scope.chargeConfirm = false;
      $scope.chargeVoucher = false;
      $scope.editedCharge.trueOrFalse = false;
      $scope.rejectCharge = true;
      $scope.submitCharge.password = '';
    };

    //点击拒绝确认开启输入密码弹框
    $scope.rejectChargeHttp = () => {
      if ($scope.rejectImagesList.length > 3) {
        $cordovaToast.showShortCenter('最多上传3张凭证图片,请删除多余图片');
      } else {
        $scope.popInputPass.show();
        $scope.submitCharge.money = walletService.eachChargeDetail.money/100;
      }
    };

    /**
     * [点击查看凭证关闭其他弹框]
     * @param  {[object]} $event [取消冒泡]
     * @return {[type]}        [description]
     */
    $scope.seekChargeVoucher = ($event) => {
      $event.stopPropagation();
      $scope.chargeConfirm = false;
      $scope.chargeVoucher = true;
      $scope.editedCharge.trueOrFalse = false;
      $scope.rejectCharge = false;
      if ($scope.eachChargeDetail.customerImg) {
        for (let oneUrl of $scope.eachChargeDetail.customerImg.split(',')) {
          $scope.getApplyRechargeImages.push(oneUrl);
          // PicMethods.downloadFile(oneUrl, 'downloadRechargeImgSucceed');
        }
      }
    };

    //download成功,查看凭证
    /*$scope.$on('downloadRechargeImgSucceed', function(event, src) {
      $scope.getApplyRechargeImages.push(src);
    });*/

    //[点击空区域关闭弹框]
    $scope.backToCharge = () => {
      $scope.editedCharge.trueOrFalse = false;
      $scope.rejectCharge = false;
      $scope.chargeVoucher = false;
      $scope.chargeConfirm = false;
      $scope.submitCharge.password = '';
    };

    //输入密码的时候检测,输入六位则http请求
    $scope.confirmVerify = async() => {
      if ($scope.submitCharge.password.toString().length === 6) {
        let chargePass = document.getElementById('chargePass'); //chargePass.blur()用来完成输入密码后失去焦点
        try {
          if ($scope.chargeConfirm === true) {
            chargePass.blur();
            let params = walletVerifyService.getAjaxParams('agree').oParams
            params.payPassword = $scope.submitCharge.password;
            let response = await Ajax.sendTo(url + `/bill/${walletVerifyService.getAjaxParams('agree').fnDoThingUrl()}`, token, { params });
            $cordovaToast.showShortCenter($scope.oVerifyView.alertText1);
            $scope.popInputPass.remove();
            $scope.afterOperation.charge = true;
            $scope.afterOperation.done = true;
            //广播已完成操作
            let chargeEmit = {
              index: $scope.eachChargeDetail.index,
              afterDoneCharge: 'agree'
            };
            $scope.$emit('chargeAuditSucceed', chargeEmit); //发送已经充值完毕的信息
          } else if ($scope.editedCharge.trueOrFalse === true) {
            chargePass.blur();
            let params = walletVerifyService.getAjaxParams('edit').oParams //获取service中的数据
            params.payPassword = $scope.submitCharge.password; //密码
            params.money = $scope.submitCharge.money*100; //修改的金额
            params.shopImg = editImgArr.join(','); //上传的图片
            let response = await Ajax.sendTo(url + `/bill/${walletVerifyService.getAjaxParams('edit').sDoThingUrl}`, token, { params });
            $scope.eachChargeDetail.money = $scope.submitCharge.money*100; //修改完成后页面显示修改后的金额
            $cordovaToast.showShortCenter($scope.oVerifyView.alertText2);
            $scope.popInputPass.remove();
            $scope.afterOperation.edited = true;
            $scope.afterOperation.done = true;
            $scope.editedCharge.trueOrFalse = false; //关闭修改的弹框
            //广播已完成操作
            let chargeEmit = {
              index: $scope.eachChargeDetail.index,
              afterDoneCharge: 'edit'
            };
            $scope.$emit('chargeAuditSucceed', chargeEmit); //发送已经充值完毕的信息
          } else if ($scope.rejectCharge === true) {
            chargePass.blur();
            let params = walletVerifyService.getAjaxParams('reject').oParams
            params.payPassword = $scope.submitCharge.password;
            params.shopImg = rejectImgArr.join(','); //上传的图片
            let response = await Ajax.sendTo(url + `/bill/${walletVerifyService.getAjaxParams('reject').fnDoThingUrl()}`, token, { params });
            $cordovaToast.showShortCenter($scope.oVerifyView.alertText3);
            $scope.popInputPass.remove();
            $scope.afterOperation.rejected = true;
            $scope.afterOperation.done = true;
            $scope.rejectCharge = false; //关闭拒绝充值弹框

            let chargeEmit = {
              index: $scope.eachChargeDetail.index,
              afterDoneCharge: 'reject'
            };
            $scope.$emit('chargeAuditSucceed', chargeEmit); //发送已经充值完毕的信息
          }
        } catch (error) { error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error); } finally {
          $scope.$apply(function() {
            $scope.submitCharge.password = '';
          })
        }
      }
    };

    //大图
    $scope.showLargeUploadImg = (imgSrc) => {
      $scope.uploadImgSrc = imgSrc;
      $scope.modalQr.show(); //modal框的形式展现
    };

    //拍照或选择照片
    $scope.showAction = function() {
      if ($scope.editImagesList.length < 3 && $scope.rejectImagesList.length < 3) {
        let hideSheet = $ionicActionSheet.show({
          buttons: [
            { text: '拍照' },
            { text: '从相册选择' }
          ],
          titleText: '请选择',
          cancelText: '取消',
          cancel: function() {
            return true;
          },
          buttonClicked: function(index) {
            if (index === 0 && $scope.editedCharge.trueOrFalse === true) {
              PicMethods.takePhoto(afterUploadDo, $scope.editImagesList.length);
            } else if (index === 0 && $scope.rejectCharge === true) {
              PicMethods.takePhoto(afterUploadDo, $scope.rejectImagesList.length);
            } else if (index === 1 && $scope.editedCharge.trueOrFalse === true) {
              PicMethods.pickImage(afterUploadDo, $scope.editImagesList.length);
            } else if (index === 1 && $scope.rejectCharge === true) {
              PicMethods.pickImage(afterUploadDo, $scope.rejectImagesList.length);
            }
            hideSheet();
          }
        });
      } else {
        $cordovaToast('最多上传3张凭证图片');
      }
    };

    /**
     * 定义照片上传后要做的事情
     * @param  {object} response 上传成功后返回的response
     * @param  {[type]} imageUrl 本地图片地址
     * @return {[type]}          [description]
     */
    function afterUploadDo(response, imageUrl,haveDoneUpload) {
      if (response.error === '0') {
        if ($scope.editedCharge.trueOrFalse === true) {
          editImgArr.push(response.data); //push图片上传成功后返回的服务器中图片地址
          $scope.editImagesList.push(imageUrl); //push本地路径,渲染本地照片
        } else if ($scope.rejectCharge === true) {
          rejectImgArr.push(response.data);
          $scope.rejectImagesList.push(imageUrl);
        }
        if (haveDoneUpload) {
          $ionicLoading.hide();
        }
      } else {
        $cordovaToast(response.info);
      }
      if ($scope.editImagesList.length > 3 || $scope.rejectImagesList.length > 3) {
        $cordovaToast('最多上传3张凭证图片,请删除多余图片');
      }
    }
    //删除图片
    $scope.deleteUploadImg = (index) => {
      if ($scope.editedCharge.trueOrFalse === true) {
        editImgArr.splice(index, 1);
        $scope.editImagesList.splice(index, 1);
      } else if ($scope.rejectCharge === true) {
        rejectImgArr.splice(index, 1);
        $scope.rejectImagesList.splice(index, 1);
      }
    };

    //关闭上传的大图modal
    $scope.closeLargeImgModal = () => {
      $scope.modalQr.hide();
    };

    /**
     * [配置密码输入框的popover]
     */
    $ionicPopover.fromTemplateUrl('./wallet/template/inputPassword.html', {
      scope: $scope,
      focusFirstInput: true
    }).then(function(popover) {
      $scope.popInputPass = popover;
    });
    $scope.openPopInputPass = function($event) {
      $scope.popInputPass.show($event);
    };
    $scope.closePopInputPass = function() {
      $scope.popInputPass.hide();
      /*$scope.editedCharge.trueOrFalse = false;
      $scope.rejectCharge = false;
      $scope.chargeVoucher = false;
      $scope.chargeConfirm = false;*/
    };
    // 清除浮动框
    $scope.$on('$destroy', function() {
      $scope.popInputPass.remove();
    });
    // 在隐藏浮动框后执行
    $scope.$on('popInputPass.hidden', function() {
      // 执行代码
    });
    // 移除浮动框后执行
    $scope.$on('popInputPass.removed', function() {
      // 执行代码
    });

    //点击显示upload大图的mordal窗口配置
    $ionicModal.fromTemplateUrl('./common/template/largeImgModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalQr = modal;
    });
  }]);
