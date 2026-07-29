'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { supabase } from '../../lib/supabaseClient';

const emptyForm = {
  vehicle_id: '',
  driver_id: '',
  trip_date: '',
  departure_time: '',
  arrival_time: '',
  route: '',
  uit_code: '',
  trip_purpose: '',
  km_start: '',
  km_end: '',
  km_traveled: '',
  fuel_added: '',
  notes: '',
};

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
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
      .from('trip_sheets')
      .select('*, vehicles(plate_number), drivers(full_name)')
      .order('trip_date', { ascending: false });
    if (error) setError(error.message);
    setTrips(data || []);
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
      trip_date: form.trip_date || null,
      departure_time: form.departure_time || null,
      arrival_time: form.arrival_time || null,
      route: form.route,
      uit_code: form.uit_code,
      trip_purpose: form.trip_purpose,
      km_start: form.km_start ? Number(form.km_start) : null,
      km_end: form.km_end ? Number(form.km_end) : null,
      km_traveled: form.km_traveled ? Number(form.km_traveled) : null,
      fuel_added: form.fuel_added ? Number(form.fuel_added) : null,
      notes: form.notes,
    };

    let result;
    if (editingId) {
      result = await supabase.from('trip_sheets').update(payload).eq('id', editingId);
    } else {
      result = await supabase.from('trip_sheets').insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  function handleEdit(t) {
    setForm({
      vehicle_id: t.vehicle_id || '',
      driver_id: t.driver_id || '',
      trip_date: t.trip_date || '',
      departure_time: t.departure_time || '',
      arrival_time: t.arrival_time || '',
      route: t.route || '',
      uit_code: t.uit_code || '',
      trip_purpose: t.trip_purpose || '',
      km_start: t.km_start ?? '',
      km_end: t.km_end ?? '',
      km_traveled: t.km_traveled ?? '',
      fuel_added: t.fuel_added ?? '',
      notes: t.notes || '',
    });
    setEditingId(t.id);
  }

  async function handleDelete(id) {
    if (!confirm('Ștergi această foaie de parcurs?')) return;
    await supabase.from('trip_sheets').delete().eq('id', id);
    load();
  }

  function cancelEdit() {
    setForm(emptyForm);
    setEditingId(null);
  }

  return (
    <Nav>
      <h1>Foi de parcurs</h1>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Editează foaia de parcurs' : 'Adaugă foaie de parcurs'}</h2>
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
            <select name="driver_id" required value={form.driver_id} onChange={handleChange}>
              <option value="">Alege șoferul</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.full_name}</option>
              ))}
            </select>
          </label>
          <label>
            Data
            <input name="trip_date" type="date" required value={form.trip_date} onChange={handleChange} />
          </label>
          <label>
            Ora plecării
            <input name="departure_time" type="time" value={form.departure_time} onChange={handleChange} />
          </label>
          <label>
            Ora sosirii
            <input name="arrival_time" type="time" value={form.arrival_time} onChange={handleChange} />
          </label>
          <label className="full">
            Traseu (plecare - destinație)
            <input name="route" value={form.route} onChange={handleChange} placeholder="ex: Brăila - Galați" />
          </label>
          <label>
            Cod UIT
            <textarea
              name="uit_code"
              value={form.uit_code}
              onChange={handleChange}
              placeholder="ex: RO3F1A2B3C..."
              cols={68}
              rows={2}
              wrap="hard"
              style={{ fontFamily: 'monospace', resize: 'vertical' }}
            />
          </label>
          <label>
            Scopul deplasării
            <input name="trip_purpose" value={form.trip_purpose} onChange={handleChange} placeholder="ex: transport marfă / aprovizionare" />
          </label>
          <label>
            Km start <span style={{ fontWeight: 400, color: '#888' }}>(opțional)</span>
            <input name="km_start" type="number" step="0.1" value={form.km_start} onChange={handleChange} />
          </label>
          <label>
            Km stop <span style={{ fontWeight: 400, color: '#888' }}>(opțional)</span>
            <input name="km_end" type="number" step="0.1" value={form.km_end} onChange={handleChange} />
          </label>
          <label>
            Km efectuați <span style={{ fontWeight: 400, color: '#888' }}>(dacă nu vrei km start/stop)</span>
            <input name="km_traveled" type="number" step="0.1" value={form.km_traveled} onChange={handleChange} placeholder="ex: 120" />
          </label>
          <label>
            Combustibil alimentat (litri)
            <input name="fuel_added" type="number" step="0.1" value={form.fuel_added} onChange={handleChange} />
          </label>
          <label className="full">
            Observații
            <textarea name="notes" rows={2} value={form.notes} onChange={handleChange} />
          </label>
          {error && <p className="error full">{error}</p>}
          <div className="full actions">
            <button className="btn-primary" type="submit">{editingId ? 'Salvează modificările' : 'Adaugă foaia'}</button>
            {editingId && <button type="button" onClick={cancelEdit}>Anulează</button>}
          </div>
        </form>
      </div>

      <h2>Istoric foi de parcurs</h2>
      <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Plecare</th>
            <th>Sosire</th>
            <th>Mașină</th>
            <th>Șofer</th>
            <th>Traseu</th>
            <th>Scop</th>
            <th>Km parcurși</th>
            <th>Combustibil</th>
            <th>Cod UIT</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trips.map((t) => (
            <tr key={t.id}>
              <td>{t.trip_date}</td>
              <td>{t.departure_time || '-'}</td>
              <td>{t.arrival_time || '-'}</td>
              <td>{t.vehicles?.plate_number || '-'}</td>
              <td>{t.drivers?.full_name || '-'}</td>
              <td>{t.route}</td>
              <td>{t.trip_purpose || '-'}</td>
              <td>{t.km_traveled != null ? t.km_traveled.toFixed(1) : (t.km_start != null && t.km_end != null ? (t.km_end - t.km_start).toFixed(1) : '-')}</td>
              <td>{t.fuel_added ?? '-'} l</td>
              <td style={{ maxWidth: '36ch', wordBreak: 'break-all', fontFamily: 'monospace' }}>{t.uit_code || '-'}</td>
              <td className="actions">
                <button onClick={() => handleEdit(t)}>Editează</button>
                <button className="btn-danger" onClick={() => handleDelete(t.id)}>Șterge</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </Nav>
  );
}
