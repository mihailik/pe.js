module pe.app.boot {

  export function reportProgress() {
    // no-op, hiding the early report progress function
  }

  export function bootingComplete() {
    set(status, 'Complete!');
    set(progress, {
      width: '100%',
      background: 'green'
    });

    setTimeout(() => {
      var layout = new app.layout.ApplicationLayout(uisite);
    }, 100);
  }

}