"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import { type Holding } from "../lib/mockData";

const FILL_RATIO = 0.55;
const PALETTE = ["#F7931A", "#627EEA", "#8247E5", "#26A17B", "#2775CA"];
const BUBBLE_RADIUS = 62;
const REPELLER_RADIUS = 70;

interface Props {
  holdings: Holding[];
}

function symbolColor(symbol: string): string {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) {
    h = (h * 31 + symbol.charCodeAt(i)) & 0xffff;
  }
  return PALETTE[h % PALETTE.length];
}

// Poisson disk sampling — random positions with guaranteed minimum separation.
// Tries up to `attempts` random candidates per point before giving up.
function samplePositions(
  count: number,
  W: number,
  H: number,
  radius: number,
  attempts = 60
): Array<{ x: number; y: number }> {
  const minDist = radius * 2 + 2;
  const minDist2 = minDist * minDist;
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let t = 0; t < attempts; t++) {
      const x = radius + Math.random() * (W - radius * 2);
      const y = radius + Math.random() * (H - radius * 2);
      const ok = pts.every((p) => {
        const dx = x - p.x, dy = y - p.y;
        return dx * dx + dy * dy >= minDist2;
      });
      if (ok) { pts.push({ x, y }); placed = true; break; }
    }
    if (!placed) {
      // Space is nearly full — fall back to any position
      pts.push({
        x: radius + Math.random() * (W - radius * 2),
        y: radius + Math.random() * (H - radius * 2),
      });
    }
  }
  return pts;
}

function distributeBubbles(
  holdings: Holding[],
  totalBubbles: number
): Array<{ holding: Holding; count: number }> {
  const total = holdings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
  const n = holdings.length;
  const extraPool = Math.max(0, totalBubbles - n);

  const items = holdings.map((h) => ({
    holding: h,
    raw: total > 0 ? ((h.quantity * h.currentPrice) / total) * extraPool : 0,
    extra: 0,
  }));

  items.forEach((item) => {
    item.extra = Math.floor(item.raw);
  });

  let assigned = items.reduce((s, r) => s + r.extra, 0);
  const sorted = [...items].sort(
    (a, b) => b.raw - b.extra - (a.raw - a.extra)
  );
  let idx = 0;
  while (assigned < extraPool) {
    sorted[idx % sorted.length].extra++;
    assigned++;
    idx++;
  }

  return items.map((r) => ({ holding: r.holding, count: 1 + r.extra }));
}

type BubbleEntry = {
  body: Matter.Body;
  holding: Holding;
  color: string;
  img: HTMLImageElement;
};

export function BubbleField({ holdings }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const { Engine, Runner, Bodies, Body, Composite, Events, Sleeping } = Matter;

    const W = container.clientWidth;
    const H = container.clientHeight;
    canvas.width = W;
    canvas.height = H;

    const engine = Engine.create({
      gravity: { x: 0, y: 1 },
      positionIterations: 20,
      velocityIterations: 12,
      enableSleeping: true,
    });

    // Walls — top, bottom, left, right
    const wt = 60;
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, -wt / 2, W + wt * 2, wt, { isStatic: true }),
      Bodies.rectangle(W / 2, H + wt / 2, W + wt * 2, wt, { isStatic: true }),
      Bodies.rectangle(-wt / 2, H / 2, wt, H + wt * 2, { isStatic: true }),
      Bodies.rectangle(W + wt / 2, H / 2, wt, H + wt * 2, { isStatic: true }),
    ]);

    // Invisible repeller — static circle body that tracks the cursor.
    // Parked off-screen until the mouse enters.
    const repeller = Bodies.circle(-500, -500, REPELLER_RADIUS, {
      isStatic: true,
      label: "repeller",
      restitution: 0.8,
      friction: 0,
      frictionAir: 0,
      // Interact with bubbles (0x0001) but not with walls (default 0x0001 category
      // on walls means repeller still resolves correctly since it's static).
      collisionFilter: { category: 0x0002, mask: 0x0001 },
    });
    Composite.add(engine.world, repeller);

    // Bubbles — scale count so total bubble area ≈ 60% of container
    const totalBubbles = Math.max(
      holdings.length,
      Math.floor((W * H * FILL_RATIO) / (Math.PI * BUBBLE_RADIUS * BUBBLE_RADIUS))
    );
    const distribution = distributeBubbles(holdings, totalBubbles);
    const bubbles: BubbleEntry[] = [];

    // Poisson disk positions — random-feeling but zero initial overlap
    const spawnPts = samplePositions(totalBubbles, W, H, BUBBLE_RADIUS);
    let spawnIdx = 0;

    distribution.forEach(({ holding, count }) => {
      const color = symbolColor(holding.symbol);

      const img = new Image();
      img.src = `/crypto-logos/${holding.symbol.toLowerCase()}.svg`;

      for (let i = 0; i < count; i++) {
        const { x, y } = spawnPts[spawnIdx++] ?? {
          x: BUBBLE_RADIUS + Math.random() * (W - BUBBLE_RADIUS * 2),
          y: BUBBLE_RADIUS + Math.random() * (H - BUBBLE_RADIUS * 2),
        };
        const body = Bodies.circle(x, y, BUBBLE_RADIUS, {
          restitution: 0.5,
          frictionAir: 0.008,
          friction: 0.05,
          label: holding.symbol,
          collisionFilter: { category: 0x0001, mask: 0x0001 | 0x0002 },
        });
        Body.setAngle(body, Math.random() * Math.PI * 2);
        Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: 0 });
        Composite.add(engine.world, body);
        bubbles.push({ body, holding, color, img });
      }
    });

    // Track repeller's real frame-to-frame movement so collision impulses carry
    // actual momentum instead of hitting with zero velocity.
    let prevPos = { x: -500, y: -500 };
    const WAKE_RADIUS = REPELLER_RADIUS * 3.5;

    Events.on(engine, "beforeUpdate", () => {
      const pos = mouseRef.current ?? { x: -500, y: -500 };

      // Repeller velocity = how far it moved this frame (capped so it can't tunnel)
      const vx = Math.max(-30, Math.min(30, pos.x - prevPos.x));
      const vy = Math.max(-30, Math.min(30, pos.y - prevPos.y));
      prevPos = { x: pos.x, y: pos.y };

      Body.setPosition(repeller, pos);
      Body.setVelocity(repeller, { x: vx, y: vy });

      if (!mouseRef.current) return;
      const { x: mx, y: my } = mouseRef.current;
      for (const { body } of bubbles) {
        const dx = body.position.x - mx;
        const dy = body.position.y - my;
        if (dx * dx + dy * dy < WAKE_RADIUS * WAKE_RADIUS) {
          Sleeping.set(body, false);
        }
      }
    });

    // Hard clamp: snap any escaped bubble back inside bounds and cap speed
    const MAX_SPEED = 35;
    Events.on(engine, "afterUpdate", () => {
      for (const { body } of bubbles) {
        const { x, y } = body.position;
        const r = BUBBLE_RADIUS;
        const cx = Math.max(r, Math.min(W - r, x));
        const cy = Math.max(r, Math.min(H - r, y));
        if (cx !== x || cy !== y) {
          Body.setPosition(body, { x: cx, y: cy });
        }
        const { x: vx, y: vy } = body.velocity;
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed > MAX_SPEED) {
          Body.setVelocity(body, {
            x: (vx / speed) * MAX_SPEED,
            y: (vy / speed) * MAX_SPEED,
          });
        }
      }
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Clip everything to the rounded container shape (rounded-2xl = 16px)
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 16);
      ctx.clip();

      // Subtle white gradient — 10% at top fading to 3% at bottom
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(255,255,255,0.03)");
      grad.addColorStop(1, "rgba(255,255,255,0.10)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Dot grid — 20px inset padding on all sides, centered within that area
      const spacing = 28;
      const dotRadius = 1;
      const pad = 20;
      const gridW = W - pad * 2;
      const gridH = H - pad * 2;
      const xStart = pad + (gridW % spacing) / 2;
      const yStart = pad + (gridH % spacing) / 2;
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let gx = xStart; gx <= W - pad; gx += spacing) {
        for (let gy = yStart; gy <= H - pad; gy += spacing) {
          ctx.beginPath();
          ctx.arc(gx, gy, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const { body, holding, color, img } of bubbles) {
        const { x, y } = body.position;
        const angle = body.angle;
        const r = BUBBLE_RADIUS;
        const logoReady = img.complete && img.naturalWidth > 0;
        const logoFailed = img.complete && img.naturalWidth === 0;

        // Translate to bubble center, rotate, draw, restore
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        if (logoReady) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, -r, -r, r * 2, r * 2);
        } else if (logoFailed) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.round(r * 0.42)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(holding.symbol, 0, 0);
        }

        ctx.restore();
      }

      ctx.restore();

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouseRef.current = null;
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      Runner.stop(runner);
      Engine.clear(engine);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [holdings]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#141414]">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
