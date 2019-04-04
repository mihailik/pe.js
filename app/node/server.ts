namespace node {
  export async function server(baseDir: string) {

    let basePort = 0;
    for (let i = 0; i < __filename.length; i++) {
      basePort += __filename.charCodeAt(i);
      basePort = basePort % 4000;

      const lowPromise = tryPort(6340 + basePort);
      const highPromise = tryPort(12891 + basePort);

      const srv = await lowPromise || await highPromise;
      if (srv)
        return srv;
    }

    function tryPort(port: number) {
      return new Promise<{ server: import('http').Server, port: number } | null>(resolve => {
        const http = require('http') as typeof import('http');
        const srv = http.createServer((request, response) => {
          server_handleRequest({ baseDir, server: srv, port, request, response });
        });

        srv.on('error', () => {
          resolve(null);
        });

        srv.on('listening', () => {
          resolve({ server: srv, port });
        });

        srv.listen(port);
      });
    }

  }
}
