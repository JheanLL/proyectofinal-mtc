import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Informe Turístico Consolidado - MTC & PeruRail';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #7f1d1d 0%, #0f172a 60%, #020617 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
              }}
            >
              🚆
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '2px', color: '#f87171' }}>
                MINISTERIO DE TRANSPORTES Y COMUNICACIONES
              </span>
              <span style={{ fontSize: '14px', color: '#94a3b8', letterSpacing: '1px' }}>
                PERÚ • ASESOR TURÍSTICO FERROVIARIO & PEATONAL
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '8px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#38bdf8',
            }}
          >
            Itinerario Oficial • Consulta en Línea
          </div>
        </div>

        {/* Center Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 16px',
              backgroundColor: 'rgba(220, 38, 38, 0.25)',
              border: '1px solid rgba(220, 38, 38, 0.4)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 700,
              color: '#fca5a5',
              width: 'auto',
            }}
          >
            DOCUMENTO OFICIAL DE ITINERARIO
          </div>

          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
              margin: 0,
              color: '#ffffff',
            }}
          >
            INFORME TURÍSTICO CONSOLIDADO
          </h1>

          <p style={{ fontSize: '24px', color: '#cbd5e1', margin: 0, maxWidth: '900px', lineHeight: 1.4 }}>
            Rutas en tren de PeruRail, circuitos turísticos exclusivamente a pie y previsiones meteorológicas oficiales en vivo de SENAMHI.
          </p>
        </div>

        {/* Footer Allies */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#fca5a5' }}>
              🚆 PeruRail
            </span>
            <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#93c5fd' }}>
              ☀️ SENAMHI
            </span>
            <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#86efac' }}>
              🚶 Travel Group Perú
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>
              Plataforma Turística Oficial • MTC Perú
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
