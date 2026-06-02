import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, ArrowLeft, Download,
  BarChart2, DollarSign, Percent, CreditCard,
  Calendar, RefreshCw, ArrowUpRight, ArrowDownRight,
  Wallet, Users, Package, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ─── Helper ───────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const fmtShort = (n) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' tr';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k';
  return n;
};

// ─── Mini Bar Chart (SVG native) ──────────────────────────
const BarChartSVG = ({ data, color = 'var(--primary)', height = 120 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = 100 / data.length;
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`bar-grad-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const bh = (d.value / max) * (height - 20);
        const x = i * barW + barW * 0.15;
        const w = barW * 0.7;
        const y = height - bh - 5;
        return (
          <rect
            key={i}
            x={`${x}%`} y={y} width={`${w}%`} height={bh}
            rx="3" ry="3"
            fill={`url(#bar-grad-${color.replace(/[^a-z0-9]/gi, '')})`}
          />
        );
      })}
    </svg>
  );
};

// ─── Mini Line Chart (SVG native) ─────────────────────────
const LineChartSVG = ({ data, color = '#00906a', height = 100 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value), 0);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((d.value - min) / range) * (height - 20) - 10;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  // Area fill
  const areaPoints = `0,${height} ${pts.join(' ')} 100,${height}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="line-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#line-area)" />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = height - ((d.value - min) / range) * (height - 20) - 10;
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
};

// ─── Donut Chart (SVG) ────────────────────────────────────
const DonutChart = ({ segments, size = 160 }) => {
  const r = 58, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="18" />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circumference;
        const gap = circumference - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="600">Tổng</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="14" fill="var(--text)" fontWeight="800">
        {fmtShort(total)}
      </text>
    </svg>
  );
};

// ─── COMPONENT ────────────────────────────────────────────
const FinanceReports = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('year');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('cashflow');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/v1/admin/finance/reports');
      if (res?.data?.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Finance reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback khi chưa có dữ liệu
  const s         = stats?.summary         ?? {};
  const gmvData   = stats?.gmv_monthly     ?? Array(12).fill(null).map((_, i) => ({ label: `T${i+1}`, value: 0 }));
  const commData  = stats?.commission_monthly ?? Array(12).fill(null).map((_, i) => ({ label: `T${i+1}`, value: 0 }));
  const subPkg    = stats?.sub_packages    ?? [];
  const commType  = stats?.commission_by_type ?? [];
  const periods   = stats?.top_periods     ?? [];
  const subTotal  = subPkg.reduce((a, b) => a + b.value, 0);

  return (
    <div className="finance-reports-page">

      {/* ── HEADER ── */}
      <div className="fr-header">
        <div className="fr-header-left">
          <button
            className="fr-back-btn"
            onClick={() => navigate('/finance/driver-summary')}
            title="Quay lại Tài chính tài xế"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="fr-header-icon">
            <BarChart2 size={28} />
          </div>
          <div>
            <h1 className="fr-title">Dashboard Phân tích Tài chính</h1>
            <p className="fr-subtitle">Dòng tiền · Hoa hồng thực tế · Hiệu quả gói thuê bao</p>
          </div>
        </div>
        <div className="fr-header-right">
          <div className="fr-period-tabs">
            {[{ k: 'month', l: 'Tháng' }, { k: 'quarter', l: 'Quý' }, { k: 'year', l: 'Năm' }].map(p => (
              <button
                key={p.k}
                className={`fr-period-btn ${period === p.k ? 'active' : ''}`}
                onClick={() => setPeriod(p.k)}
              >{p.l}</button>
            ))}
          </div>
          <button className="btn btn-glass" onClick={loadData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'fr-spin' : ''} />
            Làm mới
          </button>
          <button className="btn btn-primary">
            <Download size={16} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="fr-kpi-grid">
        {[
          {
            label: 'Tổng GMV',
            value: fmt(s.total_gmv),
            growth: s.gmv_growth ?? 0,
            icon: <DollarSign size={24} />,
            color: '#0049ac',
            bg: 'rgba(0,73,172,0.1)'
          },
          {
            label: 'Hoa hồng Hệ thống',
            value: fmt(s.total_commission),
            growth: s.commission_growth ?? 0,
            icon: <Percent size={24} />,
            color: '#00906a',
            bg: 'rgba(0,144,106,0.1)'
          },
          {
            label: 'Tỷ lệ HH trung bình',
            value: `${s.avg_commission_rate ?? 0}%`,
            growth: 0,
            icon: <TrendingUp size={24} />,
            color: '#f72585',
            bg: 'rgba(247,37,133,0.1)'
          },
          {
            label: 'Gói thuê bao bán ra',
            value: (s.total_subscriptions ?? 0).toLocaleString('vi-VN'),
            growth: s.sub_growth ?? 0,
            icon: <Package size={24} />,
            color: '#b78300',
            bg: 'rgba(183,131,0,0.1)'
          },
        ].map((kpi, i) => (
          <div key={i} className="fr-kpi-card glass glass-hover" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="fr-kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className="fr-kpi-body">
              <p className="fr-kpi-label">{kpi.label}</p>
              <h3 className="fr-kpi-value">{loading ? '...' : kpi.value}</h3>
              <div className={`fr-kpi-growth ${kpi.growth >= 0 ? 'up' : 'down'}`}>
                {kpi.growth >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                <span>{Math.abs(kpi.growth)}% so với kỳ trước</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHART TABS ── */}
      <div className="fr-tabs-bar">
        {[
          { k: 'cashflow', l: 'Dòng tiền GMV', icon: <BarChart2 size={16} /> },
          { k: 'commission', l: 'Hoa hồng theo tháng', icon: <Percent size={16} /> },
          { k: 'subscriptions', l: 'Gói thuê bao', icon: <CreditCard size={16} /> },
        ].map(tab => (
          <button
            key={tab.k}
            className={`fr-tab-item ${activeTab === tab.k ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.k)}
          >
            {tab.icon}
            {tab.l}
          </button>
        ))}
      </div>

      {/* ── MAIN CHART AREA ── */}
      <div className="fr-main-charts">

        {/* Left: Big Chart */}
        <div className="fr-chart-card glass">
          {activeTab === 'cashflow' && (
            <>
              <div className="fr-chart-head">
                <div>
                  <h2 className="fr-chart-title">Dòng tiền GMV theo tháng</h2>
                  <p className="fr-chart-sub">Tổng giá trị đơn hàng thực tế phát sinh</p>
                </div>
                <div className="fr-chart-legend">
                  <span className="fr-legend-dot" style={{ background: '#0049ac' }} />
                  <span>GMV (₫)</span>
                </div>
              </div>
              <div className="fr-chart-labels">
                {gmvData.map((d, i) => (
                  <span key={i}>{d.label}</span>
                ))}
              </div>
              <BarChartSVG data={gmvData} color="#0049ac" height={180} />
              <div className="fr-chart-values">
                {gmvData.map((d, i) => (
                  <span key={i} style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {fmtShort(d.value)}
                  </span>
                ))}
              </div>
            </>
          )}

          {activeTab === 'commission' && (
            <>
              <div className="fr-chart-head">
                <div>
                  <h2 className="fr-chart-title">Hoa hồng thu về theo tháng</h2>
                  <p className="fr-chart-sub">Doanh thu thuần từ chiết khấu hoa hồng</p>
                </div>
                <div className="fr-chart-legend">
                  <span className="fr-legend-dot" style={{ background: '#00906a' }} />
                  <span>Hoa hồng (₫)</span>
                </div>
              </div>
              <div className="fr-chart-labels">
                {commData.map((d, i) => (
                  <span key={i}>{d.label}</span>
                ))}
              </div>
              <LineChartSVG data={commData} color="#00906a" height={180} />
              <div className="fr-chart-values">
                {commData.map((d, i) => (
                  <span key={i} style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {fmtShort(d.value)}
                  </span>
                ))}
              </div>
            </>
          )}

          {activeTab === 'subscriptions' && (
            <>
              <div className="fr-chart-head">
                <div>
                  <h2 className="fr-chart-title">Phân bổ Gói thuê bao</h2>
                  <p className="fr-chart-sub">Số lượng gói đã kích hoạt theo loại</p>
                </div>
              </div>
              <div className="fr-donut-area">
                <DonutChart segments={subPkg.length ? subPkg : [{ label: '-', value: 1, color: 'var(--border)' }]} size={200} />
                <div className="fr-donut-legend">
                  {subPkg.map((seg, i) => (
                    <div key={i} className="fr-donut-item">
                      <span className="fr-legend-dot" style={{ background: seg.color, width: 14, height: 14, borderRadius: 4 }} />
                      <span className="fr-donut-label">{seg.label}</span>
                      <span className="fr-donut-val">{seg.value.toLocaleString()}</span>
                      <div className="fr-donut-bar-wrap">
                        <div
                          className="fr-donut-bar-fill"
                          style={{
                            width: `${subTotal > 0 ? (seg.value / subTotal) * 100 : 0}%`,
                            background: seg.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Commission Breakdown */}
        <div className="fr-side-cards">
          <div className="fr-side-card glass">
            <h3 className="fr-side-title">
              <Percent size={16} style={{ color: 'var(--primary)' }} />
              Hoa hồng theo loại dịch vụ
            </h3>
            {commType.map((item, i) => (
              <div key={i} className="fr-breakdown-row">
                <div className="fr-breakdown-info">
                  <span className="fr-breakdown-dot" style={{ background: item.color }} />
                  <span className="fr-breakdown-label">{item.label}</span>
                  <span className="fr-breakdown-pct">{item.pct}%</span>
                </div>
                <div className="fr-breakdown-bar">
                  <div
                    className="fr-breakdown-fill"
                    style={{ width: `${item.pct}%`, background: item.color }}
                  />
                </div>
                <span className="fr-breakdown-value">{fmtShort(item.value)} ₫</span>
              </div>
            ))}
          </div>

          <div className="fr-side-card glass">
            <h3 className="fr-side-title">
              <Wallet size={16} style={{ color: 'var(--success)' }} />
              Tỷ lệ chuyển đổi
            </h3>
            {[
              { label: 'Hoa hồng / GMV', value: `${s.avg_commission_rate ?? 0}%`, color: '#0049ac' },
              { label: 'Tài xế dùng gói', value: `${stats ? Math.round((s.total_subscriptions ?? 0) / Math.max(1, (s.total_subscriptions ?? 0) + 50) * 100) : 0}%`, color: '#00906a' },
            ].map((row, i) => (
              <div key={i} className="fr-conversion-row">
                <span className="fr-conv-label">{row.label}</span>
                <span className="fr-conv-val" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PERIOD TABLE ── */}
      <div className="fr-table-section glass">
        <div className="fr-table-head">
          <div>
            <h2 className="fr-chart-title">
              <Calendar size={18} style={{ color: 'var(--primary)', marginRight: 8 }} />
              Báo cáo theo từng mốc thời gian
            </h2>
            <p className="fr-chart-sub">So sánh doanh thu và hoa hồng theo tháng</p>
          </div>
        </div>
        <div className="fr-table-wrap">
          <table className="fr-table">
            <thead>
              <tr>
                <th>Mốc thời gian</th>
                <th className="text-right">Tổng GMV</th>
                <th className="text-right">Hoa hồng thu</th>
                <th className="text-right">Tỷ lệ HH</th>
                <th className="text-right">Tài xế thu nhập</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu...</td></tr>
              ) : periods.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có dữ liệu. Hãy chạy seeder để tạo dữ liệu mẫu.</td></tr>
              ) : periods.map((row, i) => (
                <tr key={i}>
                  <td>
                    <div className="fr-period-cell">
                      <span className="fr-period-rank">#{i + 1}</span>
                      {row.period}
                    </div>
                  </td>
                  <td className="text-right fr-val-cell">{fmt(row.gmv)}</td>
                  <td className="text-right">
                    <span className="fr-comm-badge">{fmt(row.commission)}</span>
                  </td>
                  <td className="text-right">
                    <span className="fr-rate-chip">{row.rate}%</span>
                  </td>
                  <td className="text-right fr-driver-income">{fmt(row.gmv - row.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── STYLES ─── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .finance-reports-page { padding: 1.75rem; animation: frFadeUp 0.5s cubic-bezier(0.16,1,0.3,1); }
        @keyframes frFadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

        /* HEADER */
        .fr-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2.5rem; flex-wrap:wrap; gap:1rem; }
        .fr-header-left { display:flex; align-items:center; gap:1.25rem; }
        .fr-header-right { display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; }
        .fr-back-btn { width:44px; height:44px; border-radius:14px; border:1.5px solid var(--border); background:var(--card); color:var(--text); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:var(--transition); box-shadow:var(--shadow); }
        .fr-back-btn:hover { background:var(--primary); color:white; border-color:var(--primary); transform:translateY(-2px); }
        .fr-header-icon { width:60px; height:60px; background:var(--primary); color:white; border-radius:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 12px 24px rgba(0,73,172,0.3); }
        .fr-title { font-size:2rem; font-weight:850; letter-spacing:-0.03em; margin:0; color:var(--text); }
        .fr-subtitle { font-size:0.95rem; color:var(--text-muted); margin:0.25rem 0 0; font-weight:500; }
        
        .fr-period-tabs { display:flex; background:var(--bg-soft); border-radius:12px; padding:4px; border:1px solid var(--border); gap:2px; }
        .fr-period-btn { padding:0.45rem 1.1rem; border-radius:9px; border:none; background:transparent; color:var(--text-muted); font-weight:700; font-size:0.85rem; cursor:pointer; transition:all 0.2s; }
        .fr-period-btn.active { background:var(--card); color:var(--primary); box-shadow:var(--shadow); }
        .fr-spin { animation: frSpin 0.8s linear infinite; }
        @keyframes frSpin { to { transform: rotate(360deg); } }

        /* KPI GRID */
        .fr-kpi-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1.25rem; margin-bottom:2rem; }
        .fr-kpi-card { border-radius:20px; padding:1.5rem; display:flex; gap:1.125rem; align-items:center; animation: frFadeUp 0.5s both; }
        .fr-kpi-icon { width:50px; height:50px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .fr-kpi-body { flex:1; min-width:0; }
        .fr-kpi-label { font-size:0.8rem; color:var(--text-muted); font-weight:700; margin:0 0 0.25rem; text-transform:uppercase; letter-spacing:0.4px; }
        .fr-kpi-value { font-size:1.35rem; font-weight:850; margin:0 0 0.25rem; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .fr-kpi-growth { display:flex; align-items:center; gap:0.3rem; font-size:0.75rem; font-weight:700; }
        .fr-kpi-growth.up { color:var(--success); }
        .fr-kpi-growth.down { color:var(--error); }

        /* TABS */
        .fr-tabs-bar { display:flex; gap:0.5rem; background:var(--bg-soft); padding:5px; border-radius:16px; width:fit-content; border:1px solid var(--border); margin-bottom:1.5rem; }
        .fr-tab-item { display:flex; align-items:center; gap:0.5rem; padding:0.6rem 1.25rem; border-radius:12px; border:none; background:transparent; color:var(--text-muted); font-weight:700; font-size:0.875rem; cursor:pointer; transition:all 0.2s; }
        .fr-tab-item:hover { color:var(--text); }
        .fr-tab-item.active { background:var(--card); color:var(--primary); box-shadow:var(--shadow); }

        /* MAIN CHARTS */
        .fr-main-charts { display:grid; grid-template-columns:1fr 340px; gap:1.5rem; margin-bottom:2rem; }
        @media (max-width:1100px) { .fr-main-charts { grid-template-columns:1fr; } }

        .fr-chart-card { border-radius:24px; padding:2rem; }
        .fr-chart-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
        .fr-chart-title { font-size:1.1rem; font-weight:800; margin:0; color:var(--text); display:flex; align-items:center; }
        .fr-chart-sub { font-size:0.8rem; color:var(--text-muted); margin:0.25rem 0 0; font-weight:500; }
        .fr-chart-legend { display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; font-weight:700; color:var(--text-muted); }
        .fr-legend-dot { display:inline-block; width:10px; height:10px; border-radius:50%; }

        .fr-chart-labels { display:flex; justify-content:space-between; margin-bottom:0.5rem; }
        .fr-chart-labels span { font-size:0.65rem; color:var(--text-muted); font-weight:700; flex:1; text-align:center; }
        .fr-chart-values { display:flex; justify-content:space-between; margin-top:0.5rem; }
        .fr-chart-values span { flex:1; text-align:center; }

        /* DONUT */
        .fr-donut-area { display:flex; align-items:center; gap:2.5rem; flex-wrap:wrap; justify-content:center; padding:1rem 0; }
        .fr-donut-legend { display:flex; flex-direction:column; gap:1.25rem; flex:1; min-width:160px; }
        .fr-donut-item { display:flex; align-items:center; gap:0.75rem; }
        .fr-donut-label { font-size:0.85rem; font-weight:700; flex:1; color:var(--text); }
        .fr-donut-val { font-size:0.9rem; font-weight:800; color:var(--text); min-width:40px; text-align:right; }
        .fr-donut-bar-wrap { width:80px; height:6px; background:var(--border); border-radius:6px; overflow:hidden; }
        .fr-donut-bar-fill { height:100%; border-radius:6px; transition:width 0.6s ease; }

        /* SIDE CARDS */
        .fr-side-cards { display:flex; flex-direction:column; gap:1.25rem; }
        .fr-side-card { border-radius:20px; padding:1.5rem; }
        .fr-side-title { display:flex; align-items:center; gap:0.5rem; font-size:0.9rem; font-weight:800; margin:0 0 1.25rem; color:var(--text); }
        
        .fr-breakdown-row { margin-bottom:1.25rem; }
        .fr-breakdown-info { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem; }
        .fr-breakdown-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }
        .fr-breakdown-label { flex:1; font-size:0.85rem; font-weight:700; color:var(--text); }
        .fr-breakdown-pct { font-size:0.8rem; font-weight:800; color:var(--text-muted); }
        .fr-breakdown-bar { height:6px; background:var(--border); border-radius:6px; overflow:hidden; margin-bottom:0.3rem; }
        .fr-breakdown-fill { height:100%; border-radius:6px; transition:width 0.6s ease; }
        .fr-breakdown-value { font-size:0.75rem; font-weight:700; color:var(--text-muted); }

        .fr-conversion-row { display:flex; justify-content:space-between; align-items:center; padding:0.75rem 0; border-bottom:1px solid var(--border); }
        .fr-conversion-row:last-child { border-bottom:none; }
        .fr-conv-label { font-size:0.85rem; font-weight:700; color:var(--text-muted); }
        .fr-conv-val { font-size:1rem; font-weight:850; }

        /* TABLE */
        .fr-table-section { border-radius:24px; padding:2rem; margin-bottom:2rem; }
        .fr-table-head { margin-bottom:1.5rem; }
        .fr-table-wrap { overflow-x:auto; }
        .fr-table { width:100%; border-collapse:collapse; }
        .fr-table th { text-align:left; padding:0.875rem 1rem; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; font-weight:800; border-bottom:2px solid var(--border); }
        .fr-table td { padding:0.875rem 1rem; border-bottom:1px solid var(--border); font-size:0.9rem; }
        .fr-table tr:last-child td { border-bottom:none; }
        .fr-table tr:hover td { background:rgba(0,73,172,0.025); }
        .text-right { text-align:right; }
        .fr-period-cell { display:flex; align-items:center; gap:0.75rem; font-weight:700; color:var(--text); }
        .fr-period-rank { width:24px; height:24px; border-radius:8px; background:var(--bg-soft); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:800; color:var(--text-muted); }
        .fr-val-cell { font-weight:700; color:var(--text); }
        .fr-comm-badge { background:rgba(0,144,106,0.1); color:var(--success); padding:0.3rem 0.75rem; border-radius:8px; font-weight:800; font-size:0.85rem; }
        .fr-rate-chip { background:rgba(0,73,172,0.1); color:var(--primary); padding:0.3rem 0.75rem; border-radius:8px; font-weight:800; font-size:0.85rem; }
        .fr-driver-income { font-weight:800; color:var(--primary); }
      `}} />
    </div>
  );
};

export default FinanceReports;
