'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { supabase } from '../../lib/supabaseClient';

export default function ConsumptionPage() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('vehicles').select('*').order('plate_number').then(({ data }) => setVehicles(data || []));
  }, []);

  const periodSelected = Boolean(startDate && endDate);

  async function handleCalculate(e) {
    e.preventDefault();
    if (!periodSelected) return;
    setError('');
    setLoading(true);

    let tripsQuery = supabase
      .from('trip_sheets')
      .select('vehicle_id, km_start, km_end, km_traveled, trip_date')
      .gte('trip_date', startDate)
      .lte('trip_date', endDate);
    let fuelQuery = supabase
      .from('fuel_logs')
      .select('vehicle_id, liters, fuel_date')
      .gte('fuel_date', startDate)
      .lte('fuel_date', endDate);

    if (vehicleId !== 'all') {
      tripsQuery = tripsQuery.eq('vehicle_id', vehicleId);
      fuelQuery = fuelQuery.eq('vehicle_id', vehicleId);
    }

    const [{ data: trips, error: tripsErr }, { data: fuels, error: fuelErr }] = await Promise.all([tripsQuery, fuelQuery]);

    if (tripsErr || fuelErr) {
      setError((tripsErr || fuelErr).message);
      setLoading(false);
      return;
    }

    const byVehicle = {};
    const ensure = (id) => {
      if (!byVehicle[id]) byVehicle[id] = { km: 0, liters: 0 };
      return byVehicle[id];
    };

    (trips || []).forEach((t) => {
      if (t.km_traveled != null) {
        ensure(t.vehicle_id).km += t.km_traveled;
      } else if (t.km_start != null && t.km_end != null) {
        ensure(t.vehicle_id).km += t.km_end - t.km_start;
      }
    });
    (fuels || []).forEach((f) => {
      if (f.liters != null) {
        ensure(f.vehicle_id).liters += f.liters;
      }
    });

    const rows = Object.entries(byVehicle).map(([vId, totals]) => {
      const vehicle = vehicles.find((v) => v.id === vId);
      const avgConsumption = totals.km > 0 ? (totals.liters / totals.km) * 100 : null;
      return {
        vehicleId: vId,
        plate: vehicle?.plate_number || 'Mașină ștearsă',
        norm: vehicle?.consumption_norm ?? null,
        km: totals.km,
        liters: totals.liters,
        avgConsumption,
      };
    });

    rows.sort((a, b) => a.plate.localeCompare(b.plate));
    setResults(rows);
    setLoading(false);
  }

  return (
    <Nav>
      <h1>Consum mediu</h1>
      <div className="card">
        <form onSubmit={handleCalculate}>
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
          <div className="full">
            <button className="btn-primary" type="submit" disabled={!periodSelected || loading}>
              {loading ? 'Se calculează...' : 'Calculează consumul'}
            </button>
          </div>
        </form>
      </div>

      {!periodSelected && (
        <p style={{ color: '#666', marginTop: 16 }}>Selectează o perioadă (de la - până la) pentru a vedea consumul.</p>
      )}

      {periodSelected && results && (
        <>
          <h2>Rezultate ({startDate} → {endDate})</h2>
          {results.length === 0 && <p>Nu există date (km sau alimentări) în perioada selectată.</p>}
          {results.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Mașină</th>
                  <th>Km parcurși</th>
                  <th>Litri alimentați</th>
                  <th>Consum mediu</th>
                  <th>Consum normat</th>
                  <th>Diferență</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const diff = r.norm != null && r.avgConsumption != null ? r.avgConsumption - r.norm : null;
                  return (
                    <tr key={r.vehicleId}>
                      <td>{r.plate}</td>
                      <td>{r.km.toFixed(1)} km</td>
                      <td>{r.liters.toFixed(1)} l</td>
                      <td>{r.avgConsumption != null ? r.avgConsumption.toFixed(2) + ' l/100km' : '-'}</td>
                      <td>{r.norm != null ? r.norm + ' l/100km' : '-'}</td>
                      <td>
                        {diff != null ? (
                          <span className={diff > 0 ? 'badge badge-warn' : 'badge badge-ok'}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(2)} l/100km
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </Nav>
  );
}
