'use client';

import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { supabase } from '../lib/supabaseClient';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function StatusBadge({ label, dateStr }) {
  const days = daysUntil(dateStr);
  if (days === null) return <span className="badge badge-warn">{label}: lipsă dată</span>;
  if (days < 0) return <span className="badge badge-danger">{label}: expirat</span>;
  if (days <= 30) return <span className="badge badge-warn">{label}: {days} zile</span>;
  return <span className="badge badge-ok">{label}: OK</span>;
}

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [driversCount, setDriversCount] = useState(0);
  const [tripsCount, setTripsCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: v } = await supabase.from('vehicles').select('*').order('plate_number');
    setVehicles(v || []);
    const { count: dCount } = await supabase.from('drivers').select('*', { count: 'exact', head: true });
    setDriversCount(dCount || 0);
    const { count: tCount } = await supabase.from('trip_sheets').select('*', { count: 'exact', head: true });
    setTripsCount(tCount || 0);
  }

  return (
    <Nav>
      <h1>Panou general</h1>
      <div className="card">
        <p><strong>{vehicles.length}</strong> mașini &nbsp;·&nbsp; <strong>{driversCount}</strong> șoferi &nbsp;·&nbsp; <strong>{tripsCount}</strong> foi de parcurs</p>
      </div>

      <h2>Stare documente mașini</h2>
      {vehicles.length === 0 && <p>Nu ai adăugat încă nicio mașină. Mergi la secțiunea "Mașini".</p>}
      {vehicles.map((v) => (
        <div className="card" key={v.id}>
          <strong>{v.plate_number}</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <StatusBadge label="ITV" dateStr={v.itv_expiry} />
            <StatusBadge label="Rovinietă" dateStr={v.rovinieta_expiry} />
            <StatusBadge label="Asigurare" dateStr={v.insurance_expiry} />
            <StatusBadge label="DSV" dateStr={v.dsv_expiry} />
          </div>
        </div>
      ))}
    </Nav>
  );
}
