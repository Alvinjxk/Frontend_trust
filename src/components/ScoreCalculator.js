import React, { useState, useEffect } from 'react';
import api from '../api';

function ScoreGauge({ score, color }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="score-gauge-container">
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width="200" height="200" className="gauge-svg">
          <circle className="gauge-track" cx="100" cy="100" r={radius} />
          <circle
            className="gauge-fill"
            cx="100" cy="100" r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center'
        }}>
          <div className="score-number" style={{ color }}>{score}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>/ 100</div>
        </div>
      </div>
    </div>
  );
}

function ScoreCalculator() {
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('vendors/').then(res => setVendors(res.data));
  }, []);

  const getBandInfo = (band) => {
    if (!band) return { color: '#64748b', label: 'Unknown', emoji: '❓' };
    const b = band.toUpperCase();
    if (b.includes('EXCELLENT')) return { color: '#10b981', label: 'Excellent', emoji: '🏆' };
    if (b.includes('GOOD')) return { color: '#3b82f6', label: 'Good', emoji: '✅' };
    if (b.includes('FAIR')) return { color: '#f59e0b', label: 'Fair', emoji: '⚠️' };
    return { color: '#ef4444', label: 'Poor', emoji: '❌' };
  };

  const getLoanRecommendation = (score) => {
    if (score > 75) return { amount: 'Up to UGX 5,000,000', term: '12 months', rate: '8-12% per annum' };
    if (score > 55) return { amount: 'Up to UGX 2,000,000', term: '6 months', rate: '12-18% per annum' };
    if (score > 30) return { amount: 'Up to UGX 500,000', term: '3 months', rate: '18-24% per annum' };
    return { amount: 'Not eligible', term: '—', rate: '—' };
  };

  const calculateScore = async () => {
    if (!vendorId) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('scores/calculate/', {
        vendor_id: parseInt(vendorId),
        avg_monthly_inflow: 600000,
        avg_monthly_outflow: 400000,
        inflow_outflow_ratio: 1.5,
        txn_frequency: 25,
        active_days_pct: 0.8,
        bill_payment_consistency: 0.7,
        savings_behaviour_score: 0.6,
        mobile_loan_repayment: 1
      });
      setResult(res.data);
    } catch (err) {
      setError('Failed to calculate score. Please try again.');
    }
    setLoading(false);
  };

  const selectedVendor = vendors.find(v => v.id === parseInt(vendorId));
  const bandInfo = result ? getBandInfo(result.risk_band) : null;
  const loanRec = result ? getLoanRecommendation(result.trust_score) : null;

  return (
    <div>
      <div className="top-bar fade-in-up">
        <div>
          <div className="page-title">Score Calculator</div>
          <div className="page-subtitle">Generate an AI trust score for any registered vendor</div>
        </div>
        <div className="top-bar-right">
          <div className="top-bar-avatar">A</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.4fr' : '1fr', gap: 20, maxWidth: result ? '100%' : 480 }}>

        {/* Selector panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card fade-in-up-1">
            <div className="chart-title">Select Vendor</div>
            <label className="form-label">Vendor</label>
            <select
              className="form-select"
              value={vendorId}
              onChange={e => { setVendorId(e.target.value); setResult(null); }}
            >
              <option value="">— Choose a vendor —</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.full_name} · {v.district}</option>
              ))}
            </select>

            {selectedVendor && (
              <div style={{ marginTop: 16, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Syne', fontWeight: 800, color: 'var(--gold)', fontSize: 16
                  }}>
                    {selectedVendor.full_name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedVendor.full_name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>📍 {selectedVendor.district}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div className="breakdown-item">
                    <div className="breakdown-label">Phone</div>
                    <div className="breakdown-value" style={{ fontSize: 12 }}>{selectedVendor.phone_number}</div>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-label">Consent</div>
                    <div className="breakdown-value" style={{ color: selectedVendor.consent_given ? 'var(--green)' : 'var(--red)' }}>
                      {selectedVendor.consent_given ? '✓ Given' : '✗ Pending'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="login-error" style={{ marginTop: 12 }}>⚠️ {error}</div>}

            <button
              className="btn-primary"
              onClick={calculateScore}
              disabled={!vendorId || loading}
            >
              {loading ? <><span className="spinner" />Computing Score...</> : '⚡ Calculate Trust Score'}
            </button>
          </div>

          {/* Improvement tips */}
          {result && result.improvement_tips && result.improvement_tips.length > 0 && (
            <div className="card fade-in-up-2">
              <div className="chart-title">💡 How to Improve Score</div>
              {result.improvement_tips.map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '10px 0',
                  borderBottom: i < result.improvement_tips.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <span style={{ color: 'var(--gold)', fontSize: 14, marginTop: 1 }}>→</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Result panel */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Score card */}
            <div
              className="result-card fade-in-up-1"
              style={{
                background: `linear-gradient(135deg, ${bandInfo.color}15 0%, transparent 60%)`,
                border: `1px solid ${bandInfo.color}30`,
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '1px', textTransform: 'uppercase' }}>
                Trust Score Result
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{result.vendor}</div>
              <ScoreGauge score={result.trust_score} color={bandInfo.color} />
              <div style={{ marginTop: 12 }}>
                <span style={{
                  background: `${bandInfo.color}20`, border: `1px solid ${bandInfo.color}40`,
                  color: bandInfo.color, padding: '6px 20px', borderRadius: 20,
                  fontSize: 14, fontWeight: 700, fontFamily: 'Syne'
                }}>
                  {bandInfo.emoji} {bandInfo.label} Credit Rating
                </span>
              </div>
            </div>

            {/* SHAP Explanation */}
            {result.explanations && result.explanations.length > 0 && (
              <div className="card fade-in-up-2">
                <div className="chart-title">🔍 Score Explanation</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  These factors had the biggest impact on {result.vendor}'s score:
                </p>
                {result.explanations.map((exp, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                        {exp.impact === 'positive' ? '✅' : '❌'} {exp.label}
                      </span>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: exp.impact === 'positive' ? '#10b981' : '#ef4444'
                      }}>
                        {exp.impact === 'positive' ? '+' : '-'}{exp.impact_points} pts
                      </span>
                    </div>
                    <div className="score-bar-track">
                      <div className="score-bar-fill" style={{
                        width: `${Math.min(exp.impact_points * 10, 100)}%`,
                        background: exp.impact === 'positive' ? '#10b981' : '#ef4444'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loan recommendation */}
            <div className="card fade-in-up-3">
              <div className="chart-title">💳 Loan Recommendation</div>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <div className="breakdown-label">Max Loan Amount</div>
                  <div className="breakdown-value" style={{ color: bandInfo.color }}>{loanRec.amount}</div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-label">Recommended Term</div>
                  <div className="breakdown-value">{loanRec.term}</div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-label">Interest Rate</div>
                  <div className="breakdown-value">{loanRec.rate}</div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-label">Risk Level</div>
                  <div className="breakdown-value" style={{ color: bandInfo.color }}>{bandInfo.label}</div>
                </div>
              </div>
              <div style={{
                marginTop: 16, padding: '14px 16px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 10, border: '1px solid var(--border)',
                fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6
              }}>
                📋 <strong style={{ color: 'var(--text-primary)' }}>Decision Guidance:</strong> {result.message}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScoreCalculator;