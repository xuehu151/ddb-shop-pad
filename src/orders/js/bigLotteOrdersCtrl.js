/**
 * 本模块最大的失败是把大乐透和足彩放入一个controller中,导致业务逻辑复杂!!
 */
//兑换
angular.module('starter.bigLotteOrders', ['order.services'])
  .controller('bigLotteOrdersCtrl', ['$scope', '$rootScope', 'Ajax', '$ionicModal', 'splitCode', 'locals', '$ionicActionSheet', 'PicMethods', '$ionicLoading', 'orderService', '$state', '$cordovaToast', function($scope, $rootScope, Ajax, $ionicModal, splitCode, locals, $ionicActionSheet, PicMethods, $ionicLoading, orderService, $state, $cordovaToast) {
    $scope.whetherOutput = locals.get('whetherOutput') || true; //控制cart中待出票和待派奖的显示
    $scope.iSelectActiveTab = locals.get('iSelectActiveTab') * 1; //要判断是大乐透的还是竞彩足球的,0是大乐透,1是竟足,2是全部订单
    $scope.whetherFromQuickOutput = false; //因和正常出票的modal公用同一个,但有少许不同,做判断
    $scope.allNeedDo = []; //保存请求返回的订单
    $scope.imageList = []; //保存渲染的图片路径
    $scope.checkboxSelected = { whether: false }; //控制checkbox上传凭证
    $scope.delegatePassword = { password: '' }; //委托的输入密码
    $scope.isCheckMore = false;
    $scope.delegateStatus = '委托';
    //派奖的参数
    $scope.returnParams = {
      payPassword: '',
      returnMoney: void 0
    };

    //uploadImgArr: 保存上传的图片数组
    const [uploadImgArr, token, userRights] = [
      [], locals.get('token'), locals.getObject('userRights')
    ];
    /**
     * bFromHomeSendPrize: 要判断是否从首页点击派奖进来的,0是从订单进入,1是从首页进入
     * whetherSameElementWithLastClick: 要判断和上次点击的出票或派奖是否同一个,相同则不删除凭证图片,不相同则删除
     * nowQuickOutputIndex: 第几个正在快捷出票的订单,相同则不删除凭证图片,不相同则删除
     */
    let [bFromHomeSendPrize, whetherSameElementWithLastClick, nowQuickOutputIndex] = [locals.get('bFromHomeSendPrize'), false, 0];
    const fnNeedOutput = (lotteryID, status, iSelectActiveTab, { allBall } = {}) => {
      orderService.AjaxNeedOutput(lotteryID, status, allBall, iSelectActiveTab).then(function(response) {
        $scope.$apply(function() {
          $scope.allNeedDo = response.reverse();
        })
      })
    };
    const fnNeedSend = (lotteryID, status, isReturn, [allBall] = ['']) => {
      orderService.AjaxNeedSend(lotteryID, status, isReturn, allBall).then(function(response) {
        $scope.$apply(function() {
          $scope.allNeedDo = response;
        })
      })
    };
    //处理实时添加订单
    const fnAddNeedOutput = (lotteryID, status, iSelectActiveTab, { allBall, orderInfoID, haveCloseLoading } = {}) => {
      console.log(orderInfoID)
      orderService.AjaxNeedOutput(lotteryID, status, allBall, iSelectActiveTab, orderInfoID, haveCloseLoading).then(function(response) {
        console.log(response);
        $scope.$apply(function() {
          $scope.allNeedDo.push(response[0]);
        })
        console.log($scope.allNeedDo);
        for (let [index, eachOrder] of $scope.allNeedDo.entries()) {
          eachOrder.index = $scope.allNeedDo.length - index - 1;;
        }
      })
    };
    //判断是从home.html跳转进来的还是订单模块进来的
    if (bFromHomeSendPrize === '1') {
      $scope.whetherOutput = false;
      bFromHomeSendPrize = '0';
      fnNeedSend('2', 4, 0);
    } else if (bFromHomeSendPrize === '0' && $scope.iSelectActiveTab === 0) {
      $scope.whetherOutput = true;
      fnNeedOutput('2', 1, $scope.iSelectActiveTab);
    } else if (bFromHomeSendPrize === '0' && $scope.iSelectActiveTab === 1) {
      $scope.whetherOutput = true;
      fnNeedOutput('', 1, $scope.iSelectActiveTab, { allBall: 0 });
    }
    //点击出票弹出modal
    $scope.showBetTicket = (index) => {
      $scope.whetherFromQuickOutput = false;
      whetherSameElementWithLastClick = this.index === index ? true : false;
      console.log(this);
      console.log($scope.allNeedDo[index]);
      if ($scope.iSelectActiveTab === 0) {
        $scope.nowOutputOrderInfo = $scope.allNeedDo[index];
        $scope.nowOutputOrder = $scope.allNeedDo[index].lotteryList;
        let nowTotalBetsAmount = 0;
        for (let i = 0; i < $scope.nowOutputOrder.length; i++) {
          nowTotalBetsAmount += $scope.nowOutputOrder[i].betAmount;
          $scope.nowOutputOrder[i].nums = splitCode.split($scope.nowOutputOrder[i].investCode);
        }
        $scope.nowTotalBetsAmount = nowTotalBetsAmount;
        $scope.modalBetTicket.show();
      } else if ($scope.iSelectActiveTab === 1) {
        $scope.nowOutputOrderInfo = $scope.allNeedDo[index];
        let params = { id: $scope.allNeedDo[index].id };
        orderService.AjaxGetFootballOrderDetail(params).then(function(oFootballOrders) {
          if (oFootballOrders) {
            $scope.oFootballOrders = oFootballOrders;
            $scope.footballModal.show()
          }
        })

      }
      this.index = index
    };

    //打开第二个出票modal
    $scope.showOutputDetail = () => {
      //点击不同的订单会删除图片
      if (!whetherSameElementWithLastClick) {
        $scope.imageList.length = 0;
        uploadImgArr.length = 0;
      }
      $scope.checkboxSelected.whether = false; //上传凭证不选中
      $scope.modalBetTicket.hide();
      $scope.eachOrder = $scope.nowOutputOrderInfo;
      $scope.modalBetTicketDetail.show();
    };
    /**
     * 定义照片上传后要做的事情
     * @param  {object} response 上传成功后返回的response
     * @param  {[type]} imageUrl 本地图片地址
     * @return {[type]}          [description]
     */
    function afterUploadDo(response, imageUrl, haveDoneUpload) {
      if (response.error === '0') {
        uploadImgArr.push(response.data); //push图片上传成功后返回的服务器中图片地址
        $scope.imageList.push(imageUrl); //push本地路径,渲染本地照片
        console.log(uploadImgArr);
        if (haveDoneUpload) {
          $ionicLoading.hide();
        }
      } else {
        $cordovaToast.showShortCenter(response.info);
      }
      if ($scope.imageList.length > 3) {
        $cordovaToast.showShortCenter('最多上传3张凭证图片,请删除多余图片');
      }
    }
    /**
     * 拍照或选择照片
     */
    $scope.showAction = function() {
      if ($scope.imageList.length < 3) {
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
              PicMethods.takePhoto(afterUploadDo, $scope.imageList.length);
            } else if (index === 1) {
              PicMethods.pickImage(afterUploadDo, $scope.imageList.length);
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
      $scope.imageList.splice(index, 1);
      console.log(uploadImgArr);
    };

    //大乐透订单详情中点击查看更多
    $scope.checkMore = () => {
      $scope.eachInvestCodesBall = $scope.eachOrder.investCode;
      $scope.isCheckMore = true;
    }

    $scope.closeCheckMore = () => {
      $scope.isCheckMore = false;
    }

    $scope.$on('modal.hidden', function() {
      $scope.isCheckMore = false;
    });

    //完成出票
    $scope.completeOutput = async() => {
      try {
        if (userRights.printTicket.check === false) {
          $cordovaToast.showShortCenter('您没有出票的权限');
          return;
        }
        let params = {
          id: $scope.eachOrder.id,
          printImg: uploadImgArr.join(','),
        }
        let response = await Ajax.sendTo(url + '/order/print', token, { params })
        $scope.imageList.length = 0;
        uploadImgArr.length = 0;
        $scope.checkboxSelected.whether = false;
        console.log($scope.allNeedDo);
        console.log($scope.allNeedDo.length)
        console.log($scope.eachOrder.index)
        $scope.allNeedDo.splice($scope.allNeedDo.length - $scope.eachOrder.index - 1, 1)
        //来自大乐透的快捷出票
        if ($scope.whetherFromQuickOutput && $scope.iSelectActiveTab === 0 && $scope.allNeedDo[0]) {
          $scope.modalBetTicketDetail.hide();
          $scope.eachOrder = $scope.allNeedDo[0];
          $scope.nowOutputOrderInfo = $scope.allNeedDo[0];
          $scope.nowOutputOrder = $scope.allNeedDo[0].lotteryList;
          let nowTotalBetsAmount = 0;
          for (let i = 0; i < $scope.nowOutputOrder.length; i++) {
            nowTotalBetsAmount += $scope.nowOutputOrder[i].betAmount;
            $scope.nowOutputOrder[i].nums = splitCode.split($scope.nowOutputOrder[i].investCode);
          }
          $scope.nowTotalBetsAmount = nowTotalBetsAmount;

          $scope.modalBetTicket.show();
          console.log($scope.allNeedDo);

          //来自足彩的快捷出票
        } else if ($scope.whetherFromQuickOutput && $scope.iSelectActiveTab === 1 && $scope.allNeedDo[0]) {
          $scope.modalBetTicketDetail.hide();
          $scope.eachOrder = $scope.allNeedDo[0];
          $scope.modalBetTicketDetail.hide();
          let params = { id: $scope.eachOrder.id };
          orderService.AjaxGetFootballOrderDetail(params).then(function(oFootballOrders) {
            if (oFootballOrders) {
              $scope.nowOutputOrderInfo = $scope.allNeedDo[0];
              $scope.oFootballOrders = oFootballOrders;
              $scope.footballModal.show()
            }
          })
          console.log($scope.allNeedDo);
        } else {
          // $cordovaToast.showShortCenter('出票成功');
          console.log('出票成功');
          $scope.modalBetTicketDetail.hide();
        }
        for (let [index, eachOrder] of $scope.allNeedDo.entries()) {
          eachOrder.index = $scope.allNeedDo.length - index - 1;
        }
        $scope.$emit('outputSuc', $scope.iSelectActiveTab)
      } catch (error) { error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error); };
    };
    //切换大乐透和竟足
    $scope.$on('changeActiveTab', function(event, iSelectActiveTabPassed) {
      $scope.iSelectActiveTab = iSelectActiveTabPassed
      //切换时图片清掉
      $scope.imageList.length = 0;
      uploadImgArr.length = 0;
      $scope.checkboxSelected.whether = false; //上传凭证不选中
      console.log($scope.iSelectActiveTab)
      if ($scope.iSelectActiveTab === 0) {
        $scope.whetherOutput = true;
        fnNeedOutput('2', 1, $scope.iSelectActiveTab);
      } else if ($scope.iSelectActiveTab === 1) {
        $scope.whetherOutput = true;
        fnNeedOutput('', 1, $scope.iSelectActiveTab, { allBall: 0 });
      }
    });

    //打开竟足出票详情2
    $scope.showFootballOutputDetail = () => {

      //点击不同的订单会删除图片
      if (!whetherSameElementWithLastClick) {
        $scope.imageList.length = 0;
        uploadImgArr.length = 0;
      }
      $scope.checkboxSelected.whether = false; //上传凭证不选中
      $scope.footballModal.hide();
      $scope.eachOrder = $scope.nowOutputOrderInfo;
      $scope.modalBetTicketDetail.show();
    }

    /**
     * 以下是待派奖相关的
     */
    //切换待出票和待派奖
    $scope.showOutput = (orderWhich) => {
      //切换时图片清掉
      $scope.imageList.length = 0;
      uploadImgArr.length = 0;
      $scope.checkboxSelected.whether = false; //上传凭证不选中
      $scope.allNeedDo.length = 0;
      if ($scope.iSelectActiveTab === 0 && orderWhich == 'output') {
        fnNeedOutput('2', 1, $scope.iSelectActiveTab);
        $scope.whetherOutput = true;
      } else if ($scope.iSelectActiveTab === 0 && orderWhich == 'send') {
        fnNeedSend('2', 4, 0);
        $scope.whetherOutput = false;
      } else if ($scope.iSelectActiveTab === 1 && orderWhich == 'output') {
        fnNeedOutput('', 1, $scope.iSelectActiveTab, { allBall: 0 });
        $scope.whetherOutput = true;
      } else if ($scope.iSelectActiveTab === 1 && orderWhich == 'send') {
        fnNeedSend('', 4, 0, [0]);
        $scope.whetherOutput = false;
      }
      console.log($scope.allNeedDo)
      $scope.$emit(orderWhich)
    };
    /*
      点击取票,因和全部订单的modal公用一个,全部订单的此处不能点击,所以派奖中单独写一个函数,
    本可以在html中用 ng-click="orderInfo.whetherHaveGetTicket=!orderInfo.whetherHaveGetTicket"
     */
    $scope.getTicket = () => {
      $scope.orderInfo.whetherHaveGetTicket = !$scope.orderInfo.whetherHaveGetTicket
    }
    //派奖
    $scope.confirmSendPrize = () => {
      if (userRights.sendPrize.check === false) {
        $cordovaToast.showShortCenter('您没有派奖的权限');
        return;
      }
      let params = {
        id: $scope.orderInfo.id,
        returnImg: uploadImgArr.join(','),
        payPassword: $scope.returnParams.payPassword,
        returnMoney: $scope.orderInfo.nowTotalWinamt,
        whetherHaveGetTicket: $scope.orderInfo.whetherHaveGetTicket ? 1 : 0,
      }
      orderService.AjaxConfirmSendPrize(params).then(function(response) {
        console.log(response);
        if (response) {
          $scope.allNeedDo.splice($scope.allNeedDo.length - $scope.orderInfo.index - 1, 1)
          $scope.modalSendDetailModal.hide();
          for (let [index, eachOrder] of $scope.allNeedDo.entries()) {
            eachOrder.index = $scope.allNeedDo.length - index - 1;
          }
        }
        uploadImgArr.length = 0;
        $scope.$emit('sendtSuc', $scope.iSelectActiveTab)
      })
    };
    //派奖详情的modal
    $scope.showSendDetail = (index) => {
      $scope.orderInfo = $scope.allNeedDo[index];
      //点击不同的订单会删除图片
      if (this.index !== index) {
        $scope.imageList.length = 0;
        uploadImgArr.length = 0;
        $scope.checkboxSelected.whether = false; //上传凭证不选中
        $scope.orderInfo.whetherHaveGetTicket = false; //取票不选中
      }
      $scope.modalSendDetailModal.show();
      $scope.returnParams.payPassword = '';
      this.index = index;
    };
    $scope.$on('quickOutput', function(event) {
      if (!$scope.allNeedDo[0]) { return }
      $scope.whetherFromQuickOutput = true;
      $scope.checkboxSelected.whether = false; //上传凭证不选中
      if ($scope.iSelectActiveTab === 0) {
        $scope.eachOrder = $scope.allNeedDo[nowQuickOutputIndex];
        $scope.nowOutputOrderInfo = $scope.allNeedDo[0];
        $scope.nowOutputOrder = $scope.allNeedDo[0].lotteryList;
        let nowTotalBetsAmount = 0;
        for (let i = 0; i < $scope.nowOutputOrder.length; i++) {
          nowTotalBetsAmount += $scope.nowOutputOrder[i].betAmount;
          $scope.nowOutputOrder[i].nums = splitCode.split($scope.nowOutputOrder[i].investCode);
        }
        $scope.nowTotalBetsAmount = nowTotalBetsAmount;
        $scope.eachOrder = $scope.allNeedDo[0];
        $scope.modalBetTicket.show();
      }
      if ($scope.iSelectActiveTab === 1) {
        $scope.eachOrder = $scope.allNeedDo[nowQuickOutputIndex];
        let params = { id: $scope.eachOrder.id };
        orderService.AjaxGetFootballOrderDetail(params).then(function(oFootballOrders) {
          if (oFootballOrders) {
            $scope.nowOutputOrderInfo = $scope.allNeedDo[0];
            $scope.oFootballOrders = oFootballOrders;
            $scope.footballModal.show()
          }
        })
      }
    });

    //开启委托功能和开启确认委托弹框
    $scope.openDelegate = () => {
      $scope.delegatePassword.password = '';

      if (userRights.entruse.check === false) {
        $cordovaToast.showShortCenter('您没有委托订单的权限');
        return;
      } else if (!$scope.allNeedDo[0]) {
        return false;
      } else {
        for (let cart of $scope.allNeedDo) {
          cart.delegateStatus = 1;
        }
      }
    };
    //选择一个订单委托
    $scope.delegateClickThis = (index) => {
      if ($scope.allNeedDo[index].delegateStatus === 2) {
        $scope.allNeedDo[index].delegateStatus = 1
      } else if ($scope.allNeedDo[index].delegateStatus === 1) {
        $scope.allNeedDo[index].delegateStatus = 2
      }
    };

    $scope.wantToDelegate = () => {
      if (orderService.checkHaveDelegateOrder($scope.allNeedDo)) {
        $scope.delegateOrderModal.show();
      } else {
        alert('您还未选择委托订单');
      }
    }

    //取消委托
    $scope.cancelDelegate = () => {
      if ($scope.whetherOutput === true) {
        for (let cart of $scope.allNeedDo) {
          cart.delegateStatus = 0;
        }
      }
      $scope.delegateStatus = '委托';
    }
    //全部委托
    $scope.chooseAllToDelegate = () => {
      if ($scope.allNeedDo[0]) {
        for (let eachDelegateOrder of $scope.allNeedDo) {
          eachDelegateOrder.delegateStatus = 2
        }
        $scope.delegateStatus = '确认委托'
      }
    }

    //确认委托
    $scope.confirmDelegateOrders = () => {
      orderService.AjaxConfirmDelegateOrders($scope.allNeedDo, $scope.delegatePassword.password)
        .then(function(oDelegateSuc) {
          console.log(oDelegateSuc);
          if (oDelegateSuc.amount) {
            $scope.allNeedDo = oDelegateSuc.aNowAllNeedDO;
            $scope.delegateOrderModal.hide();
            $scope.delegateStatus = '委托';
            $scope.$emit('outputSuc', $scope.iSelectActiveTab, [oDelegateSuc.amount])
          }
        })
    }

    //点击第二个全部订单按钮
    $scope.gotoAllOrder = () => {
      $scope.$emit('gotoAllOrder');
      $state.go('modules.orders.allOrders');
    }

    //点击返回关闭足彩订单详情1的modal窗口
    $scope.closeModalFootball = () => {
      $scope.footballModal.hide();
    };

    //接收到大乐透出票推送
    $scope.$on('haveBigLotteryOutputApply', function(event, orderInfoID) {
      console.log('大乐透子级');
      console.log(orderInfoID);
      if ($scope.iSelectActiveTab === 0 && $scope.whetherOutput === true && $rootScope.nowModule.index === 1) {
        fnAddNeedOutput('2', 1, $scope.iSelectActiveTab, { orderInfoID, haveCloseLoading: false });
      }
    });
    //接收到足彩出票推送
    $scope.$on('haveFootballOutputApply', function(event, orderInfoID) {
      console.log('足彩子级');
      console.log(orderInfoID);
      if ($scope.iSelectActiveTab === 1 && $scope.whetherOutput === true && $rootScope.nowModule.index === 1) {}
      fnAddNeedOutput('', 1, $scope.iSelectActiveTab, { allBall: 0, orderInfoID, haveCloseLoading: false });
    });

    //关闭上传的大图modal
    $scope.closeLargeImgModal = () => {
      $scope.modalQr.hide();
    };

    //出票详情1的mordal窗口配置
    $ionicModal.fromTemplateUrl('orders/template/betTicketModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalBetTicket = modal;
    });
    //点击返回,关闭大乐透出票详情1的modal
    $scope.closeModalBetTicket = () => {
      $scope.modalBetTicket.hide();
    };
    //出票详情2的mordal窗口配置
    $ionicModal.fromTemplateUrl('orders/template/orderDetailModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalBetTicketDetail = modal;
    });

    //查看待派奖详情的mordal窗口配置
    $ionicModal.fromTemplateUrl('orders/template/orderDetailSendModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalSendDetailModal = modal;
    });

    //竟足出票详情1的mordal窗口配置
    $ionicModal.fromTemplateUrl('orders/template/footballModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.footballModal = modal;
    });

    //点击显示upload大图的mordal窗口配置
    $ionicModal.fromTemplateUrl('common/template/largeImgModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalQr = modal;
    });
    //点击显示订单委托的mordal窗口配置
    $ionicModal.fromTemplateUrl('openDelegateOrderModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.delegateOrderModal = modal;
    });

  }]);
