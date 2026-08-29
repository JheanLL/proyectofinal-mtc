# Plataforma Web: Zonas Turísticas MTC - Rutas Ferroviarias & Peatonales

Plataforma desarrollada para el **Ministerio de Transportes y Comunicaciones (MTC)** orientada a fomentar el uso del transporte público ferroviario y el turismo local sostenible en el Perú.

El sistema funciona como un **asesor especializado** que conecta la red de estaciones de **PeruRail** con circuitos turísticos diseñados exclusivamente para realizarse **a pie** (modelo de trayecto único de ida y vuelta), integrando el pronóstico climatológico y alertas del **SENAMHI** y el catálogo turístico georreferenciado de **Travel Group Perú**.

---

## 🚀 Despliegue en Vercel (100% Gratuito)

Este proyecto está optimizado para desplegarse en **Vercel** sin costo alguno:

1. Subir el repositorio a GitHub / GitLab.
2. Iniciar sesión en [Vercel](https://vercel.com).
3. Importar el proyecto (`proyectofinal`).
4. Seleccionar el framework preset `Next.js`.
5. Hacer clic en **Deploy**. ¡Listo en menos de 1 minuto!

---

## 🏛️ Fuentes Integradas y Arquitectura de Módulos

### 1. Módulo de Integración de Datos
- **SENAMHI**: Previsiones meteorológicas por estación (temperaturas mín/máx, probabilidad de lluvia, radiación UV extrema, alertas oficiales y recomendaciones de indumentaria).
- **PeruRail**: Datos logísticos de estaciones, frecuencias de trenes (Expedition, Vistadome, Vistadome Observatory, Hiram Bingham, Tren Local), tiempos de tránsito y tarifarios en Soles (PEN) y Dólares (USD).
- **Travel Group Perú**: Levantamiento de zonas turísticas a pie vinculadas a estaciones, con cálculo de distancia y tiempo en trayecto único ida y vuelta.

### 2. Módulo de Administración
- **Travel Group Perú**: CRUD completo para zonas turísticas a pie (estaciones en modo solo lectura).
- **PeruRail**: CRUD completo para horarios, frecuencias y tarifas.
- **Panel de Gestores**: Monitoreo de integraciones y simulador de sincronización de APIs en tiempo real.

### 3. Módulo Cliente / Asesor Turístico Inteligente
- Wizard interactivo por preferencias (Naturaleza, Arqueología, Historia, Gastronomía, Fotografía, Aventura, Cultura, Descanso).
- Selector de estación de salida y llegada.
- Visualización interactiva con mapas (Leaflet / OpenStreetMap) que trazan la ruta a pie ida y vuelta.
- Widget climático oficial SENAMHI en tiempo real.
- Selector de billetes de tren PeruRail.

### 4. Módulo de Informes
- **Para Usuarios**: Informe consolidado oficial exportable a **PDF** y formateado para **impresión HTML** con membrete institucional del MTC, SENAMHI, PeruRail y Travel Group Perú, desglose de costos y QR/código de itinerario.
- **Para Travel Group Perú / Admin**: Matriz de asignación de estaciones y zonas con exportación e impresión.

---

## 🗄️ Convención de Base de Datos con Prefijos

Cumpliendo los lineamientos de diseño de bases de datos:
- `tbl_estacion` (`est_id`, `est_codigo`, `est_nombre`, `est_ciudad`, `est_altitud_msnm`, `est_latitud`, `est_longitud`, `est_servicios`, etc.)
- `tbl_zona_turistica` (`zon_id`, `zon_estacion_id`, `zon_nombre`, `zon_categoria`, `zon_distancia_metros`, `zon_tiempo_caminata_min`, `zon_dificultad`, etc.)
- `tbl_horario_tren` (`hor_id`, `hor_codigo_tren`, `hor_estacion_origen_id`, `hor_estacion_destino_id`, `hor_servicio_tipo`, `hor_tarifa_regular_pen`, etc.)
- `tbl_pronostico_clima` (`cli_id`, `cli_estacion_id`, `cli_fecha`, `cli_temp_actual_c`, `cli_alerta_meteorologica`, `cli_fuente_senamhi`, etc.)
- `tbl_preferencia_turistica` (`pre_id`, `pre_codigo`, `pre_nombre`, `pre_icono`, etc.)
- `tbl_itinerario_consulta` (`iti_id`, `iti_codigo`, `iti_fecha_creacion`, `iti_usuario_nombre`, `iti_costo_total_pen`, etc.)

---

## 💻 Tecnologías Utilizadas

- **Framework**: Next.js 16 (App Router) + React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Iconografía**: Lucide React
- **Mapas Interactivos**: Leaflet & OpenStreetMap (100% libre sin API keys de pago)
- **Generación de Informes PDF**: jsPDF & html2canvas
- **Efectos y Celebraciones**: Canvas Confetti

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
pnpm install

# Modo desarrollo
pnpm dev

# Compilar para producción
pnpm run build

# Iniciar servidor de producción
pnpm start
```
