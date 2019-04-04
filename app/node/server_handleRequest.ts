namespace node {

  export declare namespace server_handleRequest {
    type Options = {
      baseDir: string,
      server: import('http').Server,
      port: number,
      request: import('http').IncomingMessage,
      response: import('http').ServerResponse
    };
  }

  export async function server_handleRequest(options: server_handleRequest.Options) {
    
    const { baseDir, server, port, request, response } = options;

    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const URL = require('url') as typeof import('url');

    const requestURL = URL.parse(
      request.url,
      true /* parseQueryString */);

    const requestPath = requestURL.path.replace(/^[\.\/\\]+/, '').replace(/\[\.\/\\]*\//g, '/');
    if (requestPath === '' || requestPath === '/') {
      await server_handleRoot(options);
      return;
    }

    const resolvedPath = path.resolve(baseDir, requestPath);
    
    const fileContent = await readFileIfExistsAsync(resolvedPath);
    if (fileContent)
      return response.end(fileContent);

    response.statusCode = 404;
    response.end();
  }

  function readFileIfExistsAsync(fullPath: string) {
    const fs = require('fs') as typeof import('fs');
    return new Promise<Buffer | null>(resolve => {
      fs.readFile(fullPath, (error, buffer) => {
        if (buffer)
          resolve(buffer);
        else
          resolve(null);
      });
    });

  }

}