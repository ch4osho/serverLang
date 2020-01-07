const ws = require('ws')
let uuid = require('uuid')


let socketServer = ws.Server;

let wss = new socketServer({port: 8009})

let clients = []

function broadcastSend(type,msg,nickname){
    clients.forEach(function(client,index){
        if(client.ws.readyState === ws.OPEN) {
            client.ws.send(JSON.stringify({
                'type': type,
                'nickname': nickname,
                'message': msg
            }))
        }
    })
}

wss.on('connection',function(ws){
    let clientIndex = 0;
    let client_uuid = uuid.v4();
    let nickname = `anonymousUser${clientIndex++}`;
    clients.push({
        "id": client_uuid,
        "ws": ws,
        "nickname": nickname
    })


    console.log(`client ${client_uuid} connected`);

    function closeSocket(){
        for(let i = 0;i<clients.length;i++) {
            if(clients[i].id == client_uuid) {
                let disconnect_message = `${nickname} has disconnected`;
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
                let nickname_message = `Client ${old_nickname} change to ${nickname}`;
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
