"use client";

type SystemNode = {
  detail: string;
  label: string;
  x: string;
  y: string;
};

const nodes: readonly SystemNode[] = [
  { detail: "tower events", label: "Telemetry", x: "8%", y: "45%" },
  { detail: "durable streams", label: "Kafka", x: "13%", y: "24%" },
  { detail: "stateful compute", label: "Flink", x: "87%", y: "23%" },
  { detail: "shared storage", label: "Lakehouse", x: "93%", y: "47%" },
  { detail: "signals to action", label: "Observability", x: "13%", y: "78%" },
  { detail: "analytics products", label: "Data products", x: "87%", y: "79%" },
];

const rails = [
  "systems-rail rail-one",
  "systems-rail rail-two",
  "systems-rail rail-three",
  "systems-rail rail-four",
  "systems-rail rail-five",
] as const;

export default function SystemsBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block"
    >
      <div className="systems-halo" />
      <div className="systems-grid" />
      <div className="systems-map">
        {rails.map((rail, index) => (
          <div className={rail} key={rail}>
            <span style={{ animationDelay: `${index * 0.7}s` }} />
          </div>
        ))}

        {nodes.map((node) => (
          <div
            className="systems-node"
            data-detail={node.detail}
            data-label={node.label}
            key={node.label}
            style={{ left: node.x, top: node.y }}
          />
        ))}
      </div>
      <style>{`
        .systems-halo {
          position: absolute;
          inset: 8% 4% 0;
          background:
            radial-gradient(circle at 50% 38%, rgba(14, 21, 40, 0.09), transparent 16rem),
            radial-gradient(circle at 30% 18%, rgba(31, 59, 115, 0.12), transparent 18rem),
            radial-gradient(circle at 78% 30%, rgba(20, 184, 166, 0.12), transparent 18rem);
          filter: blur(2px);
        }

        .systems-grid {
          position: absolute;
          inset: 2rem 0 6rem;
          background-image:
            linear-gradient(rgba(31, 59, 115, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31, 59, 115, 0.06) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(circle at 50% 42%, black 0, transparent 62%);
          opacity: 0.6;
        }

        .systems-map {
          position: absolute;
          inset: 2rem 0 0;
          -webkit-mask-image: radial-gradient(ellipse at 50% 52%, transparent 0%, transparent 38%, black 56%);
          mask-image: radial-gradient(ellipse at 50% 52%, transparent 0%, transparent 38%, black 56%);
        }

        .systems-node {
          position: absolute;
          min-width: 8rem;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(255, 255, 255, 0.82);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.58);
          box-shadow: 0 18px 46px rgba(31, 44, 75, 0.08);
          padding: 0.72rem 1rem;
          text-align: left;
          backdrop-filter: blur(18px);
          opacity: 0.72;
        }

        .systems-node::before {
          content: attr(data-label);
          display: block;
          color: #0e1528;
          font-weight: 800;
          font-size: 0.78rem;
          letter-spacing: 0.01em;
          line-height: 1.15;
        }

        .systems-node::after {
          content: attr(data-detail);
          display: block;
          margin-top: 0.18rem;
          color: #64748b;
          font-size: 0.67rem;
          font-weight: 650;
          line-height: 1.1;
          text-transform: uppercase;
        }

        .systems-rail {
          position: absolute;
          height: 2px;
          overflow: hidden;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, rgba(31, 59, 115, 0.2), transparent);
          transform-origin: left center;
          opacity: 0.46;
        }

        .systems-rail span {
          position: absolute;
          left: -1.5rem;
          top: -0.18rem;
          height: 0.42rem;
          width: 0.42rem;
          border-radius: 999px;
          background: #1f3b73;
          box-shadow: 0 0 18px rgba(31, 59, 115, 0.5);
          animation: systems-pulse 5.4s linear infinite;
        }

        .rail-one {
          left: 8%;
          top: 45%;
          width: 30%;
          transform: rotate(-28deg);
        }

        .rail-two {
          left: 13%;
          top: 24%;
          width: 28%;
          transform: rotate(-14deg);
        }

        .rail-three {
          left: 64%;
          top: 25%;
          width: 28%;
          transform: rotate(24deg);
        }

        .rail-four {
          left: 13%;
          top: 78%;
          width: 29%;
          transform: rotate(10deg);
        }

        .rail-five {
          left: 61%;
          top: 78%;
          width: 27%;
          transform: rotate(-11deg);
        }

        @keyframes systems-pulse {
          0% {
            opacity: 0;
            transform: translateX(0) scale(0.75);
          }
          12% {
            opacity: 1;
          }
          82% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(42rem) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .systems-rail span {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
