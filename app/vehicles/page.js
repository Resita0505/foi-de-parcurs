'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { supabase } from '../../lib/supabaseClient';

const emptyForm = {
  plate_number: '',
  brand: '',
  model: '',
  category: '',
  consumption_norm: '',
  dsv_authorization_number: '',
  dsv_expiry: '',
  itv_expiry: '',
  rovinieta_expiry: '',
  insurance_expiry: '',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data, error } = await supabase.from('vehicles').select('*').order('plate_number');
    if (error) setError(error.message);
    setVehicles(data || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      consumption_norm: form.consumption_norm ? Number(form.consumption_norm) : null,
      dsv_expiry: form.dsv_expiry || null,
      itv_expiry: form.itv_expiry || null,
      rovinieta_expiry: form.rovinieta_expiry || null,
      insurance_expiry: form.insurance_expiry || null,
    };

    let result;
    if (editingId) {
      result = await supabase.from('vehicles').update(payload).eq('id', editingId);
    } else {
      result = await supabase.from('vehicles').insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  function handleEdit(v) {
    setForm({
      plate_number: v.plate_number || '',
      brand: v.brand || '',
      model: v.model || '',
      category: v.category || '',
      consumption_norm: v.consumption_norm ?? '',
      dsv_authorization_number: v.dsv_authorization_number || '',
      dsv_expiry: v.dsv_expiry || '',
      itv_expiry: v.itv_expiry || '',
      rovinieta_expiry: v.rovinieta_expiry || '',
      insurance_expiry: v.insurance_expiry || '',
    });
    setEditingId(v.id);
  }

  async function handleDelete(id) {
    if (!confirm('Ștergi această mașină?')) return;
    await supabase.from('vehicles').delete().eq('id', id);
    load();
  }

  function cancelEdit() {
    setForm(emptyForm);
    setEditingId(null);
  }

  return (
    <Nav>
      <h1>Mașini</h1>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Editează mașina' : 'Adaugă mașină nouă'}</h2>
        <form onSubmit={handleSubmit}>
          <label className="full">
            Număr înmatriculare
            <input name="plate_number" required value={form.plate_number} onChange={handleChange} />
          </label>
          <label>
            Marcă
            <input name="brand" value={form.brand} onChange={handleChange} placeholder="ex: Mercedes" />
          </label>
          <label>
            Model
            <input name="model" value={form.model} onChange={handleChange} placeholder="ex: Actros" />
          </label>
          <label>
            Categorie
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Alege categoria</option>
              <option value="B">B</option>
              <option value="BE">BE</option>
              <option value="C">C</option>
              <option value="C1">C1</option>
              <option value="CE">CE</option>
              <option value="C1E">C1E</option>
              <option value="D">D</option>
              <option value="D1">D1</option>
              <option value="DE">DE</option>
              <option value="D1E">D1E</option>
            </select>
          </label>
          <label>
            Consum normat (l/100km)
            <input name="consumption_norm" type="number" step="0.1" value={form.consumption_norm} onChange={handleChange} />
          </label>
          <label>
            Nr. autorizație DSV
            <input name="dsv_authorization_number" value={form.dsv_authorization_number} onChange={handleChange} />
          </label>
          <label>
            Expirare DSV
            <input name="dsv_expiry" type="date" value={form.dsv_expiry} onChange={handleChange} />
          </label>
          <label>
            Expirare ITV
            <input name="itv_expiry" type="date" value={form.itv_expiry} onChange={handleChange} />
          </label>
          <label>
            Expirare rovinietă
            <input name="rovinieta_expiry" type="date" value={form.rovinieta_expiry} onChange={handleChange} />
          </label>
          <label>
            Expirare asigurare (RCA)
            <input name="insurance_expiry" type="date" value={form.insurance_expiry} onChange={handleChange} />
          </label>
          {error && <p className="error full">{error}</p>}
          <div className="full actions">
            <button className="btn-primary" type="submit">{editingId ? 'Salvează modificările' : 'Adaugă mașina'}</button>
            {editingId && <button type="button" onClick={cancelEdit}>Anulează</button>}
          </div>
        </form>
      </div>

      <h2>Lista mașinilor</h2>
      <table>
        <thead>
          <tr>
            <th>Nr. înmatriculare</th>
            <th>Marcă / Model</th>
            <th>Categorie</th>
            <th>Consum normat</th>
            <th>DSV</th>
            <th>ITV</th>
            <th>Rovinietă</th>
            <th>Asigurare</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id}>
              <td>{v.plate_number}</td>
              <td>{[v.brand, v.model].filter(Boolean).join(' ') || '-'}</td>
              <td>{v.category || '-'}</td>
              <td>{v.consumption_norm ?? '-'} l/100km</td>
              <td>{v.dsv_expiry || '-'}</td>
              <td>{v.itv_expiry || '-'}</td>
              <td>{v.rovinieta_expiry || '-'}</td>
              <td>{v.insurance_expiry || '-'}</td>
              <td className="actions">
                <button onClick={() => handleEdit(v)}>Editează</button>
                <button className="btn-danger" onClick={() => handleDelete(v.id)}>Șterge</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Nav>
  );
}
