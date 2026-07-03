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

// ── Form submission handler (Web3Forms, AJAX — no page redirect) ──
function handleFormSubmit(form, successId){
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"], .submit-btn');
    var originalText = btn ? btn.textContent : '';
    if(btn){ btn.textContent = 'Sending…'; btn.disabled = true; }

    var formData = new FormData(form);
    var payload = {};
    formData.forEach(function(value, key){ payload[key] = value; });

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(res){ return res.json(); })
    .then(function(data){
      if(data.success){
        // Hide the form, show the success message
        form.style.display = 'none';
        var success = document.getElementById(successId);
        if(success) success.style.display = 'block';
      } else {
        if(btn){ btn.textContent = originalText; btn.disabled = false; }
        alert('Sorry, something went wrong. Please email us directly at sales@netability.sg');
      }
    })
    .catch(function(){
      if(btn){ btn.textContent = originalText; btn.disabled = false; }
      alert('Sorry, something went wrong. Please email us directly at sales@netability.sg');
    });
  });
}

// Wire up both forms if present on the page
window.addEventListener('DOMContentLoaded', function(){
  var homeForm = document.getElementById('lead-form-home');
  if(homeForm) handleFormSubmit(homeForm, 'lead-form-home-success');
  var contactForm = document.getElementById('lead-form-contact');
  if(contactForm) handleFormSubmit(contactForm, 'lead-form-contact-success');
});
