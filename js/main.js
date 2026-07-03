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

// ── Form submission handler (→ Cloudflare Worker → Power Automate) ──
function handleFormSubmit(form, successId){
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"], .submit-btn');
    var originalText = btn ? btn.textContent : '';
    if(btn){ btn.textContent = 'Sending…'; btn.disabled = true; }

    // Gather fields
    var fd = new FormData(form);
    var get = function(n){ return (fd.get(n) || '').toString().trim(); };

    // Combine first + last name into a single 'name'
    var fullName = (get('firstname') + ' ' + get('lastname')).trim();

    var payload = {
      name: fullName,
      email: get('email'),
      company: get('company'),
      jobtitle: get('jobtitle'),
      service: get('service'),
      message: get('message'),
      botcheck: get('botcheck')
    };

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(res){ return res.json().catch(function(){ return { success: res.ok }; }); })
    .then(function(data){
      if(data && data.success){
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

window.addEventListener('DOMContentLoaded', function(){
  var homeForm = document.getElementById('lead-form-home');
  if(homeForm) handleFormSubmit(homeForm, 'lead-form-home-success');
  var contactForm = document.getElementById('lead-form-contact');
  if(contactForm) handleFormSubmit(contactForm, 'lead-form-contact-success');
});
