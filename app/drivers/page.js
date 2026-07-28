'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { supabase } from '../../lib/supabaseClient';

const emptyForm = { full_name: '', phone: '', license_number: '' };

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data, error } = await supabase.from('drivers').select('*').order('full_name');
    if (error) setError(error.message);
    setDrivers(data || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    let result;
    if (editingId) {
      result = await supabase.from('drivers').update(form).eq('id', editingId);
    } else {
      result = await supabase.from('drivers').insert(form);
    }
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  function handleEdit(d) {
    setForm({ full_name: d.full_name || '', phone: d.phone || '', license_number: d.license_number || '' });
    setEditingId(d.id);
  }

  async function handleDelete(id) {
    if (!confirm('Ștergi acest șofer?')) return;
    await supabase.from('drivers').delete().eq('id', id);
    load();
  }

  function cancelEdit() {
    setForm(emptyForm);
    setEditingId(null);
  }

  return (
    <Nav>
      <h1>Șoferi</h1>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Editează șofer' : 'Adaugă șofer nou'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Nume complet
            <input name="full_name" required value={form.full_name} onChange={handleChange} />
          </label>
          <label>
            Telefon
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
          <label>
            Nr. permis conducere
            <input name="license_number" value={form.license_number} onChange={handleChange} />
          </label>
          {error && <p className="error full">{error}</p>}
          <div className="full actions">
            <button className="btn-primary" type="submit">{editingId ? 'Salvează modificările' : 'Adaugă șoferul'}</button>
            {editingId && <button type="button" onClick={cancelEdit}>Anulează</button>}
          </div>
        </form>
      </div>

      <h2>Lista șoferilor</h2>
      <table>
        <thead>
          <tr>
            <th>Nume</th>
            <th>Telefon</th>
            <th>Permis</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.id}>
              <td>{d.full_name}</td>
              <td>{d.phone || '-'}</td>
              <td>{d.license_number || '-'}</td>
              <td className="actions">
                <button onClick={() => handleEdit(d)}>Editează</button>
                <button className="btn-danger" onClick={() => handleDelete(d.id)}>Șterge</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Nav>
  );
}
