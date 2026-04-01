export default function Ticker() {
  const items = [
    'PERFORM LIVE', 'COMPETE FOR REAL', 'GET VOTED IN', 'GO VIRAL',
    'WIN YOUR FUTURE', 'DARWIN 2027', '4 REGIONS', '3,000 KM OF TALENT', 'ONE GRAND FINALE',
    'PERFORM LIVE', 'COMPETE FOR REAL', 'GET VOTED IN', 'GO VIRAL',
    'WIN YOUR FUTURE', 'DARWIN 2027', '4 REGIONS', '3,000 KM OF TALENT', 'ONE GRAND FINALE',
  ]

  return (
    <div className="ticker-wrap" aria-hidden="true">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i}>
            {item}
            <span className="ticker-dot" style={{ marginLeft: 20 }}>&#9733;</span>
          </span>
        ))}
      </div>
    </div>
  )
}
