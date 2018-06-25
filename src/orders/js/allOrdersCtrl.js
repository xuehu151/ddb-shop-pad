//兑换
angular.module('starter.allOrders', ['order.services'])

  .controller('allOrdersCtrl', ['$scope', '$rootScope', 'Ajax', 'orderService', 'splitCode', '$ionicModal', 'locals', 'PicMethods','dateCheck','$cordovaToast','$stateParams', function($scope, $rootScope, Ajax, orderService, splitCode, $ionicModal, locals, PicMethods,dateCheck,$cordovaToast,$stateParams) {
    $scope.allStatus = ['委托', '待出票', '已出票', '待派奖', '已派奖', '未中奖']; //订单status
    $scope.allLotteryID = ['超级大乐透', '竞彩足球']; //订单彩种
    $scope.checkboxSelected = { whether: false }; //控制checkbox上传凭证
    $scope.showLastPic = false;  //显示没有更多的图片
    $scope.imageList = []; //查看凭证
    $scope.allOrders = [];  //保存所有订单
    let now = new Date();
    $scope.search = {
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()-179),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1),
      phone: null,
      customerName: null,
    };
    /**
     * [全部订单分页]
     * @type {[type]}
     */
    const moreOrders = $scope.moreOrders = {
      moredata: true, //是否还有待显示数据
      eachOrder: [], //每次请求返回数据
      alter: false, //用于解决切换列表的时候会有两次相同的ajax请求的bug
      params: {
        pageNumber: 1,
        pageSize: 15,
        entrust:'',
        phone:$stateParams.whetherPhone,
        startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth() + 1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
        endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
      },
      loadMore: async function() {
        try {
          if (moreOrders.moredata === true && moreOrders.alter === false) {
            let params = moreOrders.params;
            let response = await Ajax.sendTo(url + '/order/getList', locals.get('token'), { params })
            console.log(response);
            if (response.data.length === moreOrders.params.pageSize) {
              $scope.allOrders = moreOrders.eachOrder = moreOrders.eachOrder.concat(response.data);

                $scope.allOrders = orderService.addStatusAndType($scope.allOrders,2);

              moreOrders.params.pageNumber += 1;
            } else if ((response.data.length !== 0) && (response.data.length <= moreOrders.params.pageSize)) {
              $scope.allOrders = moreOrders.eachOrder = moreOrders.eachOrder.concat(response.data);
              $scope.allOrders = orderService.addStatusAndType($scope.allOrders,2);
              moreOrders.moredata = false;
              $scope.showLastPic = true;
            } else if (response.data.length === 0) {
              moreOrders.moredata = false;
              $scope.showLastPic = true;
              // alert('已加载全部订单');
            }
            moreOrders.alter = false
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      }
    };

    // moreOrders.loadMore();
    //查询订单
    $scope.searchAllOrders = () => {
        console.info(61656);
      if (dateCheck.whetherInMonth($scope.search.startDate,179)) {
        moreOrders.params = {
          pageNumber: 1,
          pageSize: 15,
          phone: $scope.search.phone,
          allBall: '',
          entrust:'',
          customerName: $scope.search.customerName,
          startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
          endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
        };
        $scope.showLastPic = false;
        $scope.allOrders.length = 0;
        moreOrders.eachOrder.length = 0;
        moreOrders.moredata = true;
        moreOrders.loadMore();
        moreOrders.alter = true
      }
    };

    //查看详情
    $scope.showDetail = (index) => {
      $scope.eachOrder = $scope.allOrders[index];
      console.log($scope.eachOrder);
      $scope.checkboxSelected.whether = false;
      let params = { id: $scope.eachOrder.id };
      if ($scope.eachOrder.lotteryType === '竞彩足球') {
        orderService.AjaxGetFootballOrderDetail(params).then(function(oFootballOrders) {
          console.log(oFootballOrders)
          if (oFootballOrders) {
            $scope.oFootballOrders = oFootballOrders;
            $scope.orderInfo = $scope.eachOrder
            $scope.footballModal.show()
          }
        })
      } else if ($scope.eachOrder.lotteryType === '超级大乐透' && ($scope.eachOrder.status === 1 || $scope.eachOrder.status === 2 || $scope.eachOrder.status === 3)) {
        $scope.modalOrderDetail.show();
      } else if ($scope.eachOrder.lotteryType === '超级大乐透' && $scope.eachOrder.status === 4) {
        $scope.orderInfo = $scope.eachOrder
        $scope.modalSendDetailModal.show();
      }
    };

    $scope.showFootballOutputDetail = () => {
      if ($scope.eachOrder.status === 4) {
        $scope.footballModal.hide();
        $scope.modalSendDetailModal.show();
      } else if (($scope.eachOrder.status === 1 || $scope.eachOrder.status === 2 || $scope.eachOrder.status === 3)) {
        $scope.footballModal.hide();
        $scope.modalOrderDetail.show();
      }
    }

    /**
     * 筛选订单状态
     * @param  {string} eachStatus 订单状态
     * @return {[type]}            [description]
     */
    $scope.filterStatus = (eachStatus) => {
      $scope.showLastPic = false;
      switch (eachStatus) {
        case '委托':
          filterStatusUpdate('', '', 1);
          break;
        case '待出票':
          filterStatusUpdate(1);
          break;
        case '已出票':
          filterStatusUpdate(2);
          break;
        case '待派奖':
          filterStatusUpdate(4, 0);
          break;
        case '已派奖':
          filterStatusUpdate(4, 1);
          break;
        case '未中奖':
          filterStatusUpdate(3);
          break;
      }
    };
    $scope.filterLotteryID = (eachLotteryID) => {
      $scope.showLastPic = false;
      console.log(eachLotteryID);
      switch (eachLotteryID) {
        case '超级大乐透':
          filterLotteryUpdate('2');
          break;
        case '竞彩足球':
          filterLotteryUpdate('', 0);
          break;
      }
    };

    /**
     * 筛选订单状态
     * @param  {number}  status   状态
     * @param  {number} isReturn 返奖
     * @return {[type]}           [description]
     */
    let filterStatusUpdate = (status, isReturn, entrust = 0) => {
      console.log(status, isReturn, entrust);
      if (status !== moreOrders.params.status || isReturn !== moreOrders.params.isReturn) {
        $scope.allOrders.length = 0;
        moreOrders.eachOrder.length = 0;
        moreOrders.params.status = status;
        moreOrders.params.pageNumber = 1;
        moreOrders.params.isReturn = isReturn;
        moreOrders.params.entrust = entrust;
        moreOrders.moredata = true;
        moreOrders.loadMore();
        moreOrders.alter = true
      }
    };
    /**
     * 筛选彩种
     * @param  {string} ID 彩种
     * @return {[type]}    [description]
     */
    let filterLotteryUpdate = (ID, allBall) => {
      $scope.allOrders.length = 0;
      moreOrders.eachOrder.length = 0;
      moreOrders.params.lotteryID = ID;
      moreOrders.params.allBall = allBall;
      moreOrders.params.pageNumber = 1;
      moreOrders.moredata = true;
      moreOrders.loadMore();
      moreOrders.alter = true
    };

    //检测是否3个月内
    $scope.whetherInMonth = () => {
      dateCheck.whetherInMonth($scope.search.startDate,179)
    }

    //查看凭证
    $scope.checkUploadImg = (which) => {
      $scope.checkboxSelected.whether = !$scope.checkboxSelected.whether;
      if ($scope.checkboxSelected.whether === true && $scope.eachOrder[which]) {
        $scope.imageList.length = 0;
        for (let oneUrl of $scope.eachOrder[which].split(',')) {
          PicMethods.downloadFile(oneUrl, 'downloadOrderImgSucceed');
        }
      }
    }
    //download成功,查看上传的图片
    $scope.$on('downloadOrderImgSucceed', function(event, src) {
      $scope.imageList.push(src);
    });

    //大图
    $scope.showLargeUploadImg = (imgSrc) => {
      $scope.uploadImgSrc = imgSrc;
      $scope.modalAllOrder.show(); //modal框的形式展现
    };


    //查看详情的mordal窗口配置
    $scope.showOrderDetail = () => {
      $scope.modalOrderDetail.show();
    };

    $ionicModal.fromTemplateUrl('orders/template/orderDetailModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalOrderDetail = modal;
    });


    //竟足出票详情1的mordal窗口配置
    $ionicModal.fromTemplateUrl('orders/template/footballModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.footballModal = modal;
    });

    //查看派奖详情的mordal窗口配置
    $ionicModal.fromTemplateUrl('orders/template/orderDetailSendModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalSendDetailModal = modal;
    });

    //点击显示upload大图的mordal窗口配置
    $ionicModal.fromTemplateUrl('./common/template/largeImgModal.html', {
      scope: $scope,
      backdropClickToClose: true
    }).then(function(modal) {
      $scope.modalAllOrder = modal;
    });


  }]);
