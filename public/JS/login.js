document.querySelector('form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.redirected) {
    window.location.href = res.url;
    return;
  }

  if (res.ok) {
    const isAdmin = document.cookie.split(';').some(c => c.trim().startsWith('isAdmin=true'));
    if (isAdmin) {
      window.location.href = '/admin';
    } else {
      window.location.href = '/';
    }
  } else {
    alert(await res.text());
  }
});