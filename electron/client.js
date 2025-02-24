const io = require('socket.io-client');
const {
    mouse,
    keyboard,
    Point
} = require('@nut-tree/nut-js');
const readline = require('readline');

const socket = io('http://localhost:3000');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 指令队列与锁
let commandQueue = [];
let isProcessing = false;

// 选择角色
rl.question('选择角色 (1-被控端, 2-控制端): ', (role) => {
    if (role === '1') {
        setupControlledClient();
    } else if (role === '2') {
        setupControllerClient();
    } else {
        console.log('无效选项');
        process.exit();
    }
});

// 被控端逻辑
async function setupControlledClient() {
    const roomName = await askQuestion('输入你的房间名（被控端ID）: ');
    socket.emit('registerAsControlled', roomName);
    console.log('被控端已启动，等待指令...');

    // 监听指令并加入队列
    socket.on('executeCommand', (command) => {
        commandQueue.push(command);
        if (!isProcessing)
            processQueue();
    });
}

// 控制端逻辑
async function setupControllerClient() {
    const targetRoom = await askQuestion('输入目标房间名（被控端ID）: ');
    console.log('输入指令（格式：move x,y / click / type text）:');

    rl.on('line', (input) => {
        const [action, ...args] = input.split(' ');
        const command = {
            type: action,
            args
        };

        // 发送指令到服务端
        socket.emit('controlCommand', {
            targetRoom,
            command
        });
    });
}

// 指令队列处理（确保顺序执行）
async function processQueue() {
    isProcessing = true;
    while (commandQueue.length > 0) {
        const cmd = commandQueue.shift();
        await executeCommand(cmd);
    }
    isProcessing = false;
}

// 执行具体操作
async function executeCommand(cmd) {
    try {
        switch (cmd.type) {
        case 'move':
            const [x, y] = cmd.args[0].split(',').map(Number);
            await mouse.setPosition(new Point(x, y)); // 使用 Point 对象
            console.log(`执行: 鼠标移动到 (${x}, ${y})`);
            break;
        case 'click':
            await mouse.leftClick();
            console.log('执行: 鼠标左键点击');
            break;
        case 'type':
            await keyboard.type(cmd.args.join(' '));
            console.log(`执行: 输入文本 "${cmd.args.join(' ')}"`);
            break;
        default:
            console.log('未知指令:', cmd.type);
        }
    } catch (error) {
        console.error('执行失败:', error);
    }
}

// 工具函数
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim()));
    });
}