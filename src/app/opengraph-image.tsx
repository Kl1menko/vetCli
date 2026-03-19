import { ImageResponse } from "next/og";

import { clinicProfile } from "@/constants/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #f8fdfd 0%, #ffffff 44%, #eef8f7 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 15% 18%, rgba(113,204,196,0.28), transparent 28%), radial-gradient(circle at 85% 12%, rgba(247,197,112,0.22), transparent 22%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 56,
            width: 280,
            height: 280,
            borderRadius: 72,
            background: "linear-gradient(135deg, rgba(18,52,59,1) 0%, rgba(15,85,99,1) 100%)",
            transform: "rotate(12deg)",
            opacity: 0.96,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 86,
            right: 92,
            width: 240,
            height: 240,
            borderRadius: 60,
            border: "1px solid rgba(255,255,255,0.22)",
            background: "linear-gradient(160deg, rgba(113,204,196,0.92), rgba(18,52,59,0.88))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 94,
            fontWeight: 800,
            letterSpacing: "-0.08em",
          }}
        >
          UV
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 64px 56px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: 22,
                background: "#12343b",
                color: "white",
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              UV
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 34, fontWeight: 700 }}>{clinicProfile.name}</div>
              <div style={{ fontSize: 18, color: "#48616a" }}>Ветклініка у Львові</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                borderRadius: 999,
                padding: "10px 16px",
                background: "rgba(255,255,255,0.88)",
                color: "#0f5563",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Онлайн-запис 24/7
            </div>
            <div style={{ fontSize: 64, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.06em" }}>
              Турбота про тварин без черг, стресу і втрати медичної історії.
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.35, color: "#40525b" }}>
              Запис на прийом, кабінет власника тварини, профілі лікарів і прозора історія візитів в одному сервісі.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 22,
              color: "#48616a",
            }}
          >
            <div>{clinicProfile.address}</div>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: "#71ccc4" }} />
            <div>{clinicProfile.phone}</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
