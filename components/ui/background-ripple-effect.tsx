"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Aceternity's Background Ripple Effect, from
 * `npx shadcn@latest add @aceternity/background-ripple-effect-demo`.
 *
 * Four changes from what the registry installs. Noted here because
 * re-running that command overwrites this file:
 *
 * 1. The registry does NOT ship the `cell-ripple` keyframes its own
 *    `animate-cell-ripple` class depends on, so out of the box the
 *    ripple — the entire point of the component — did nothing. They are
 *    defined in globals.css alongside the utility.
 * 2. `useRef<any>(null)` was assigned to the root and never read.
 *    Removed rather than typed: dead code that also failed lint.
 * 3. Colours came from Tailwind's neutral palette with `dark:` twins.
 *    This site declares `color-scheme: light` and owns its palette, so
 *    the cells now take `--line-soft`, `--surface` and `--accent`, and
 *    the dark variants are gone as dead weight.
 * 4. `opacity-600` dropped. Tailwind's opacity scale stops at 100, so
 *    it generated nothing — it only looked like it was doing something.
 *
 * The grid is a fixed `cols × cellSize` block, centred. It is meant to
 * overflow a narrow viewport and be clipped by the section holding it,
 * which is why the hero keeps its `overflow-hidden`.
 */
export const BackgroundRippleEffect = ({
  /** Both are only the first render's guess. Replaced by a measurement
   *  as soon as the element has a size — see below. */
  rows: initialRows = 16,
  cols: initialCols = 44,
  cellSize = 28,
}: {
  rows?: number;
  cols?: number;
  cellSize?: number;
}) => {
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  // Bumping this remounts the grid, which is what restarts the
  // animation on a second click to the same cell.
  const [rippleKey, setRippleKey] = useState(0);

  /**
   * Grid size, measured rather than fixed, so it fills whatever it is
   * placed in.
   *
   * Upstream renders a fixed `cols × rows × cellSize` block, which
   * leaves bare page either side of it on a wide monitor and stops
   * partway down a tall one — the hero is `100svh` minus some chrome,
   * so its height is not a number this component can be told in
   * advance.
   *
   * Counting cells is also the only way to fill the box AND keep the
   * ripple honest: the distance maths below derives a cell's row and
   * column from its index, so it needs the real counts, which
   * `repeat(auto-fill, …)` would hide inside the layout engine.
   */
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(initialCols);
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // Ceil on both, so the last partial row and column are drawn and
      // clipped rather than leaving a gap at the edge.
      setCols(Math.max(1, Math.ceil(width / cellSize)));
      setRows(Math.max(1, Math.ceil(height / cellSize)));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [cellSize]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 h-full w-full",
        // `--line-soft` for the grid itself, the same weight the CSS
        // grid this replaced used. The fill is an indigo wash rather
        // than white: on an off-white page a white cell is invisible
        // whatever its opacity, which is why hovering did nothing you
        // could see.
        "[--cell-border-color:color-mix(in_oklab,var(--line-soft)_55%,transparent)] [--cell-fill-color:color-mix(in_oklab,var(--accent)_16%,transparent)] [--cell-ripple-color:var(--accent)]",
      )}
    >
      {/* `h-full`, not `h-auto`: the observer measures this box, and
          a box sized by its contents would just report the grid's own
          height back — the grid would never grow to fill the hero. */}
      <div className="relative h-full w-full overflow-hidden">
        <DivGrid
          key={`base-${rippleKey}`}
          // Fades out towards the bottom so the grid never competes
          // with the headline sitting on top of it — the same job the
          // mask on the old `.grid-field` did.
          className="mask-radial-from-30% mask-radial-at-top"
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey((k) => k + 1);
          }}
          interactive
        />
      </div>
    </div>
  );
};

/**
 * How far the ripple reaches, in cells. Beyond this a cell simply does
 * not animate.
 *
 * A cap rather than faster timings alone, because the distance that
 * drives the stagger is counted in CELLS: shrinking the boxes puts more
 * of them between the click and the edge, so an uncapped ripple gets
 * slower and longer every time the grid gets finer. Holding the radius
 * fixed makes the effect a burst around the pointer rather than
 * something that crosses the whole hero.
 */
const RIPPLE_RADIUS = 9;

/**
 * Stagger and flash length, per cell of distance from the click.
 *
 * The delay is what the eye reads as the ripple's SPEED — how long each
 * ring waits before its turn — and the duration is how long a single
 * cell holds its colour. Both matter: raising only the delay gives a
 * slow wave of brief flickers, and raising only the duration gives a
 * fast wave that takes a long time to clear.
 *
 * At `RIPPLE_RADIUS` of 9 this puts the outermost ring at 405ms and
 * lets it run for a further 815ms, so the whole thing plays out in
 * about 1.2s. Still short of upstream's 55ms/80ms, which at this cell
 * size ran for several seconds.
 */
const RIPPLE_DELAY_PER_CELL = 45;
const RIPPLE_DURATION_PER_CELL = 55;
const RIPPLE_BASE_DURATION = 320;

type DivGridProps = {
  className?: string;
  rows: number;
  cols: number;
  /** Pixels. */
  cellSize: number;
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
};

type CellStyle = React.CSSProperties & {
  ["--delay"]?: string;
  ["--duration"]?: string;
  ["--cell-fill"]?: string;
  ["--intensity"]?: string;
};

const DivGrid = ({
  className,
  rows = 16,
  cols = 44,
  cellSize = 28,
  borderColor = "color-mix(in oklab, var(--line-soft) 55%, transparent)",
  fillColor = "var(--surface)",
  clickedCell = null,
  onCellClick = () => {},
  interactive = true,
}: DivGridProps) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  );

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: "auto",
  };

  return (
    <div className={cn("relative z-[3]", className)} style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;

        // Distance from the clicked cell drives both the stagger and
        // the length of each cell's flash, which is what makes the
        // ripple read as travelling outwards rather than flashing all
        // at once.
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0;
        const rippling = clickedCell !== null && distance <= RIPPLE_RADIUS;
        const delay = distance * RIPPLE_DELAY_PER_CELL;
        const duration =
          RIPPLE_BASE_DURATION + distance * RIPPLE_DURATION_PER_CELL;

        // 1 at the click, 0 at the edge of the radius.
        //
        // Without this the cap is a cliff: the outermost ring flashes as
        // hard as the centre and the cell beside it does nothing, so the
        // ripple stops dead instead of running out. Fading the strength
        // to zero exactly where the radius ends means the boundary is
        // never a thing you can see.
        const intensity = rippling
          ? Math.max(0, 1 - distance / RIPPLE_RADIUS)
          : 0;

        const style: CellStyle = rippling
          ? {
              "--delay": `${delay}ms`,
              "--duration": `${duration}ms`,
              "--intensity": intensity.toFixed(3),
            }
          : {};

        return (
          <div
            key={idx}
            className={cn(
              // Upstream faded the whole cell between opacity 40 and
              // 80, which dims the border along with the fill and can
              // only ever make a white box slightly less white. Colour
              // is the hover state now, and the cell is transparent
              // until then — so at rest this reads as a plain line
              // grid, exactly as it did before.
              // Top and left only, not all four. Separate divs do not
              // collapse their borders, so a full `border` draws every
              // internal line TWICE — one cell's right edge against its
              // neighbour's left — which is why 0.5px was landing as a
              // solid 1px. One edge per line halves it for real, and
              // the outer right and bottom edges are no loss: the mask
              // has already faded the grid out by the time it gets
              // there.
              "cell relative border-t-[0.5px] border-l-[0.5px] bg-transparent transition-colors duration-150 hover:bg-[var(--cell-fill)]",
              rippling && "animate-cell-ripple [animation-fill-mode:none]",
              !interactive && "pointer-events-none",
            )}
            style={
              {
                "--cell-fill": fillColor,
                borderColor,
                ...style,
              } as CellStyle
            }
            onClick={
              interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
            }
          />
        );
      })}
    </div>
  );
};
