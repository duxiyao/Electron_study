const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getUser: () => ipcRenderer.invoke('get-user'),
    saveUser: (user) => ipcRenderer.invoke('save-user',user),
    clearUser: () => ipcRenderer.invoke('clear-user'),
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});