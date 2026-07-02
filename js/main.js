// Netability Singapore — shared JS

// Mobile menu toggle
function toggleMenu(){
  var m = document.getElementById('mobile-menu');
  if(m) m.classList.toggle('open');
}

// Always start at the top of the page on load/refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('load', function(){
  window.scrollTo(0, 0);
});
