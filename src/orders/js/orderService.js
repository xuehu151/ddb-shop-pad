angular.module('order.services', [])
  //分割字符串
  .factory('splitCode', [function() {
    let code = {};
    code.split = function(obj) {
      let investCode = obj.split('*');
      let investCodeFormat = [];
      investCodeFormat[0] = investCode[0].split(',');
      investCodeFormat[1] = investCode[1].split(',');
      return investCodeFormat;
    };
    return code;
  }])
  .factory('orderService', ['splitCode', 'Ajax', 'locals', 'PicMethods', '$rootScope', 'addBefore', '$cordovaToast', function(splitCode, Ajax, locals, PicMethods, $rootScope, addBefore, $cordovaToast) {
    class httpParams {
      constructor(pageNumber, pageSize, lotteryID, status, allBall,orderInfoID) {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.lotteryID = lotteryID;
        this.status = status;
        this.allBall = allBall;
        this.orderInfoID = orderInfoID;
      }
      returnParams() {
        return {
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
          lotteryID: this.lotteryID,
          status: this.status,
          allBall: this.allBall,
          orderInfoID:this.orderInfoID,
          entrust:0,
        };
      }
    }

    class prizeHttpParams extends httpParams {
      constructor(pageNumber, pageSize, lotteryID, status, isReturn, allBall) {
        super(pageNumber, pageSize, lotteryID, status, allBall);
        this.isReturn = isReturn;
      }
      returnParams() {
        return {
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
          lotteryID: this.lotteryID,
          status: this.status,
          isReturn: this.isReturn,
          allBall: this.allBall,
          entrust:0,
        };
      }
    }
    //编译胜负平
    function fnCompileWinOrLose(eachDivide5) {
      let method = [];
      let aCompoundMethod = eachDivide5.split('#');
      for (let eachCompoundMethod of aCompoundMethod) {
        switch (eachCompoundMethod.charAt(0)) {
          case '3':
            // oOneInvestCode.winOrLose = `主胜`;
            method.push(`主胜`)
            break;
          case '1':
            // oOneInvestCode.winOrLose = `平`;
            method.push(`平`);
            break;
          case '0':
            method.push(`主负`);
            // oOneInvestCode.winOrLose = `主负`;
            break;
        }
      }
      return method
    }

    //编译让球胜负平
    function fnCompileWinOrLoseLet(eachDivide5, eachDivide4) {
      let method = [];
      let aCompoundMethod = eachDivide5.split('#');
      for (let eachCompoundMethod of aCompoundMethod) {
        switch (eachCompoundMethod.charAt(0)) {
          case '3':
            method.push(`让胜(${eachDivide4})`);
            break;
          case '1':
            method.push(`让平(${eachDivide4})`);
            break;
          case '0':
            method.push(`让负(${eachDivide4})`);
            break;
        }
      }
      return method
    }

    //编译比分
    function fnCompileScoreResult(eachDivide5) {
      let method = [];
      let aCompoundMethod = eachDivide5.split('#');
      for (let eachCompoundMethod of aCompoundMethod) {
        if (eachCompoundMethod) {
          if (eachCompoundMethod.charAt(0) === '9' && eachCompoundMethod.charAt(1) === '9') {
            method.push(`平其他`)
          } else if (eachCompoundMethod.charAt(0) === '0' && eachCompoundMethod.charAt(1) === '9') {
            method.push(`负其他`)
          } else if (eachCompoundMethod.charAt(0) === '9' && eachCompoundMethod.charAt(1) === '0') {
            method.push(`胜其他`)
          } else {
            method.push(`${eachCompoundMethod.charAt(0)}:${eachCompoundMethod.charAt(1)}`)
          }
        }

      }
      return method;
    }

    //编译进球数
    function fnCompileTotalGoals(eachDivide5) {
      let method = [];
      let aCompoundMethod = eachDivide5.split('#');
      for (let eachCompoundMethod of aCompoundMethod) {
        if (eachCompoundMethod) {
          method.push(`${eachCompoundMethod.charAt(0)}球`)
        }
      }
      return method;
    }

    //编译几串几
    function fnCompileXInY(betWay, oFootballOrders) {
      switch (betWay) {
        case '500':
          oFootballOrders.sXInY = '单关';
          break;
        case '502':
          oFootballOrders.sXInY = '2串1';
          break;
        case '503':
          oFootballOrders.sXInY = '3串1';
          break;
        case '504':
          oFootballOrders.sXInY = '4串1';
          break;
        case '505':
          oFootballOrders.sXInY = '5串1';
          break;
        case '506':
          oFootballOrders.sXInY = '6串1';
          break;
        case '507':
          oFootballOrders.sXInY = '7串1';
          break;
        case '508':
          oFootballOrders.sXInY = '8串1';
          break;
        case '526':
          oFootballOrders.sXInY = '3串3';
          break;
        case '527':
          oFootballOrders.sXInY = '3串4';
          break;
        case '539':
          oFootballOrders.sXInY = '4串4';
          break;
        case '540':
          oFootballOrders.sXInY = '4串5';
          break;
        case '528':
          oFootballOrders.sXInY = '4串6';
          break;
        case '529':
          oFootballOrders.sXInY = '4串11';
          break;
        case '544':
          oFootballOrders.sXInY = '5串5';
          break;
        case '545':
          oFootballOrders.sXInY = '5串6';
          break;
        case '530':
          oFootballOrders.sXInY = '5串10';
          break;
        case '541':
          oFootballOrders.sXInY = '5串16';
          break;
        case '531':
          oFootballOrders.sXInY = '5串20';
          break;
        case '532':
          oFootballOrders.sXInY = '5串26';
          break;
        case '549':
          oFootballOrders.sXInY = '6串6';
          break;
        case '550':
          oFootballOrders.sXInY = '6串7';
          break;
        case '533':
          oFootballOrders.sXInY = '6串15';
          break;
        case '542':
          oFootballOrders.sXInY = '6串20';
          break;
        case '546':
          oFootballOrders.sXInY = '6串22';
          break;
        case '534':
          oFootballOrders.sXInY = '6串35';
          break;
        case '543':
          oFootballOrders.sXInY = '6串42';
          break;
        case '535':
          oFootballOrders.sXInY = '6串50';
          break;
        case '536':
          oFootballOrders.sXInY = '6串57';
          break;
        case '553':
          oFootballOrders.sXInY = '7串7';
          break;
        case '554':
          oFootballOrders.sXInY = '7串8';
          break;
        case '551':
          oFootballOrders.sXInY = '7串21';
          break;
        case '547':
          oFootballOrders.sXInY = '7串35';
          break;
        case '537':
          oFootballOrders.sXInY = '7串120';
          break;
        case '556':
          oFootballOrders.sXInY = '8串8';
          break;
        case '557':
          oFootballOrders.sXInY = '8串9';
          break;
        case '555':
          oFootballOrders.sXInY = '8串28';
          break;
        case '552':
          oFootballOrders.sXInY = '8串56';
          break;
        case '548':
          oFootballOrders.sXInY = '8串70';
          break;
        case '538':
          oFootballOrders.sXInY = '8串247';
          break;
      }
    }

    //编译半全场
    function fnCompileHalfAndAll(eachDivide5) {
      let method = [];
      let aCompoundMethod = eachDivide5.split('#');
      for (let eachCompoundMethod of aCompoundMethod) {
        switch (eachCompoundMethod.charAt(0) + eachCompoundMethod.charAt(1)) {
          case '00':
            method.push(`负负`);
            break;
          case '01':
            method.push(`负平`);
            break;
          case '03':
            method.push(`负胜`);
            break;
          case '11':
            method.push(`平平`);
            break;
          case '10':
            method.push(`平负`);
            break;
          case '13':
            method.push(`平胜`);
            break;
          case '33':
            method.push(`胜胜`);
            break;
          case '31':
            method.push(`胜平`);
            break;
          case '30':
            method.push(`胜负`);
            break;
        }
      }
      return method
    }

    return {
      httpParams,
      prizeHttpParams,
      async AjaxNeedOutput(lotteryID, status, allBall, iSelectActiveTab,orderInfoID,haveCloseLoading) {
        try {
          let params = new this.httpParams(1, 200, lotteryID, status, allBall,orderInfoID).returnParams();
          let response = await Ajax.sendTo(url + '/order/getList', locals.get('token'), { params,haveCloseLoading });

          response = this.addStatusAndType(response.data, iSelectActiveTab) //添加中文
          console.log(response)
          return response;
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
      async AjaxNeedSend(lotteryID, status, isReturn, allBall) {
        try {
          let params = new this.prizeHttpParams(1, 200, lotteryID, status, isReturn, allBall).returnParams();
          let response = await Ajax.sendTo(url + '/order/getList', locals.get('token'), { params });
          console.log(response);
          let newPrizeArr = [];
          for (let [index, item] of response.data.entries()) {
            if (item.lotteryID === '2') {
              item.lotteryType = '超级大乐透';
            } else if (item.lotteryID.indexOf('202') === 0) {
              item.lotteryType = '竞彩足球';
            }
            item.whetherHaveGetTicket = false;
            let [nowTotalWinamt, nowSendOrder] = [0, item.lotteryList];
            for (let each of nowSendOrder) {
              nowTotalWinamt += each.winamt;
            }
            item.nowTotalWinamt = nowTotalWinamt;
            item.index = index;
            newPrizeArr.unshift(item);
          }
          return newPrizeArr;
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
      async AjaxConfirmSendPrize(params) {
        try {
          let response = await Ajax.sendTo(url + '/order/return', locals.get('token'), { params })
          console.log(response);
          $cordovaToast.showShortCenter('派奖成功');
          return response;
        } catch (error) { error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error); }
      },
      addStatusAndType(datas, tab) {
        let newDataArr = [];
        for (let [index, obj] of datas.entries()) {

          /**
           * pc端不下载图片,移动端下载图片
           */
          //因目前没有彩民头像,故先隐藏,注意解开时html也要修改
          /*if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent) && obj.customerHeadImg) {
            //下载账户头像
          PicMethods.downloadFile(obj.customerHeadImg, 'downloadCustomerImgSucceed', index)
          }*/

          if (obj.entrust === 1) {
            obj.statusChina = '委托';
          } else if (obj.status === -1 && obj.entrust === 0) {
            obj.statusChina = '出票失败';
          } else if (obj.status === 1 && obj.entrust === 0) {
            obj.statusChina = '待出票';
            obj.delegateStatus = 0 //0:未开启委托  1.未选中委托  2.选中委托
          } else if (obj.status === 2 && obj.entrust === 0) {
            obj.statusChina = '已出票';
          } else if (obj.status === 3 && obj.entrust === 0) {
            obj.statusChina = '未中奖';
          } else if (obj.status === 4 && obj.isReturn === 0 && obj.entrust === 0) {
            obj.statusChina = '待派奖';
          } else if (obj.status === 4 && obj.isReturn === 1 && obj.entrust === 0) {
            obj.statusChina = '已派奖';
          }
          /*
                 switch (obj.status) {
                   case -1:
                     obj.statusChina = '出票失败';
                     break;
                   case 1:
                     obj.statusChina = '待出票';
                     obj.delegateStatus = 0; //0:未开启委托  1.未选中委托  2.选中委托
                     break;
                   case 2:
                     obj.statusChina = '已出票';
                     break;
                   case 3:
                     obj.statusChina = '未中奖';
                     break;
                   case 4:
                     if (obj.isReturn === 0) {
                       obj.statusChina = '待派奖';
                     } else if (obj.isReturn === 1) {
                       obj.statusChina = '已派奖';
                     }
                     break;
                 }*/
          if (obj.lotteryID === '2') {
            obj.lotteryType = '超级大乐透';
            let investCode = []; //保存点击的订单的号码

            for (let i = 0; i < obj.lotteryList.length; i++) {
              let oneCode = splitCode.split(obj.lotteryList[i].investCode);
              investCode.push(oneCode);
            }
            obj.investCode = investCode;
          } else if (obj.lotteryID.indexOf('202') === 0) {
            obj.lotteryType = '竞彩足球';
          }

          let [nowTotalWinamt, nowSendOrder] = [0, obj.lotteryList];
          for (let each of nowSendOrder) {
            nowTotalWinamt += each.winamt;
          }
          obj.nowTotalWinamt = nowTotalWinamt;

          let nowDate = `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}`;
          if (obj.createDate.slice(0, 10) === addBefore.addMMDD0(nowDate)) {
            obj.createDate = `今日${obj.createDate.slice(11,16)}`;
          } else {
            obj.createDate = `${obj.createDate.slice(0,16)}`;
          }
          obj.index = index;
          console.log(tab)
          newDataArr.push(obj);
          /*if (tab !== 2) {
            newDataArr.unshift(obj);
          } else {
            newDataArr.push(obj);
          }*/
        }
        return newDataArr;
      },
      async AjaxGetFootballOrderDetail(params) {
        /**
         * aFootballOrders:保存所有场次
         * sXInY:单关还是几串几
         * multiple:倍数
         */
        let oFootballOrders = { aFootballOrders: [], sXInY: '', multiple: '' };
        try {
          let response = await Ajax.sendTo(url + '/order/getInfo', locals.get('token'), { params });
          console.log(response);
          let aMethods = []; //用于保存编译后的玩法数组
          let aInvestCode = response.data.lotteryList[0].investCode.split('^');
          for (let oEachMethod of aInvestCode) {
            let method = [];

            let eachDivide = oEachMethod.split('|');
            switch (eachDivide[3]) {
              case '20201':
                method = fnCompileWinOrLose(eachDivide[5])
                aMethods.push(method); //胜平负
                break;
              case '20202':
                method = fnCompileScoreResult(eachDivide[5]);
                aMethods.push(method);
                break;
              case '20203': //进球数
                method = fnCompileTotalGoals(eachDivide[5]);
                aMethods.push(method);
                break;
              case '20204':
                method = fnCompileHalfAndAll(eachDivide[5]);
                aMethods.push(method)
                break;
              case '20206':
                method = fnCompileWinOrLoseLet(eachDivide[5], eachDivide[4])
                aMethods.push(method); //让球胜平负
                break;
            }
          }
          for (let i = 0; i < response.data.lotteryList[0].ballHistory.length; i++) {
            let oOneMatch = {};
            oOneMatch.hostTeam = response.data.lotteryList[0].ballHistory[i].hostTeam;
            oOneMatch.visitTeam = response.data.lotteryList[0].ballHistory[i].visitTeam;
            oOneMatch.oneMethod = aMethods[i].join(',');
            oFootballOrders.aFootballOrders.push(oOneMatch);
          }

          fnCompileXInY(response.data.lotteryList[0].betWay, oFootballOrders); //几串几
          oFootballOrders.multiple = response.data.lotteryList[0].multiple; //倍数
          console.log(oFootballOrders);
          return oFootballOrders;
        } catch (error) {
          error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error);
        }
      },
      async AjaxConfirmDelegateOrders(allNeedDo, payPassword) {
        try {
          console.log(payPassword);
          let aId = allNeedDo.filter(eachOrder => eachOrder.delegateStatus === 2)
            .map(eachDelegateOrder => eachDelegateOrder.id)
          let params = {
            payPassword,
            id: aId
          };
          console.log(aId);
          let response = await Ajax.sendTo(url + '/order/orderEntrust', locals.get('token'), { params })
          console.log(response);
          $cordovaToast.showShortCenter('委托成功')
          let aNowAllNeedDO = allNeedDo.filter(eachOrder => eachOrder.delegateStatus !== 2)
          for (let [index, each] of aNowAllNeedDO.entries()) {
            each.index = index;
            each.delegateStatus = 0;
          }
          return { aNowAllNeedDO, amount: aId.length };
        } catch (error) { error.info ? $cordovaToast.showShortCenter(error.info) : $cordovaToast.showShortCenter(error); }
      },

      //用于红包模块
      dealXInY(betway, oneResponseObj) {
        fnCompileXInY(betway, oneResponseObj); //几串几
      },
      checkHaveDelegateOrder (allNeedDo){
        console.log(allNeedDo);
        let bHaveDelegateOrder = false;
        for (let oneOrder of allNeedDo){
          if (oneOrder.delegateStatus === 2) {
            bHaveDelegateOrder = true;
          }
        }
        return bHaveDelegateOrder;
      }
    };
  }])
