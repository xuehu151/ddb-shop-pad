angular.module('starter.registerCtrl', [])
  .controller('registerCtrl', ['$scope', '$ionicActionSheet', '$cordovaToast', '$ionicLoading', 'singlePicMethods', '$ionicModal','Ajax','$state', function($scope, $ionicActionSheet, $cordovaToast, $ionicLoading, singlePicMethods, $ionicModal,Ajax,$state) {
    $scope.verifyData = {
      account: '',
      phone: '',
      password: '',
      payPassword: '',
      verifyCode:''
    };

    $scope.shopImgSrc = ''; //彩店本地图片
    let uploadShopImg = ''; //上传的彩店

    function afterUploadDo(response, imageUrl) {
      if (response.error === '0') {
        uploadShopImg = response.data; //push图片上传成功后返回的服务器中图片地址
        $scope.shopImgSrc = imageUrl; //push本地路径,渲染本地照片
        console.log(uploadShopImg);
        console.log($scope.shopImgSrc);
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
            singlePicMethods.takePhoto(afterUploadDo);
          } else if (index === 1) {
            singlePicMethods.pickImage(afterUploadDo);
          }
          hideSheet();
        }
      });
    };
    //大图
    $scope.showLargeUploadImg = (imgSrc) => {
      $scope.uploadImgSrc = imgSrc;
      $scope.modalPic.show(); //modal框的形式展现
    };

    //发送验证码
    $scope.sendVerifyCode = async() => {
      let params = {
        phone: $scope.verifyData.phone,
      };
      try {
        let response = await Ajax.sendTo(url + '/auth/sendCodeForReview', '', { params })
        // console.log(response);
        // console.log('已发送验证码,请稍等');
        $cordovaToast.showShortCenter('已发送验证码,请稍等');
      } catch (error) {
        error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
      }
    }

    $scope.submitVerify = async() => {
      try {
        // uploadShopImg = 'http://47.104.29.94:8080/ddbFile/img/2017/12/19/20171219143655361723.jpg';
        if (uploadShopImg) {
          let params = {
            account:$scope.verifyData.account,
            password:$scope.verifyData.password,
            phone:$scope.verifyData.phone,
            payPassword:$scope.verifyData.payPassword,
            shopImg:uploadShopImg,
            verificationCode:$scope.verifyData.verifyCode,
          }
          let response = await Ajax.sendTo(url + '/auth/applyReview', '', { params });
          console.log(response);
          $cordovaToast.showShortCenter('发起审核成功')
          $state.go('login');
        } else {
          alert('请上传彩店凭证照片')
        }
      }
      catch (error) {
        error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
      }
    };

    //点击显示upload大图的mordal窗口配置
    $ionicModal.fromTemplateUrl('common/template/largeImgModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalPic = modal;
    });

  }]);
