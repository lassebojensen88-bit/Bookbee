import React, { useEffect, useState } from 'react';
import { SalonIcon, DashboardIcon, ScissorsIcon, ToothIcon, FaceIcon, PlusIcon } from '../components/icons';

type Salon = {
  id: number;
  name: string;
  owner: string;
  email: string;
  address: string;
  type: string;
  paid?: boolean;
};

export default function Salons() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newKunde, setNewKunde] = useState({ name: '', owner: '', address: '', email: '', type: '' });
  // Inline edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ name: '', owner: '', address: '', email: '', type: '' });

  function handleEditClick(salon: Salon) {
    setEditId(salon.id);
    setEditData({ name: salon.name, owner: salon.owner, address: salon.address, email: salon.email, type: salon.type });
  }

  async function handleEditSave(e: React.FormEvent, id: number) {
    e.preventDefault();
    setSalons(salons.map(s => s.id === id ? { ...s, ...editData } : s));
    await fetch(`http://localhost:4000/salons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    setEditId(null);
  }

  const fetchSalons = () => {
    fetch('http://localhost:4000/salons')
      .then((res) => res.json())
      .then((data) => {
        setSalons(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch salons');
        setLoading(false);
      });
  };


  // Add a random hair salon if the list is empty (for demo)
  useEffect(() => {
    fetchSalons();
  }, []);

  useEffect(() => {
    if (!loading && salons.length === 0) {
      // Add a random hair salon
      const demoSalon = {
        name: 'Random Hair Salon',
        owner: 'Anna Demo',
        address: 'Hovedgaden 123, 2800 Kgs. Lyngby',
        email: 'anna@randomsalon.dk',
        type: 'Frisør',
        paid: true
      };
      fetch('http://localhost:4000/salons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoSalon)
      }).then(() => fetchSalons());
    }
  }, [loading, salons.length]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Er du sikker på at du vil slette denne kunde?')) return;
    await fetch(`http://localhost:4000/salons/${id}`, { method: 'DELETE' });
    setSalons(salons.filter((s) => s.id !== id));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/salons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newKunde)
    });
    if (res.ok) {
      setShowAdd(false);
  setNewKunde({ name: '', owner: '', address: '', email: '', type: '' });
      fetchSalons();
    } else {
      alert('Kunne ikke tilføje kunde');
    }
  };

  // Gruppér saloner pr. ejer
  const owners = salons.reduce((acc: Record<string, Salon[]>, salon) => {
    acc[salon.owner] = acc[salon.owner] || [];
    acc[salon.owner].push(salon);
    return acc;
  }, {});

  // Vælg ikon ud fra kundetype
  function getTypeIcon(type: string) {
    const t = type.toLowerCase();
    if (t.includes('frisør') || t.includes('hair')) return <ScissorsIcon style={{ color: '#6366f1' }} />;
    if (t.includes('tand') || t.includes('dent')) return <ToothIcon style={{ color: '#f59e42' }} />;
    if (t.includes('klinik') || t.includes('skøn')) return <FaceIcon style={{ color: '#e879f9' }} />;
    return <SalonIcon style={{ color: '#a21caf' }} />;
  }

  // Ejerkort viser ikon for første salons type
  function getOwnerIcon(owner: string, salons: Salon[]) {
    if (salons.length > 0) return getTypeIcon(salons[0].type);
    return <SalonIcon style={{ color: '#a21caf' }} />;
  }


  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Kunder</h1>
      <button
        style={{
          marginBottom: 24,
          background: 'transparent',
          color: '#111',
          border: '2px solid #111',
          borderRadius: 6,
          padding: '9px 22px',
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
        onClick={() => setShowAdd((v) => !v)}
      >
        {!showAdd && <PlusIcon style={{ marginRight: 2 }} />}
        {showAdd ? 'Annuller' : 'Tilføj kunde'}
      </button>
      {showAdd && (
        <form onSubmit={handleAdd} style={{ marginBottom: 32, background: '#f3f4f8', padding: 24, borderRadius: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <input required placeholder="Kunde" value={newKunde.name} onChange={e => setNewKunde({ ...newKunde, name: e.target.value })} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 120 }} />
          <input required placeholder="Ejer" value={newKunde.owner} onChange={e => setNewKunde({ ...newKunde, owner: e.target.value })} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 120 }} />
          <input required placeholder="Adresse" value={newKunde.address} onChange={e => setNewKunde({ ...newKunde, address: e.target.value })} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 120 }} />
          <input required placeholder="E-mail" value={newKunde.email} onChange={e => setNewKunde({ ...newKunde, email: e.target.value })} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 120 }} />
          <select 
            required 
            value={newKunde.type} 
            onChange={e => setNewKunde({ ...newKunde, type: e.target.value })}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 120, fontSize: 16 }}
          >
            <option value="">Vælg kundetype</option>
            <option value="Frisør">Frisør</option>
            <option value="Skønhedsklinik">Skønhedsklinik</option>
            <option value="Tandlæge">Tandlæge</option>
            <option value="Spa">Spa</option>
          </select>
          <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Opret</button>
        </form>
      )}
      {/* Moderne bokse for ejere */}
      {!loading && !error && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
          marginBottom: 36
        }}>
          {Object.entries(owners).map(([owner, salons]) => (
            <div key={owner} style={{
              background: '#f3f4f8',
              borderRadius: 14,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              minHeight: 100
            }}>
              <div style={{ marginBottom: 10 }}>{getOwnerIcon(owner, salons)}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{owner}</div>
              <div style={{ fontSize: 15, color: '#555', marginTop: 2 }}>{salons.length} salon(er)</div>
            </div>
          ))}
        </div>
      )}
      {loading && <p>Indlæser...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* Eksisterende tabel */}
      {!loading && !error && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32, minWidth: 600 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f8' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Kunde</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Ejer</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Adresse</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>E-mail</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Kundetype</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Betalt</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {salons.map((salon) => (
                <React.Fragment key={salon.id}>
                  {editId === salon.id ? (
                    <tr style={{ background: '#f3f4f8' }}>
                      <td colSpan={7} style={{ padding: 16 }}>
                        <form style={{ display: 'flex', gap: 12, alignItems: 'center' }} onSubmit={e => handleEditSave(e, salon.id)}>
                          <input required value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 90 }} />
                          <input required value={editData.owner} onChange={e => setEditData({ ...editData, owner: e.target.value })} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 90 }} />
                          <input required value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 90 }} />
                          <input required value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 90 }} />
                          <select 
                            required 
                            value={editData.type} 
                            onChange={e => setEditData({ ...editData, type: e.target.value })}
                            style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 90, fontSize: 15 }}
                          >
                            <option value="">Vælg kundetype</option>
                            <option value="Frisør">Frisør</option>
                            <option value="Skønhedsklinik">Skønhedsklinik</option>
                            <option value="Tandlæge">Tandlæge</option>
                            <option value="Spa">Spa</option>
                          </select>
                          <button type="submit" style={{ background: '#4ade80', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Gem</button>
                          <button type="button" onClick={() => setEditId(null)} style={{ background: '#f87171', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Annuller</button>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {getTypeIcon(salon.type)}
                        {salon.name}
                        {/* Link to client portal for this salon */}
                        <a
                          href={`/client/${salon.id}/dashboard`}
                          style={{
                            marginLeft: 8,
                            fontSize: 13,
                            color: '#6366f1',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Gå til portal
                        </a>
                      </td>
                      <td style={{ padding: '10px 8px' }}>{salon.owner}</td>
                      <td style={{ padding: '10px 8px' }}>{salon.address}</td>
                      <td style={{ padding: '10px 8px' }}>{salon.email}</td>
                      <td style={{ padding: '10px 8px' }}>{salon.type}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={!!salon.paid}
                            onChange={async (e) => {
                              const newPaid = e.target.checked;
                              setSalons(salons.map(s => s.id === salon.id ? { ...s, paid: newPaid } : s));
                              const res = await fetch(`http://localhost:4000/salons/${salon.id}/paid`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ paid: newPaid })
                              });
                              if (!res.ok) {
                                alert('Kunne ikke opdatere betalingsstatus');
                                setSalons(salons.map(s => s.id === salon.id ? { ...s, paid: !newPaid } : s));
                              }
                            }}
                            style={{ accentColor: '#4ade80', width: 18, height: 18 }}
                          />
                          <span style={{
                            color: salon.paid ? '#4ade80' : '#f87171',
                            fontWeight: 600,
                            fontSize: 15
                          }}>
                            {salon.paid ? 'Betalt' : 'Ikke betalt'}
                          </span>
                        </label>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <button
                          style={{
                            background: '#6366f1',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 16px',
                            marginRight: 8,
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                          onClick={() => handleEditClick(salon)}
                        >Ret</button>
                        <button
                          style={{
                            background: '#f87171',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 16px',
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                          onClick={() => handleDelete(salon.id)}
                        >Slet</button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
