import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Sonia Brown — Private Chef & Catering in Accra";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Link previews (WhatsApp, Instagram, iMessage) show this image, so lead with food.
const photo = await readFile(join(process.cwd(), "public/images/hero-jollof.jpg"));
const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F5F9FD", color: "#0B2239" }}>
        <div style={{ width: 680, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 56px 64px 72px", background: "linear-gradient(160deg, #DDEFFB 0%, #9fd2f2 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 76, height: 76, borderRadius: 999, background: "#0B2239", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>SB</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 40 }}>Sonia Brown</div>
              <div style={{ fontSize: 18, letterSpacing: 4, color: "#14548C" }}>PRIVATE CHEF &amp; CATERING</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 72, lineHeight: 1.05 }}>Cooked for you,</div>
            <div style={{ fontSize: 72, lineHeight: 1.05, color: "#14548C" }}>at your table.</div>
            <div style={{ fontSize: 26, marginTop: 24, color: "#14548C" }}>Private dinners · Meal prep · Catering · Accra</div>
          </div>
        </div>
        <img src={photoSrc} alt="" width={520} height={630} style={{ width: 520, height: 630, objectFit: "cover" }} />
      </div>
    ),
    size,
  );
}
