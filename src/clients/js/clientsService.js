angular.module('client.services', [])
  .factory('walletIndexService', [function() {
    return {
      feature: 'charge'
    };
  }])
  .factory('clientService', ['Ajax', 'locals', '$rootScope','$cordovaToast', function(Ajax, locals, $rootScope,$cordovaToast) {
    let [bettersView, assistView] = [{
        h1: '冻结账户',
        text1: '冻结',
        text2: '立即冻结',
        text3: '*彩民账户冻结后，用户将无法向彩店提交订单,直到彩店解除冻结。',
        text4:'最近下单',
        text5:'店内余额',
      },
      {
        h1: '删除角色',
        text1: '删除',
        text2: '立即删除',
        text3: '*销售员角色删除后，将无法恢复，请慎重删除；',
        text4:'店内充值',
        text5:'店内提现',
      }
    ];
    return {
      featureChoose(feature) {
        if (feature === 'betters') {
          return bettersView;
        } else if (feature === 'assist') {
          return assistView;
        }
      },
      async AjaxEditName(userId, remark) {
        try {
          let params = { userId, remark }
          let response = await Ajax.sendTo(url + '/client/updateRemark', locals.get('token'), { params })
          console.log(response)
          $rootScope.$broadcast('editNameSuc', remark);
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
      async AjaxFrozeClient(userId, payPassword, { str} = {}) {
        try {
          let params = { userId, payPassword, str }
          let response = await Ajax.sendTo(url + '/client/operationCustomer', locals.get('token'), { params })

          //str存在则是解冻,不存在则是冻结
          if (!str) {
            $rootScope.$broadcast('frozeClientSuc');
          } else {
            $rootScope.$broadcast('cancelFrozeClientSuc');
          }
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
      async AjaxCreateAssist(params) {
        try {
          let response = await Ajax.sendTo(url + '/client/createRole', locals.get('token'), { params })
          $rootScope.$broadcast('createRoleSuc');
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
      async AjaxSaveManageRight(params) {
        try {
          let response = await Ajax.sendTo(url + '/client/updateResource', locals.get('token'), { params })
          $rootScope.$broadcast('editRightsSuc');
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
      getUploadRightNum(obj) {
        //筛选选择的权限
        let newRights = obj.filter(function(right) {
          return right.check === true;
        })
        //获取权限对应的代号
        let newRightsNums = Array.from(newRights, (right) => {
          return right.rightNum;
        });
        return newRightsNums;
      },

      addChineseRights(obj) {
        let rightsArr = [];
        for (let right of Object.values(obj.roles)) {
          switch (right.rightNum)
          {
          case '9':
            right.name = '充值';
            break;
          case '10':
            right.name = '提现';
            break;
          case '11':
            right.name = '充值审核';
            break;
          case '12':
            right.name = '提现审核';
            break;
          case '13':
            right.name = '红包派发';
            break;
          /*case '14':
            right.name = '上传凭证';
            break;*/
          case '15':
            right.name = '彩民账号停用';
            break;
          /*case '16':
            right.name = '语音配置';
            break;*/
          case '17':
            right.name = '出票';
            break;
          case '18':
            right.name = '委托';
            break;
          case '19':
            right.name = '派奖';
            break;
          }
          rightsArr.push(right);
        }
        obj.rightsArr = rightsArr;
        return obj;
      },
      broadcastToAllOrder(){
        $rootScope.$broadcast('fromClientToAllOrder')
      },
      whichFeature: {},
      rights: [
        { right: '充值', check: false,rightNum:9 },
        { right: '提现', check: false,rightNum:10 },
        { right: '充值审核', check: false,rightNum:11 },
        { right: '提现审核', check: false,rightNum:12 },
        { right: '红包派发', check: false,rightNum:13 },
        // { right: '上传凭证', check: false,rightNum:14 },
        { right: '彩民账号停用', check: false,rightNum:15 },
        // { right: '语音配置', check: false,rightNum:16 },
        { right: '出票', check: false,rightNum:17 },
        { right: '委托', check: false,rightNum:18 },
        { right: '派奖', check: false,rightNum:19 },
      ],
    };
  }])
//已经取消余额明细模块
  /*.factory('clientDetailService', ['Ajax','locals','clientService','$cordovaToast', function(Ajax,locals,clientService,$cordovaToast) {
    let [bettersView, assistView] = [{
        allStatus: ['出票成功', '等待出票', '出票失败'],
        text1: '冻结',
        text2: '立即冻结',
        text3: '*彩民账户冻结后，用户将无法向彩店提交订单,直到彩店解除冻结。',
      },
      {
        allStatus: ['账户充值', '账户提现', '出票成功', '出票失败'],
        text1: '删除',
        text2: '立即删除',
        text3: '*销售员角色删除后，将无法恢复，请慎重删除；',
      }
    ];
    return {
      choosedDetailAccount :'',
      featureChoose(feature) {
        if (feature === 'orders') {
          return bettersView;
        } else if (feature === 'account') {
          return assistView;
        }
      },
      addChineseStatus(obj){
        if (obj.status === -1) {
          obj.chineseStatus= '出票失败';
        }
        else if (obj.status === 1) {
          obj.chineseStatus= '等待出票';
        }
        else if (obj.status <=4 && obj.status>=2) {
          obj.chineseStatus= '出票成功';
        }
      },
      addChineseStatus2(obj){
        if (obj.type === 1) {
          obj.chineseType= '账户充值';
        }
        else if (obj.type === 2) {
          obj.chineseType= '账户提现';
        }
        else if (obj.type ===3) {
          obj.chineseType= '出票成功';
        }
        else if (obj.type ===4) {
          obj.chineseType= '出票失败';
        }
      },
      async getAllTotalAmount(params) {
        try {
          console.log(params);
          let response = await Ajax.sendTo(url + '/client/successOutTicketAndBonus', locals.get('token'), { params })
          console.log(response)
          return response
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
      findPersonDetail() {

      },
      whichFeature: {},
    };
  }])*/
