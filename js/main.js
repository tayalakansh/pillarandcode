// Pillar & Code — shared site behavior. No build step, no dependencies.
(function header() {
  var el = document.querySelector('.site-header');
  if (!el) return;
  var onScroll = function () {
    el.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

(function mobileNav() {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

(function pillGroups() {
  document.querySelectorAll('[data-pill-group]').forEach(function (group) {
    var multi = group.dataset.pillGroup === 'multi';
    var buttons = Array.prototype.slice.call(group.querySelectorAll('.btn-pill'));
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (multi) {
          var pressed = btn.getAttribute('aria-pressed') === 'true';
          btn.setAttribute('aria-pressed', String(!pressed));
        } else {
          buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
          btn.setAttribute('aria-pressed', 'true');
        }
      });
    });
  });
})();

(function contactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;
  var successState = document.getElementById('formSuccess');
  var hint = document.getElementById('formHint');
  var submitBtn = form.querySelector('button[type="submit"]');
  var required = ['name', 'email'];
  var ENQUIRY_URL = 'https://casebench.in/pillarandcodeenquiry';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);

    var kindBtn = form.querySelector('[data-pill-group="single"] .btn-pill[aria-pressed="true"]');
    if (kindBtn) data.append('kind', kindBtn.textContent.trim());
    form.querySelectorAll('[data-pill-group="multi"] .btn-pill[aria-pressed="true"]').forEach(function (btn) {
      data.append('needs', btn.textContent.trim());
    });

    var ok = required.every(function (k) { return (data.get(k) || '').trim().length > 1; });
    if (!ok) {
      hint.textContent = 'Please give a name and an email address we can reply to.';
      return;
    }

    submitBtn.disabled = true;
    hint.textContent = 'Sending…';

    fetch(ENQUIRY_URL, { method: 'POST', body: data })
      .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
      .then(function (result) {
        if (!result.ok || result.body.status !== 'success') {
          throw new Error((result.body && result.body.message) || 'Something went wrong.');
        }
        form.hidden = true;
        successState.hidden = false;
        successState.focus();
      })
      .catch(function (err) {
        hint.textContent = err.message || "Couldn't send that — please email contact@pillarandcode.com directly.";
        submitBtn.disabled = false;
      });
  });
})();
