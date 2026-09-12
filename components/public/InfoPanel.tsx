export default function InfoPanel() {
  return (
    <section className="bd-info">
      <div className="bd-info-inner">
        {/* Weather */}
        <div className="bd-info-card">
          <div className="bd-info-card-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFC107" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <span className="bd-info-card-title">今日の天気</span>
          </div>
          <div className="bd-info-card-body">
            <div className="bd-info-weather">
              <span className="bd-info-temp">34°C</span>
              <span className="bd-info-temp-feel">体感 38°C</span>
            </div>
            <div className="bd-info-weather-desc">晴れ / バンコク</div>
          </div>
        </div>

        {/* PM2.5 */}
        <div className="bd-info-card">
          <div className="bd-info-card-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span className="bd-info-card-title">PM2.5</span>
          </div>
          <div className="bd-info-card-body">
            <div className="bd-info-pm25">
              <span className="bd-info-pm25-value">42</span>
              <span className="bd-info-pm25-unit">µg/m³</span>
            </div>
            <div className="bd-info-pm25-status bd-info-pm25-moderate">普通</div>
            <div className="bd-info-pm25-note">マスク推奨レベル</div>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="bd-info-card">
          <div className="bd-info-card-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            <span className="bd-info-card-title">為替レート</span>
          </div>
          <div className="bd-info-card-body">
            <div className="bd-info-rate">
              <span className="bd-info-rate-label">1 THB =</span>
              <span className="bd-info-rate-value">4.21 JPY</span>
            </div>
            <div className="bd-info-rate">
              <span className="bd-info-rate-label">1 JPY =</span>
              <span className="bd-info-rate-value">0.237 THB</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
