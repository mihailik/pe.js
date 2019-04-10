if (typeof process !== 'undefined' && process && typeof process.exit === 'function') {
  node.boot();
}
else if (typeof window !== 'undefined' && typeof window.alert === 'function') {
  browser.boot();
}
