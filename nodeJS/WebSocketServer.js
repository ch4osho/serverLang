// npm install nodejs-websocket --save -g
// Chrome
// Firefox
// IE >= 10
// Sarafi >= 6
// Android >= 4.4
// iOS >= 8

var ws = require('nodejs-websocket')


var allUserData = new Array()

var server = ws.createServer(function (connect){
    console.log("New Connection")
    connect.on("text",function(str){
        console.log("收到:" + str)
        allUserData.push({
            'id':str,
            'ws': connect
        })
        connect.sendText(str.toUpperCase() + "!!!")
    })

    connect.on("close",function(code, reason){
        console.log("Connection closed")
        for(var i = 0 in allUserData){
            if(allUserData[i].ws == connect) {
                console.log(allUserData[i])
            }
        }
    })
}).listen(8001)