if (isNotSupported()) {
  var regex = /\/?(de|en|fr|it|rm)/;
  if (regex.exec(window.location.pathname) !== null) {
    var lang = regex.exec(window.location.pathname)[0]
    lang = lang.replace('/', '')
    window.location.href = window.location.protocol + '//' + window.location.host + '/assets/old-browser/' + 'browser_not_supported.' + lang + '.html'
  } else {
    // for local testing without language redirect
    window.location.href = window.location.protocol + '//' + window.location.host + '/assets/old-browser/' + 'browser_not_supported.en.html'
  }
}
function isNotSupported() {
  // return true
  // checks for <= ie11 and edge non chromium -> Edge chromium is Edg
  return window.navigator.userAgent.match(/(MSIE|Trident|Edge)/);
}
