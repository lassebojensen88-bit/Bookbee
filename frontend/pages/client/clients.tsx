
import React, { useEffect, useState, useRef } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { UserIcon } from '../../components/icons';
import { parseClientsCSV } from '../../utils/csvImport';

type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit?: string;
  nextAppointment?: string;
  totalBookings?: number;
  totalSpent?: number;
  notes?: string;
};

type BookingSlot = {
  start: number;
  end: number;
  name: string;
  service: string;
  price: number;
  phone: string;
};

interface ClientsProps {
  salonId?: string;
}

export default function Clients({ salonId }: ClientsProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add customer modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  // Edit customer modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Client | null>(null);
  const [editCustomer, setEditCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Function to extract clients from booking data
  function extractClientsFromBookings(): Client[] {
    // Use salon-specific localStorage key
    const storageKey = salonId ? `allBookings_salon_${salonId}` : 'allBookings';
    const savedBookings = localStorage.getItem(storageKey);
    let allBookingsData: Record<string, BookingSlot[]> = {};
    
    if (savedBookings) {
      try {
        allBookingsData = JSON.parse(savedBookings);
      } catch (e) {
        // If parsing fails, use default data
      }
    }
    
    // Default booking data if nothing in localStorage
    // Only add mock data for the default/legacy system (no salonId)
    if (Object.keys(allBookingsData).length === 0 && !salonId) {
      const today = new Date().toDateString();
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      allBookingsData = {
        [today]: [
          { start: 9, end: 10, name: 'Marie Hansen', service: 'Dameklip', price: 349, phone: '12345678' },
          { start: 10.5, end: 13, name: 'Peter Nielsen', service: 'Herreklip + Hårfarvning', price: 599, phone: '87654321' },
          { start: 13.5, end: 14.5, name: 'Lars Olsen', service: 'Herreklip + Skægtrim', price: 329, phone: '23456789' },
          { start: 15, end: 17.5, name: 'Sofie Madsen', service: 'Balayage + Klip', price: 899, phone: '34567890' },
        ],
        [tomorrow]: [
          { start: 9.5, end: 11, name: 'Anna Larsen', service: 'Dameklip', price: 349, phone: '45678901' },
          { start: 14, end: 16, name: 'Michael Jensen', service: 'Herreklip + Styling', price: 399, phone: '56789012' },
        ],
        [yesterday]: [
          { start: 10, end: 11, name: 'Lise Nielsen', service: 'Dameklip + Føn', price: 449, phone: '67890123' },
          { start: 15, end: 15.5, name: 'Tom Andersen', service: 'Herreklip', price: 249, phone: '78901234' },
        ]
      };
    }

    // Extract unique clients from all bookings using phone number as primary key
    const clientMap = new Map<string, Client>(); // Using phone as key for easier matching
    let clientIdCounter = 1;

    Object.entries(allBookingsData).forEach(([dateStr, bookings]) => {
      const date = new Date(dateStr);
      
      bookings.forEach((booking) => {
        const phoneKey = booking.phone || ''; // Use phone as primary key
        
        if (clientMap.has(phoneKey) && phoneKey !== '') {
          const client = clientMap.get(phoneKey)!;
          client.totalBookings = (client.totalBookings || 0) + 1;
          client.totalSpent = (client.totalSpent || 0) + booking.price;
          
          // Update last visit if this booking is more recent
          if (!client.lastVisit || new Date(client.lastVisit) < date) {
            client.lastVisit = date.toISOString().split('T')[0];
          }
          
          // Update next appointment if this booking is in the future
          if (date > new Date() && (!client.nextAppointment || new Date(client.nextAppointment) > date)) {
            client.nextAppointment = date.toISOString().split('T')[0];
          }
        } else if (phoneKey !== '') {
          const client: Client = {
            id: clientIdCounter++,
            name: booking.name,
            email: `${booking.name.toLowerCase().replace(' ', '.')}@email.com`,
            phone: booking.phone,
            totalBookings: 1,
            totalSpent: booking.price,
          };
          
          if (date <= new Date()) {
            client.lastVisit = date.toISOString().split('T')[0];
          } else {
            client.nextAppointment = date.toISOString().split('T')[0];
          }
          
          clientMap.set(phoneKey, client);
        }
      });
    });

    // Load manually added clients for this salon
    const manualStorageKey = salonId ? `manualClients_salon_${salonId}` : 'manualClients';
    const existingManualClients = localStorage.getItem(manualStorageKey);
    let manualClients: Client[] = [];
    
    if (existingManualClients) {
      try {
        manualClients = JSON.parse(existingManualClients);
      } catch (e) {
        console.error('Failed to parse manual clients:', e);
      }
    }
    
    // Merge manual clients with booking data based on phone number
    manualClients.forEach(manualClient => {
      const phoneKey = manualClient.phone;
      if (clientMap.has(phoneKey) && phoneKey !== '') {
        // Customer exists in bookings - merge data, prioritizing booking statistics
        const existingClient = clientMap.get(phoneKey)!;
        existingClient.email = manualClient.email || existingClient.email; // Use manual email if provided
        existingClient.notes = manualClient.notes; // Keep manual notes
        // Keep booking statistics (totalBookings, totalSpent, lastVisit, nextAppointment)
      } else {
        // Customer only exists in manual list - add them with manual data
        clientMap.set(phoneKey, {
          ...manualClient,
          totalBookings: manualClient.totalBookings || 0,
          totalSpent: manualClient.totalSpent || 0
        });
      }
    });

    const allClients = Array.from(clientMap.values());
    
    console.log('👥 Clients page debug:', {
      totalClients: allClients.length,
      uniquePhones: Array.from(clientMap.keys()),
      clientsFromBookings: Array.from(clientMap.values()).filter(c => c.totalBookings && c.totalBookings > 0).length,
      clientsManualOnly: Array.from(clientMap.values()).filter(c => !c.totalBookings || c.totalBookings === 0).length
    });
    
    return allClients.sort((a, b) => a.name.localeCompare(b.name));
  }

  async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseClientsCSV(file);
      // Map CSV data to Client type (add id, fallback for missing fields)
      const importedClients: Client[] = data.map((row: any, idx: number) => ({
        id: Date.now() + idx, // Temporary unique id
        name: row.name || row.Navn || '',
        email: row.email || row.Email || '',
        phone: row.phone || row.Telefon || '',
        lastVisit: row.lastVisit || row['Sidste besøg'] || '',
        nextAppointment: row.nextAppointment || row['Næste tid'] || '',
      }));
      setClients(prev => [...prev, ...importedClients]);
    } catch (err) {
      alert('Kunne ikke importere CSV: ' + (err as any).message);
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Handle adding a new customer manually
  function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate required fields
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      alert('Navn og telefon er påkrævet');
      return;
    }
    
    // Create new customer object
    const customer: Client = {
      id: Date.now(), // Simple unique ID
      name: newCustomer.name.trim(),
      email: newCustomer.email.trim() || '', // Don't auto-generate email
      phone: newCustomer.phone.trim(),
      totalBookings: 0,
      totalSpent: 0,
      lastVisit: undefined,
      nextAppointment: undefined
    };
    
    // Add to clients list
    setClients(prev => [...prev, customer]);
    
    // Store manually added customers separately for this salon
    const manualStorageKey = salonId ? `manualClients_salon_${salonId}` : 'manualClients';
    const existingManualClients = localStorage.getItem(manualStorageKey);
    let manualClients: Client[] = [];
    
    if (existingManualClients) {
      try {
        manualClients = JSON.parse(existingManualClients);
      } catch (e) {
        console.error('Failed to parse manual clients:', e);
      }
    }
    
    manualClients.push(customer);
    localStorage.setItem(manualStorageKey, JSON.stringify(manualClients));
    
    // Reset form and close modal
    setNewCustomer({ name: '', email: '', phone: '', notes: '' });
    setShowAddModal(false);
    
    // Dispatch event to update other components if needed
    window.dispatchEvent(new Event('clientsUpdated'));
  }

  // Handle editing a customer
  function handleEditCustomer(customer: Client) {
    setEditingCustomer(customer);
    setEditCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      notes: ''
    });
    setShowEditModal(true);
  }

  // Handle saving edited customer
  function handleSaveEditCustomer(e: React.FormEvent) {
    e.preventDefault();
    
    if (!editingCustomer) return;
    
    // Validate required fields
    if (!editCustomer.name.trim() || !editCustomer.phone.trim()) {
      alert('Navn og telefon er påkrævet');
      return;
    }
    
    // Update customer in clients list
    const updatedCustomer: Client = {
      ...editingCustomer,
      name: editCustomer.name.trim(),
      email: editCustomer.email.trim() || '',
      phone: editCustomer.phone.trim(),
      notes: editCustomer.notes?.trim()
    };
    
    setClients(prev => prev.map(client => 
      client.id === editingCustomer.id ? updatedCustomer : client
    ));
    
    // Update in manual clients storage
    const manualStorageKey = salonId ? `manualClients_salon_${salonId}` : 'manualClients';
    const existingManualClients = localStorage.getItem(manualStorageKey);
    let manualClients: Client[] = [];
    
    if (existingManualClients) {
      try {
        manualClients = JSON.parse(existingManualClients);
      } catch (e) {
        console.error('Failed to parse manual clients:', e);
      }
    }
    
    // Find if this customer exists in manual clients storage
    const existingIndex = manualClients.findIndex(client => client.id === editingCustomer.id);
    
    if (existingIndex >= 0) {
      // Update existing manual client
      manualClients[existingIndex] = updatedCustomer;
    } else {
      // If customer wasn't in manual storage but was edited manually, add them
      // This preserves any booking statistics they might have from the booking system
      manualClients.push(updatedCustomer);
    }
    
    localStorage.setItem(manualStorageKey, JSON.stringify(manualClients));
    
    // Close modal and reset state
    setShowEditModal(false);
    setEditingCustomer(null);
    setEditCustomer({ name: '', email: '', phone: '', notes: '' });
    
    // Refresh client data to ensure proper merging with booking data
    setTimeout(() => {
      const extractedClients = extractClientsFromBookings();
      setClients(extractedClients);
    }, 100);
  }

  // Handle deleting a customer
  function handleDeleteCustomer(customer: Client) {
    const confirmDelete = window.confirm(`Er du sikker på at du vil slette kunden "${customer.name}"?\n\nDenne handling kan ikke fortrydes.`);
    
    if (!confirmDelete) return;
    
    // Remove from clients list
    setClients(prev => prev.filter(client => client.id !== customer.id));
    
    // Remove from manual clients storage if this was a manually added customer
    const manualStorageKey = salonId ? `manualClients_salon_${salonId}` : 'manualClients';
    const existingManualClients = localStorage.getItem(manualStorageKey);
    
    if (existingManualClients) {
      try {
        const manualClients: Client[] = JSON.parse(existingManualClients);
        const updatedManualClients = manualClients.filter(client => client.id !== customer.id);
        localStorage.setItem(manualStorageKey, JSON.stringify(updatedManualClients));
      } catch (e) {
        console.error('Failed to update manual clients:', e);
      }
    }
    
    // Dispatch event to update other components
    window.dispatchEvent(new Event('clientsUpdated'));
  }

  useEffect(() => {
    // Extract clients from booking data
    setTimeout(() => {
      const extractedClients = extractClientsFromBookings();
      setClients(extractedClients);
      setLoading(false);
    }, 500);

    // Listen for booking updates
    const handleStorageChange = () => {
      const extractedClients = extractClientsFromBookings();
      setClients(extractedClients);
    };

    // Listen for localStorage changes (when bookings are updated from dashboard)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when bookings are updated in the same tab
    window.addEventListener('bookingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookingsUpdated', handleStorageChange);
    };
  }, [salonId]); // Re-run when salonId changes

  return (
    <ClientLayout salonId={salonId}>
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Mine Kunder</h1>
        
        {/* Information about automatic booking integration */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #7dd3fc',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          fontSize: 14,
          color: '#0c4a6e'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>📞 Automatisk booking-integration</div>
          <div>
            Når eksisterende kunder booker nye tider vil deres statistikker automatisk blive opdateret baseret på telefonnummer. 
            Bookinger fra kalenderen vil automatisk vises som "Antal Bookinger" og "Samlet Forbrug" for den matchende kunde.
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          padding: 24,
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Kundeliste</h2>
              <p style={{ color: '#666', margin: '8px 0 0 0' }}>{clients.length} kunder i alt</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowAddModal(true)}
                style={{
                background: '#222',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: 20, marginRight: 4 }}>+</span> Tilføj kunde
              </button>
              <button
                style={{
                  background: '#fff',
                  color: '#222',
                  border: '1px solid #222',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                Importér CSV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleImportCSV}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Navn</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Telefon</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Bookings</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Sidste besøg</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Næste tid</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Total brugt</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <UserIcon style={{ color: '#6b7280', width: 18, height: 18 }} />
                        </div>
                        {client.name}
                      </div>
                    </td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>{client.phone}</td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>{client.email}</td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        background: '#dbeafe', 
                        color: '#1e40af',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 14,
                        fontWeight: 500
                      }}>
                        {client.totalBookings || 0}
                      </span>
                    </td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>{client.lastVisit || '-'}</td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                      {client.nextAppointment ? (
                        <span style={{ 
                          background: '#f0fdf4', 
                          color: '#166534',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 14,
                          fontWeight: 500
                        }}>
                          {client.nextAppointment}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: '#059669' }}>
                        {client.totalSpent ? `${client.totalSpent} kr.` : '-'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button 
                        onClick={() => handleEditCustomer(client)}
                        style={{
                        background: 'transparent',
                        border: '1px solid #e5e7eb',
                        borderRadius: 6,
                        padding: '6px 12px',
                        marginRight: 8,
                        color: '#374151',
                        fontSize: 14,
                        cursor: 'pointer'
                      }}>Rediger</button>
                      <button 
                        onClick={() => handleDeleteCustomer(client)}
                        style={{
                        background: 'transparent',
                        border: '1px solid #fee2e2',
                        borderRadius: 6,
                        padding: '6px 12px',
                        color: '#ef4444',
                        fontSize: 14,
                        cursor: 'pointer'
                      }}>Slet</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Add Customer Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 32,
              minWidth: 400,
              maxWidth: 500,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, margin: 0 }}>Tilføj ny kunde</h2>
              
              <form onSubmit={handleAddCustomer}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Navn <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Kundens fulde navn"
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
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Telefon <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="12345678"
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
                
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Email (valgfri)
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="kunde@email.dk"
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
                
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewCustomer({ name: '', email: '', phone: '', notes: '' });
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
                    Tilføj kunde
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditModal && editingCustomer && (
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
              <h2 style={{ 
                fontSize: 24, 
                fontWeight: 600, 
                marginBottom: 24,
                color: '#111827'
              }}>
                Rediger kunde
              </h2>
              
              <form onSubmit={handleSaveEditCustomer}>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Navn *
                  </label>
                  <input
                    type="text"
                    value={editCustomer.name}
                    onChange={(e) => setEditCustomer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Fulde navn"
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
                
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Telefonnummer *
                  </label>
                  <input
                    type="tel"
                    value={editCustomer.phone}
                    onChange={(e) => setEditCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+45 XX XX XX XX"
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
                
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>
                    Email (valgfri)
                  </label>
                  <input
                    type="email"
                    value={editCustomer.email}
                    onChange={(e) => setEditCustomer(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="kunde@email.dk"
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
                
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCustomer(null);
                      setEditCustomer({ name: '', email: '', phone: '', notes: '' });
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
                    Gem ændringer
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