
const {
  app,
  BrowserWindow,
  protocol,
  net
} = require('electron');

const path = require('node:path');
const { pathToFileURL } = require('node:url');

const APP_SCHEME = 'app';
const APP_HOST = 'slabikar';

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true
    }
  }
]);

function registerAppProtocol() {
  const appRoot = path.resolve(
    __dirname,
    '../dist/slabikar/browser'
  );

  protocol.handle(APP_SCHEME, request => {
    const url = new URL(request.url);

    if (url.hostname !== APP_HOST) {
      return new Response('Unknown host', {
        status: 404
      });
    }

    let relativePath;

    try {
      relativePath = decodeURIComponent(
        url.pathname
      ).replace(/^\/+/, '');
    } catch {
      return new Response('Invalid path', {
        status: 400
      });
    }

    if (!relativePath) {
      relativePath = 'index.html';
    }

    const filePath = path.resolve(
      appRoot,
      relativePath
    );

    const relative = path.relative(
      appRoot,
      filePath
    );

    if (
      relative === '..' ||
      relative.startsWith('..' + path.sep) ||
      path.isAbsolute(relative)
    ) {
      return new Response('Forbidden', {
        status: 403
      });
    }

    return net.fetch(
      pathToFileURL(filePath).toString()
    );
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Slabikář',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  win.loadURL('app://slabikar/');
}

app.whenReady().then(() => {
  registerAppProtocol();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


