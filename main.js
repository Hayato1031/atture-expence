const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Expan - 経費・収入管理',
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Temporarily disabled to allow Tesseract.js to load language files
      preload: path.join(__dirname, 'preload.js')
    },
    show: false // Don't show until ready
  });

  // Load the app
  const isDev = process.env.ELECTRON_START_URL;
  const startUrl = isDev ? process.env.ELECTRON_START_URL : `file://${path.join(__dirname, 'build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create app menu
function createMenu() {
  const template = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '新規経費',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-expense');
          }
        },
        { type: 'separator' },
        {
          label: '終了',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '編集',
      submenu: [
        { label: '元に戻す', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'やり直し', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '切り取り', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'コピー', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '貼り付け', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '表示',
      submenu: [
        { label: '再読み込み', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '強制再読み込み', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '開発者ツール', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '実際のサイズ', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '拡大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '縮小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'フルスクリーン', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'ウィンドウ',
      submenu: [
        { label: '最小化', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: '閉じる', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: `${app.getName()}について`, role: 'about' },
        { type: 'separator' },
        { label: '環境設定', accelerator: 'Cmd+,', click: () => { mainWindow.webContents.send('menu-preferences'); } },
        { type: 'separator' },
        { label: 'サービス', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: `${app.getName()}を隠す`, accelerator: 'Cmd+H', role: 'hide' },
        { label: 'その他を隠す', accelerator: 'Cmd+Shift+H', role: 'hideothers' },
        { label: 'すべてを表示', role: 'unhide' },
        { type: 'separator' },
        { label: '終了', accelerator: 'Cmd+Q', click: () => { app.quit(); } }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});