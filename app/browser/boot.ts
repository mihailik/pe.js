namespace browser {
  export async function boot() {
    const rootElement = getRootElement();

    rootElement.style.cssText = `
    background: white;
    color: black;
    font-family: Segoe UI, Tahoma, Verdana, Roboto, Helvetica, San Francisco, Sans Serif;
    font-size: 10pt;
    `;

    let docBody = document.body;
    if (!docBody) {
      docBody = document.createElement('body');
      if (!document.body)
        rootElement.appendChild(docBody);
    }

    docBody.innerHTML = `
    <h2> Loaded </h2>
    `
    
  }

  function getRootElement() {
    const bodyOrHead =
      document.body ||
      document.head ||
      document.getElementsByTagName('body')[0] ||
      document.getElementsByTagName('head')[0];
    
    return bodyOrHead && bodyOrHead.parentElement;
  }
}