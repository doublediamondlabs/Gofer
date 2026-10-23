const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('goferDesktop',{setQuitMode:mode=>ipcRenderer.invoke('quit-mode',mode),savePDF:name=>ipcRenderer.invoke('save-pdf',name),quit:()=>ipcRenderer.invoke('quit'),chooseFolder:()=>ipcRenderer.invoke('folder'),print:()=>ipcRenderer.invoke('print')});
