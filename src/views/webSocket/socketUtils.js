var socketUtil = /** @class */ (function () {
    function socketUtil(url) {
        // this.timer = null;
        this.ws = null;
        //心跳监测时长
        this.heartCheckTimes = 1000*10
        //最后消息计时器
        this.heartCheckTimer = null
        //获取值的回调函数
        this.onmessage = null;
        //开启的回调函数
        this.onopen = null;
        this.onclose = null;
        this.onerror = null;
        //url地址
        this.socketUrl = url
        this.init()
    }
    socketUtil.prototype.init = function () {
        this.socketConnect();
    };
    //socket连接
    socketUtil.prototype.socketConnect = function () {
        var vm = this;
        this.ws = new WebSocket(this.socketUrl);
        //连接失败
        this.ws.onclose = function (e) {
            //连接关闭
            // this.getConnect(this.socketConnect)
            vm.handleOnClose(e)
        };
        //连接成功
        this.ws.onopen =  function(e) {
            vm.heartCheckReset().heartCheckStart();
            vm.handleOnOpen(e)
        };
        this.ws.onerror = function (e) {
            //连接异常
            // vm.getConnect(params);
            vm.handleOnError(e)
        };
        this.ws.onmessage = this.handleMessage.bind(this)
    };
    socketUtil.prototype.handleMessage = function (e) {
        if(typeof this.onmessage==='function'){
            try{
                this.onmessage(JSON.parse(e.data))
            }catch(e){
                console.log(e);
                new Error('socket消息错误:',e.toString())
            }
        }
    };
    socketUtil.prototype.handleOnOpen = function (e) {
        if(typeof this.onopen==='function'){
            try{
                this.onopen(e)
            }catch(e){
                console.log(e);
                new Error('socket消息错误:',e.toString())
            }
        }
    };
    socketUtil.prototype.handleOnError = function (e) {
        if(typeof this.onerror==='function'){
            try{
                this.onerror(e)
            }catch(e){
                console.log(e);
                new Error('socket消息错误:',e.toString())
            }
        }
    };
    socketUtil.prototype.handleOnClose = function (e) {
        if(typeof this.onclose==='function'){
            try{
                this.onclose(e)
            }catch(e){
                console.log(e);
                new Error('socket消息错误:',e.toString())
            }
        }
    };
    //发送socket信息prototype.destroy
    socketUtil.prototype.sendSocketMsg = function (msg) {
       if(this.ws.readyState == 1){
            this.ws.send(JSON.stringify(msg));
        }
    };
    //心跳开始
    socketUtil.prototype.heartCheckStart = function(){
        this.heartCheckTimer = setInterval(()=>{
            if(this.ws.readyState == 1){
                // console.log("连接状态，发送消息保持连接");
                this.sendSocketMsg("heartbeat");
                this.heartCheckReset().heartCheckStart();    // 如果获取到消息，说明连接是正常的，重置心跳检测
            }else{
                // console.log("断开状态，尝试重连");
                this.socketConnect();
            }
        }, this.heartCheckTimes)
    };
    //心跳重置
    socketUtil.prototype.heartCheckReset = function(){
        clearTimeout(this.heartCheckTimer);
        this.heartCheckTimer = null
        return this;
    };
    //注销
    socketUtil.prototype.destroy = function(){
        this.heartCheckReset()
        this.ws.close()
    };
    socketUtil.prototype.close = socketUtil.prototype.destroy
    //socket重连监测
    // socketUtil.prototype.socketReConnent = function (params) {
    //     if (this.ws.readyState !== 1) {
    //         this.socketConnect(params);
    //     }
    //     else {
    //         this.sendSocketMsg(params);
    //     }
    // };
    //下发播放信息，进行播放
    // socketUtil.prototype.doPlay = function (url, name, serviceId, hidePlayer, VID, AID) {
    //     if (serviceId === void 0) { serviceId = 0; }
    //     if (hidePlayer === void 0) { hidePlayer = 0; }
    //     if (VID === void 0) { VID = ""; }
    //     if (AID === void 0) { AID = ""; }
    //     var info = {
    //         msgID: this.msgID++,
    //         type: "videoPlay",
    //         url: url,
    //         displayInfo: name,
    //         hidePlayer: hidePlayer,
    //         serviceId: serviceId,
    //         VID: VID,
    //         AID: AID
    //     };
    //     this.socketReConnent(info);
    // };
    //设置获取重复音量值
    // socketUtil.prototype.setReportVolumeVal = function (value) {
    //     var info = {
    //         msgID: this.msgID++,
    //         type: "setReportElectricalLevel",
    //         "interval": value,
    //         "enable": 1
    //     };
    //     this.socketReConnent(info);
    // };
    //设置音量
    // socketUtil.prototype.setVolumeVal = function (value) {
    //     if (value == undefined) {
    //         return false;
    //     }
    //     var info = {
    //         msgID: this.msgID++,
    //         type: "setVolumn",
    //         value: value
    //     };
    //     this.socketReConnent(info);
    // };
    
    //socket异常事件
    // socketUtil.prototype.onSocketError = function (params) {
    //     //连接异常
    //     //进行重连
    //     this.getConnect(params);
    // };
    //socket连接信息异常处理
    // socketUtil.prototype.getConnect = function (params) {
    //     var vm = this;
    //     if (vm.timer) {
    //         window.clearTimeout(vm.timer);
    //         vm.timer = null;
    //     }
    //     vm.timer = window.setTimeout(function () {
    //         if (vm.i === 3) {
    //             vm.i = 1;
    //             alert("socket error");
    //             return false;
    //         }
    //         vm.i++;
    //         vm.socketConnect(params);
    //     }, 500);
    // };
    //信息错误异常
    // socketUtil.prototype.getMessage = function () {
    //     if (this.timer) {
    //         window.clearTimeout(this.timer);
    //         this.timer = null;
    //     }
    //     alert("socket error");
    // };
    return socketUtil;
}());
export default socketUtil