const BOOKING_URLS = {
  "15": "", // Add your real 15-minute booking URL
  "30": ""  // Add your real 30-minute booking URL
};

function toggleMenu(){
  const nav = document.querySelector('nav');
  const btn = document.querySelector('.menu-toggle');
  const open = nav.classList.toggle('menu-open');
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('nav').classList.remove('menu-open');
    const btn = document.querySelector('.menu-toggle');
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Open menu');
  });
});

function openBooking(minutes){
  const url = BOOKING_URLS[minutes];
  if(!url){
    const status = document.getElementById('formStatus');
    status.className = 'form-status error';
    status.textContent = `Booking is ready to connect. Add your ${minutes}-minute calendar URL in BOOKING_URLS in index.html.`;
    document.getElementById('requestForm').scrollIntoView({behavior:'smooth', block:'center'});
    return;
  }
  window.open(url, '_blank', 'noopener');
}

const purposeMap = {
  'Financial Solution':'Financial Solution',
  'Work with Vikas':'Work with Vikas',
  'Business Opportunity':'Business Opportunity',
  'Collaboration':'Collaboration',
  'Join the Network':'Join the Network',
  'Meet Vikas':'Meet Vikas'
};

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    const heading = card.querySelector('h3')?.innerText.replace(/\s+/g,' ').trim() || '';
    let purpose = Object.keys(purposeMap).find(k => heading.includes(k));
    if(!purpose){
      if(heading.includes('Financial')) purpose='Financial Solution';
      else if(heading.includes('Work with')) purpose='Work with Vikas';
      else if(heading.includes('Business')) purpose='Business Opportunity';
      else if(heading.includes('Collaborate')) purpose='Collaboration';
      else if(heading.includes('Network')) purpose='Join the Network';
      else if(heading.includes('Meet')) purpose='Meet Vikas';
    }
    if(purpose){
      const select = document.querySelector('select[name="purpose"]');
      select.value = purpose;
      document.getElementById('requestForm').scrollIntoView({behavior:'smooth', block:'center'});
      select.focus();
    }
  });
});

document.getElementById('requestForm').addEventListener('submit', async function(e){
  e.preventDefault();
  const form = e.currentTarget;
  const button = document.getElementById('submitRequest');
  const status = document.getElementById('formStatus');

  if(!form.checkValidity()){
    form.reportValidity();
    status.className = 'form-status error';
    status.textContent = 'Please complete all required fields.';
    return;
  }

  button.classList.add('is-loading');
  button.textContent = 'Sending…';
  status.className = 'form-status';
  status.textContent = '';

  // Frontend-only demo behavior. Replace this section with your API/form endpoint.
  await new Promise(resolve => setTimeout(resolve, 700));

  button.classList.remove('is-loading');
  button.textContent = '✓ Request Ready';
  status.className = 'form-status success';
  status.textContent = 'Your request has been validated. Connect this form to your backend/form service to receive submissions.';
  form.reset();

  setTimeout(() => {
    button.textContent = '✈ Send Request →';
  }, 2200);
});