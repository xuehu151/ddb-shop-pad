//兑换
angular.module('starter.chartsTwoCtrl', ['charts.services'])

  .controller('chartsTimeCtrl', ['chartsService', '$scope','$cordovaToast', function(chartsService, $scope,$cordovaToast) {
    let now = new Date();
    let searchDate = {
      startDate: `${now.getFullYear()}-${now.getMonth()+1}-01`,
      endDate: `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`,
    };

    chartsService.AjaxGetTimeDatas(searchDate).then(function(response) {
      console.log(response);
      if (response) {
        $scope.$apply(function () {
          $scope.timeDatas = response.data;
        })
      }
    });

    $scope.$on('searchTimeData', function(event, searchDate) {
      chartsService.AjaxGetTimeDatas(searchDate).then(function(response) {
        console.log(response);
        if (response) {
          $scope.$apply(function () {
            $scope.timeDatas = response.data;
          })
        }
      });
    });
  }])
  .controller('chartsClientsCtrl', ['chartsService','$rootScope', '$scope','locals','Ajax', function(chartsService, $rootScope, $scope,locals,Ajax) {
    $scope.allClientsData = [];
    $scope.showLastPic = false;   //显示没有更多的图片
    let now = new Date();
    let searchDate = {
      startDate: `${now.getFullYear()}-${now.getMonth()+1}-01`,
      endDate: `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`,
    };
    /**
     * [全部clients分页]
     * @type {[type]}
     */
    let moreClientsData = $scope.moreClientsData = {
      moredata: true, //是否还有待显示数据
      eachOrder: [], //每次请求返回数据
      alter: false, //用于解决切换列表的时候会有两次相同的ajax请求的bug
      params: {
        pageNumber: 1,
        pageSize: 15,
        startDate: searchDate.startDate,
        endDate: searchDate.endDate,
      },
      loadMore: async function() {
        try {
          if (moreClientsData.moredata === true && moreClientsData.alter === false) {
            let params = moreClientsData.params;
            let response = await Ajax.sendTo(url + '/home/customerStatistics', locals.get('token'), { params })
            console.log(response);
            if (response.data.length === moreClientsData.params.pageSize) {
              $scope.allClientsData = moreClientsData.eachOrder = moreClientsData.eachOrder.concat(response.data);
              moreClientsData.params.pageNumber += 1;
            } else if ((response.data.length !== 0) && (response.data.length <= moreClientsData.params.pageSize)) {
              $scope.allClientsData = moreClientsData.eachOrder = moreClientsData.eachOrder.concat(response.data);
              $scope.showLastPic = true;
              moreClientsData.moredata = false;
            } else if (response.data.length === 0) {
              $scope.showLastPic = true;
              moreClientsData.moredata = false;
            }
            moreClientsData.alter = false
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      }
    };

    $scope.$on('searchClientsData', function(event, searchDate) {
      $scope.showLastPic = false;
      moreClientsData.moredata = true;
      moreClientsData.params.pageNumber = 1;
      $scope.allClientsData.length = 0;
      moreClientsData.params.startDate = searchDate.startDate;
      moreClientsData.params.endDate = searchDate.endDate;
      moreClientsData.loadMore();
      moreClientsData.alter = true;
    });
  }]);
