const lines = [
  {tag:'SENTRY', cls:'tag-sentry', html:'Alert: <code>TypeError</code> in <b>authMiddleware.ts</b> — 14 occurrences / 3 min'},
  {tag:'GLUE', cls:'tag-agent', html:'Root cause found: introduced by <code>PR #342</code>, merged 2 hrs ago'},
  {tag:'LINEAR', cls:'tag-linear', html:'Ticket created and linked: <code>ENG-892</code>'},
  {tag:'GLUE', cls:'tag-agent', html:'Reproduced locally, regression test written'},
  {tag:'PR', cls:'tag-pr', html:'Draft opened: <code>#345 fix(auth): null check on session token</code>'},
];

const body = document.getElementById('term-body');
let delay = 200;
const stepDelay = 850;

lines.forEach((l, i) => {
  const el = document.createElement('div');
  el.className = 'term-line';
  el.style.animationDelay = delay + 'ms';
  el.innerHTML = `<span class="tag ${l.cls}">${l.tag}</span><span class="term-text">${l.html}</span>`;
  body.appendChild(el);
  delay += stepDelay;
});

const btn = document.createElement('div');
btn.className = 'term-btn';
btn.style.animationDelay = delay + 'ms';
btn.textContent = '✓ Approve & Deploy';
body.appendChild(btn);

const cursor = document.createElement('span');
cursor.className = 'term-cursor';
setTimeout(() => body.appendChild(cursor), delay + 300);

// Waitlist form — backed by Supabase
// 1. Create a free project at supabase.com
// 2. Run supabase-setup.sql in the SQL Editor to create the `waitlist` table
// 3. Paste your Project URL + anon/publishable key below (Settings → API)
const SUPABASE_URL = 'https://upbuidzwlsydbppplahb.supabase.co';   // e.g. https://abcdefgh.supabase.co
const SUPABASE_ANON_KEY = 'sb_publishable_f9tpYz6tgkGnkGte178eWw_d64ooS0X';

let supabaseClient = null;
if (SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

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
    if (!supabaseClient) {
      // Falls back to a simulated request if credentials haven't been added yet,
      // so the form still demos correctly out of the box.
      await new Promise(r => setTimeout(r, 700));
    } else {
      const { error } = await supabaseClient.from('waitlist').insert({ email });
      if (error) {
        if (error.code === '23505') { // unique_violation — email already on the list
          form.style.display = 'none';
          waitlistSuccess.querySelector('span').textContent = "You're already on the list — we'll be in touch.";
          waitlistSuccess.style.display = 'inline-flex';
          return;
        }
        throw error;
      }
    }
    form.style.display = 'none';
    formMsg.textContent = '';
    waitlistSuccess.style.display = 'inline-flex';
  } catch (err) {
    formMsg.textContent = 'Something went wrong — try again in a moment.';
    formMsg.className = 'form-msg error';
    waitlistBtn.disabled = false;
    waitlistBtn.textContent = 'Join waitlist →';
  }
});