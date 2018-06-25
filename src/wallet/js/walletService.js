angular.module('wallet.services', [])
  .factory('walletIndexService', [function() {
    return {
      feature: 'charge'
    };
  }])
  .factory('walletService', ['locals', 'Ajax', function(locals, Ajax) {
    let [chargeView, withdrawView] = [{
        h3: '充值彩友',
        target: '申请充值',
        record: '充值记录',
        launch: '发起充值',
      },
      {
        h3: '提现彩友',
        target: '申请提现',
        record: '提现记录',
        launch: '发起提现',
      }
    ];
    return {
      featureChoose(feature) {
        if (feature === 'charge') {
          return chargeView;
        } else if (feature === 'withdraw') {
          return withdrawView;
        }
      },
      lastChargeDatas: [],
      /**
       * 1.实时更新功能,在收到推送后请求这特定一秒的订单
       * 2.处理这一秒的并发状态,将本次请求的数据与上次请求的数据比较id,没有相同的id则push到订单列表中
       */
      async addPushCharge(params, haveCloseLoading) {
        let response = await Ajax.sendTo(url + '/bill/getList', locals.get('token'), { params, haveCloseLoading });
        //给每个充值申请加上一个状态,判断是否当前点击
        console.log(response);
        response.data[0].nowClick = false; //当前点击的状态
        response.data[0].afterDoneCharge = ''; //加一个是否已经充值的状态

        return response.data[0];
      },
      eachChargeDetail: {},
    };
  }])
  .factory('walletVerifyService', ['walletService', 'walletIndexService', function(walletService, walletIndexService) {
    let [oChargeVerifyView, oWithdrawVerifyView] = [{
        h3: '充值金额审核',
        accept: '充值成功',
        edit: '请重新输入充值金额',
        illustrate: '充值说明',
        text1: '充值金额',
        text2: '拒绝充值的金额',
        alertText1: '充值成功',
        alertText2: '已修改金额并充值成功',
        alertText3: '已拒绝充值',
      },
      {
        h3: '提现金额审核',
        accept: '提现成功',
        edit: '请重新输入提现金额',
        illustrate: '提现说明',
        text1: '提现金额',
        text2: '拒绝提现的金额',
        alertText1: '提现成功',
        alertText2: '已修改金额并提现成功',
        alertText3: '已拒绝提现',
      }
    ];
    let [oArgeeAjax, oEditAjax, oRejectAjax] = [{
      oParams: {
        id: walletService.eachChargeDetail.id,
        status: 1,
        payPassword: ''
      },
      fnDoThingUrl: () => {
        if (walletService.eachChargeDetail.type === 1) {
          return 'rechargeAudit';
        } else if (walletService.eachChargeDetail.type === 2) {
          return 'cashAudit';
        }
      }
    }, {
      oParams: {
        id: walletService.eachChargeDetail.id,
        money: '',
        payPassword: '',
        shopImg: '',
      },
      sDoThingUrl: 'updateMoney'
    }, {
      oParams: {
        id: walletService.eachChargeDetail.id,
        status: -1,
        payPassword: '',
        shopImg: '',
      },
      fnDoThingUrl: () => {
        if (walletService.eachChargeDetail.type === 1) {
          return 'rechargeAudit';
        } else if (walletService.eachChargeDetail.type === 2) {
          return 'cashAudit';
        }
      }
    }];
    return {
      featureChoose() {
        if (walletIndexService.feature === 'charge') {
          return oChargeVerifyView;
        } else if (walletIndexService.feature === 'withdraw') {
          return oWithdrawVerifyView;
        }
      },
      getAjaxParams(which) {
        if (which === 'agree') {
          oArgeeAjax.oParams.id = walletService.eachChargeDetail.id; //要赋新值
          return oArgeeAjax;
        } else if (which === 'edit') {
          oEditAjax.oParams.id = walletService.eachChargeDetail.id;
          return oEditAjax;
        } else if (which === 'reject') {
          oRejectAjax.oParams.id = walletService.eachChargeDetail.id;
          return oRejectAjax;
        }
      }
    };
  }])
  .factory('walletRecordsService', ['walletIndexService', function(walletIndexService) {

    let [chargeView, withdrawView] = [{
        h3: '充值记录',
        th1: '充值金额',
        th2: '充值状态',
        th3: '充值时间',
        type: 1,
        allStatus: ['已充值', '已拒绝'],
        alertText: '已加载全部充值记录',
      },
      {
        h3: '提现记录',
        th1: '提现金额',
        th2: '提现状态',
        th3: '提现时间',
        type: 2,
        allStatus: ['已提现', '已拒绝'],
        alertText: '已加载全部提现记录',
      }
    ];
    return {
      featureChoose() {
        if (walletIndexService.feature === 'charge') {
          return chargeView;
        } else if (walletIndexService.feature === 'withdraw') {
          return withdrawView;
        }
      },
      addStatusWord(obj) {
        if (walletIndexService.feature === 'charge') {
          for (let item of obj) {
            item.statusChinese = item.status === 1 ? '已充值' : '已拒绝充值';
          }
        } else if (walletIndexService.feature === 'withdraw') {
          for (let item of obj) {
            item.statusChinese = item.status === 1 ? '已提现' : '已拒绝提现';
          }
        }
        return obj;
      },
      /*setFeature(type){
        if (type === 'charge') {
          walletIndexService.feature = 'charge';
        } else if (type === 'withdraw') {
          walletIndexService.feature = 'withdraw';
        }
      },*/
    };
  }])
  .factory('walletToCustomerService', ['walletIndexService', function(walletIndexService) {

    let [chargeView, withdrawView] = [{
        h3: '发起充值',
        text1: '充值金额:',
        text2: '充值备注:',
        text3: '确定充值',
        httpUrl: 'recharge',
      },
      {
        h3: '发起提现',
        text1: '提现金额:',
        text2: '提现备注:',
        text3: '确定提现',
        httpUrl: 'cash',
      }
    ];
    return {
      featureChoose() {
        if (walletIndexService.feature === 'charge') {
          return chargeView;
        } else if (walletIndexService.feature === 'withdraw') {
          return withdrawView;
        }
      },
    };
  }])
  .factory('walletToCustomerWaitingService', ['walletIndexService', 'walletToCustomerService', function(walletIndexService, walletToCustomerService) {

    let [chargeView, withdrawView] = [{
        h3: '发起充值',
        text1: '充值申请发起成功',
        text2: '充值金额',
        text3: '充值成功',
        urlShow: 'charge',
      },
      {
        h3: '发起提现',
        text1: '提现申请发起成功',
        text2: '提现金额',
        text3: '等待彩民确认',
        urlShow: 'withdraw',
      }
    ];
    return {
      featureChoose() {
        if (walletIndexService.feature === 'charge') {
          return chargeView;
        } else if (walletIndexService.feature === 'withdraw') {
          return withdrawView;
        }
      },

    };
  }]);
