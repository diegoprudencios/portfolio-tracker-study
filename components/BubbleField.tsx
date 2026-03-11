"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import { type Holding } from "../lib/mockData";

const FILL_RATIO = 0.6;
const PALETTE = ["#F7931A", "#627EEA", "#8247E5", "#26A17B", "#2775CA"];
const BUBBLE_RADIUS = 40;
const REPELLER_RADIUS = 56;

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

    const { Engine, Runner, Bodies, Body, Composite, Events } = Matter;

    const W = container.clientWidth;
    const H = container.clientHeight;
    canvas.width = W;
    canvas.height = H;

    const engine = Engine.create({ gravity: { x: 0, y: 1 } });

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
      restitution: 0.6,
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

    distribution.forEach(({ holding, count }) => {
      const color = symbolColor(holding.symbol);

      const img = new Image();
      img.src = `/crypto-logos/${holding.symbol.toLowerCase()}.svg`;

      for (let i = 0; i < count; i++) {
        // Spawn in upper half so they fall down into view
        const x = BUBBLE_RADIUS * 2 + Math.random() * (W - BUBBLE_RADIUS * 4);
        const y = BUBBLE_RADIUS * 2 + Math.random() * (H * 0.5);
        const body = Bodies.circle(x, y, BUBBLE_RADIUS, {
          restitution: 0.2,
          frictionAir: 0.01,
          friction: 0.05,
          label: holding.symbol,
          collisionFilter: { category: 0x0001, mask: 0x0001 | 0x0002 },
        });
        Body.setAngle(body, Math.random() * Math.PI * 2);
        Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: 0 });
        Composite.add(engine.world, body);
        bubbles.push({ body, holding, color, img });
      }
    });

    // Move repeller to cursor position before each physics step
    Events.on(engine, "beforeUpdate", () => {
      const pos = mouseRef.current ?? { x: -500, y: -500 };
      Body.setPosition(repeller, pos);
      Body.setVelocity(repeller, { x: 0, y: 0 });
    });

    // Hard clamp: snap any escaped bubble back inside bounds and cap speed
    const MAX_SPEED = 22;
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
