import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script loaded');

// Expose protected methods that allow the renderer process to use
// specific electron APIs without exposing the entire object
console.log('Exposing electron interface');
contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      send: (channel: string, data: any) => {
        console.log('IPC send:', channel, data);
        ipcRenderer.send(channel, data);
      },
      on: (channel: string, func: (...args: any[]) => void) => {
        console.log('IPC on:', channel);
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      },
      removeListener: (channel: string, func: (...args: any[]) => void) => {
        console.log('IPC removeListener:', channel);
        ipcRenderer.removeListener(channel, func);
      },
      invoke: (channel: string, ...args: any[]) => {
        console.log('IPC invoke:', channel, args);
        return ipcRenderer.invoke(channel, ...args);
      }
    }
  }
); 