import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.message.trim()) errs.message = 'Tell us a little about what you need.';
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  }

  return (
    <>
      <Navbar />

      <div className="ep-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-8)' }}>
        <div>
          <h6 style={{ color: 'var(--color-accent-700)' }}>Get in touch</h6>
          <h1 style={{ fontSize: 40, fontWeight: 400, marginTop: 'var(--space-2)' }}>We're here, too.</h1>
          <p style={{ fontSize: 16, opacity: .85, marginTop: 'var(--space-3)', maxWidth: '46ch' }}>Questions about your account, a provider partnership, or just want to talk before you sign up — send a note and a real person will reply.</p>

          {submitted ? (
            <div className="card elev-sm" style={{ marginTop: 'var(--space-6)', borderColor: 'var(--color-accent)' }}>
              <span className="card-kicker">Sent</span>
              <h4 className="card-title">Thank you, {form.name}.</h4>
              <p className="card-body">We've received your message and will reply to {form.email} within one business day.</p>
            </div>
          ) : (
            <form style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 440 }} onSubmit={handleSubmit}>
              <div className="field">
                <label>Name</label>
                <input className="input" type="text" value={form.name} onChange={set('name')} />
                {errors.name && <div className="ep-err">{errors.name}</div>}
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" type="text" value={form.email} onChange={set('email')} />
                {errors.email && <div className="ep-err">{errors.email}</div>}
              </div>
              <div className="field">
                <label>Message</label>
                <textarea className="input" rows={4} value={form.message} onChange={set('message')} />
                {errors.message && <div className="ep-err">{errors.message}</div>}
              </div>
              <button className="btn btn-primary btn-block" type="submit">Send message</button>
            </form>
          )}
        </div>

        <div className="card elev-sm" style={{ height: 'fit-content' }}>
          <span className="card-kicker">Reach us directly</span>
          <h4 className="card-title">Support</h4>
          <p className="card-body">support@elpis.care<br />1&#8209;800&#8209;555&#8209;0134<br />Mon–Fri, 8am–8pm ET</p>
          <div className="hr" style={{ margin: 'var(--space-2) 0' }} />
          <span className="card-kicker">Office</span>
          <p className="card-body">Elpis Health, Inc.<br />228 Harbor Street, Suite 4<br />Boston, MA 02110</p>
        </div>
      </div>

      <div className="hr ep-container" />
      <Footer />
    </>
  );
}
