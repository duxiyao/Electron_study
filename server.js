const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// 房间管理：{ roomName: Set<socketId> }
const rooms = new Map();
// 用户管理：{ userName: Set<socketId> }
const users = new Map();
// 房间被控端管理：{ roomName: userName }
const roomsCtl = new Map();

io.on('connection', (socket) => {
    const roomName = socket.handshake.query.roomName;
    socket.join(roomName);
    if (!rooms.has(roomName)) {
        rooms.set(roomName, new Set());
    }
    if (roomsCtl.has(roomName)&&roomsCtl.get(roomName)) {
        socket.emit('registerAsControlled', roomsCtl.get(roomName));
    }
    rooms.get(roomName).add(socket.id);
    console.log(`${socket.id} 加入房间 ${roomName}`);
    const userName = socket.handshake.query.userName;
    users.set(userName, socket);
    console.log(`${userName} 加入房间 ${roomName}`);

    // 被控端加入房间（房间名唯一）
    socket.on('registerAsControlled', () => {
		roomsCtl.set(roomName,userName)
        console.log(`[被控端] ${userName} registerAsControlled ${roomName}  `);
        io.to(roomName).emit('registerAsControlled', userName); // 广播给所有人被控端userName

    });

    socket.on('applyTobeController', (targetUserName) => {
		if(users.has(targetUserName))
			users.get(targetUserName).emit('applyTobeController', userName);
    });
    socket.on('agreeTobeController', (targetUserName) => {
		if(users.has(targetUserName))
			users.get(targetUserName).emit('agreeTobeController', userName);
    });
    socket.on('rejectController', (targetUserName) => {
		if(users.has(targetUserName))
			users.get(targetUserName).emit('rejectController', userName);
    });
    socket.on('execcmd', (p) => {
		//console.log(`cmd->${p}  `);
		var i=p.indexOf(',')
		var u=p.substring(0,i);
		var c=p.substring(i+1);
		if(users.has(u))
			users.get(u).emit('execcmd', c);
    });

    // 清理断开连接的客户端
    socket.on('disconnect', () => {
        rooms.forEach((clients, roomName) => {
            if (clients.has(socket.id)) {
                clients.delete(socket.id);
                console.log(`客户端 ${socket.id} 离开房间 ${roomName}`);
            }
        });
		
		if(roomsCtl.get(roomName)===userName){
			roomsCtl.delete(roomName)
            console.log(`[被控端] ${userName} 离开房间 ${roomName}`);			
		}
    });
	
    // 控制端发送指令到目标房间
    socket.on('controlCommand', (data) => {
        const {
            targetUserName,
            command
        } = data;
        if (users.has(targetUserName)) {
			users.get(targetUserName).emit('executeCommand', command);
        }
    });
});

http.listen(3000, () => {
    console.log('服务器运行在 http://localhost:3000');
});