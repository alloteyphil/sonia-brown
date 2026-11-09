import { ImageResponse } from "next/og";

export const alt = "Sonia Brown — Private Chef & Catering in Accra";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(160deg, #DDEFFB 0%, #7CC3EE 100%)", padding: 72, color: "#0B2239" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 84, height: 84, borderRadius: 999, background: "#0B2239", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>SB</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44 }}>Sonia Brown</div>
            <div style={{ fontSize: 20, letterSpacing: 4, color: "#14548C" }}>PRIVATE CHEF &amp; CATERING</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.05 }}>Cooked for you,</div>
          <div style={{ fontSize: 84, lineHeight: 1.05, color: "#14548C" }}>at your table.</div>
          <div style={{ fontSize: 28, marginTop: 24, color: "#14548C" }}>Private dinners · Meal prep · Event catering · Accra</div>
        </div>
      </div>
    ),
    size,
  );
}
