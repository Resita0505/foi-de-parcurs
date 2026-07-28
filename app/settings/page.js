'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { supabase } from '../../lib/supabaseClient';

export default function SettingsPage() {
  const [form, setForm] = useState({ company_name: '', cui: '', address: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (error) setError(error.message);
    if (data) {
      setForm({
        company_name: data.company_name || '',
        cui: data.cui || '',
        address: data.address || '',
      });
    }
    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const { error } = await supabase.from('settings').update(form).eq('id', 1);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
  }

  if (loading) {
    return (
      <Nav>
        <p>Se încarcă...</p>
      </Nav>
    );
  }

  return (
    <Nav>
      <h1>Setări firmă</h1>
      <p style={{ color: '#666' }}>Aceste date apar pe antetul documentelor tipărite pentru ANAF.</p>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <label className="full">
            Nume firmă
            <input name="company_name" value={form.company_name} onChange={handleChange} />
          </label>
          <label>
            CUI / CIF
            <input name="cui" value={form.cui} onChange={handleChange} />
          </label>
          <label className="full">
            Adresă
            <input name="address" value={form.address} onChange={handleChange} />
          </label>
          {error && <p className="error full">{error}</p>}
          {saved && <p className="full" style={{ color: '#1a7d3a', fontSize: 13 }}>Setări salvate.</p>}
          <div className="full">
            <button className="btn-primary" type="submit">Salvează setările</button>
          </div>
        </form>
      </div>
    </Nav>
  );
}
