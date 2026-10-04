import { useSettings } from "../utils/useSettings";
export function useTornEdges() {
  const game = useSettings((state) => state.game);
  return game === "rdr3" ? "torn-edge-wrapper" : "";
}

// Add this SVG to your layout/root component:
export function TornEdgeSVGFilter() {
  return (
    <svg
      style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <defs>
        <filter id="torn-edge-filter" x="-50%" y="-50%" width="200%" height="200%">
          {/* Base fractal noise for tearing */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.022"
            numOctaves="5"
            seed="9"
            result="noise1"
          />
          {/* Second noise layer for micro detail */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.08 0.12"
            numOctaves="2"
            seed="3"
            result="noise2"
          />

          {/* Blend both noise layers */}
          <feBlend in="noise1" in2="noise2" mode="multiply" result="combinedNoise" />

          {/* Primary displacement */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="combinedNoise"
            scale="52"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />

          {/* Alpha fade toward edges */}
          <feGaussianBlur stdDeviation="0.8" in="displaced" result="blurred" />
          <feComponentTransfer in="blurred" result="alphaFade">
            <feFuncA type="gamma" amplitude="1" exponent="1.3" offset="-0.05" />
          </feComponentTransfer>

          {/* Sharpen a bit after fade */}
          <feMorphology operator="erode" radius="0.4" in="alphaFade" result="eroded" />

          {/* Merge final */}
          <feMerge>
            <feMergeNode in="eroded" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

