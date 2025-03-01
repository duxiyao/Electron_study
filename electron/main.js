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
			switch(cmd.k){
				case 'Control':
					keyboard.pressKey(Key.LeftControl);
				break;
				case 'Shift':
					keyboard.pressKey(Key.LeftShift);
				break;
				case 'Alt':
					keyboard.pressKey(Key.LeftAlt);
				break;
				case 'Meta':
					keyboard.pressKey(Key.LeftWin);
				break;
				case 'CapsLock':
					keyboard.pressKey(Key.CapsLock);
				break;
				case 'Tab':
					keyboard.pressKey(Key.Tab);
				break;
				case 'Escape':
					keyboard.pressKey(Key.Escape);
				break;
				default:
					await keyboard.pressKey(cmd.k);
			}
            break;
        case 'releaseKey':
			switch(cmd.k){
				case 'Control':
					keyboard.releaseKey(Key.LeftControl);
				break;
				case 'Shift':
					keyboard.releaseKey(Key.LeftShift);
				break;
				case 'Alt':
					keyboard.releaseKey(Key.LeftAlt);
				break;
				case 'Meta':
					keyboard.releaseKey(Key.LeftWin);
				break;
				case 'CapsLock':
					keyboard.releaseKey(Key.CapsLock);
				break;
				case 'Tab':
					keyboard.releaseKey(Key.Tab);
				break;
				case 'Escape':
					keyboard.releaseKey(Key.Escape);
				break;
				default:
					await keyboard.releaseKey(cmd.k);
			}
            break;
        default:
            console.log('none cmd:', cmd.type);
        }
    } catch (error) {
        console.error('error:', error);
    }
}
