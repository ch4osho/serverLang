var ws = new WebSocket("ws://chaosho.com:443");
    var nickname = "";
    ws.onopen = function (e) {
        console.log('连接到聊天室啦~');
}
        //显示消息
function appendLog(type, nickname, message) {
    if (typeof message == "undefined") return;
    var messages = document.getElementById('messages');
    var messageElem = document.createElement("li");
    var preface_label;
    var message_text;
    if (type === 'notification') {
        preface_label = `<span class="label label-warning"><i class="glyphicon glyphicon-remove"></i></span>`;
        message_text = `<p>${preface_label}&nbsp;&nbsp;${message}</p>`
    } else if (type == 'nick_update') {
        preface_label = `<span class="label label-warning"><i class="glyphicon glyphicon-bullhorn"></i></span>`;
        message_text = `<p>${preface_label}&nbsp;&nbsp;${message}</p>`
    } else if(type == 'join') {
        preface_label = `<span class="label label-warning"><i class="glyphicon glyphicon-plus"></i></span>`;
        message_text = `<p>${preface_label}&nbsp;&nbsp;${message}</p>`
    } else {
        preface_label = `<span class="label label-info">${nickname}:</span>`;
        message_text = `<p class="user_msg">${preface_label}&nbsp;&nbsp;${message}</p>`
    }
    messageElem.innerHTML = message_text;
    messages.appendChild(messageElem);
}
        //收到消息处理
ws.onmessage = function (e) {
    var data = JSON.parse(e.data);
    nickname = data.nickname;
    appendLog(data.type, data.nickname, data.message);
    console.log("ID: [%s] = %s", data.id, data.message);
    console.log('这是data',data)
}
//监听连接关闭情况
ws.onclose = function (e) {
    appendLog("Connection closed");
    console.log("Connection closed");
}
//发送消息
function sendMessage() {
    var messageField = document.getElementById('message');
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageField.value);
    }
    messageField.value = '';
    messageField.focus();
}
//修改名称
function changName() {
    var name = $("#name").val();
    if (ws.readyState === WebSocket.OPEN) {
        ws.send("/nick " + name);
    }
}