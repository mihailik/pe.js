(function() {

  //  early init logic

  var bootShadowDiv = document.createElement('div');
  bootShadowDiv.className = 'pe-boot-shadow';
  if ('textContent' in bootShadowDiv)
    bootShadowDiv.textContent = 'Loading...';
  else
    bootShadowDiv.innerText = 'Loading...';

  var dragSite = document.getElementById('dragSite');
  if (!dragSite) {
    alert('Incomplete application file, please update.')
    returnl
  }

  dragSite.innerHTML = '';
  dragSite.appendChild(bootShadowDiv);

})()
