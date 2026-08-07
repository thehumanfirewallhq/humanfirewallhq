(function () {
  'use strict';
  var theme = 'light';
  try {
    var saved = localStorage.getItem('humanfirewall-theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch (error) {
    // The dark theme is a safe default when storage is unavailable.
  }
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.toggle('light', theme === 'light');
  document.documentElement.classList.toggle('dark', theme !== 'light');
  document.documentElement.dataset.theme = theme;
})();
