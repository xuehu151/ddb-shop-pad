angular.module('starter.services', [])
  //本地存储
  .factory('locals', ['$window', function($window) {
    return { //存储单个属性
      set: function(key, value) {
        $window.localStorage[key] = value;
      }, //读取单个属性
      get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      }, //存储对象，以JSON格式存储
      setObject: function(key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      }, //读取对象
      getObject: function(key) {
        return JSON.parse($window.localStorage[key] || '{}');
      }
    };
  }])
  //获取信息的http请求
  .factory('Ajax', ['$http', '$q', '$ionicLoading', '$state','$cordovaToast', function($http, $q, $ionicLoading, $state,$cordovaToast) {
    let info = {};
    info.sendTo = (url, token, { data, params, errorText = '网络超时,请重试', closeLoading = true, haveCloseLoading = true } = {}) => {
      console.log(params);
      console.log(haveCloseLoading);
      if (haveCloseLoading) {
        $ionicLoading.show();
      }
      let d = $q.defer();
      $http({
        method: 'post',
        url: url,
        data: data,
        params: params,
        headers: {
          // 'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Auth-Token': token
        },
        timeout: 15000,
      }).success(function(response) {
        if (response.error === '0') {
          d.resolve(response);
        } else if (response.error === '1110') {
          $cordovaToast.showShortCenter('登录过期,请重新登录');
          $state.go('login', { fromWhich: 'normal' });
        } else {
          d.reject(response);
        }
        $ionicLoading.hide();
      }).error(function(error) {
        if (error === null) {
          d.reject({ info: errorText });
        } else {
          d.reject(error);
        }
        if (closeLoading) {
          $ionicLoading.hide();
        }
      });
      return d.promise;
    };
    return info;
  }])

  //格式化处理,在前面添加
  .factory('addBefore', [function() {
    let item = {};
    //小时和分钟添加0
    item.addHour0 = function(obj) {
      let hoursString = '';
      let minutesString = '';
      if (obj.getHours().toString().length == 1) {
        hoursString = 0 + '' + obj.getHours().toString();
      } else {
        hoursString = obj.getHours().toString();
      }
      if (obj.getMinutes().toString().length == 1) {
        minutesString = 0 + '' + obj.getMinutes().toString();
      } else {
        minutesString = obj.getMinutes().toString();
      }
      return hoursString + ':' + minutesString;
    };
    item.addMMDD0 = function() {
      //如果月份长度少于2，则前加 0 补位
      let newDate = new Date();
      let monthString = '';
      let dayString = '';
      let dateString = '';
      if ((newDate.getMonth() + 1).toString().length == 1) {
        monthString = 0 + '' + (newDate.getMonth() + 1).toString();
      } else {
        monthString = (newDate.getMonth() + 1).toString();
      }
      //如果天数长度少于2，则前加 0 补位
      if (newDate.getDate().toString().length == 1) {
        dayString = 0 + '' + newDate.getDate().toString();
      } else {
        dayString = newDate.getDate().toString();
      }
      dateString = newDate.getFullYear() + '-' + monthString + '-' + dayString;
      return dateString;
    };
    item.addMMDD0Input = function(obj) {
      let arr = obj.split('.');
      if (arr[1].length == 1) {
        arr[1] = '0' + arr[1];
      }
      if (arr[2].length == 1) {
        arr[2] = '0' + arr[2];
      }
      return arr.join('.');
    };
    return item;
  }])
  .factory('dateCheck', ['$cordovaToast', function($cordovaToast) {
    const now = new Date();
    return {
      whetherInMonth(startDate, daysAmount) {
        const daysFromStart = (now.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24;
        if (daysFromStart > daysAmount + 1) {
          $cordovaToast.showShortCenter(`只能查询过去${daysAmount + 1}天的数据`);
          return false;
        } else {
          return true;
        }
      }
    };
  }])

  .factory('jpushService', [function() {
    // 获取RegistrationID
    function getRegistrationID() {
      window.JPush.getRegistrationID(function(data) {
        try {
          console.log('JPushPlugin:registrationID is ' + data);
        } catch (exception) {
          console.log(exception);
        }
      });
    }
    return {
      //初始化jpush
      initiateUI() {
        try {
          window.JPush.init()
          // getRegistrationID();
          window.JPush.setDebugMode(true);
          console.log('初始化成功!');
        } catch (exception) {
          console.log(exception);
        }
      },
      // 设置别名和标签
      setTagsAndAlias(tags, alias) {
        try {
          /*window.JPush.isPushStopped(function(result) {
            if (result == 0) {
              console.log('已经开启');
            } else {
              console.log('已经关闭');
            }
          });*/
          console.log(tags, alias);
          window.JPush.setTags({ sequence: 1, tags },
            function(response) {
              console.log(response, '设置tag成功');
            },
            function(response) {
              console.log(response, '设置tag失败');
            });
          console.log(window.JPush.getAlias());

        } catch (exception) {
          console.log(exception);
        }
      },
      // 设置标签和别名
      onTagsWithAlias(event) {
        try {
          console.log(event);
          console.log(event.resultCode);
          console.log(event.tags, event.alias);
        } catch (exception) {
          console.log(exception);
        }
      },
    };
  }])
  .service('PicMethods', ['locals', '$rootScope', '$cordovaCamera', '$cordovaImagePicker', '$cordovaFileTransfer', '$ionicLoading','$cordovaToast', function(locals, $rootScope, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer, $ionicLoading,$cordovaToast) {
    // let token = locals.get('token');
    let nowUploadIndex = 1;
    //上传照片
    function upImage(imageUrl, afterUploadDo, uploadImgsAmount) {

      var filename = imageUrl.split('/').pop();
      var options = {
        fileKey: 'filedata',
        fileName: filename,
        mimeType: 'image/jpg',
        timeout: 40000,
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
        afterUploadDo(response, imageUrl, nowUploadIndex === uploadImgsAmount);
        nowUploadIndex === uploadImgsAmount ? nowUploadIndex = 1 : nowUploadIndex++;
      }, function(error) {
        $cordovaToast.showShortCenter('部分图片上传失败' + error.exceptio);
        $ionicLoading.hide();
      }, function(progress) {});
    }
    //相机
    this.takePhoto = (afterUploadDo, localImagesAmount) => {
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

        upImage(imageData, afterUploadDo);
      }, function(error) {
        alert(error);
      });
    };
    //选择照片
    this.pickImage = (afterUploadDo, localImagesAmount) => { //从相册选择
      let options = {
        maximumImagesCount: 3,
        // width: 140,
        // height: 100,
        quality: 100
      };
      // 从相册获取照片
      $cordovaImagePicker.getPictures(options).then(function(results) {
        /*多余三张删除*/
        if ((results.length + localImagesAmount) > 3) {
          $cordovaToast.showShortCenter('最多上传3张凭证图片');
          results.splice(3 - localImagesAmount - results.length, localImagesAmount + results.length - 3);
        }
        console.log(results);
        for (let oneSrc of results) {
          upImage(oneSrc, afterUploadDo, results.length);
        }
      }, function(error) {
        alert(error);
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
  .directive('instMessage', [function() {
    // Runs during compile
    return {
      templateUrl: './common/template/instMessage.html',
      restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
      scope: false, // {} = isolate, true = child, false/undefined = no change
    };
  }])
  .constant('$ionicLoadingConfig', {
    hideOnStateChange: true,
    template: '<p class="spinner-icon"><ion-spinner icon="bubbles" class="spinner-balanced"></ion-spinner><span>加载中...',
    // delay: 1000,
    duration: 15000
  });
