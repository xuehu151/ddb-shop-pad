// Ionic Starter App  18888888888

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in loading.js
var url = 'http://47.104.29.94:8080/shop';
// var url = 'http://121.42.253.149:18818/shop';
// var url = 'http://192.168.1.109:8080/shop';  //刘一星
angular.module('starter', [
    'ionic',
    'ngCordova',
    'starter.services',
    'starter.loginCtrl',
    'starter.registerCtrl',
    'starter.modulesCtrl',
    'modules.services',
    'starter.homeCtrl',
    'starter.ordersCtrl',
    'starter.bigLotteOrders',
    'starter.allOrders',
    'starter.walletCtrl',
    'starter.walletIndexCtrl',
    'starter.walletCharge',
    'starter.walletChargeDetail',
    'starter.walletChargeRecords',
    'starter.walletChargeToCustomer',
    'starter.walletChargeToCustomerWaiting',
    'starter.clientsCtrl',
    // 'starter.clientsDetailCtrl',
    'client.services',
    'starter.mineCtrl',
    'starter.mineShopSetsCtrl',
    'starter.mineTwoSetsCtrl',
    'starter.chartsCtrl',
    'starter.chartsTwoCtrl',
    'starter.chartsHistoryCtrl',
    'charts.services',
    'starter.redBagCtrl',
    'starter.redBagService'
  ])
  .run(['$ionicPlatform', 'jpushService', function($ionicPlatform, jpushService) {
    //fff
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      jpushService.initiateUI();

      var permissions = cordova.plugins.permissions;
       permissions.checkPermission(permissions.WRITE_EXTERNAL_STORAGE, checkPermissionCallback, null);
       function checkPermissionCallback(status) {
         if(!status.checkPermission) {
           var errorCallback = function() {
             console.warn('没有赋予读取文件权限');
           }
           permissions.requestPermission(
             permissions.WRITE_EXTERNAL_STORAGE,
             function(status) {
               if(!status.checkPermission) errorCallback();
             },
             errorCallback);
         }
       }
    });
  }])
  .config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$httpProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, $locationProvider) {
    //解决tabs在Android顶部的方法
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard'); // 参数可以是： standard | striped => 带条
    $ionicConfigProvider.platform.android.tabs.position('bottom');
    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');
    $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
    $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');
    $ionicConfigProvider.views.maxCache(0);

    //隐藏ion-nav-back-button的文字
    $ionicConfigProvider.backButton.text('');
    $ionicConfigProvider.backButton.previousTitleText(false);

    //添加http请求头文件
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript, */*; q=0.01';
    $httpProvider.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';

    $locationProvider.html5Mode(false);

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in loading.js
    $stateProvider
      .state('login', {
        url: '/login/:fromWhich',
        templateUrl: 'login/template/login.html',
        controller: 'loginCtrl',
        // cache: false
      })

      .state('register', {
        url: '/register',
        templateUrl: 'login/template/register.html',
        controller: 'registerCtrl',
        cache: false
      })

      .state('modules', {
        url: '/modules',
        templateUrl: 'modules/template/modules.html',
        controller: 'modulesCtrl',
        // cache:false
      })

      .state('modules.home', {
        url: '/home',
        templateUrl: 'home/template/home.html',
        controller: 'homeCtrl',
        // cache:false
      })
      //home首页
      .state('modules.home.index', {
        url: '/index',
        templateUrl: 'home/template/homeIndex.html',
        controller: 'homeIndexCtrl',
        // cache:false
      })
      //home系統公告
      .state('modules.home.public', {
        url: '/public',
        prefetchTemplate: false,
        templateUrl: 'home/template/homePublicNotes.html',
        controller: 'homePublicCtrl',
        // cache:false
      })
      //公告详情
      .state('modules.home.publicDetail', {
        url: '/public/:index',
        prefetchTemplate: false,
        templateUrl: 'home/template/homePublicNotesDetail.html',
        controller: 'homePublicDetailCtrl',
        // cache:false
      })

      .state('modules.orders', {
        url: '/orders',
        prefetchTemplate: false,
        templateUrl: 'orders/template/orders.html',
        controller: 'ordersCtrl',
        // cache:false
      })

      //全部订单
      .state('modules.orders.allOrders', {
        url: '/allOrders/:whetherPhone',
        cache: false,
        prefetchTemplate: false,
        templateUrl: 'orders/template/allOrders.html',
        controller: 'allOrdersCtrl'
      })

      //大乐透订单
      .state('modules.orders.bigLotteOrders', {
        url: '/bigLotteOrders',
        cache: false,
        prefetchTemplate: false,
        templateUrl: 'orders/template/bigLotteOrders.html',
        controller: 'bigLotteOrdersCtrl'

      })

      /*//大乐透待出票订单
      .state('modules.orders.bigLotteOrders.needOutput', {
        url: '/needOutput',
        cache: false,
        prefetchTemplate:false,
        templateUrl: 'orders/template/needOutputBigLotte.html'
      })*/

      /*//大乐透待派奖订单
      .state('modules.orders.bigLotteOrders.needSend', {
        url: '/needSend',
        cache: false,
        prefetchTemplate:false,
        templateUrl: 'orders/template/needSendBigLotte.html'
      })*/

      //竞彩足球订单
      .state('modules.orders.footballOrders', {
        url: '/footballOrders',
        cache: false,
        prefetchTemplate: false,
        templateUrl: 'orders/template/footballOrders.html',
        controller: 'footballOrdersCtrl'
      })

      //竞猜足球待出票订单
      .state('modules.orders.footballOrders.needOutput', {
        url: '/needOutput',
        cache: false,
        prefetchTemplate: false,
        templateUrl: 'orders/template/needOutputFootball.html'
      })

      //竞猜足球待派奖订单
      .state('modules.orders.footballOrders.needSend', {
        url: '/needSend',
        cache: false,
        prefetchTemplate: false,
        templateUrl: 'orders/template/needSendFootball.html'
      })


      //钱包模块
      .state('modules.wallet', {
        url: '/wallet',
        templateUrl: 'wallet/template/wallet.html',
        controller: 'walletCtrl',
        prefetchTemplate: false,
        // cache:false
      })

      //钱包首页
      .state('modules.wallet.index', {
        url: '/walletIndex',
        templateUrl: 'wallet/template/walletIndex.html',
        controller: 'walletIndexCtrl',
        prefetchTemplate: false,
        // cache:false
      })

      //钱包=>充值
      .state('modules.wallet.charge', {
        url: '/charge/:type',
        templateUrl: 'wallet/template/walletCharge.html',
        controller: 'walletChargeCtrl',
        prefetchTemplate: false,
        cache: false
      })

      //钱包=>充值=>审核
      .state('modules.wallet.charge.verify', {
        url: '/chargeVerify/:id',
        templateUrl: 'wallet/template/walletChargeVerify.html',
        controller: 'walletChargeDetailCtrl',
        prefetchTemplate: false,
        cache: false
      })

      //钱包=>充值=>充值记录
      .state('modules.wallet.charge.records', {
        url: '/chargeRecords/:type',
        templateUrl: 'wallet/template/walletChargeRecords.html',
        controller: 'walletChargeRecordsCtrl',
        prefetchTemplate: false,
        // cache:false
      })

      //钱包=>充值=>给用户充值
      .state('modules.wallet.charge.toCustomer', {
        url: '/chargeToCustomer/:type',
        templateUrl: 'wallet/template/walletChargeToCustomer.html',
        controller: 'walletChargeToCustomerCtrl',
        prefetchTemplate: false,
        // cache:false
      })

      //钱包=>充值=>充值待确认
      .state('modules.wallet.charge.toCustomerWaitingInfo', {
        url: '/chargeToCustomerWaitingInfo/:type',
        templateUrl: 'wallet/template/walletChargeToCustomer-waitting.html',
        controller: 'walletChargeToCustomerWaitingCtrl',
        prefetchTemplate: false,
        cache:false
      })

      //客户
      .state('modules.clients', {
        url: '/clients/:fromHome',
        templateUrl: 'clients/template/clients.html',
        controller: 'clientsCtrl',
        prefetchTemplate: false,
        // cache:false
      })
      //客户=>明细
      /*.state('modules.clientsDetail', {
        url: '/clientsDetail/:id',
        templateUrl: 'clients/template/clients.detail.html',
        controller: 'clientsDetailCtrl',
        prefetchTemplate: false,
        // cache:false
      })*/

      //报表首页
      .state('modules.charts', {
        url: '/charts',
        templateUrl: 'charts/template/charts.html',
        controller: 'chartsCtrl',
        // cache:false
      })
      //报表=>时段统计
      .state('modules.charts.Time', {
        url: '/timeSummarize',
        templateUrl: 'charts/template/chartsTime.html',
        controller: 'chartsTimeCtrl',
        // cache:false
      })
      //报表=>历史报表
      .state('modules.charts.History', {
        url: '/historyCharts',
        templateUrl: 'charts/template/chartsHistory.html',
        controller: 'chartsHistoryCtrl',
        // cache:false
      })
      //报表=>客户统计
      .state('modules.charts.Clients', {
        url: '/clientsCharts',
        templateUrl: 'charts/template/chartsClients.html',
        controller: 'chartsClientsCtrl',
        // cache:false
      })
      //我的
      .state('modules.mine', {
        url: '/mine/:editAccount',
        templateUrl: 'mine/template/mine.html',
        controller: 'mineCtrl',
        // cache:false
      })
      //我的=>彩店设置
      .state('modules.mine.shopSets', {
        url: '/shopSets',
        templateUrl: 'mine/template/mineShopSets.html',
        controller: 'mineShopSetsCtrl',
        // cache:false
      })
      //我的=>委托设置
      /*.state('modules.mine.delegateSets', {
        url: '/delegateSets',
        templateUrl: 'mine/template/mineDelegateSets.html',
        controller: 'mineDelegateSetsCtrl',
        // cache:false
      })*/
      //我的=>彩店账户
      .state('modules.mine.shopAccount', {
        url: '/shopAccount',
        templateUrl: 'mine/template/mineShopAccount.html',
        controller: 'mineShopAccountCtrl',
        // cache:false
      })
      //我的=>账户设置
      .state('modules.mine.accountSets', {
        url: '/accountSets',
        templateUrl: 'mine/template/mineAccountSets.html',
        controller: 'mineAccountSetsCtrl',
        // cache:false
      })

      //红包
      .state('modules.redBag', {
        url: '/redBag',
        templateUrl: 'redBag/template/redBag.html',
        controller: 'redBagCtrl',
        // cache:false
      });


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login/normal');

  }]);
