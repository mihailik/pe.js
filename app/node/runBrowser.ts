namespace node {

  export async function runBrowser(url: string) {
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const child_process = require('child_process') as typeof import('child_process');

    const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    if (await existAsync(chromePath)) {
      const chromeProcess = child_process.spawn(
        '"' + chromePath + '" --app=' + url,
        {
          shell: false
        });

      await new Promise<void>((resolve, reject) => {
        chromeProcess.on('error', error => {
          reject(error);
        });
      });
    }
  }

  function existAsync(fullPath: string) {
    return new Promise<boolean>(resolve => {
      const fs = require('fs') as typeof import('fs');
      fs.exists(fullPath, result => {
        resolve(result);
      });
    })
  }
}