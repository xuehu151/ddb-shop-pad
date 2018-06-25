//兑换
angular.module('starter.chartsHistoryCtrl', [])

  .controller('chartsHistoryCtrl', ['$scope', 'Ajax', 'locals', 'chartsService', 'dateCheck', '$cordovaToast', function($scope, Ajax, locals, chartsService, dateCheck, $cordovaToast) {
    let now = new Date();
    $scope.allBonusData = [];
    $scope.showLastPic = false; //显示没有更多的图片
    let searchDate = {
      startDate: `${now.getFullYear()}-${now.getMonth()+1}-01`,
      endDate: `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`,
    };

    chartsService.AjaxGetTotalHistory(searchDate).then(
      function(response) {
        console.log(response)
        if (response) {
          $scope.totalHistoryData = response.data;
        }
      })

    //已取消历史余额报表
    /*$scope.$on('changeHistoryTab', function(event, historyTab) {
      $scope.iHistroryTab = historyTab;
      if (historyTab === 1) {
        chartsService.AjaxGetTotalHistory(searchDate).then(
          function (response) {
            console.log(response)
            if (response) {
              $scope.totalHistoryData = response.data;
            }
          })
      }
    });*/

    /**
     * [全部clients分页]
     * @type {[type]}
     */
    const moreBonusData = $scope.moreBonusData = {
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
          if (moreBonusData.moredata === true && moreBonusData.alter === false) {
            let params = moreBonusData.params;
            let response = await Ajax.sendTo(url + '/home/historyBouns', locals.get('token'), { params })
            console.log(response);
            if (response.data.length === moreBonusData.params.pageSize) {
              $scope.allBonusData = moreBonusData.eachOrder = moreBonusData.eachOrder.concat(response.data);
              moreBonusData.params.pageNumber += 1;
            } else if ((response.data.length !== 0) && (response.data.length <= moreBonusData.params.pageSize)) {
              $scope.allBonusData = moreBonusData.eachOrder = moreBonusData.eachOrder.concat(response.data);
              $scope.showLastPic = true;
              moreBonusData.moredata = false;
            } else if (response.data.length === 0) {
              $scope.showLastPic = true;
              moreBonusData.moredata = false;
            }
            moreBonusData.alter = false
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      }
    };
    $scope.$on('searchHistoryData', function(event, searchDate) {
      /*if ($scope.iHistroryTab === 1) {
        chartsService.AjaxGetTotalHistory(searchDate).then(
          function (response) {
            console.log(response)
            if (response) {
              $scope.totalHistoryData = response.data;
            }
          })
      }*/
      $scope.showLastPic = false;
      chartsService.AjaxGetTotalHistory(searchDate).then(
        function(response) {
          console.log(response)
          if (response) {
            $scope.totalHistoryData = response.data;
          }
        })

      moreBonusData.moredata = true;
      moreBonusData.params.pageNumber = 1;
      $scope.allBonusData.length = 0;
      moreBonusData.params.startDate = searchDate.startDate;
      moreBonusData.params.endDate = searchDate.endDate;
      moreBonusData.loadMore();
      moreBonusData.alter = true;
    });
  }]);
