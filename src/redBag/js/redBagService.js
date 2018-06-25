angular.module('starter.redBagService', [])
  .factory('redBagService', ['splitCode','orderService','locals','Ajax','$cordovaToast', function(splitCode,orderService,locals,Ajax,$cordovaToast) {
    const month = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    return {
      month,
      dealResponseData(allReaBags) {
        let aNewResponse = [];

        for (let [index,oneBag] of allReaBags.entries()) {
          let oneResponseObj = {};
          oneResponseObj.id = oneBag.orderInfo.id;
          oneResponseObj.date = oneBag.createDate.substring(5, 10);
          oneResponseObj.nickName = oneBag.customer.nickName;
          oneResponseObj.phone = oneBag.customer.phone;
          oneResponseObj.orderMoney = oneBag.orderInfo.money;
          oneResponseObj.redBag = oneBag.money;
          oneResponseObj.printImg = oneBag.orderInfo.printImg;
          oneResponseObj.index = index;

          if (oneBag.orderInfo.lotteryID === '2') {
            oneResponseObj.lotteryType = '超级大乐透';
            let investCode = []; //保存点击的订单的号码
            for (let i = 0; i < oneBag.orderInfo.lotteryList.length; i++) {
              let oneCode = splitCode.split(oneBag.orderInfo.lotteryList[i].investCode);
              investCode.push(oneCode);
            }
            oneResponseObj.investCode = investCode;
          } else if (oneBag.orderInfo.lotteryID.indexOf('202') === 0) {
            oneResponseObj.lotteryType = '竞彩足球';
            orderService.dealXInY(oneBag.orderInfo.lotteryList[0].betWay,oneResponseObj);
            oneResponseObj.multiple = oneBag.orderInfo.lotteryList[0].multiple;
          }

          aNewResponse.push(oneResponseObj);
        }
        return aNewResponse;
      },
      async AjaxUploadRedBagImg(params) {
        try {
          let response = await Ajax.sendTo(url + '/redPacket/uploadVoucher', locals.get('token'), { params })
          console.log(response);
          $cordovaToast.showShortCenter('补图成功');
        } catch (error) { error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error); }
      },
      async AjaxGetBalance(params) {
        try {
          let response = await Ajax.sendTo(url + '/redPacket/dataStatistic', locals.get('token'), { params })
          console.log(response);
          return response;
        } catch (error) { error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error); }
      },
    };
  }]);
