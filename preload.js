const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Send messages to main process
  send: (channel, data) => {
    const validChannels = ['menu-new-expense', 'menu-preferences'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Receive messages from main process
  receive: (channel, func) => {
    const validChannels = ['menu-new-expense', 'menu-preferences'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    const validChannels = ['menu-new-expense', 'menu-preferences'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },

  // Platform information
  platform: process.platform,
  
  // File operations (if needed in the future)
  fileOperations: {
    // Add file operations here if needed
  }
});