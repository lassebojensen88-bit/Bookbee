import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ClientLayout from '../../../components/ClientLayout';
import { SalonIcon, UserIcon } from '../../../components/icons';
import { listServices, createService, updateService, deleteService } from '../../../utils/api';

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number; // in hours
  category?: string;
  description?: string;
}

export default function Services() {
  const router = useRouter();
  const { salonId } = router.query as { salonId: string };
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    duration: '',
    category: '',
    description: ''
  });

  // Load services from localStorage on component mount
  useEffect(() => {
    if (!salonId) return;
    let cancelled = false;
    const init = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const api = await listServices(Number(salonId));
        if (cancelled) return;
        // Map API service -> UI service
        const mapped: Service[] = api.map(s => ({
          id: s.id,
          name: s.name,
          price: parseFloat(s.price),
          duration: s.durationMin / 60,
          description: s.description || undefined
        }));
        setServices(mapped);
      } catch (e: any) {
        // Fallback to localStorage approach
        setApiError(e?.message || 'Kunne ikke hente services fra API – viser lokal data');
        loadServices();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, [salonId]);

  const loadServices = () => {
    const storageKey = `services_salon_${salonId}`;
    const savedServices = localStorage.getItem(storageKey);
    
    if (savedServices) {
      try {
        setServices(JSON.parse(savedServices));
      } catch (e) {
        console.error('Failed to parse services:', e);
        setDefaultServices();
      }
    } else {
      setDefaultServices();
    }
  };

  const setDefaultServices = () => {
    const defaultServices: Service[] = [
      { id: 1, name: 'Herreklip', price: 249, duration: 0.5, category: 'Herre' },
      { id: 2, name: 'Herreklip + Skægtrim', price: 329, duration: 1, category: 'Herre' },
      { id: 3, name: 'Herreklip + Styling', price: 399, duration: 1.5, category: 'Herre' },
      { id: 4, name: 'Dameklip', price: 349, duration: 1, category: 'Dame' },
      { id: 5, name: 'Dameklip + Føn', price: 449, duration: 1.5, category: 'Dame' },
      { id: 6, name: 'Balayage + Klip', price: 899, duration: 2.5, category: 'Dame' },
      { id: 7, name: 'Hårfarvning', price: 599, duration: 2, category: 'Dame' }
    ];
    setServices(defaultServices);
    saveServices(defaultServices);
  };

  const saveServices = (servicesToSave: Service[]) => {
    const storageKey = `services_salon_${salonId}`;
    localStorage.setItem(storageKey, JSON.stringify(servicesToSave));
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('servicesUpdated'));
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name.trim() || !newService.price || !newService.duration) {
      alert('Navn, pris og varighed er påkrævet');
      return;
    }
    const durationHours = parseFloat(newService.duration);
    const priceNumber = parseFloat(newService.price);
    const optimistic: Service = {
      id: Date.now(),
      name: newService.name.trim(),
      price: priceNumber,
      duration: durationHours,
      category: newService.category.trim() || undefined,
      description: newService.description.trim() || undefined
    };
    setServices(prev => [...prev, optimistic]);
    setSaving(true);
    try {
      if (salonId) {
        const created = await createService(Number(salonId), {
          name: optimistic.name,
          description: optimistic.description,
          durationMin: Math.round(durationHours * 60),
          price: priceNumber.toFixed(2)
        });
        // Replace optimistic with actual (id, canonical values)
        setServices(prev => prev.map(s => s.id === optimistic.id ? {
          id: created.id,
          name: created.name,
          price: parseFloat(created.price),
          duration: created.durationMin / 60,
          description: created.description || undefined
        } : s));
      } else {
        saveServices([...services, optimistic]);
      }
      setShowAddModal(false);
      setNewService({ name: '', price: '', duration: '', category: '', description: '' });
    } catch (err: any) {
      alert('Kunne ikke oprette service: ' + (err.message || 'Ukendt fejl'));
      // Rollback optimistic
      setServices(prev => prev.filter(s => s.id !== optimistic.id));
    } finally {
      setSaving(false);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category || '',
      description: service.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !newService.name.trim() || !newService.price || !newService.duration) {
      alert('Navn, pris og varighed er påkrævet');
      return;
    }
    const priceNumber = parseFloat(newService.price);
    const durationHours = parseFloat(newService.duration);
    const original = editingService;
    const updated: Service = {
      ...editingService,
      name: newService.name.trim(),
      price: priceNumber,
      duration: durationHours,
      category: newService.category.trim() || undefined,
      description: newService.description.trim() || undefined
    };
    setServices(prev => prev.map(s => s.id === original.id ? updated : s));
    setSaving(true);
    try {
      if (salonId && original.id) {
        await updateService(original.id, {
          name: updated.name,
          description: updated.description,
          durationMin: Math.round(updated.duration * 60),
          price: priceNumber.toFixed(2)
        });
      } else {
        saveServices(services.map(s => s.id === original.id ? updated : s));
      }
      setShowEditModal(false);
      setEditingService(null);
      setNewService({ name: '', price: '', duration: '', category: '', description: '' });
    } catch (err: any) {
      alert('Kunne ikke opdatere service: ' + (err.message || 'Ukendt fejl'));
      // Rollback
      setServices(prev => prev.map(s => s.id === original.id ? original : s));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (service: Service) => {
    const confirmDelete = window.confirm(`Er du sikker på at du vil slette "${service.name}"?\n\nDenne handling kan ikke fortrydes.`);
    if (!confirmDelete) return;
    const prev = services;
    setServices(prev.filter(s => s.id !== service.id));
    try {
      if (salonId && service.id) {
        await deleteService(service.id);
      } else {
        saveServices(prev.filter(s => s.id !== service.id));
      }
    } catch (err: any) {
      alert('Kunne ikke slette service: ' + (err.message || 'Ukendt fejl'));
      // rollback
      setServices(prev);
    }
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration);
    const minutes = Math.round((duration % 1) * 60);
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} time${hours > 1 ? 'r' : ''}`;
    } else {
      return `${hours}t ${minutes}min`;
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || 'Andet';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <ClientLayout salonId={salonId}>
      <div style={{ padding: 24 }}>
        {/* Minimalistic Header Bar */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: 32,
          marginBottom: 32,
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Service Icon in Circle */}
              <div style={{
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '50%',
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#374151" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="6" cy="6" r="3"/>
                  <circle cx="6" cy="18" r="3"/>
                  <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                  <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                  <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                </svg>
              </div>
              
              <div>
                <h1 style={{ 
                  fontSize: 32, 
                  fontWeight: 700, 
                  margin: 0,
                  color: '#111827'
                }}>
                  Services
                </h1>
                <p style={{ 
                  fontSize: 16, 
                  color: '#6b7280', 
                  margin: '4px 0 0',
                  fontWeight: 500
                }}>
                  Tilføj services til din salon
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#111827',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '14px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#374151';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#111827';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tilføj Service
            </button>
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}>
          {apiError && (
            <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px 20px', borderBottom: '1px solid #fecaca', fontSize: 14 }}>
              {apiError}
            </div>
          )}
          {loading && services.length === 0 && (
            <div style={{ padding: '32px 24px', fontSize: 14, color: '#6b7280' }}>Henter services...</div>
          )}
          {Object.entries(groupedServices).map(([category, categoryServices]) => (
            <div key={category}>
              <div style={{
                background: '#f8f9fa',
                padding: '16px 24px',
                borderBottom: '1px solid #e5e7eb',
                fontSize: 18,
                fontWeight: 600,
                color: '#374151'
              }}>
                {category}
              </div>
              
              {categoryServices.map((service, index) => (
                <div
                  key={service.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderBottom: index === categoryServices.length - 1 ? 'none' : '1px solid #f3f4f6'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: '#111827' }}>
                      {service.name}
                    </div>
                    <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                      {formatDuration(service.duration)}
                      {service.description && ` • ${service.description}`}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#059669' }} title="Pris">
                      {service.price.toFixed ? service.price.toFixed(0) : service.price} kr
                    </div>
                    
                    <button
                      onClick={() => handleEditService(service)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 14,
                        color: '#374151',
                        cursor: 'pointer'
                      }}
                    >
                      Rediger
                    </button>
                    
                    <button
                      onClick={() => handleDeleteService(service)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #fee2e2',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 14,
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      Slet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          
          {services.length === 0 && (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <SalonIcon style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.3 }} />
              <div style={{ fontSize: 18, marginBottom: 8 }}>Ingen services endnu</div>
              <div style={{ fontSize: 14 }}>Klik på "Tilføj Service" for at komme i gang</div>
            </div>
          )}
        </div>

        {/* Add Service Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              width: '100%',
              maxWidth: 500
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, color: '#111827' }}>
                Tilføj Ny Service
              </h2>
              
              <form onSubmit={handleAddService}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Service Navn *
                  </label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="f.eks. Herreklip"
                    required
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                      Pris (kr) *
                    </label>
                    <input
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="299"
                      required
                      min="0"
                      step="1"
                      style={{
                        width: '100%',
                        padding: 12,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 16,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                      Varighed (timer) *
                    </label>
                    <input
                      type="number"
                      value={newService.duration}
                      onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="1.5"
                      required
                      min="0.25"
                      step="0.25"
                      style={{
                        width: '100%',
                        padding: 12,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 16,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={newService.category}
                    onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="f.eks. Dame, Herre, Skønhed"
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Beskrivelse
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Kort beskrivelse af servicen..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewService({ name: '', price: '', duration: '', category: '', description: '' });
                    }}
                    style={{
                      padding: '12px 24px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      background: 'white',
                      fontSize: 16,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Annuller
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: 8,
                      background: '#222',
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Tilføj Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Service Modal */}
        {showEditModal && editingService && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              width: '100%',
              maxWidth: 500
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, color: '#111827' }}>
                Rediger Service
              </h2>
              
              <form onSubmit={handleUpdateService}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Service Navn *
                  </label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="f.eks. Herreklip"
                    required
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                      Pris (kr) *
                    </label>
                    <input
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="299"
                      required
                      min="0"
                      step="1"
                      style={{
                        width: '100%',
                        padding: 12,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 16,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                      Varighed (timer) *
                    </label>
                    <input
                      type="number"
                      value={newService.duration}
                      onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="1.5"
                      required
                      min="0.25"
                      step="0.25"
                      style={{
                        width: '100%',
                        padding: 12,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 16,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={newService.category}
                    onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="f.eks. Dame, Herre, Skønhed"
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Beskrivelse
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Kort beskrivelse af servicen..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingService(null);
                      setNewService({ name: '', price: '', duration: '', category: '', description: '' });
                    }}
                    style={{
                      padding: '12px 24px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      background: 'white',
                      fontSize: 16,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Annuller
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: 8,
                      background: '#222',
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Gem Ændringer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}