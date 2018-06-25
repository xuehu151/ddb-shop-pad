//兑换
angular.module('starter.modulesCtrl', [])
    .controller('modulesCtrl', ['$scope', '$rootScope', 'locals', 'Ajax', 'PicMethods', '$state', 'walletIndexService', 'modulesService', function($scope, $rootScope, locals, Ajax, PicMethods, $state, walletIndexService, modulesService) {
        $rootScope.isShowInstMessage = false; // 即时消息显示开关
        locals.set('iSelectActiveTab', '0');
        if (!$rootScope.whetherHadChangeAccount) {
            $rootScope.receiveMessages = locals.getObject('receiveMessage').arr ? locals.getObject('receiveMessage').arr : []; //收到的通知
        } else {
            $rootScope.receiveMessages = [];
        }
        /*$rootScope.receiveMessages = [{
            title: '充值申请f',
            content: '您的彩民XXXX请求宠孩子11元。时间:2017-12-22 14:05:36*流水ID+11424',
          },
          {
            title: '充值申请',
            content: '您的彩民XXXX请求宠孩子11元。时间:2017-12-22 14:05:36*流水ID+11424',
          },
        ];*/
        $scope.accountHeadImg = locals.getObject('userInfo').headImg;
        $scope.account = locals.getObject('userInfo').account;
        $scope.whetherOwner = locals.getObject('userInfo').type === 1 ? true : false;
        let shopPerformance = locals.getObject('shopPerformance');
        $rootScope.shopImgSrc = shopPerformance.RequestShopInformation.headImg;
        $scope.whetherOpen = shopPerformance.RequestShopInformation.status === 0 ? '营业中' : '暂停营业中';
        console.log(window.xunfeiListenSpeaking);
        $scope.rightsList = locals.getObject('userRights');
        $scope.voiceStatus = true;
        let jpushServiceOther = {
            // 打开通知的回调函数
            onOpenNotification(event) {
                try {
                    // console.log(event);
                    let alertTitle, alertContent;
                    if (device.platform == 'Android') {
                        alertContent = window.plugins.jPushPlugin.openNotification.alert;
                        alertTitle = window.plugins.jPushPlugin.receiveNotification.title;
                    } else {
                        alertContent = event.aps.alert;
                        alertTitle = event.aps.title;
                    }
                    modulesService.chooseWhichToGo(alertTitle); //跳转到的页面
                } catch (exception) {
                    alert('JPushPlugin:onOpenNotification' + exception);
                }
            },
            // 接收到通知时的回调函数
            onReceiveNotification(event) {
                try {
                    console.log(event);
                    let alertTitle, alertContent;
                    if (device.platform == 'Android') {
                        alertContent = window.plugins.jPushPlugin.receiveNotification.alert;
                        alertTitle = window.plugins.jPushPlugin.receiveNotification.title;
                        // console.log(event.title);
                        // console.log(window.plugins.jPushPlugin.receiveNotification.title);
                        // console.log(event.alert);
                        // console.log(window.plugins.jPushPlugin.receiveNotification.alert);
                    } else {
                        alertContent = event.aps.alert;
                        alertTitle = event.aps.title;
                    }
                    let aOneMessage = alertContent.split('。');
                    let message = {
                        title: alertTitle,
                        content: aOneMessage[0],
                        time: aOneMessage[1].split('*')[1] ? aOneMessage[1].split('*')[0].split(',')[0] : aOneMessage[1],
                    };
                    $rootScope.$apply(function() {
                        $rootScope.receiveMessages.unshift(message); //头部插入推送
                    });
                    console.log($scope.voiceStatus);
                    modulesService.broadcastAudio(alertTitle, alertContent, $scope.voiceStatus);
                    locals.setObject('receiveMessage', { arr: $rootScope.receiveMessages });
                } catch (exception) {
                    // console.log(exception);
                }
            },
            // 接收到消息时的回调函数
            onReceiveMessage(event, receiveMessages) {
                try {
                    // console.log(event);
                    if (device.platform == 'Android') {
                        console.log(window.plugins.jPushPlugin.receiveMessage.message);
                    } else {
                        console.log(event.content);
                    }
                } catch (exception) {
                    console.log('JPushPlugin:onReceiveMessage-->' + exception);
                }
            },
        };

        document.addEventListener("jpush.openNotification", jpushServiceOther.onOpenNotification, false);
        document.addEventListener("jpush.receiveNotification", jpushServiceOther.onReceiveNotification, false);

        $scope.$on('exitLogin', function(){
            document.removeEventListener("jpush.openNotification", jpushServiceOther.onOpenNotification, false);
            document.removeEventListener("jpush.receiveNotification", jpushServiceOther.onReceiveNotification, false);
            alert('解绑成功')
        });
        //开关即时信息
        $rootScope.showInstMessages = () => {
            if ($rootScope.receiveMessages.length === 0) {
                return;
            }
            $rootScope.isShowInstMessage = !$rootScope.isShowInstMessage;
        };
        //点击即时消息的一条
        $scope.toDetailFromInst = (index) => {
            modulesService.chooseWhichToGo($rootScope.receiveMessages[index].title);
            $rootScope.receiveMessages.splice(index, 1);
            locals.setObject('receiveMessage', { arr: $rootScope.receiveMessages });
            $rootScope.isShowInstMessage = false;
        };
        //点击忽略
        $rootScope.ignoreThis = (index, $event) => {
            $event.stopPropagation();
            $rootScope.receiveMessages.splice(index, 1);
            locals.setObject('receiveMessage', { arr: $rootScope.receiveMessages });
            if ($rootScope.receiveMessages.length === 0) {
                $rootScope.isShowInstMessage = false;
            }
        };

        //一键清除所有推送
        $rootScope.clearAllMessage = () => {
            $rootScope.receiveMessages.length = 0;
            locals.getObject('receiveMessage').arr.length = 0;
            $rootScope.isShowInstMessage = false;
        };

        //1.在我的=>账户设置中修改营业状态,
        //2.在委托余额不足,自动变为营业状态
        $scope.$on('editOnSaleStatusSuc', function() {
            console.log(locals.getObject('shopPerformance'));
            $scope.$apply(function() {
                $scope.whetherOpen = locals.getObject('shopPerformance').RequestShopInformation.status === 0 ? '营业中' : '暂停营业中';
            });
        });

        //跳转到权限管理
        $scope.goClientAssist = () => {
            $state.go('modules.clients', { fromHome: 'fromHome' });
        };
    }]);
