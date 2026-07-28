'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { supabase } from '../../lib/supabaseClient';

const emptyForm = {
  vehicle_id: '',
  driver_id: '',
  fuel_date: '',
  liters: '',
  cost: '',
  station: '',
  km_at_fueling: '',
  notes: '',
};

export default function FuelPage() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLookups();
    load();
  }, []);

  async function loadLookups() {
    const { data: v } = await supabase.from('vehicles').select('id, plate_number').order('plate_number');
    setVehicles(v || []);
    const { data: d } = await supabase.from('drivers').select('id, full_name').order('full_name');
    setDrivers(d || []);
  }

  async function load() {
    const { data, error } = await supabase
      .from('fuel_logs')
      .select('*, vehicles(plate_number), drivers(full_name)')
      .order('fuel_date', { ascending: false });
    if (error) setError(error.message);
    setLogs(data || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      vehicle_id: form.vehicle_id || null,
      driver_id: form.driver_id || null,
      fuel_date: form.fuel_date || null,
      liters: form.liters ? Number(form.liters) : null,
      cost: form.cost ? Number(form.cost) : null,
      station: form.station,
      km_at_fueling: form.km_at_fueling ? Number(form.km_at_fueling) : null,
      notes: form.notes,
    };

    let result;
    if (editingId) {
      result = await supabase.from('fuel_logs').update(payload).eq('id', editingId);
    } else {
      result = await supabase.from('fuel_logs').insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  function handleEdit(f) {
    setForm({
      vehicle_id: f.vehicle_id || '',
      driver_id: f.driver_id || '',
      fuel_date: f.fuel_date || '',
      liters: f.liters ?? '',
      cost: f.cost ?? '',
      station: f.station || '',
      km_at_fueling: f.km_at_fueling ?? '',
      notes: f.notes || '',
    });
    setEditingId(f.id);
  }

  async function handleDelete(id) {
    if (!confirm('Ștergi această alimentare?')) return;
    await supabase.from('fuel_logs').delete().eq('id', id);
    load();
  }

  function cancelEdit() {
    setForm(emptyForm);
    setEditingId(null);
  }

  return (
    <Nav>
      <h1>Alimentări</h1>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Editează alimentarea' : 'Adaugă alimentare'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Mașină
            <select name="vehicle_id" required value={form.vehicle_id} onChange={handleChange}>
              <option value="">Alege mașina</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plate_number}</option>
              ))}
            </select>
          </label>
          <label>
            Șofer
            <select name="driver_id" value={form.driver_id} onChange={handleChange}>
              <option value="">Alege șoferul</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.full_name}</option>
              ))}
            </select>
          </label>
          <label>
            Data
            <input name="fuel_date" type="date" required value={form.fuel_date} onChange={handleChange} />
          </label>
          <label>
            Litri
            <input name="liters" type="number" step="0.01" required value={form.liters} onChange={handleChange} />
          </label>
          <label>
            Cost total (lei)
            <input name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} />
          </label>
          <label>
            Stație / benzinărie
            <input name="station" value={form.station} onChange={handleChange} />
          </label>
          <label>
            Km la alimentare
            <input name="km_at_fueling" type="number" step="0.1" value={form.km_at_fueling} onChange={handleChange} />
          </label>
          <label className="full">
            Observații
            <textarea name="notes" rows={2} value={form.notes} onChange={handleChange} />
          </label>
          {error && <p className="error full">{error}</p>}
          <div className="full actions">
            <button className="btn-primary" type="submit">{editingId ? 'Salvează modificările' : 'Adaugă alimentarea'}</button>
            {editingId && <button type="button" onClick={cancelEdit}>Anulează</button>}
          </div>
        </form>
      </div>

      <h2>Istoric alimentări</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Mașină</th>
            <th>Șofer</th>
            <th>Litri</th>
            <th>Cost</th>
            <th>Stație</th>
            <th>Km</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((f) => (
            <tr key={f.id}>
              <td>{f.fuel_date}</td>
              <td>{f.vehicles?.plate_number || '-'}</td>
              <td>{f.drivers?.full_name || '-'}</td>
              <td>{f.liters} l</td>
              <td>{f.cost != null ? f.cost + ' lei' : '-'}</td>
              <td>{f.station || '-'}</td>
              <td>{f.km_at_fueling ?? '-'}</td>
              <td className="actions">
                <button onClick={() => handleEdit(f)}>Editează</button>
                <button className="btn-danger" onClick={() => handleDelete(f.id)}>Șterge</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Nav>
  );
}
