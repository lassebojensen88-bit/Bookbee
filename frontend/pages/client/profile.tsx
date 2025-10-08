import React, { useState, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { useProfile } from '../../contexts/ProfileContext';
import { PublicPageConfig } from '../../utils/publicPageConfig';
import { getSalon, updateSalon } from '../../utils/api';

interface ClientProfileProps {
  salonId?: string;
}

export default function ClientProfile({ salonId }: ClientProfileProps) {
  const { profile, loading, refreshProfile, updateProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    salonName: '',
    ownerName: '',
    email: '',
    address: '',
    type: '',
  });
  const [addSalon, setAddSalon] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);

  // NEW: public page config state
  const [publicConfig, setPublicConfig] = useState<PublicPageConfig | null>(null);
  const [editingPublic, setEditingPublic] = useState(false);
  const [publicForm, setPublicForm] = useState<PublicPageConfig | null>(null);

  // Update form when profile changes
  useEffect(() => {
    setForm({
      id: profile.id,
      salonName: profile.salonName,
      ownerName: profile.ownerName,
      email: profile.email,
      address: profile.address,
      type: profile.type,
    });
  }, [profile]);

  // Load public page config from backend
  useEffect(() => {
    const id = salonId ? Number(salonId) : profile.id;
    if (!id) return;
    let aborted = false;
    getSalon(id)
      .then(salon => {
        if (aborted) return;
        const cfg: PublicPageConfig = {
          // fallback defaults merged (minimal to avoid duplication of constants — keep existing fields if present)
          title: 'Velkommen til vores online booking',
            subtitle: 'Professionel behandling – nemt at booke',
            introText: 'Her kan du trygt booke din næste tid. Vi glæder os til at tage imod dig og give dig en god oplevelse.',
            highlightPoints: ['Erfarne behandlere','Nem online booking','Kvalitet & tryghed'],
            termsTitle: 'Generelle vilkår',
            termsBody: 'Afbud skal ske senest 4 timer før din aftale. Udeblivelser eller for sent afbud kan medføre gebyr svarende til 50% af behandlingens pris.',
            cancellationTitle: 'Afbuds- og ændringspolitik',
            cancellationBody: 'Du kan nemt aflyse eller ændre din tid via bekræftelsesmail eller ved at kontakte os. Senere end 4 timer før – kontakt os direkte.',
            footerNote: 'Tak fordi du vælger os – vi glæder os til at se dig! ✂️',
            primaryColor: '#111827',
            accentColor: '#6366f1',
            ctaEnabled: true,
            ctaText: 'Book tid',
            ctaLink: '#',
            logoUrl: undefined,
            coverImageUrl: undefined,
            updatedAt: new Date().toISOString(),
          ...(salon.publicConfig || {})
        } as PublicPageConfig;
        setPublicConfig(cfg);
      })
      .catch(err => {
        console.warn('Kunne ikke hente publicConfig', err);
      });
    return () => { aborted = true; };
  }, [salonId, profile.id]);

  function handleEdit() {
    setEditing(true);
    setForm({
      id: profile.id,
      salonName: profile.salonName,
      ownerName: profile.ownerName,
      email: profile.email,
      address: profile.address,
      type: profile.type,
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    
    // Update profile via backend API
    updateSalon(profile.id, {
      name: form.salonName,
      owner: form.ownerName,
      email: form.email,
      address: form.address,
      type: form.type
    })
    .then(updatedSalon => {
      // Update the global profile context
      updateProfile({
        id: updatedSalon.id,
        salonName: updatedSalon.name,
        ownerName: updatedSalon.owner,
        email: updatedSalon.email,
        address: updatedSalon.address,
        type: updatedSalon.type,
      });
      setEditing(false);
    })
    .catch(error => {
      console.error('Failed to save profile:', error);
      alert('Kunne ikke gemme ændringer. Prøv igen.');
    });
  }

  function handleAddSalon() {
    setPaymentRequired(true);
  }

  // Public page edit handlers
  function startEditPublic() {
    if (!publicConfig) return;
    setEditingPublic(true);
    setPublicForm({ ...publicConfig });
  }

  function cancelEditPublic() {
    setEditingPublic(false);
    setPublicForm(null);
  }

  async function savePublic(e: React.FormEvent) {
    e.preventDefault();
    if (!publicForm) return;
    try {
      const id = salonId ? Number(salonId) : profile.id;
      const updated = await updateSalon(id, { publicConfig: { ...publicForm, updatedAt: new Date().toISOString() } });
      setPublicConfig(updated.publicConfig || publicForm);
      setEditingPublic(false);
    } catch (err) {
      console.error('Kunne ikke gemme publicConfig', err);
      alert('Kunne ikke gemme offentlig side konfiguration');
    }
  }

  async function resetPublic() {
    if (!confirm('Nulstil til standard tekster?')) return;
    try {
      const base: PublicPageConfig = {
        title: 'Velkommen til vores online booking',
        subtitle: 'Professionel behandling – nemt at booke',
        introText: 'Her kan du trygt booke din næste tid. Vi glæder os til at tage imod dig og give dig en god oplevelse.',
        highlightPoints: ['Erfarne behandlere','Nem online booking','Kvalitet & tryghed'],
        termsTitle: 'Generelle vilkår',
        termsBody: 'Afbud skal ske senest 4 timer før din aftale. Udeblivelser eller for sent afbud kan medføre gebyr svarende til 50% af behandlingens pris.',
        cancellationTitle: 'Afbuds- og ændringspolitik',
        cancellationBody: 'Du kan nemt aflyse eller ændre din tid via bekræftelsesmail eller ved at kontakte os. Senere end 4 timer før – kontakt os direkte.',
        footerNote: 'Tak fordi du vælger os – vi glæder os til at se dig! ✂️',
        primaryColor: '#111827',
        accentColor: '#6366f1',
        ctaEnabled: true,
        ctaText: 'Book tid',
        ctaLink: '#',
        logoUrl: undefined,
        coverImageUrl: undefined,
        updatedAt: new Date().toISOString()
      };
      const id = salonId ? Number(salonId) : profile.id;
      await updateSalon(id, { publicConfig: base });
      setPublicConfig(base);
    } catch (err) {
      console.error('Kunne ikke nulstille publicConfig', err);
      alert('Nulstilling fejlede');
    }
  }

  const publicPageUrl = publicConfig && (salonId || profile.id) ? `/p/${salonId || profile.id}` : null;

  return (
    <ClientLayout salonId={salonId}>
      <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Min Profil</h1>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div>Indlæser profil...</div>
          </div>
        ) : !editing ? (
          <>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32, marginBottom: 32 }}>
              <div style={{ marginBottom: 18 }}><b>Salonnavn:</b> {profile.salonName}</div>
              <div style={{ marginBottom: 18 }}><b>Ejer:</b> {profile.ownerName}</div>
              <div style={{ marginBottom: 18 }}><b>Email:</b> {profile.email}</div>
              <div style={{ marginBottom: 18 }}><b>Adresse:</b> {profile.address}</div>
              <div style={{ marginBottom: 18 }}><b>Type:</b> {profile.type}</div>
              <button onClick={handleEdit} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer', marginTop: 12 }}>Rediger profil</button>
            </div>

            {/* Public landing page config section */}
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32, marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Offentlig booking forside</h2>
                {publicPageUrl && (
                  <a href={publicPageUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, textDecoration: 'none', background: '#f3f4f6', padding: '8px 14px', borderRadius: 6, color: '#111' }}>Vis side</a>
                )}
              </div>
              {!editingPublic && publicConfig && (
                <div>
                  <div style={{ marginBottom: 14 }}><b>Titel:</b> {publicConfig.title}</div>
                  <div style={{ marginBottom: 14 }}><b>Undertekst:</b> {publicConfig.subtitle}</div>
                  <div style={{ marginBottom: 14 }}><b>Intro:</b><br />{publicConfig.introText}</div>
                  <div style={{ marginBottom: 14 }}><b>Highlights:</b>
                    <ul style={{ marginTop: 6 }}>
                      {publicConfig.highlightPoints.map((p,i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                  <div style={{ marginBottom: 14 }}><b>{publicConfig.termsTitle}:</b><br />{publicConfig.termsBody}</div>
                  <div style={{ marginBottom: 14 }}><b>{publicConfig.cancellationTitle}:</b><br />{publicConfig.cancellationBody}</div>
                  <div style={{ marginBottom: 14 }}><b>Footer note:</b><br />{publicConfig.footerNote}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Sidst opdateret: {new Date(publicConfig.updatedAt).toLocaleString('da-DK')}</div>
                  <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                    <button onClick={startEditPublic} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14 }}>Rediger tekst</button>
                    <button onClick={resetPublic} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14 }}>Nulstil</button>
                  </div>
                </div>
              )}
              {editingPublic && publicForm && (
                <form onSubmit={savePublic}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontWeight: 600 }}>Primær farve</label>
                      <input type="color" value={publicForm.primaryColor || '#111827'} onChange={e => setPublicForm({ ...publicForm, primaryColor: e.target.value })} style={{ ...inputStyle, padding: 2, height: 46 }} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 600 }}>Accent farve</label>
                      <input type="color" value={publicForm.accentColor || '#6366f1'} onChange={e => setPublicForm({ ...publicForm, accentColor: e.target.value })} style={{ ...inputStyle, padding: 2, height: 46 }} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 600 }}>Logo (billede)</label>
                      <input type="file" accept="image/*" onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const b64 = await fileToBase64(file);
                        setPublicForm({ ...publicForm, logoUrl: b64 });
                      }} style={inputStyle} />
                      {publicForm.logoUrl && <div style={{ marginTop: 6 }}><img src={publicForm.logoUrl} alt="logo" style={{ maxHeight: 60, objectFit: 'contain' }} /></div>}
                    </div>
                    <div>
                      <label style={{ fontWeight: 600 }}>Cover billede</label>
                      <input type="file" accept="image/*" onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const b64 = await fileToBase64(file);
                        setPublicForm({ ...publicForm, coverImageUrl: b64 });
                      }} style={inputStyle} />
                      {publicForm.coverImageUrl && <div style={{ marginTop: 6 }}><img src={publicForm.coverImageUrl} alt="cover" style={{ maxHeight: 60, objectFit: 'cover', borderRadius: 4 }} /></div>}
                    </div>
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <label style={{ fontWeight: 600 }}>Titel</label>
                      <input value={publicForm.title} onChange={e => setPublicForm({ ...publicForm, title: e.target.value })} style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <label style={{ fontWeight: 600 }}>Undertekst</label>
                      <input value={publicForm.subtitle} onChange={e => setPublicForm({ ...publicForm, subtitle: e.target.value })} style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <label style={{ fontWeight: 600 }}>Intro tekst</label>
                      <textarea value={publicForm.introText} onChange={e => setPublicForm({ ...publicForm, introText: e.target.value })} style={textareaStyle} rows={3} />
                    </div>
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <label style={{ fontWeight: 600 }}>Highlights (1 per linje)</label>
                      <textarea value={publicForm.highlightPoints.join('\n')} onChange={e => setPublicForm({ ...publicForm, highlightPoints: e.target.value.split(/\n+/).filter(x=>x.trim()) })} style={textareaStyle} rows={3} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 600 }}>Vilkår titel</label>
                      <input value={publicForm.termsTitle} onChange={e => setPublicForm({ ...publicForm, termsTitle: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 600 }}>Afbud titel</label>
                      <input value={publicForm.cancellationTitle} onChange={e => setPublicForm({ ...publicForm, cancellationTitle: e.target.value })} style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <label style={{ fontWeight: 600 }}>Vilkår tekst</label>
                      <textarea value={publicForm.termsBody} onChange={e => setPublicForm({ ...publicForm, termsBody: e.target.value })} style={textareaStyle} rows={4} />
                    </div>
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <label style={{ fontWeight: 600 }}>Afbuds tekst</label>
                      <textarea value={publicForm.cancellationBody} onChange={e => setPublicForm({ ...publicForm, cancellationBody: e.target.value })} style={textareaStyle} rows={4} />
                    </div>
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <label style={{ fontWeight: 600 }}>Footer note</label>
                      <textarea value={publicForm.footerNote} onChange={e => setPublicForm({ ...publicForm, footerNote: e.target.value })} style={textareaStyle} rows={2} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, display: 'block' }}>CTA aktiveret</label>
                      <input type="checkbox" checked={publicForm.ctaEnabled !== false} onChange={e => setPublicForm({ ...publicForm, ctaEnabled: e.target.checked })} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 600 }}>CTA tekst</label>
                      <input value={publicForm.ctaText || ''} onChange={e => setPublicForm({ ...publicForm, ctaText: e.target.value })} style={inputStyle} disabled={publicForm.ctaEnabled === false} />
                    </div>
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <label style={{ fontWeight: 600 }}>CTA link (URL eller #)</label>
                      <input value={publicForm.ctaLink || ''} onChange={e => setPublicForm({ ...publicForm, ctaLink: e.target.value })} style={inputStyle} disabled={publicForm.ctaEnabled === false} />
                    </div>
                  </div>
                  <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
                    <button type="submit" style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', cursor: 'pointer', fontSize: 14 }}>Gem landing page</button>
                    <button type="button" onClick={cancelEditPublic} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 6, padding: '10px 22px', cursor: 'pointer', fontSize: 14 }}>Annuller</button>
                  </div>
                </form>
              )}
            </div>

            <div style={{ background: '#f3f4f8', borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>Tilføj ekstra salon</h2>
              <p style={{ color: '#666', marginBottom: 18 }}>Du kan tilføje en ekstra salon til din konto. Dette kræver betaling.</p>
              <button onClick={handleAddSalon} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Tilføj salon (kræver betaling)</button>
              {paymentRequired && (
                <div style={{ marginTop: 24, color: '#ef4444', fontWeight: 500 }}>
                  Betalingsfunktion ikke implementeret endnu.
                </div>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32 }}>
            <div style={{ marginBottom: 18 }}>
              <label><b>Salonnavn:</b></label><br />
              <input value={form.salonName} onChange={e => setForm({ ...form, salonName: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label><b>Ejer:</b></label><br />
              <input value={form.ownerName} readOnly style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, background: '#f3f4f8', color: '#888' }} />
              <div style={{ color: '#ef4444', fontSize: 14, marginTop: 4 }}>
                Ejer kan kun ændres af admin. Kontakt support for at overføre ejerskab.
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label><b>Email:</b></label><br />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label><b>Adresse:</b></label><br />
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label><b>Type:</b></label><br />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}>
                <option value="">Vælg kundetype</option>
                <option value="Frisør">Frisør</option>
                <option value="Skønhedsklinik">Skønhedsklinik</option>
                <option value="Tandlæge">Tandlæge</option>
                <option value="Spa">Spa</option>
              </select>
            </div>
            <button type="submit" style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer', marginTop: 12 }}>Gem ændringer</button>
            <button type="button" onClick={() => setEditing(false)} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer', marginTop: 12, marginLeft: 12 }}>Annuller</button>
          </form>
        )}
      </div>
    </ClientLayout>
  );
}

// Simple shared styles for inputs in public edit form
const inputStyle: React.CSSProperties = { width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', fontFamily: 'inherit' };

// Helper til at konvertere billede til base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
