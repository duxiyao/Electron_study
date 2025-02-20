// electron/main.js
const {
    app,
    BrowserWindow,
    ipcMain,
	Menu,
	MenuItem 
} = require('electron');
const path = require('path');

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
    console.log(path.join(__dirname, '../dist/index.html'));
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')); // 加载打包后的文件
    //mainWindow.webContents.openDevTools(); // 打开开发者工具

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 监听渲染进程的打开弹窗请求
    ipcMain.on('open-popup', () => {
        createPopup()
    });
	
	createMenu()
	//rightClickMenu()
}

let popupWindow;
function createPopup() {
    if (!popupWindow) {
        popupWindow = new BrowserWindow({
            width: 400,
            height: 300,
            parent: mainWindow, // 设置父窗口
            modal: true, // 设置为模态窗口
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        });

		popupWindow.loadFile(path.join(__dirname, 'popup.html'));

        popupWindow.on('closed', () => {
            popupWindow = null;
        });
    }
}

function createMenu(){
		// 定义菜单模板
	const template = [
	  {
		label: '菜单',
		submenu: [
		
		  {
			label: '打开共享屏幕',
			click: () => {
			  mainWindow.loadURL('https://pmgx.jiujinbangong.com/#/login');
			}
		  },
		  {
			label: '打开远程控制',
			click: () => {
			  console.log('open remote');
			}
		  },
		  { type: 'separator' }, // 分隔线
		  {
			label: '退出',
			role: 'quit' // 使用内置角色
		  }
		]
	  },/*
	  {
		label: '编辑',
		submenu: [
		  { role: 'undo' }, // 撤销
		  { role: 'redo' }, // 重做
		  { type: 'separator' },
		  { role: 'cut' }, // 剪切
		  { role: 'copy' }, // 复制
		  { role: 'paste' } // 粘贴
		]
	  },
	  {
		label: '帮助',
		submenu: [
		  {
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

function rightClickMenu(){
	// 创建上下文菜单
  const contextMenu = Menu.buildFromTemplate([
    { label: '复制', role: 'copy' },
    { label: '粘贴', role: 'paste' },
    { type: 'separator' },
    {
      label: '自定义操作',
      click: () => {
        console.log('自定义操作');
      }
    }
  ]);

  // 监听右键点击事件
  mainWindow.webContents.on('context-menu', (e) => {
    contextMenu.popup({ window: mainWindow });
  });

}


console.log('Electron version:', process.versions.electron);
console.log('Chromium version:', process.versions.chrome);
console.log('Node.js version:', process.versions.node);
console.log('V8 version:', process.versions.v8);

// Electron 初始化完成后创建窗口
app.on('ready', createWindow);

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
