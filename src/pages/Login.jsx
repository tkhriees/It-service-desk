
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

export default function Login({ onLogin }) {
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const email = data.get('email').trim();
    const password = data.get('password');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed.');
      }

      const user = {
        ...result.user,
        role: result.user.role.toLowerCase() === 'user'
          ? 'student'
          : 'staff',
        token: result.token
      };

      onLogin(user);
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-story">
        <div className="brand">CampusDesk</div>
        <div>
          <span className="eyebrow">YOUR CAMPUS. CONNECTED.</span>
          <h1>Less tech trouble.<br />More possibilities.</h1>
          <p>
            One place for all your university IT support.<br />
            Get help, stay updated, and get back to what matters.
          </p>
          <div className="story-features">
            {[
              'Support that’s easy to reach',
              'Every request, in one place',
              'Stay in the loop from start to finish'
            ].map(t => (
              <div key={t}><Check size={17} />{t}</div>
            ))}
          </div>
        </div>
        <small>Technology should move you forward.</small>
      </section>

      <section className="login-form-wrap">
        <form onSubmit={submit} className="login-form">
          <span className="eyebrow">WELCOME TO CAMPUSDESK</span>
          <h1>Good to see you.</h1>
          <p className="muted">
            Sign in to your university support workspace.
          </p>

          <label htmlFor="email">University email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="12345678@university.edu"
            required
            autoComplete="username"
          />

          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              name="password"
              type={show ? 'text' : 'password'}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              aria-label={show ? 'Hide password' : 'Show password'}
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p role="alert" className="error">{error}</p>}

          <button className="button login-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in to workspace'}
            <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </div>
  );
}
