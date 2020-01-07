const express = require('express');
const fs = require('fs');
const ws = require('ws');
const uuid = require('uuid');
const path = require('path');


var app = express()

let socketServer = ws.Server;

let wss = new socketServer({port: 443})

let clients = []

let clientIndex = 0;


app.use('/static',express.static(path.join(__dirname, 'static')))


app.get('/test',(req,res)=>{
    res.send('test success!')
})

function broadcastSend(type,msg,nickname){
    clients.forEach(function(client,index){
        if(client.ws.readyState === ws.OPEN) {
            client.ws.send(JSON.stringify({
                'type': type,
                'nickname': nickname,
                'message': msg,
                'visitedNum': clientIndex
            }))
        }
    })
}

wss.on('connection',function(ws){
    let client_uuid = uuid.v4();
    let nickname = `陌生人${clientIndex++}`;
    clients.push({
        "id": client_uuid,
        "ws": ws,
        "nickname": nickname
    })

    broadcastSend("join", '加入聊天室', nickname);



    console.log(`client ${client_uuid} connected`);

    function closeSocket(){
        for(let i = 0;i<clients.length;i++) {
            if(clients[i].id == client_uuid) {
                let disconnect_message = `${nickname} 退出群聊`;
                broadcastSend("notification", disconnect_message, nickname);
                clients.splice(i, 1);
            }
        }
    }

    ws.on('message', function(message) {
        if(message.indexOf('/nick') === 0) {
            let nickname_array = message.split(' ');
            if(nickname_array.length >= 2) {
                let old_nickname = nickname;
                nickname = nickname_array[1];
                let nickname_message = `游客 ${old_nickname}  改名为 ${nickname}`;
                console.log(message)
                broadcastSend("nick_update", nickname_message, nickname);
            }
        } else {
            broadcastSend("message", message, nickname);
        }
    })

    ws.on('close', function() {
        closeSocket();
    })


})


let server = app.listen(80, function(){
    console.log('connect!!')
})
