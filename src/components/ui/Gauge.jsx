import { useEffect, useState } from "react";

const Gauge = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();

    const animateGauge = (currentTime) => {
      const elapsed = currentTime - startTime;
      const percentage = Math.min(elapsed / duration, 1);

      // Smooth easing
      const eased = 1 - Math.pow(1 - percentage, 3);

      setProgress(Math.round(eased * 95));

      if (percentage < 1) {
        requestAnimationFrame(animateGauge);
      }
    };

    requestAnimationFrame(animateGauge);
  }, []);

  // Calculate dot position
  const angle = Math.PI * (1 - progress / 100);

  const cx = 50 + 40 * Math.cos(angle);
  const cy = 40 - 40 * Math.sin(angle);

  // Calculate how much of the arc should be visible
  const circumference = Math.PI * 40;
  const dashLength = (progress / 100) * circumference;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0px 14px",
        gap: 30,
        marginTop: "4px",
      }}
    >
      {/* Percentage */}
      <div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: "#47E05C",
          }}
        >
          {progress}%
        </div>

        <div
          style={{
            fontSize: 10.5,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Confidence
        </div>
      </div>

      {/* Gauge */}
      <div
        style={{
          width: 150,
          height: 64,
          position: "relative",
        }}
      >
        <svg
          width="150"
          height="64"
          viewBox="0 0 100 44"
          style={{
            overflow: "visible",
          }}
        >
          {/* Background arc */}
          <path
            d="M 10 40 A 40 40 0 0 1 90 40"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Green animated arc */}
          <path
            d="M 10 40 A 40 40 0 0 1 90 40"
            fill="none"
            stroke="#00E676"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dashLength} ${circumference}`}
            style={{
              transition: "stroke-dasharray 0.05s linear",
              filter: "drop-shadow(0 0 3px rgba(0,230,118,0.4))",
            }}
          />

          {/* Needle */}
          <line
            x1="50"
            y1="40"
            x2={cx}
            y2={cy}
            stroke="#47E05C"
            strokeWidth="1"
          />

          {/* Center point */}
          <circle cx="50" cy="40" r="2" fill="#47E05C" />

          {/* Moving indicator */}
          <circle
            cx={cx}
            cy={cy}
            r="3.5"
            fill="#ffffff"
            style={{
              filter: "drop-shadow(0 0 5px rgba(0,230,118,0.9))",
            }}
          />
        </svg>

        {/* Labels */}
        {/* Labels */}
        <div
          style={{
            position: "absolute",
            bottom: -8,
            left: 14,
            right: 10,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 8,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};

export default Gauge;
