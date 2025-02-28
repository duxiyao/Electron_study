const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onRefreshControlled: (callback) => ipcRenderer.on('refresh-controlled', callback),
    getUser: () => ipcRenderer.invoke('get-user'),
    applyController: () => ipcRenderer.invoke('apply-controller'),
    agreeTobeController: () => ipcRenderer.invoke('agree-controller'),
    rejectController: () => ipcRenderer.invoke('reject-controller'),
    saveUser: (user) => ipcRenderer.invoke('save-user',user),
    sendCtlCmd: (cmd) => ipcRenderer.invoke('send-ctl-cmd',cmd),
    clearUser: () => ipcRenderer.invoke('clear-user'),
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});