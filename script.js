const lines = [
  {time:'14:02:11', tag:'sentry', cls:'tag-sentry', html:'new issue, <code>TypeError: Cannot read properties of null</code> in /api/user, line 42'},
  {time:'14:02:14', tag:'glue', cls:'tag-agent', html:'checking context: stack trace, recent changes, related commits'},
  {time:'14:02:19', tag:'glue', cls:'tag-agent', html:'found a related change, <code>a7f3c2d</code>, user serialization was changed'},
  {time:'14:02:20', tag:'note', cls:'tag-aside', html:'(likely cause: getUser() can return null when the user isn\u2019t found)'},
  {time:'14:03:02', tag:'github', cls:'tag-linear', html:'draft PR opened: "fix: handle null user"'},
  {time:'14:03:04', tag:'pr', cls:'tag-pr', html:'status: ready for review'},
];

const body = document.getElementById('term-body');
let delay = 200;
const stepDelay = 780;

lines.forEach((l, i) => {
  const el = document.createElement('div');
  el.className = 'term-line' + (l.tag === 'note' ? ' term-aside' : '');
  el.style.animationDelay = delay + 'ms';
  if (l.tag === 'note') {
    el.innerHTML = `<span class="term-text term-note">${l.html}</span>`;
  } else {
    el.innerHTML = `<span class="term-time">${l.time}</span><span class="tag ${l.cls}">${l.tag}</span><span class="term-text">${l.html}</span>`;
  }
  body.appendChild(el);
  delay += stepDelay;
});

const btn = document.createElement('div');
btn.className = 'term-btn';
btn.style.animationDelay = delay + 'ms';
btn.textContent = '✓ Review and approve';
body.appendChild(btn);

const cursor = document.createElement('span');
cursor.className = 'term-cursor';
setTimeout(() => body.appendChild(cursor), delay + 300);

// Waitlist form, backed by Formspree

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xnpqzerp';

const form = document.getElementById('waitlistForm');
const emailInput = document.getElementById('emailInput');
const formMsg = document.getElementById('formMsg');
const waitlistBtn = document.getElementById('waitlistBtn');
const waitlistSuccess = document.getElementById('waitlistSuccess');

function isValidEmail(v){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();

  if(!isValidEmail(email)){
    emailInput.classList.add('error');
    formMsg.textContent = 'Enter a valid email address.';
    formMsg.className = 'form-msg error';
    emailInput.focus();
    return;
  }

  emailInput.classList.remove('error');
  formMsg.textContent = '';
  waitlistBtn.disabled = true;
  waitlistBtn.textContent = 'Joining…';

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    });

    if (response.ok) {
      form.style.display = 'none';
      formMsg.textContent = '';
      waitlistSuccess.style.display = 'inline-flex';
    } else {
      const data = await response.json().catch(() => null);
      if (data && data.errors && data.errors.some(err => err.field === 'email' && err.code === 'DUPLICATE')) {
        form.style.display = 'none';
        waitlistSuccess.querySelector('span').textContent = "You're already on the list, we'll be in touch.";
        waitlistSuccess.style.display = 'inline-flex';
      } else {
        throw new Error('Formspree submission failed');
      }
    }
  } catch (err) {
    formMsg.textContent = 'Something went wrong, try again in a moment.';
    formMsg.className = 'form-msg error';
    waitlistBtn.disabled = false;
    waitlistBtn.textContent = 'Join the waitlist';
  }
});