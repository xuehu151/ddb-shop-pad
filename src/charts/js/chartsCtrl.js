//兑换
angular.module('starter.chartsCtrl', [])

  .controller('chartsCtrl', ['$scope', '$rootScope', '$state', 'dateCheck', function($scope, $rootScope, $state,dateCheck) {
    $rootScope.nowModule = { index: 4 };
    $scope.iSelectTab = 'Time';
    $scope.iHistroryTab = 0;
    let now = new Date();
    $scope.search = {
      startDate: new Date(now.getFullYear(), now.getMonth(), '01'),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1),
    };

    $scope.changeTab = (tab) => {
      $scope.iSelectTab = tab;
      if (tab === 'History') {
        $scope.iHistroryTab = 0;
      }
      $state.go(`modules.charts.${tab}`);
      let nowTime = new Date();
      $scope.search = {
        startDate: new Date(nowTime.getFullYear(), now.getMonth(), '01'),
        endDate: new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate(), nowTime.getHours() + 1),
      };
    };
    $scope.changeHistoryTab = (historyTab) => {
      $scope.iHistroryTab = historyTab;
      $scope.$broadcast('changeHistoryTab', historyTab);
    };

    $scope.searchDatas = () => {
      if (dateCheck.whetherInMonth($scope.search.startDate,179)) {
        let searchDate = {
          startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
          endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
        };
        console.log(searchDate);
        $scope.$broadcast(`search${$scope.iSelectTab}Data`, searchDate);
      }
    };

    //检测是否3个月内
    $scope.whetherInMonth = () => {
      dateCheck.whetherInMonth($scope.search.startDate,179);
    };
  }]);
