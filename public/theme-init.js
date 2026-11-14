// Nkap: apply the saved light/dark theme before the first paint (no white flash).
;(function () {
  var pref = 'system'
  try {
    var saved = JSON.parse(localStorage.getItem('nkap-theme'))
    if (saved && saved.state && /^(system|light|dark)$/.test(saved.state.theme)) pref = saved.state.theme
  } catch (e) {}
  var dark = pref === 'dark' || (pref === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
})()
