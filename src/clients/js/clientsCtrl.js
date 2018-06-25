//兑换
angular.module('starter.clientsCtrl', [])

  .controller('clientsCtrl', ['$scope', '$rootScope', 'locals', 'Ajax', '$ionicModal', 'clientService', '$state', '$stateParams', /*'clientDetailService',*/ 'dateCheck', '$cordovaToast', function($scope, $rootScope, locals, Ajax, $ionicModal, clientService, $state, $stateParams /*,clientDetailService*/ , dateCheck, $cordovaToast) {
    //初始化,默认彩民管理
    $rootScope.nowModule = { index: 3 };
    $scope.isBetClients = $stateParams.fromHome === 'fromHome' ? false : true;
    $scope.oView = clientService.featureChoose($stateParams.fromHome === 'fromHome' ? 'assist' : 'betters');
    $scope.operations = { editdRemarkName: '', password: '' }; //修改备注名,冻结,解冻
    $scope.allClients = []; //保存列表数据
    $scope.allRights = clientService.rights; //所有权限
    $scope.oCreateRole = { account: '', phone: void 0, loginPassword: '', payPassword: '' }; //创建角色
    $scope.showLastPic = false; //显示没有更多的图片
    let now = new Date();
    const [userRights, userInfo] = [locals.getObject('userRights'), locals.getObject('userInfo')];
    $scope.search = {
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 179),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1),
      name: '',
      customerName: null,
    };
    $scope.arrow = [true, true, true, true];
    /**
     * [全部clients分页]
     * @type {[type]}
     */
    const moreClients = $scope.moreClients = {
      moredata: true, //是否还有待显示数据
      eachOrder: [], //每次请求返回数据
      alter: false, //用于解决切换列表的时候会有两次相同的ajax请求的bug
      params: {
        pageNumber: 1,
        pageSize: 15,
        type: $stateParams.fromHome === 'fromHome' ? 2 : 3,
        startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
        endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
      },
      loadMore: async function() {
        try {
          if (moreClients.moredata === true && moreClients.alter === false) {
            // if (moreClients.moredata === true) {
            let params = moreClients.params;
            let response = await Ajax.sendTo(url + '/client/managerList', locals.get('token'), { params })
            console.log(response);
            if (response.data.length === moreClients.params.pageSize) {
              $scope.allClients = moreClients.eachOrder = moreClients.eachOrder.concat(response.data);
              if (!$scope.isBetClients) {
                for (let eachClient of $scope.allClients) {
                  clientService.addChineseRights(eachClient);
                }
                console.log($scope.allClients);
              }
              moreClients.params.pageNumber += 1;
            } else if ((response.data.length !== 0) && (response.data.length <= moreClients.params.pageSize)) {
              $scope.allClients = moreClients.eachOrder = moreClients.eachOrder.concat(response.data);
              if (!$scope.isBetClients) {
                for (let eachClient of $scope.allClients) {
                  clientService.addChineseRights(eachClient);
                }
                console.log($scope.allClients);
              }
              $scope.showLastPic = true;
              moreClients.moredata = false;
            } else if (response.data.length === 0) {
              $scope.showLastPic = true;
              moreClients.moredata = false;
            }
            moreClients.alter = false
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }

        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      }
    };
    //切换彩民管理和角色管理
    $scope.chooseOne = (which) => {
      if (userInfo.type !== 1 && which === 'assist') {
        $cordovaToast.showShortCenter('只有店主有角色管理的权限');
        return;
      }
      $scope.allClients.length = 0;
      $scope.search.name = '';
      moreClients.params.name = '';
      moreClients.moredata = true;
      moreClients.params.pageNumber = 1;
      if (which === 'betters') {
        $scope.isBetClients = true;
        moreClients.params.type = 3;
        $scope.oView = clientService.featureChoose('betters');
      } else {
        $scope.isBetClients = false;
        moreClients.params.type = 2;
        $scope.oView = clientService.featureChoose('assist');
      }
      moreClients.loadMore();
      moreClients.alter = true;
    }

    //查询订单
    $scope.searchClients = () => {
      if (dateCheck.whetherInMonth($scope.search.startDate, 179)) {
        moreClients.params = {
          pageNumber: 1,
          pageSize: 15,
          type: moreClients.params.type,
          name: $scope.search.name,
          startDate: `${$scope.search.startDate.getFullYear()}-${$scope.search.startDate.getMonth()+1}-${$scope.search.startDate.getDate()} ${$scope.search.startDate.getHours()}:${$scope.search.startDate.getMinutes()}`,
          endDate: `${$scope.search.endDate.getFullYear()}-${$scope.search.endDate.getMonth()+1}-${$scope.search.endDate.getDate()} ${$scope.search.endDate.getHours()}:${$scope.search.endDate.getMinutes()}`,
        };
        $scope.showLastPic = false;
        $scope.allClients.length = 0;
        moreClients.moredata = true;
        moreClients.loadMore();
        moreClients.alter = true
      }
    };
    //修改备注名modal出现
    $scope.editName = (index) => {
      $scope.operations.editdRemarkName = '';
      $scope.thisClient = $scope.allClients[index];
      console.log($scope.thisClient);
      $scope.editNameModal.show();
    };
    //确认修改备注名
    $scope.submitEditName = () => {
      clientService.AjaxEditName($scope.thisClient.customer.id, $scope.operations.editdRemarkName)
    }
    //修改备注成功
    $scope.$on('editNameSuc', function(event, remark) {
      $scope.editNameModal.hide();
      $scope.thisClient.customer.remark = remark;
    });
    //冻结用户modal弹出
    $scope.frozeClient = (index) => {
      if (userRights.buyerAccountStopUse.check === false) {
        $cordovaToast.showShortCenter('您没有冻结和删除账号的权限');
        return;
      }
      $scope.operations.password = '';
      $scope.thisClient = $scope.allClients[index];
      $scope.thisClient.index = index;
      console.log($scope.thisClient);
      $scope.frozenClientModal.show();
    }
    //确认冻结用户
    $scope.confirmFrozenClient = () => {
      if ($scope.operations.password === '') {
        $cordovaToast.showShortCenter('请输入密码')
      } else {
        clientService.AjaxFrozeClient($scope.thisClient.customer.id, $scope.operations.password);
      }
    }
    //冻结成功
    $scope.$on('frozeClientSuc', function(event) {
      $scope.frozenClientModal.hide();
      if ($scope.isBetClients === true) {
        $scope.thisClient.customer.delFlag = '1';
      } else {
        $scope.allClients.splice($scope.thisClient.index, 1);
      }

    });
    //解除冻结modal弹出
    $scope.cancelFrozen = (index) => {
      $scope.operations.password = '';
      $scope.thisClient = $scope.allClients[index];
      $scope.cancelFrozenClientModal.show();
    }
    //确认解除冻结
    $scope.confirmCancelFrozen = () => {
      if ($scope.operations.password === '') {
        $cordovaToast.showShortCenter('请输入密码')
      } else {
        clientService.AjaxFrozeClient($scope.thisClient.customer.id, $scope.operations.password, { str: 'cancel' });
      }
    }
    //解除冻结成功
    $scope.$on('cancelFrozeClientSuc', function() {
      $scope.cancelFrozenClientModal.hide();
      $scope.thisClient.customer.delFlag = '0';
    });
    //创建角色modal弹出
    $scope.openCreateAssist = () => {
      $scope.oCreateRole.account = '';
      $scope.oCreateRole.phone = '';
      $scope.oCreateRole.loginPassword = '';
      $scope.oCreateRole.payPassword = '';
      for (let right of $scope.allRights) {
        right.check = false;
      }
      console.log($scope.allRights);
      $scope.createAssistModal.show();
    }

    //确认创建角色
    $scope.submitCreateAssist = () => {
      console.log($scope.allRights);
      let newRightsNums = clientService.getUploadRightNum($scope.allRights);
      let params = {
        account: $scope.oCreateRole.account,
        phone: $scope.oCreateRole.phone,
        passWord: $scope.oCreateRole.loginPassword,
        payPassWord: $scope.oCreateRole.payPassword,
        resource: newRightsNums.join(','),
      }
      clientService.AjaxCreateAssist(params);
    };
    //创建角色成功
    $scope.$on('createRoleSuc', function() {
      $cordovaToast.showShortCenter('创建角色成功');
      /*$scope.allClients.push({
        customer:{
          account: $scope.oCreateRole.account,
          phone: $scope.oCreateRole.phone,
          remark:'init',
        },
        roles:$scope.allRights,
      })*/
      $scope.createAssistModal.hide();
      $scope.allClients.length = 0;
      $scope.search.name = '';
      moreClients.params.name = '';
      moreClients.moredata = true;
      moreClients.params.pageNumber = 1;
    });
    //转到明细
    $scope.gotoDetail = (index) => {
      /*console.log($scope.allClients[index].customer.account);
      clientDetailService.choosedDetailAccount = $scope.allClients[index].customer.account;//查询的明细账户
      console.log(clientDetailService.choosedDetailAccount)
      $state.go('modules.clientsDetail', { id: $scope.allClients[index].customer.id});*/
      locals.set('whetherFromClientToAllOrder', 'true');
      $state.go('modules.orders.allOrders', { whetherPhone: $scope.allClients[index].customer.phone });
    }
    //打开权限管理
    $scope.doManageRight = (index) => {
      $scope.thisClient = $scope.allClients[index];
      console.log($scope.thisClient)
      $scope.rightsManageModal.show();
    }
    //确定权限修改
    $scope.saveManageRight = () => {
      console.log($scope.thisClient)
      let newRightsNums = clientService.getUploadRightNum($scope.thisClient.rightsArr);
      clientService.AjaxSaveManageRight({ id: $scope.thisClient.customer.id, resource: newRightsNums.join(',') });
    }
    //权限修改成功
    $scope.$on('editRightsSuc', function() {
      $cordovaToast.showShortCenter('修改权限成功');
      $scope.rightsManageModal.hide();
    });

    //检测是否3个月内
    $scope.whetherInMonth = () => {
      dateCheck.whetherInMonth($scope.search.startDate, 179)
    }

    //修改备注名modal配置
    $ionicModal.fromTemplateUrl('editNameModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.editNameModal = modal;
    });
    //冻结用户modal配置
    $ionicModal.fromTemplateUrl('frozenClientModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.frozenClientModal = modal;
    });
    //解除冻结用户modal配置
    $ionicModal.fromTemplateUrl('cancelFrozenClientModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.cancelFrozenClientModal = modal;
    });
    //权限管理modal配置
    $ionicModal.fromTemplateUrl('rightsManageModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.rightsManageModal = modal;
    });
    //创建角色modal配置
    $ionicModal.fromTemplateUrl('createAssistModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.createAssistModal = modal;
    });

  }]);
