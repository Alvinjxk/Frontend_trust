/*eslint-disable no-unused-vars*/
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import api from '../api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e2533', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#f59e0b', fontWeight: 700, fontSize: 16 }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const TrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e2533', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#10b981', fontWeight: 700, fontSize: 16 }}>Avg: {payload[0].value}/100</p>
        {payload[1] && <p style={{ color: '#3b82f6', fontSize: 13 }}>Scores: {payload[1].value}</p>}
      </div>
    );
  }
  return null;
};

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;
    const duration = 1000;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

function Dashboard() {
  const [vendors, setVendors] = useState([]);
  const [scores, setScores] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('vendors/'),
      api.get('scores/'),
      api.get('scores/trends/'),
      api.get('loans/'),
    ]).then(([v, s, t, l]) => {
      setVendors(v.data);
      setScores(s.data);
      setTrends(t.data);
      setLoans(l.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b.score_value, 0) / scores.length)
    : 0;

  const excellentCount = scores.filter(s => s.score_value > 75).length;
  const approvalRate = scores.length > 0 ? Math.round((excellentCount / scores.length) * 100) : 0;
  const pendingLoans = loans.filter(l => l.status === 'pending').length;

  const chartData = [
    { band: 'Poor', count: scores.filter(s => s.score_value <= 30).length, color: '#ef4444' },
    { band: 'Fair', count: scores.filter(s => s.score_value > 30 && s.score_value <= 55).length, color: '#f59e0b' },
    { band: 'Good', count: scores.filter(s => s.score_value > 55 && s.score_value <= 75).length, color: '#3b82f6' },
    { band: 'Excellent', count: scores.filter(s => s.score_value > 75).length, color: '#10b981' },
  ];

  const recentScores = [...scores].reverse().slice(0, 5);

  const getBandColor = (score) => {
    if (score > 75) return '#10b981';
    if (score > 55) return '#3b82f6';
    if (score > 30) return '#f59e0b';
    return '#ef4444';
  };

  const getBandLabel = (score) => {
    if (score > 75) return 'Excellent';
    if (score > 55) return 'Good';
    if (score > 30) return 'Fair';
    return 'Poor';
  };

  const handleExport = async () => {
    try {
      const response = await api.get('vendors/export_csv/', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'trustscore_vendors.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
};

  return (
    <div>
      {/* Top bar */}
      <div className="top-bar fade-in-up">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">
            {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="top-bar-right">
          <button
            onClick={handleExport}
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 8,
              padding: '8px 16px',
              color: 'var(--gold)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'DM Sans',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(245,158,11,0.2)'}
            onMouseLeave={e => e.target.style.background = 'rgba(245,158,11,0.1)'}
          >
            ⬇ Export CSV
          </button>
          <div className="live-badge">
            <span className="live-dot" /> Live
          </div>
          <div className="top-bar-avatar">A</div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card gold fade-in-up-1">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{loading ? '—' : <AnimatedNumber value={vendors.length} />}</div>
          <div className="stat-label">Total Vendors</div>
          <div className="stat-change up">↑ Registered on platform</div>
        </div>
        <div className="stat-card green fade-in-up-2">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{loading ? '—' : <AnimatedNumber value={scores.length} />}</div>
          <div className="stat-label">Scores Generated</div>
          <div className="stat-change up">↑ AI assessments done</div>
        </div>
        <div className="stat-card blue fade-in-up-3">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{loading ? '—' : <AnimatedNumber value={avgScore} />}</div>
          <div className="stat-label">Average Score</div>
          <div className="stat-change neutral">Out of 100 points</div>
        </div>
        <div className="stat-card purple fade-in-up-4">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{loading ? '—' : <AnimatedNumber value={pendingLoans} />}</div>
          <div className="stat-label">Pending Loans</div>
          <div className="stat-change neutral">Awaiting decision</div>
        </div>
      </div>

      {/* Score trend chart */}
      <div className="card fade-in-up-2" style={{ marginBottom: 16 }}>
        <div className="chart-title">📈 Score Trend — Last 30 Days</div>
        {trends.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <div className="empty-title">No trend data yet</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Calculate more scores to see trends</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TrendTooltip />} />
              <Area type="monotone" dataKey="avg_score" stroke="#10b981" strokeWidth={2} fill="url(#scoreGrad)" />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Distribution + Recent */}
      <div className="charts-grid fade-in-up-2">
        <div className="card">
          <div className="chart-title">Score Distribution</div>
          {scores.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-title">No scores yet</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="band" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="chart-title">Recent Scores</div>
          {recentScores.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🕐</div>
              <div className="empty-title">No activity yet</div>
            </div>
          ) : (
            <div>
              {recentScores.map((score) => (
                <div key={score.id} className="activity-item">
                  <div className="activity-dot" style={{ background: getBandColor(score.score_value) }} />
                  <div style={{ flex: 1 }}>
                    <div className="activity-name">Vendor #{score.vendor}</div>
                    <div className="activity-time">{getBandLabel(score.score_value)}</div>
                  </div>
                  <div className="activity-score" style={{ color: getBandColor(score.score_value) }}>
                    {score.score_value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loan applications table */}
      {loans.length > 0 && (
        <div className="card fade-in-up-3" style={{ marginTop: 16 }}>
          <div className="chart-title">💳 Loan Applications</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vendor</th>
                  <th>Amount (UGX)</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan.id}>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      #{String(loan.id).padStart(4, '0')}
                    </td>
                    <td style={{ fontWeight: 500 }}>Vendor #{loan.vendor}</td>
                    <td>{Number(loan.amount_requested).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${
                        loan.status === 'approved' ? 'badge-excellent' :
                        loan.status === 'declined' ? 'badge-poor' : 'badge-fair'
                      }`}>
                        {loan.status === 'approved' ? '✓ Approved' :
                         loan.status === 'declined' ? '✗ Declined' : '⏳ Pending'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {new Date(loan.application_date).toLocaleDateString('en-UG', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Portfolio breakdown */}
      <div className="card fade-in-up-3" style={{ marginTop: 16 }}>
        <div className="chart-title">Portfolio Breakdown</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {chartData.map(band => (
            <div key={band.band} style={{ padding: '16px 0' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{band.band}</div>
              <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: band.color }}>{band.count}</div>
              <div className="score-bar-track" style={{ marginTop: 10 }}>
                <div className="score-bar-fill" style={{
                  width: scores.length > 0 ? `${(band.count / scores.length) * 100}%` : '0%',
                  background: band.color
                }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                {scores.length > 0 ? `${Math.round((band.count / scores.length) * 100)}%` : '0%'} of total
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;