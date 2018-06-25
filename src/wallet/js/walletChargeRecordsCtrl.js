//兑换
angular.module('starter.walletChargeRecords', [])

  .controller('walletChargeRecordsCtrl', ['$scope', 'locals', 'Ajax', '$ionicPopover', 'walletRecordsService', 'dateCheck', '$cordovaToast', function($scope, locals, Ajax, $ionicPopover, walletRecordsService, dateCheck, $cordovaToast) {
    $scope.oView = walletRecordsService.featureChoose();
    $scope.whetherShowStatusChoose = false;
    $scope.showLastPic = false; //显示没有更多的图片
    $scope.allChargesSucOrder = [];
    let now = new Date();
    $scope.search = {
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 179),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      ticketID: null,
      customerName: null,
      phone: '',
    };
    /**
     * [充值记录分页]
     * @type {[type]}
     */
    const moreChargeSuc = $scope.moreChargeSuc = {
      moredata: true, //是否还有待显示数据
      eachCharge: [], //每次请求返回数据
      alter: false, //用于解决切换列表的时候会有两次相同的ajax请求的bug
      params: {
        type: $scope.oView.type,
        status: 2,
        pageNumber: 1,
        pageSize: 15,
        phone: $scope.search.phone,
        customerName: $scope.search.customerName,
        startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
        endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
      },
      loadMore: async function() {
        try {
          if (moreChargeSuc.moredata === true && moreChargeSuc.alter === false) {
            let params = moreChargeSuc.params;
            let response = await Ajax.sendTo(url + '/bill/getList', locals.get('token'), { params });
            console.log(response);
            if (response.data.length === moreChargeSuc.params.pageSize) {
              walletRecordsService.addStatusWord(response.data);
              $scope.allChargesSucOrder = moreChargeSuc.eachCharge = moreChargeSuc.eachCharge.concat(response.data);
              moreChargeSuc.params.pageNumber += 1;
            } else if ((response.data.length !== 0) && (response.data.length <= moreChargeSuc.params.pageSize)) {
              walletRecordsService.addStatusWord(response.data);
              $scope.allChargesSucOrder = moreChargeSuc.eachCharge = moreChargeSuc.eachCharge.concat(response.data);
              moreChargeSuc.params.pageNumber += 1;
              $scope.showLastPic = true;
              moreChargeSuc.moredata = false;
            } else if (response.data.length === 0) {
              $scope.showLastPic = true;
              moreChargeSuc.moredata = false;
              // alert($scope.oView.alertText);
            }
            moreChargeSuc.alter = false
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }

        } catch (error) { error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error); }
      }
    };

    $scope.filterStatus = (index) => {
      console.log(index);
      switch (index) {
        case 0:
          moreChargeSuc.params.status = 1;
          break;
        case 1:
          moreChargeSuc.params.status = -1;
          break;
      }
      $scope.whetherShowStatusChoose = false;
      $scope.choosedStatus = $scope.oView.allStatus[index];
    };

    $scope.searchallChargeSuc = () => {
      /*moreChargeSuc.params = {
        type:1;
        status:1;
        pageNumber: 1,
        pageSize: 20,
        phone: $scope.search.phone,
        customerName: $scope.search.customerName,
        startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
        endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
      };*/
      if (dateCheck.whetherInMonth($scope.search.startDate, 179)) {
        $scope.showLastPic = false;
        $scope.allChargesSucOrder.length = 0;
        moreChargeSuc.eachCharge.length = 0;
        moreChargeSuc.moredata = true;
        moreChargeSuc.params.phone = $scope.search.phone;
        moreChargeSuc.params.customerName = $scope.search.customerName;
        moreChargeSuc.params.startDate = `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`;
        moreChargeSuc.params.endDate = `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`;
        moreChargeSuc.params.pageNumber = 1;
        moreChargeSuc.loadMore();
        moreChargeSuc.alter = true
      }
    };

    //检测是否3个月内
    $scope.whetherInMonth = () => {
      dateCheck.whetherInMonth($scope.search.startDate, 179)
    }
  }]);
