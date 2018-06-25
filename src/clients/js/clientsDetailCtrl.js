//兑换
angular.module('starter.clientsDetailCtrl', [])
  .controller('clientsDetailCtrl', ['$scope', '$rootScope', 'locals', 'Ajax', '$ionicModal', 'clientService', '$stateParams', 'clientDetailService', '$ionicScrollDelegate','dateCheck','$cordovaToast', function($scope, $rootScope, locals, Ajax, $ionicModal, clientService, $stateParams, clientDetailService, $ionicScrollDelegate,dateCheck,$cordovaToast) {
    $scope.whetherOrders = true; //初始化为下单明细
    $scope.allStatus = clientDetailService.featureChoose('orders').allStatus;
    $scope.allClientsDetail = [];
    $scope.allBalanceDetail = [];
    let now = new Date();
    let [nowStartdateStr, nowEnddateStr] = [
      `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`,
      `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`,
    ];
    $scope.search = {
      // startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20),
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()-179),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1),
    };

    clientDetailService.getAllTotalAmount({ customerId: $stateParams.id * 1 }).then((response) => {
      $scope.allTotalAmount = response.data
    })

    $scope.choosedPerson = clientDetailService.choosedDetailAccount  //查询的账户

    /**
     * [全部下单明细分页]
     * @type {[type]}
     */
    const moreClientsDetail = $scope.moreClientsDetail = {
      moredata: true, //是否还有待显示数据
      eachOrder: [], //每次请求返回数据
      alter: false, //用于解决切换列表的时候会有两次相同的ajax请求的bug
      params: {
        pageNumber: 1,
        pageSize: 15,
        customerId: $stateParams.id * 1,
        startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
        endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
        status: void 0,
      },
      loadMore: async function() {
        try {
          if (moreClientsDetail.moredata === true && moreClientsDetail.alter === false) {
            let params = moreClientsDetail.params;
            let response = await Ajax.sendTo(url + '/client/buyerOrderDetails', locals.get('token'), { params })
            console.log(response);
            for (let each of response.data) {
              clientDetailService.addChineseStatus(each)
            }
            if (response.data.length === moreClientsDetail.params.pageSize) {
              $scope.allClientsDetail = moreClientsDetail.eachOrder = moreClientsDetail.eachOrder.concat(response.data);
              moreClientsDetail.params.pageNumber += 1;
            } else if ((response.data.length !== 0) && (response.data.length <= moreClientsDetail.params.pageSize)) {
              $scope.allClientsDetail = moreClientsDetail.eachOrder = moreClientsDetail.eachOrder.concat(response.data);
              moreClientsDetail.moredata = false;
            } else if (response.data.length === 0) {
              moreClientsDetail.moredata = false;
              // $cordovaToast.showShortCenter('已加载全部订单');
            }
            moreClientsDetail.alter = false
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      }
    };

    const moreBalanceDetail = $scope.moreBalanceDetail = {
      moredata: true, //是否还有待显示数据
      eachOrder: [], //每次请求返回数据
      alter: false, //用于解决切换列表的时候会有两次相同的ajax请求的bug
      params: {
        pageNumber: 1,
        pageSize: 15,
        customerId: $stateParams.id * 1,
        startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
        endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
        type: void 0,
      },
      loadMore: async function() {
        try {
          if (moreBalanceDetail.moredata === true && moreBalanceDetail.alter === false) {
            let params = moreBalanceDetail.params;
            let response = await Ajax.sendTo(url + '/client/buyerBalanceDetails', locals.get('token'), { params })
            console.log(response);
            for (let each of response.data) {
              clientDetailService.addChineseStatus2(each)
            }
            if (response.data.length === moreBalanceDetail.params.pageSize) {
              $scope.allBalanceDetail = moreBalanceDetail.eachOrder = moreBalanceDetail.eachOrder.concat(response.data);
              moreBalanceDetail.params.pageNumber += 1;
            } else if ((response.data.length !== 0) && (response.data.length <= moreBalanceDetail.params.pageSize)) {
              $scope.allBalanceDetail = moreBalanceDetail.eachOrder = moreBalanceDetail.eachOrder.concat(response.data);
              moreBalanceDetail.moredata = false;
            } else if (response.data.length == 0) {
              moreBalanceDetail.moredata = false;
              // $cordovaToast.showShortCenter('已加载全部订单');
            }

            moreBalanceDetail.alter = false
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }

        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      }
    };


    $scope.chooseOne = (which) => {

      if (which === 'orders') {
        $scope.whetherOrders = true;
        moreClientsDetail.params.status = void 0;
        /*moreClientsDetail.params.startDate = nowStartdateStr;
        moreClientsDetail.params.endDate = nowEnddateStr;*/
        $scope.allStatus = clientDetailService.featureChoose('orders').allStatus;
        resetParams();
      } else {
        $scope.whetherOrders = false;
        moreBalanceDetail.params.type = void 0;
        $scope.allStatus = clientDetailService.featureChoose('account').allStatus;
        resetBalanceParams();
      }
      /*$scope.search = {
        // startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20),
        startDate: new Date(now.getFullYear(), '01', '01'),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1),
      };*/
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();

    };

    $scope.searchDetail = () => {
      if (dateCheck.whetherInMonth($scope.search.startDate,179)) {
        if ($scope.whetherOrders) {
          resetParams();
        } else {
          resetBalanceParams()
        }
      }

    }

    $scope.filterStatus = (status) => {
      let rules = [];
      if ($scope.whetherOrders) {
        rules = [{
            match: (status) => {
              if (status === '出票失败') { return true }
            },
            action: () => {
              moreClientsDetail.params.status = -1;
            }
          },
          {
            match: (status) => {
              if (status === '等待出票') { return true }
            },
            action: () => {
              moreClientsDetail.params.status = 1;
            }
          },
          {
            match: (status) => {
              if (status === '出票成功') { return true }
            },
            action: () => {
              moreClientsDetail.params.status = 2;
            }
          }
        ]
        resetParams();
      } else {
        rules = [{
            match: (status) => {
              if (status === '账户充值') { return true }
            },
            action: () => {
              moreBalanceDetail.params.type = 1;
            }
          },
          {
            match: (status) => {
              if (status === '账户提现') { return true }
            },
            action: () => {
              moreBalanceDetail.params.type = 2;
            }
          },
          {
            match: (status) => {
              if (status === '出票成功') { return true }
            },
            action: () => {
              moreBalanceDetail.params.type = 3;
            }
          },
          {
            match: (status) => {
              if (status === '出票失败') { return true }
            },
            action: () => {
              moreBalanceDetail.params.type = 4;
            }
          }
        ];
        resetBalanceParams();
      }


      function determineWhich(status) {
        for (let rule of rules) {
          if (rule.match(status)) {
            return rule.action(status)
          }
        }
      }
      determineWhich(status)
      /*switch(status)
      {
      case '出票失败':
        moreClientsDetail.params.status = -1;
        break;
      case '等待出票':
        执行代码块 2
        break;
      case '出票成功':
        执行代码块 2
        break;
      }*/

    }

    function resetParams() {
      moreClientsDetail.moredata = true;
      moreClientsDetail.params.pageNumber = 1;
      moreClientsDetail.params.startDate = `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`;
      moreClientsDetail.params.endDate = `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`;
      $scope.allClientsDetail.length = 0
      moreClientsDetail.loadMore();
      moreClientsDetail.alter = true;
    }

    function resetBalanceParams() {
      moreBalanceDetail.moredata = true;
      moreBalanceDetail.params.pageNumber = 1;
      moreBalanceDetail.params.startDate = `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`;
      moreBalanceDetail.params.endDate = `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`;
      $scope.allBalanceDetail.length = 0;
      moreBalanceDetail.loadMore();
      moreBalanceDetail.alter = true;
    }

    //检测是否3个月内
    $scope.whetherInMonth = () => {
      dateCheck.whetherInMonth($scope.search.startDate,179)
    }
  }]);
