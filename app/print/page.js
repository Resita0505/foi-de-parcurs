'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { supabase } from '../../lib/supabaseClient';

export default function PrintPage() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [settings, setSettings] = useState(null);
  const [trips, setTrips] = useState(null);
  const [fuels, setFuels] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('vehicles').select('*').order('plate_number').then(({ data }) => setVehicles(data || []));
    supabase.from('settings').select('*').eq('id', 1).single().then(({ data }) => setSettings(data));
  }, []);

  const periodSelected = Boolean(startDate && endDate);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!periodSelected) return;
    setError('');
    setLoading(true);

    let tripsQuery = supabase
      .from('trip_sheets')
      .select('*, vehicles(plate_number), drivers(full_name)')
      .gte('trip_date', startDate)
      .lte('trip_date', endDate)
      .order('trip_date');
    let fuelQuery = supabase
      .from('fuel_logs')
      .select('*, vehicles(plate_number), drivers(full_name)')
      .gte('fuel_date', startDate)
      .lte('fuel_date', endDate)
      .order('fuel_date');

    if (vehicleId !== 'all') {
      tripsQuery = tripsQuery.eq('vehicle_id', vehicleId);
      fuelQuery = fuelQuery.eq('vehicle_id', vehicleId);
    }

    const [{ data: t, error: tErr }, { data: f, error: fErr }] = await Promise.all([tripsQuery, fuelQuery]);

    if (tErr || fErr) {
      setError((tErr || fErr).message);
      setLoading(false);
      return;
    }

    setTrips(t || []);
    setFuels(f || []);
    setLoading(false);
  }

  const totalKm = (trips || []).reduce((sum, t) => {
    if (t.km_traveled != null) return sum + t.km_traveled;
    if (t.km_start != null && t.km_end != null) return sum + (t.km_end - t.km_start);
    return sum;
  }, 0);
  const totalLiters = (fuels || []).reduce((sum, f) => sum + (f.liters || 0), 0);
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  return (
    <Nav>
      <h1>Tipărire raport pentru ANAF</h1>

      <div className="card no-print">
        <form onSubmit={handleGenerate}>
          <label>
            Mașină
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="all">Toate mașinile</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plate_number}</option>
              ))}
            </select>
          </label>
          <label>
            De la data
            <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>
            Până la data
            <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
          {error && <p className="error full">{error}</p>}
          <div className="full actions">
            <button className="btn-primary" type="submit" disabled={!periodSelected || loading}>
              {loading ? 'Se generează...' : 'Generează raportul'}
            </button>
            {trips && <button type="button" onClick={() => window.print()}>Tipărește</button>}
          </div>
        </form>
      </div>

      {trips && (
        <div className="card" style={{ marginTop: 24 }}>
          <h2 style={{ marginTop: 0 }}>{settings?.company_name || 'Raport foi de parcurs'}</h2>
          {settings?.cui && <p style={{ margin: 0, fontSize: 13 }}>CUI: {settings.cui}</p>}
          {settings?.address && <p style={{ margin: 0, fontSize: 13 }}>{settings.address}</p>}
          <p style={{ fontSize: 13, color: '#666' }}>
            Perioadă: {startDate} → {endDate} &nbsp;|&nbsp; Mașină: {selectedVehicle ? selectedVehicle.plate_number : 'toate'}
          </p>

          <h2>Foi de parcurs</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Plecare</th>
                <th>Sosire</th>
                <th>Mașină</th>
                <th>Șofer</th>
                <th>Traseu</th>
                <th>Cod UIT</th>
                <th>Scop deplasare</th>
                <th>Km start</th>
                <th>Km stop</th>
                <th>Km parcurși</th>
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
                  <td>{t.uit_code || '-'}</td>
                  <td>{t.trip_purpose || '-'}</td>
                  <td>{t.km_start ?? '-'}</td>
                  <td>{t.km_end ?? '-'}</td>
                  <td>{t.km_traveled != null ? t.km_traveled.toFixed(1) : (t.km_start != null && t.km_end != null ? (t.km_end - t.km_start).toFixed(1) : '-')}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700 }}>
                <td colSpan={10} style={{ textAlign: 'right' }}>Total km parcurși:</td>
                <td>{totalKm.toFixed(1)} km</td>
              </tr>
            </tbody>
          </table>

          <h2>Alimentări</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Mașină</th>
                <th>Șofer</th>
                <th>Litri</th>
                <th>Cost</th>
                <th>Stație</th>
              </tr>
            </thead>
            <tbody>
              {fuels.map((f) => (
                <tr key={f.id}>
                  <td>{f.fuel_date}</td>
                  <td>{f.vehicles?.plate_number || '-'}</td>
                  <td>{f.drivers?.full_name || '-'}</td>
                  <td>{f.liters} l</td>
                  <td>{f.cost != null ? f.cost + ' lei' : '-'}</td>
                  <td>{f.station || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Total perioadă</h2>
          <p>
            <strong>{totalKm.toFixed(1)} km</strong> parcurși &nbsp;·&nbsp;
            <strong> {totalLiters.toFixed(1)} l</strong> combustibil alimentat &nbsp;·&nbsp;
            <strong> {totalKm > 0 ? ((totalLiters / totalKm) * 100).toFixed(2) : '-'} l/100km</strong> consum mediu
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 60 }}>
            <div>Întocmit: _______________________</div>
            <div>Semnătură / Ștampilă: _______________________</div>
          </div>
        </div>
      )}
    </Nav>
  );
}
