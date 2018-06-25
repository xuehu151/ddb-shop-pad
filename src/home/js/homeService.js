angular.module('home.services', [])
  .factory('homeShopSetsService', ['Ajax', 'locals', '$rootScope','$cordovaToast', function(Ajax, locals, $rootScope,$cordovaToast) {
    return {
      async AjaxUpdateShopInformation(params, which) {
        try {
          let response = await Ajax.sendTo(url + '/ownSetUp/updateShopInformation', locals.get('token'), { params })
          console.log(response);
          $rootScope.$broadcast('homeOperationsSuc', which)
          return response;
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
      async getPublicNote() {
        try {
          let params = {
            pageNumber: 1,
            pageSize: 4
          }
          let response = await Ajax.sendTo(url + '/home/notice',locals.get('token'), { params });
          console.log(response);
          return response;
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
    };
  }])
