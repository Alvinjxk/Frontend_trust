import React, { useState, useEffect } from 'react';
import api from '../api';

function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('vendors/').then(res => {
      setVendors(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = vendors.filter(v =>
    v.full_name.toLowerCase().includes(search.toLowerCase()) ||
    v.district.toLowerCase().includes(search.toLowerCase()) ||
    v.phone_number.includes(search)
  );

  return (
    <div>
      <div className="top-bar fade-in-up">
        <div>
          <div className="page-title">Vendors</div>
          <div className="page-subtitle">{vendors.length} registered vendors on platform</div>
        </div>
        <div className="top-bar-right">
          <div className="top-bar-avatar">A</div>
        </div>
      </div>

      <div className="card fade-in-up-1">
        <div className="search-bar">
          <span style={{ fontSize: 16 }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, district or phone number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <span
              style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}
              onClick={() => setSearch('')}
            >✕</span>
          )}
        </div>

        {loading ? (
          <div className="empty-state">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading vendors...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-title">{search ? 'No vendors match your search' : 'No vendors yet'}</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {search ? 'Try a different search term' : 'Vendors will appear here once registered via USSD'}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Phone Number</th>
                  <th>District</th>
                  <th>Consent</th>
                  <th>Registered</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vendor, i) => (
                  <tr key={vendor.id} style={{ animationDelay: `${i * 0.05}s` }}>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 13 }}>
                      #{String(vendor.id).padStart(4, '0')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: `hsl(${vendor.id * 47}, 60%, 20%)`,
                          border: `1px solid hsl(${vendor.id * 47}, 60%, 35%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: `hsl(${vendor.id * 47}, 80%, 70%)`,
                          fontFamily: 'Syne'
                        }}>
                          {vendor.full_name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{vendor.full_name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 13 }}>
                      {vendor.phone_number}
                    </td>
                    <td>
                      <span style={{ background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: 6, fontSize: 13 }}>
                        📍 {vendor.district}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${vendor.consent_given ? 'badge-yes' : 'badge-no'}`}>
                        {vendor.consent_given ? '✓ Given' : '✗ Pending'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {new Date(vendor.registration_date).toLocaleDateString('en-UG', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <span className="badge badge-excellent">● Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing {filtered.length} of {vendors.length} vendors
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorList;