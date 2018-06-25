angular.module('starter.redBagCtrl', [])
  .controller('redBagCtrl', ['$rootScope', '$scope', 'redBagService', '$ionicModal', 'Ajax', 'locals', 'PicMethods', '$ionicActionSheet', '$ionicLoading','$cordovaToast', function($rootScope, $scope, redBagService, $ionicModal, Ajax, locals, PicMethods, $ionicActionSheet, $ionicLoading,$cordovaToast) {
    $rootScope.nowModule = { index: 6 }; //模块
    $scope.allMonth = redBagService.month; //获取所有月份
    console.log($scope.allMonth);
    $scope.whetherShowAllMonth = false; //月份是否显示
    $scope.nowMonth = new Date().getMonth() + 1; //显示的月份
    let uploadImgArr = []; //本地上传的照片
    $scope.imageUploadList = []; //上传的照片
    $scope.imageCheckList = []; //查看的照片
    $scope.checkboxSelected = { whether: false };
    $scope.showLastPic = false;  //显示没有更多的图片
    $scope.allRedBags = [];    //所有红包//
    const now = new Date();
    let paramsSpc = {
      startDate: `${now.getFullYear()}-${now.getMonth()+1}-01`,
      endDate: `${now.getFullYear()}-${now.getMonth()+2}-01`,
    }
    redBagService.AjaxGetBalance(paramsSpc).then(function(response) {
      $scope.balance = response.data;
    })
    /**
     * [全部红包分页]
     * @type {[type]}
     */
    const moreRedBagData = $scope.moreRedBagData = {
      moredata: true, //是否还有待显示数据
      eachOrder: [], //每次请求返回数据
      alter: false, //用于解决切换列表的时候会有两次相同的ajax请求的bug
      params: {
        pageNumber: 1,
        pageSize: 10,
        startDate: `${now.getFullYear()}-${now.getMonth()+1}-01`,
        endDate: `${now.getFullYear()}-${now.getMonth()+2}-01`,
      },
      loadMore: async function() {
        try {
          if (moreRedBagData.moredata === true && moreRedBagData.alter === false) {
            let params = moreRedBagData.params;
            let response = await Ajax.sendTo(url + '/redPacket/getPacket', locals.get('token'), { params })
            console.log(response);
            if (response.data.length === moreRedBagData.params.pageSize) {
              moreRedBagData.eachOrder = moreRedBagData.eachOrder.concat(response.data);
              $scope.allRedBags = redBagService.dealResponseData(moreRedBagData.eachOrder);
              moreRedBagData.params.pageNumber += 1;
            } else if ((response.data.length !== 0) && (response.data.length <= moreRedBagData.params.pageSize)) {
              moreRedBagData.eachOrder = moreRedBagData.eachOrder.concat(response.data);
              $scope.allRedBags = redBagService.dealResponseData(moreRedBagData.eachOrder);
              $scope.showLastPic = true;
              moreRedBagData.moredata = false;
            } else if (response.data.length === 0) {
              $scope.showLastPic = true;
              moreRedBagData.moredata = false;
            }
            console.log($scope.allRedBags);
            moreRedBagData.alter = false
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      }
    };

    //开启modal
    $scope.showRedBagModal = (index) => {
      $scope.imageCheckList.length = 0;
      $scope.imageUploadList.length = 0;
      uploadImgArr.length = 0;
      $scope.checkboxSelected.whether = false;
      $scope.thisRedBag = $scope.allRedBags[index];
      console.log($scope.thisRedBag);
      $scope.modalRedBag.show();
    };

    //大乐透订单详情中点击查看更多
    $scope.checkMore = () => {
      console.log($scope.eachOrder)
      $scope.isCheckMore = true;
    }

    $scope.closeCheckMore = () => {
      $scope.isCheckMore = false;
    }

    $scope.$on('modal.hidden', function() {
      $scope.isCheckMore = false;
    });

    /**
     * 定义照片上传后要做的事情
     * @param  {object} response 上传成功后返回的response
     * @param  {[type]} imageUrl 本地图片地址
     * @return {[type]}          [description]
     */
    function afterUploadDo(response, imageUrl, haveDoneUpload) {
      if (response.error === '0') {
        uploadImgArr.push(response.data); //push图片上传成功后返回的服务器中图片地址
        $scope.imageUploadList.push(imageUrl); //push本地路径,渲染本地照片
        console.log(uploadImgArr);
        if (haveDoneUpload) {
          $ionicLoading.hide();
        }
      } else {
        $cordovaToast.showShortCenter(response.info);
      }
      if ($scope.imageUploadList.length > 3) {
        $cordovaToast.showShortCenter('最多上传3张凭证图片,请删除多余图片');
      }
    }
    /**
     * 拍照或选择照片
     */
    $scope.showAction = function() {
      if ($scope.imageUploadList.length < 3) {
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
              PicMethods.takePhoto(afterUploadDo, $scope.imageUploadList.length);
            } else if (index === 1) {
              PicMethods.pickImage(afterUploadDo, $scope.imageUploadList.length);
            }
            hideSheet();
          }
        });
      } else {
        $cordovaToast.showShortCenter('最多上传3张凭证图片');
      }
    };
    //大图
    $scope.showLargeUploadImg = (imgSrc) => {
      $scope.uploadImgSrc = imgSrc;
      $scope.modalQr.show(); //modal框的形式展现
    };
    $scope.deleteUploadImg = (index) => {
      uploadImgArr.splice(index, 1);
      $scope.imageUploadList.splice(index, 1);
      console.log(uploadImgArr);
    };

    //查看凭证
    $scope.checkUploadImg = (which) => {
      $scope.checkboxSelected.whether = !$scope.checkboxSelected.whether;
      if ($scope.checkboxSelected.whether === true) {
        $scope.imageCheckList.length = 0;
        for (let oneUrl of $scope.thisRedBag.printImg.split(',')) {
          PicMethods.downloadFile(oneUrl, 'downloadReaBagImgSucceed');
        }
      }
    }

    //download成功,查看上传的图片
    $scope.$on('downloadReaBagImgSucceed', function(event, src) {
      $scope.imageCheckList.push(src);
    });

    //选择时间段
    $scope.searchOneMonth = (month) => {
      $scope.nowMonth = month;
      moreRedBagData.params = {
        pageNumber: 1,
        pageSize: 15,
        startDate: `${now.getFullYear()}-${month*1}-01`,
        endDate: `${now.getFullYear()}-${month*1+1}-01 `,
      };
      console.log(moreRedBagData.params);
      $scope.allRedBags.length = 0;
      moreRedBagData.eachOrder.length = 0;
      moreRedBagData.moredata = true;
      $scope.showLastPic = false;
      moreRedBagData.loadMore();
      moreRedBagData.alter = true

      paramsSpc = {
        startDate: `${now.getFullYear()}-${month*1}-01`,
        endDate: `${now.getFullYear()}-${month*1+1}-01 `,
      }
      redBagService.AjaxGetBalance(paramsSpc).then(function(response) {
        $scope.$apply(function () {
          $scope.balance = response.data;
        })
      });
    };

    //取消上传
    $scope.cancelUploadRedBagImg = () => {
      $scope.modalRedBag.hide();
    }
    //确认上传
    $scope.confirmUploadRedBagImg = () => {
      if (uploadImgArr) {
        let params = {
          id: $scope.thisRedBag.id,
          printImg: uploadImgArr.join(',')
        };
        redBagService.AjaxUploadRedBagImg(params).then(function() {
          $scope.imageCheckList.length = 0;
          $scope.imageUploadList.length = 0;
          $scope.allRedBags[$scope.thisRedBag.index].printImg = params.printImg;
          uploadImgArr.length = 0;
          $scope.checkboxSelected.whether = false;
          $scope.modalRedBag.hide();
        })
      } else {
        '请先上传凭证'
      }
    }

    //出票详情2的mordal窗口配置
    $ionicModal.fromTemplateUrl('redBag/template/redBagModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalRedBag = modal;
    });

    //点击显示upload大图的mordal窗口配置
    $ionicModal.fromTemplateUrl('common/template/largeImgModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalQr = modal;
    });
  }]);
