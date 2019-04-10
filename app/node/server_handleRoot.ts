namespace node {

  let thisScriptPromise: Promise<Buffer> | undefined;

  export async function server_handleRoot(options: server_handleRequest.Options) {
    if (typeof thisScriptPromise !== 'string')
      thisScriptPromise = readThisScript();
    
    const thisScriptData = await thisScriptPromise;

    const wholeHTML = '<' + 'body' + '><' + 'script' + '>' + thisScriptData + '</' + 'script' + '></' + 'body' + '>';
    
      options.response.end(wholeHTML);

    async function readThisScript() {
      return new Promise<Buffer>((resolve, reject) => {
        const fs = require('fs') as typeof import('fs');
        fs.readFile(__filename, (error, data) => {
          if (error)
            reject(error);
          else
            resolve(data);
        });
      });
    }
  }
}