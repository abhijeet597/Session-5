// auth-pages.js — wires login.html and signup.html. Only one of these
// forms exists on a given page, so each block below is a no-op on the
// other page.

const signedUpParam = new URLSearchParams(window.location.search).get('signedup');
if (signedUpParam === 'true') {
  const messageEl = document.getElementById('auth-message');
  if (messageEl) {
    messageEl.textContent = 'Account created successfully! Please log in.';
  }
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const result = await login(email, password);

    if (!result.token) {
      document.getElementById('auth-error').textContent = result.error || 'Login failed';
      return;
    }

    setToken(result.token);
    window.location.href = 'index.html';
  });
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const result = await signup(email, password);

    if (!result.token) {
      document.getElementById('auth-error').textContent = result.error || 'Signup failed';
      return;
    }

    window.location.href = 'login.html?signedup=true';
  });
}
