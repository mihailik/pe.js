namespace node {

  export function boot() {
    bootAsync().then(
      () => {
        console.log('COMPLETED>');
      },
      error => {
        process.exit(error.message.charCodeAt(0));
      });
  }

  async function bootAsync() {
    const serverPromise = server(__dirname);

    const srv = await serverPromise;
    console.log('Running server on port ' + srv.port);

    await serverPromise;
  }

}