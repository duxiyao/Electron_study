// electron/main.js
const {
    app,
    BrowserWindow,
    ipcMain,
    Menu,
    MenuItem
} = require('electron');
const io = require('socket.io-client');
const path = require('path');
const {
    mouse,
    keyboard,
    Point,
	Button,
	Key	
} = require('@nut-tree/nut-js');
let store;

async function initializeStore() {
    const electronStore = await import('electron-store');
    store = new electronStore.default();
}

initializeStore().then(() => {
    // 现在您可以使用 store 了
    //console.log(store.get('user'));
    store.clear()
    createWindow()
});

let mainWindow;

function createWindow() {
    // 创建浏览器窗口
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true, // 允许在渲染进程中使用 Node.js
            contextIsolation: true, // 禁用上下文隔离
            enableRemoteModule: false,
			webPreferences: {
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', // 自定义 UA
			},
			
        },
    });

    //console.log(process.env.NODE_ENV)
    // 加载 Vue 开发服务器或打包后的文件
    /*
    if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080'); // Vue 开发服务器地址
    mainWindow.webContents.openDevTools(); // 打开开发者工具
    } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')); // 加载打包后的文件
    }*/

    //mainWindow.loadURL('http://localhost:8080'); // Vue 开发服务器地址

    //console.log(path.join(__dirname, '../dist/index.html'));
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')); // 加载打包后的文件
    //mainWindow.webContents.openDevTools(); // 打开开发者工具
    //mainWindow.loadURL('https://pmgx.jiujinbangong.com/');
    //mainWindow.loadFile(path.join(__dirname, './ctlpanel.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 监听渲染进程的打开弹窗请求
    ipcMain.on('open-popup', () => {});
    ipcMain.on('close-window', (event, id) => {
        /*
        if (popupWindow && !popupWindow.isDestroyed()) {
        popupWindow.close(); // 关闭指定窗口
        delete popupWindow; // 从对象中移除窗口
        }*/
    });
    createMenu()
    //rightClickMenu()


    // IPC 监听器：获取用户数据
    ipcMain.handle('get-user', async() => {
        const user = store.get('user');
        return user;
    });

    // IPC 监听器：保存用户数据
    ipcMain.handle('save-user', async(event, user) => {
        store.set('user', JSON.parse(user));
        console.log(`user=${user}`);
        createSocketClient();
        //popupWindow.close();
        return true;
    });
    ipcMain.handle('clear-user', async(event, name) => {
        store.clear()
        return true;
    });
	
	
    ipcMain.handle('apply-controller', async() => {
		socket.emit('applyTobeController', ctlUn);
        return true;
    });
    ipcMain.handle('agree-controller', async() => {
		socket.emit('agreeTobeController', targetApplyCtler);
		applyTobeControllerWindow.close();
        return true;
    });
    ipcMain.handle('reject-controller', async() => {
		socket.emit('rejectController', targetApplyCtler);
		applyTobeControllerWindow.close();
        return true;
    });

    ipcMain.handle('send-ctl-cmd', async(event, cmd) => {		
		// 发送指令到服务端
        //console.log(`on send-ctl-cmd  ${JSON.stringify(cmd)} `);
		socket.emit('execcmd', `${ctlUn},${cmd}`);
        return true;
    });
   // if (!store.get('user') || !store.get('user').name)
   //     createPopup()
	
    //createApplyTobeControllerPopup('123')
}

let popupWindow;
function createPopup() {
    if (!popupWindow) {
        popupWindow = new BrowserWindow({
            width: 400,
            height: 300,
            resizable: false, // 禁止调整窗口大小
            parent: mainWindow, // 设置父窗口
            modal: true, // 设置为模态窗口
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: true
            }
        });
		popupWindow.setMenuBarVisibility(false)
        //popupWindow.loadFile(path.join(__dirname, 'popup.html'));
        popupWindow.loadFile(path.join(__dirname, '../dist/index.html'));

        popupWindow.on('closed', () => {
            popupWindow = null;
        });
        //popupWindow.webContents.openDevTools();
    }
}

function createMenu() {
    // 定义菜单模板
    const template = [{
            label: '菜单',
            submenu: [
			/*{
                    label: '打开共享屏幕',
                    click: () => {
                        mainWindow.loadURL('https://pmgx.jiujinbangong.com/#/login');
                    }
                },*/ {
                    label: '设置',
                    click: () => {
                        //createPopup()
						mainWindow.webContents.openDevTools();
                    }
                }, {
                    type: 'separator'
                }, // 分隔线
                {
                    label: '退出',
                    role: 'quit' // 使用内置角色
                }
            ]
        }, /*{
        label: '编辑',
        submenu: [{ role: 'undo' }, // 撤销{ role: 'redo' }, // 重做{ type: 'separator' },{ role: 'cut' }, // 剪切{ role: 'copy' }, // 复制{ role: 'paste' } // 粘贴
        ]
        },{
        label: '帮助',
        submenu: [{
        label: '关于',
        click: () => {
        console.log('关于应用程序');
        }
        }
        ]
        }*/
    ];

    // 创建菜单
    const menu = Menu.buildFromTemplate(template);

    // 设置应用程序菜单
    Menu.setApplicationMenu(menu);
}

function rightClickMenu() {
    // 创建上下文菜单
    const contextMenu = Menu.buildFromTemplate([{
                    label: '复制',
                    role: 'copy'
                }, {
                    label: '粘贴',
                    role: 'paste'
                }, {
                    type: 'separator'
                }, {
                    label: '自定义操作',
                    click: () => {
                        console.log('自定义操作');
                        console.log('----------------');
						mouse.pressButton(Button.LEFT);
						mouse.releaseButton(Button.LEFT);
                    }
                }
            ]);

    // 监听右键点击事件
    mainWindow.webContents.on('context-menu', (e) => {
        contextMenu.popup({
            window: mainWindow
        });
    });

}

console.log('Electron version:', process.versions.electron);
console.log('Chromium version:', process.versions.chrome);
console.log('Node.js version:', process.versions.node);
console.log('V8 version:', process.versions.v8);

// Electron 初始化完成后创建窗口
app.on('ready', initializeStore);

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        initializeStore();
    }
});

/////////////applyTobeController
let applyTobeControllerWindow;
function createApplyTobeControllerPopup(userName) {
    if (!applyTobeControllerWindow) {
        applyTobeControllerWindow = new BrowserWindow({
            width: 400,
            height: 300,
            parent: mainWindow, // 设置父窗口
            modal: true, // 设置为模态窗口
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: true
            }
        });
		applyTobeControllerWindow.setMenuBarVisibility(false)
        applyTobeControllerWindow.loadFile(path.join(__dirname, 'applytoctl.html'), {
			query: { un: userName }, // 添加查询参数
		});
        
        applyTobeControllerWindow.on('closed', () => {
            applyTobeControllerWindow = null;
        });
        //applyTobeControllerWindow.webContents.openDevTools();
    }
}


///////////////// controll panel
let controllPanelWindow;
function createControllPopup(userName) {
    if (!controllPanelWindow) {
        controllPanelWindow = new BrowserWindow({
            width: 400,
            height: 300,
            parent: mainWindow, // 设置父窗口
            modal: true, // 设置为模态窗口
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: true
            }
        });
		controllPanelWindow.setMenuBarVisibility(false)
        controllPanelWindow.loadFile(path.join(__dirname, 'ctlpanel.html'), {
			query: { un: userName }, // 添加查询参数
		});
        
        controllPanelWindow.on('closed', () => {
            controllPanelWindow = null;
        });
        //controllPanelWindow.webContents.openDevTools();
    }
}
////////////////socket client

let ctlUn = ''
let targetApplyCtler = ''
let socket;

function createSocketClient() {	
	
    let user = store.get('user');
	//let turl='http://localhost:3000'
	let turl='http://192.168.2.84:3000'
    socket = io(turl, {
        query: {
            userName: user.name,
            roomName: '000000'
        }
    });
    if (user.isControlled) {
        socket.emit('registerAsControlled');
    }

    socket.on('registerAsControlled', (userName) => {
        console.log(`on registerAsControlled  ${userName} `);
        if (user.name != userName) {
            //记录控制端
            ctlUn = userName
			mainWindow.webContents.send('refresh-controlled',userName);
        }
        console.log(`registerAsControlled ctlUn=${ctlUn} `);
    });
    socket.on('unRegisterControlled', (uname) => {
        console.log(`on registerAsControlled  ${uname} `);
        if (uname === ctlUn) {
            ctlUn = ''
			mainWindow.webContents.send('refresh-controlled','');
        }
        console.log(`unRegisterControlled ctlUn=${ctlUn} `);

    }); 
    socket.on('applyTobeController', (targetUserName) => {
		createApplyTobeControllerPopup(targetUserName)
		targetApplyCtler = targetUserName
    });
    socket.on('agreeTobeController', (targetUserName) => {
		//createControllPopup(targetUserName)
		mainWindow.loadFile(path.join(__dirname, './ctlpanel.html'));
    });
    socket.on('rejectController', (targetUserName) => {
    });
	

    // 监听指令并加入队列
    socket.on('execcmd', (command) => {
        console.log(`on execcmd  ${command} `);
        commandQueue.push(JSON.parse(command));
        if (!isProcessing)
            processQueue();
    });
}


let commandQueue = [];
let isProcessing = false;
// 指令队列处理（确保顺序执行）
async function processQueue() {
    isProcessing = true;
    while (commandQueue.length > 0) {
        const cmd = commandQueue.shift();
        await executeCommand(cmd);
    }
    isProcessing = false;
}

const keyMap = new Map([
  // 字母 A-Z（大小写）
  ['a', Key.A], ['A', Key.A],
  ['b', Key.B], ['B', Key.B],
  ['c', Key.C], ['C', Key.C],
  ['d', Key.D], ['D', Key.D],
  ['e', Key.E], ['E', Key.E],
  ['f', Key.F], ['F', Key.F],
  ['g', Key.G], ['G', Key.G],
  ['h', Key.H], ['H', Key.H],
  ['i', Key.I], ['I', Key.I],
  ['j', Key.J], ['J', Key.J],
  ['k', Key.K], ['K', Key.K],
  ['l', Key.L], ['L', Key.L],
  ['m', Key.M], ['M', Key.M],
  ['n', Key.N], ['N', Key.N],
  ['o', Key.O], ['O', Key.O],
  ['p', Key.P], ['P', Key.P],
  ['q', Key.Q], ['Q', Key.Q],
  ['r', Key.R], ['R', Key.R],
  ['s', Key.S], ['S', Key.S],
  ['t', Key.T], ['T', Key.T],
  ['u', Key.U], ['U', Key.U],
  ['v', Key.V], ['V', Key.V],
  ['w', Key.W], ['W', Key.W],
  ['x', Key.X], ['X', Key.X],
  ['y', Key.Y], ['Y', Key.Y],
  ['z', Key.Z], ['Z', Key.Z],

  // 数字 0-9 及符号
  ['0', Key._0], [')', Key._0],        // Shift+0
  ['1', Key._1], ['!', Key._1],
  ['2', Key._2], ['@', Key._2],
  ['3', Key._3], ['#', Key._3],
  ['4', Key._4], ['$', Key._4],
  ['5', Key._5], ['%', Key._5],
  ['6', Key._6], ['^', Key._6],
  ['7', Key._7], ['&', Key._7],
  ['8', Key._8], ['*', Key._8],
  ['9', Key._9], ['(', Key._9],

  // 功能键
  ['F1', Key.F1], ['F2', Key.F2],
  ['F3', Key.F3], ['F4', Key.F4],
  ['F5', Key.F5], ['F6', Key.F6],
  ['F7', Key.F7], ['F8', Key.F8],
  ['F9', Key.F9], ['F10', Key.F10],
  ['F11', Key.F11], ['F12', Key.F12],

  // 方向键
  ['ArrowUp', Key.Up], ['Up', Key.Up],
  ['ArrowDown', Key.Down], ['Down', Key.Down],
  ['ArrowLeft', Key.Left], ['Left', Key.Left],
  ['ArrowRight', Key.Right], ['Right', Key.Right],

  // 常用操作键
  ['Enter', Key.Enter], ['\n', Key.Enter],    // 回车
  ['Space', Key.Space], [' ', Key.Space],     // 空格
  ['Tab', Key.Tab], ['\t', Key.Tab],          // Tab
  ['Backspace', Key.Backspace], 
  ['Delete', Key.Delete], ['Del', Key.Delete],
  ['Escape', Key.Escape], ['Esc', Key.Escape],

  // 控制键（左右区分）
  ['Control', Key.LeftControl], ['Ctrl', Key.LeftControl],
  ['LeftControl', Key.LeftControl], 
  ['RightControl', Key.RightControl],
  ['Shift', Key.LeftShift], 
  ['LeftShift', Key.LeftShift],
  ['RightShift', Key.RightShift],
  ['Alt', Key.LeftAlt], 
  ['LeftAlt', Key.LeftAlt],
  ['RightAlt', Key.RightAlt],
  ['Meta', Key.LeftSuper], ['Super', Key.LeftSuper], // Windows/Mac键
  ['LeftSuper', Key.LeftSuper],
  ['RightSuper', Key.RightSuper],

  // 符号键
  ['`', Key.Backquote], ['~', Key.Backquote],  // Shift+`
  ['-', Key.Minus], ['_', Key.Minus],          // Shift+-
  ['=', Key.Equal], ['+', Key.Equal],
  ['[', Key.LeftBracket], ['{', Key.LeftBracket],
  [']', Key.RightBracket], ['}', Key.RightBracket],
  ['\\', Key.Backslash], ['|', Key.Backslash],
  [';', Key.Semicolon], [':', Key.Semicolon],
  ["'", Key.Quote], ['"', Key.Quote],
  [',', Key.Comma], ['<', Key.Comma],
  ['.', Key.Period], ['>', Key.Period],
  ['/', Key.Slash], ['?', Key.Slash]
]);

const keyPressed=[]
// 执行具体操作
async function executeCommand(cmd) {
    try {
        switch (cmd.type) {
        case 'move':
            await mouse.setPosition(new Point(cmd.x, cmd.y)); // 使用 Point 对象
            break;
        case 'click':
            await mouse.setPosition(new Point(cmd.x, cmd.y));
            await mouse.leftClick();
            console.log('leftClick');
            break;
        case 'pressButton':
            await mouse.setPosition(new Point(cmd.x, cmd.y));
            await mouse.pressButton(Button.LEFT);
            console.log('pressButton');
            break;
        case 'releaseButton':
            await mouse.setPosition(new Point(cmd.x, cmd.y));
            await mouse.releaseButton(Button.LEFT);
            console.log('releaseButton');
            break;
        case 'rightClickMouse':
            await mouse.setPosition(new Point(cmd.x, cmd.y));
            await mouse.rightClick();
            console.log('rightClick');
            break;
        case 'dbclick':
            await mouse.setPosition(new Point(cmd.x, cmd.y));
            await mouse.leftClick();
            await mouse.leftClick();
            console.log('dbclick');
            break;
        case 'pressKey':
			keyPressed.push(cmd.k)
			keyboard.pressKey(keyMap.get(cmd.k));
            break;
        case 'releaseKey':
			let targetKey=keyMap.get(cmd.k)
			
			let pressedIndex=keyPressed.indexOf(cmd.k)
			if(pressedIndex!==-1){
				keyPressed.splice(pressedIndex,1)
			}else{				
				keyboard.pressKey(targetKey);
			}
			keyboard.releaseKey(targetKey);
            break;
        default:
            console.log('none cmd:', cmd.type);
        }
    } catch (error) {
        console.error('error:', error);
    }
}
