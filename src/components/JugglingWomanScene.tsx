import { useEffect, useState } from "react";

// Stage coordinate space (matches silhouette_v2.png dimensions)
const W = 1920;
const H = 1080;

// Shoulder attachment points on silhouette_v2.png
const L_SHOULDER = { x: 839, y: 728 };
const R_SHOULDER = { x: 1092, y: 730 };

// Arm segment dimensions
const UPPER_LEN   = 115;
const FOREARM_LEN = 125;
const UPPER_W     = 44;
const FORE_W      = 37;
const WRIST_W     = 29;
const HAND_R      = 32;

// Cascade timing
const THROW_DUR  = 0.35;  // seconds one arc takes
const HOLD_DUR   = 0.10;  // seconds ball sits in hand
const HALF_CYCLE = THROW_DUR + HOLD_DUR;    // 0.45s
const FULL_CYCLE = HALF_CYCLE * 2;           // 0.90s
const PEAK_Y     = 570;   // arc peak in stage coords (lower y = higher on screen)
const BALL_R     = 52;

// Arm rest/throw angles (radians from vertical)
const SHOULDER_REST = 0.30;
const SHOULDER_LIFT = 0.18;
const ELBOW_IN      = -1.55;  // catch
const ELBOW_OUT     = -1.05;  // throw

// Ball colors matching site pillars
const BALL_COLORS = ["#3D834A", "#33ccff", "#ff6633"];

type V = { x: number; y: number };
type Pose = { shoulder: V; elbow: V; wrist: V; upperDir: V; foreDir: V };

function computePose(
  shoulder: V,
  shoulderAngle: number,
  elbowAngle: number,
  mirror: boolean
): Pose {
  const s = mirror ? -1 : 1;
  const sa = s * shoulderAngle;
  const upDx = Math.sin(sa), upDy = Math.cos(sa);
  const elbow = { x: shoulder.x + upDx * UPPER_LEN, y: shoulder.y + upDy * UPPER_LEN };
  const fa = sa + s * elbowAngle;
  const fwDx = Math.sin(fa), fwDy = Math.cos(fa);
  const wrist = { x: elbow.x + fwDx * FOREARM_LEN, y: elbow.y + fwDy * FOREARM_LEN };
  return { shoulder, elbow, wrist, upperDir: { x: upDx, y: upDy }, foreDir: { x: fwDx, y: fwDy } };
}

function quad(a: V, b: V, dir: V, wA: number, wB: number): string {
  const px = -dir.y, py = dir.x;
  const p1 = { x: a.x + px * wA / 2, y: a.y + py * wA / 2 };
  const p2 = { x: a.x - px * wA / 2, y: a.y - py * wA / 2 };
  const p3 = { x: b.x - px * wB / 2, y: b.y - py * wB / 2 };
  const p4 = { x: b.x + px * wB / 2, y: b.y + py * wB / 2 };
  return `M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y} L${p4.x},${p4.y} Z`;
}

function phaseAngle(t: number, shift: number, rest: number, lift: number): number {
  const k = (((t + shift) % HALF_CYCLE) + HALF_CYCLE) % HALF_CYCLE / HALF_CYCLE;
  return rest - (rest - lift) * Math.sin(Math.PI * k);
}

function phaseElbow(t: number, shift: number): number {
  const k = (((t + shift) % HALF_CYCLE) + HALF_CYCLE) % HALF_CYCLE / HALF_CYCLE;
  return ELBOW_IN + (ELBOW_OUT - ELBOW_IN) * Math.sin(Math.PI * k);
}

function arc(from: V, to: V, k: number): V {
  // quadratic bezier with control point at horizontal midpoint, PEAK_Y height
  const cx = (from.x + to.x) / 2, cy = PEAK_Y, u = 1 - k;
  return { x: u * u * from.x + 2 * u * k * cx + k * k * to.x,
           y: u * u * from.y + 2 * u * k * cy + k * k * to.y };
}

function ballPosition(t: number, phase: number, startLeft: boolean, lw: V, rw: V): V {
  const lt = ((t - phase) % FULL_CYCLE + FULL_CYCLE) % FULL_CYCLE;
  const A = startLeft ? lw : rw;
  const B = startLeft ? rw : lw;
  if (lt < HOLD_DUR)
    return A;
  if (lt < HOLD_DUR + THROW_DUR)
    return arc(A, B, (lt - HOLD_DUR) / THROW_DUR);
  if (lt < 2 * HOLD_DUR + THROW_DUR)
    return B;
  return arc(B, A, (lt - 2 * HOLD_DUR - THROW_DUR) / THROW_DUR);
}

export default function JugglingWomanScene() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const loop = (ts: number) => {
      if (!start) start = ts;
      setTime((ts - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const t = time;

  const lPose = computePose(L_SHOULDER, phaseAngle(t, HALF_CYCLE / 2, SHOULDER_REST, SHOULDER_LIFT), phaseElbow(t, HALF_CYCLE / 2), true);
  const rPose = computePose(R_SHOULDER, phaseAngle(t, 0, SHOULDER_REST, SHOULDER_LIFT), phaseElbow(t, 0), false);

  const balls = [
    ballPosition(t, 0,                 true,  lPose.wrist, rPose.wrist),
    ballPosition(t, FULL_CYCLE / 3,    false, lPose.wrist, rPose.wrist),
    ballPosition(t, (FULL_CYCLE * 2) / 3, true, lPose.wrist, rPose.wrist),
  ];

  const CREAM = "#F4ECD8";

  function Arm({ pose }: { pose: Pose }) {
    const uPath = quad(pose.shoulder, pose.elbow, pose.upperDir, UPPER_W, FORE_W);
    const fPath = quad(pose.elbow, pose.wrist, pose.foreDir, FORE_W, WRIST_W);
    return (
      <g style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))" }}>
        <circle cx={pose.shoulder.x} cy={pose.shoulder.y} r={UPPER_W / 2} fill={CREAM} />
        <path d={uPath} fill={CREAM} />
        <circle cx={pose.elbow.x} cy={pose.elbow.y} r={FORE_W / 2} fill={CREAM} />
        <path d={fPath} fill={CREAM} />
        <circle cx={pose.wrist.x} cy={pose.wrist.y} r={HAND_R} fill={CREAM} />
      </g>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id="jwArmClip">
          <rect x="0" y={L_SHOULDER.y} width={W} height={H} />
        </clipPath>
        <filter id="jwBallGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Silhouette - slightly transparent */}
      <image
        href="/images/juggler-woman-silhouette.png"
        x="0" y="0"
        width={W} height={H}
        opacity="0.72"
      />

      {/* Animated arms clipped to below shoulder line */}
      <g clipPath="url(#jwArmClip)">
        <Arm pose={lPose} />
        <Arm pose={rPose} />
      </g>

      {/* Cascade balls */}
      {balls.map((pos, i) => (
        <g key={i} transform={`translate(${pos.x} ${pos.y})`} filter="url(#jwBallGlow)">
          <circle r={BALL_R} fill={BALL_COLORS[i]} />
          <ellipse
            cx={-BALL_R * 0.35} cy={-BALL_R * 0.38}
            rx={BALL_R * 0.33} ry={BALL_R * 0.20}
            fill="rgba(255,255,255,0.38)"
          />
        </g>
      ))}
    </svg>
  );
}
