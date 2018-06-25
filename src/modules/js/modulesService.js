angular.module('modules.services', [])
    .factory('modulesService', ['$rootScope', '$state', 'locals', 'walletIndexService', function($rootScope, $state, locals, walletIndexService) {

        return {
            broadcastAudio(alertTitle, alertContent, voiceStatus) {
                console.log(alertTitle);
                console.log(alertContent);
                let voiceMessage = '';
                let id = alertTitle !== '状态更新' ? alertContent.split('+')[1] : '';
                console.log(alertTitle);
                if (alertTitle === '状态更新') {
                    let shopPerformance = locals.getObject('shopPerformance');
                    shopPerformance.RequestShopInformation.status = 0;
                    locals.setObject('shopPerformance', shopPerformance);
                    $rootScope.$broadcast('editOnSaleStatusSuc');
                } else if (alertTitle === '大乐透出票申请') {
                        if (voiceStatus) {
                        voiceMessage = '您有新的大乐透订单,请及时出票';
                        window.xunfeiListenSpeaking.startSpeak(function() {
                            console.log('成功');
                        }, function() {
                            console.log('失败');
                        }, voiceMessage);
                    }
                    $rootScope.$broadcast('haveBigLotteryOutputApply', id);
                } else if (alertTitle === '竞彩出票申请') {
                    if (voiceStatus) {
                        voiceMessage = '您有新的足彩订单,请及时出票';
                        window.xunfeiListenSpeaking.startSpeak(function() {
                            console.log('成功');
                        }, function() {
                            console.log('失败');
                        }, voiceMessage);
                    }
                    $rootScope.$broadcast('haveFootballOutputApply', id);
                } else if (alertTitle === '充值申请') {
                    if (voiceStatus) {
                        voiceMessage = '您有新的充值申请,请及时处理';
                        window.xunfeiListenSpeaking.startSpeak(function() {
                            console.log('成功');
                        }, function() {
                            console.log('失败');
                        }, voiceMessage);
                    }
                    $rootScope.$broadcast('haveChargeApply', id);
                } else if (alertTitle === '提现申请') {
                    if (voiceStatus) {
                        voiceMessage = '您有新的提现申请,请及时处理';
                        window.xunfeiListenSpeaking.startSpeak(function() {
                            console.log('成功');
                        }, function() {
                            console.log('失败');
                        }, voiceMessage);
                    }
                    $rootScope.$broadcast('haveWithdrawApply', id);
                } else if (alertTitle === '及时出票') {
                    voiceMessage = '您有新订单即将截止投注,请及时处理';
                    window.xunfeiListenSpeaking.startSpeak(function() {
                        console.log('成功');
                    }, function() {
                        console.log('失败');
                    }, voiceMessage);
                }
            },
            chooseWhichToGo(alertTitle) {
                let iSelectActiveTab;
                switch (alertTitle) {
                    case '竞彩出票申请':
                        locals.set('iSelectActiveTab', '1');
                        $state.go('modules.orders.bigLotteOrders');
                        break;
                    case '大乐透出票申请':
                        locals.set('iSelectActiveTab', '0');
                        $state.go('modules.orders.bigLotteOrders');
                        break;
                    case '派奖申请':
                        $state.go('modules.wallet.bigLotteOrders', { whetherOutput: locals.set('whetherOutput', false) });
                        break;
                    case '充值申请':
                        walletIndexService.feature = 'charge';
                        $state.go('modules.wallet.charge');
                        break;
                    case '提现申请':
                        walletIndexService.feature = 'withdraw';
                        $state.go('modules.wallet.charge');
                        break;
                    case '拒绝提现申请':
                        walletIndexService.feature = 'withdraw';
                        $state.go('modules.wallet.charge.records', { type: 'withdraw' });
                        break;
                    case '同意提现申请':
                        walletIndexService.feature = 'withdraw';
                        $state.go('modules.wallet.charge.records', { type: 'withdraw' });
                        break;
                    default:
                        $state.go('modules.home.index');
                }
            }
        };
    }]);
