import React, { useState, useEffect } from 'https://esm.sh/react';

export default function Clock() {
  const [time, setTime] = useState(new Date());
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    let mounted = true;

    function updateDisplay() {
      if (!mounted) return;
      const now = new Date();
      setTime(now);
      setHighlight(false);
      setTimeout(() => setHighlight(true), 150);
      setTimeout(updateDisplay, 1000);
    }

    updateDisplay();
    return () => { mounted = false; };
  }, []);

  let hr = time.getHours() % 12;
  if (hr === 0) hr = 12;
  const mn = time.getMinutes();
  const sc = time.getSeconds();
  const digits = [
    Math.floor(hr / 10), hr % 10,
    Math.floor(mn / 10), mn % 10,
    Math.floor(sc / 10), sc % 10
  ].map(String);

  const color = highlight ? '#ffc800' : '#000000';

  return (
    <div id="dt" className="led">
      {digits.map((d, i) => (
        <span key={i} className="equal" style={{ color }}>
          {d}
        </span>
      ))}
    </div>
  );
}
