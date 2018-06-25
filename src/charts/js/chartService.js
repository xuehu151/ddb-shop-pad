angular.module('charts.services', [])
  .factory('chartsService', ['Ajax', 'locals', '$rootScope','$cordovaToast', function(Ajax, locals, $rootScope,$cordovaToast) {
    return {
      async AjaxGetTimeDatas(params) {
        try {
          let response = await Ajax.sendTo(url + '/home/timeIntervalStatistics', locals.get('token'),{params})
          console.log(response);
          return response;
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
      async AjaxGetTotalHistory (params) {
        try {
          let response = await Ajax.sendTo(url + '/home/historyBounsTotal', locals.get('token'),{params});
          console.log(response);
          return response;
        }
        catch(error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
    };
  }])
