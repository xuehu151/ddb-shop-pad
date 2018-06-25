angular.module('mine.services', [])
  .service('singlePicMethods', ['locals', '$rootScope', '$cordovaCamera', '$cordovaImagePicker', '$cordovaFileTransfer', '$ionicLoading', '$cordovaToast', function(locals, $rootScope, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer, $ionicLoading, $cordovaToast) {
    //上传照片
    function upImage(imageUrl, afterUploadDo, which) {
      var filename = imageUrl.split('/').pop();
      var options = {
        fileKey: 'filedata',
        fileName: filename,
        mimeType: 'image/jpg',
        headers: {
          'Auth-Token': locals.get('token')
        }
      };
      var serve = url + '/home/uploadImg'; //服务器地址
      $ionicLoading.show({
        template: '<p class="spinner-icon"><ion-spinner icon="bubbles" class="spinner-balanced"></ion-spinner><span>上传中...',
      });
      $cordovaFileTransfer.upload(serve, imageUrl, options).then(function(result) {
        let response = JSON.parse(result.response);
        console.log(response);
        afterUploadDo(response, imageUrl, which);
      }, function(error) {
        alert('部分图片上传失败' + error.exception);
        console.log(error);
        $ionicLoading.hide();
      }, function(progress) {});
    }
    //相机
    this.takePhoto = (afterUploadDo, which) => {
      let options = {
        //这些参数可能要配合着使用，比如选择了source type是0，destinationtype要相应的设置
        quality: 100, //相片质量0-100
        destinationType: Camera.DestinationType.FILE_URI, //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI
        sourceType: Camera.PictureSourceType.CAMERA, //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
        allowEdit: false, //在选择之前允许修改截图
        encodingType: Camera.EncodingType.JPEG, //保存的图片格式： JPEG = 0, PNG = 1
        /*targetWidth : 100,                                        //照片宽度
        targetHeight : 100,  */ //照片高度
        mediaType: 0, //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
        cameraDirection: 0, //前后摄像头类型：Back= 0,Front-facing = 1
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: true //保存进手机相册
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
        upImage(imageData, afterUploadDo, which);
      }, function(error) {
        $cordovaToast.showShortCenter(error);
      });
    };
    //选择照片
    this.pickImage = (afterUploadDo, which) => { //从相册选择
      let options = {
        maximumImagesCount: 1,
        // width: 140,
        // height: 100,
        quality: 100
      };
      // 从相册获取照片
      $cordovaImagePicker.getPictures(options).then(function(results) {
        for (let oneSrc of results) {
          upImage(oneSrc, afterUploadDo, which);
        }
      }, function(error) {
        $cordovaToast.showShortCenter(error);
      });
    };
    this.downloadFile = (downloadUrl, downloadSucceed, index) => {
      let filename = downloadUrl.split('/').pop(); //文件名
      let targetPath = cordova.file.externalRootDirectory + filename; //下载后的文件路劲
      let trustHosts = true; //安全校验,无
      let options = {};
      console.log(downloadUrl);
      $cordovaFileTransfer.download(downloadUrl, targetPath, options, trustHosts).then(function(result) {
        $rootScope.$broadcast(downloadSucceed, result.nativeURL, index);
      }, function(error) {
        $cordovaToast.showShortCenter('获取图片失败,请重试' + error);
      }, function(progress) {
        //进度条
        //   $timeout(function () {
        //   $scope.downloadProgress = (progress.loaded / progress.total) * 100;
        // })
      });
    };
  }])
  .factory('mineIndexService', ['Ajax', 'locals', '$rootScope', function(Ajax, locals, $rootScope) {
    return {
      feature: 0
    };
  }])
  .factory('mineShopSetsService', ['Ajax', 'locals', '$rootScope', '$cordovaToast', function(Ajax, locals, $rootScope, $cordovaToast) {
    return {
      feature: 0,
      featureChoose(feature) {
        if (feature === 'betters') {
          return bettersView;
        } else if (feature === 'assist') {
          return assistView;
        }
      },
      async AjaxUpdateShopInformation(params, which) {
        try {
          let response = await Ajax.sendTo(url + '/ownSetUp/updateShopInformation', locals.get('token'), { params })
          console.log(response);
          $rootScope.$broadcast('mineOperationsSuc', which)
          return response;
        } catch (error) {
          console.log(error)
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error.error);
        }
      },
      async AjaxEditSaleTime(params, which) {
        try {
          let response = await Ajax.sendTo(url + '/ownSetUp/updateBusinessTime', locals.get('token'), { params })
          console.log(response);
          $rootScope.$broadcast('mineOperationsSuc', which)
          return response;
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error.error);
        }
      },
    };
  }])
  .factory('mineShopAccountService', ['locals', function(locals) {
    return {
      allStatus: ['充值', '委托扣费'],
      addStatusChina(aShopAccountdata) {
        for (let each of aShopAccountdata) {
          each.statusChina = each.status === 1 ? '充值' : '委托扣费'
        }
        return aShopAccountdata;
      },
    }
  }])
  .factory('mineAccountService', ['Ajax', 'locals', '$rootScope', '$cordovaToast', function(Ajax, locals, $rootScope, $cordovaToast) {
    let [loginView, operationView] = [{
        h1: '修改登录密码',
        text1: '登录密码',
        text2: '确认登录密码',
      },
      {
        h1: '修改操作密码',
        text1: '操作密码',
        text2: '确认操作密码',
      }
    ];
    return {
      getFeature(which) {
        if (which === 'login') {
          return loginView;
        } else {
          return operationView;
        }
      },
      async AjaxEditAccount(params) {
        try {
          let response = await Ajax.sendTo(url + '/ownSetUp/updateAccount', locals.get('token'), { params })
          console.log(response);
          $rootScope.$broadcast('editAccountSuc')
          return response;
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error.error);
        }
      },
      async AjaxEditPassword(params) {
        try {
          let response = await Ajax.sendTo(url + '/ownSetUp/updatePassword', locals.get('token'), { params })
          console.log(response);
          $rootScope.$broadcast('editPasswordSuc')
          return response;
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error.error);
        }
      },
    }
  }])
