'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  getZonasTuristicas, 
  getEstaciones, 
  syncZonaToStorage,
  syncZonasListToStorage,
  deleteZonaFromStorage
} from '@/lib/db/store';
import { 
  TblZonaTuristica, 
  TblEstacion, 
  CategoriaTuristica, 
  NivelDificultad 
} from '@/types/database';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Train, 
  ArrowLeft, 
  Save, 
  X, 
  Search,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { formatDistance, formatDurationMin, formatCurrencyPEN } from '@/lib/utils';

export default function AdminZonasCrudPage() {
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStationFilter, setSelectedStationFilter] = useState('todos');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Image Upload State
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload');
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);
  const [imageSizeKb, setImageSizeKb] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState: Omit<TblZonaTuristica, 'zon_id'> = {
    zon_estacion_id: 'est_04',
    zon_nombre: '',
    zon_categoria: 'naturaleza',
    zon_descripcion: '',
    zon_resumen_corto: '',
    zon_distancia_metros: 1000,
    zon_tiempo_caminata_min: 15,
    zon_tiempo_sugerido_visita_min: 60,
    zon_dificultad: 'Fácil',
    zon_desnivel_metros: 20,
    zon_puntos_interes: ['Punto de observación panorámica', 'Plaza de bienvenida'],
    zon_recomendaciones: ['Llevar calzado cómodo', 'Protector solar y agua'],
    zon_latitud: -13.1550,
    zon_longitud: -72.5250,
    zon_imagen_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80',
    zon_precio_entrada_pen: 0,
    zon_horario_atencion: '08:00 - 17:00',
    zon_es_destacado: false,
  };

  const [formData, setFormData] = useState<Omit<TblZonaTuristica, 'zon_id'>>(initialFormState);
  const [puntosInteresText, setPuntosInteresText] = useState('');
  const [recomendacionesText, setRecomendacionesText] = useState('');

  const reloadData = async () => {
    setIsLoading(true);
    // Carga inicial reactiva desde store local
    setZonas(getZonasTuristicas());
    setEstaciones(getEstaciones());

    // Sincronización en vivo con Aiven MySQL
    try {
      const cacheBust = `?t=${Date.now()}`;
      const [resZonas, resEst] = await Promise.all([
        fetch(`/api/zonas${cacheBust}`),
        fetch(`/api/estaciones${cacheBust}`),
      ]);
      const dataZ = await resZonas.json();
      const dataE = await resEst.json();
      if (dataZ.success && Array.isArray(dataZ.data)) {
        setZonas(dataZ.data);
        syncZonasListToStorage(dataZ.data);
      }
      if (dataE.success && Array.isArray(dataE.data)) {
        setEstaciones(dataE.data);
      }
    } catch (err) {
      console.warn('[Admin Zonas] Usando datos locales:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setPuntosInteresText(initialFormState.zon_puntos_interes.join('\n'));
    setRecomendacionesText(initialFormState.zon_recomendaciones.join('\n'));
    setImageSizeKb(null);
    setImageUploadMode('upload');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zona: TblZonaTuristica) => {
    setEditingId(zona.zon_id);
    const { zon_id, ...rest } = zona;
    setFormData(rest);
    setPuntosInteresText(zona.zon_puntos_interes.join('\n'));
    setRecomendacionesText(zona.zon_recomendaciones.join('\n'));
    if (zona.zon_imagen_url.startsWith('data:image/')) {
      const approxBytes = Math.round((zona.zon_imagen_url.length * 3) / 4);
      setImageSizeKb(Math.round(approxBytes / 1024));
      setImageUploadMode('upload');
    } else {
      setImageSizeKb(null);
      setImageUploadMode('url');
    }
    setIsModalOpen(true);
  };

  // Algoritmo de Compresión de Imágenes en Cliente a WebP (100% Gratis - Cero Costo de Cloud)
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido (JPEG, PNG, WEBP).');
      return;
    }

    setIsOptimizingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Escala proporcional a máx 1000px para conservar nitidez y peso pluma (< 80 KB)
          const maxDim = 1000;
          let w = img.width;
          let h = img.height;

          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            // Conversión a WebP optimizado con calidad 0.82
            const webpDataUrl = canvas.toDataURL('image/webp', 0.82);
            const approxBytes = Math.round((webpDataUrl.length * 3) / 4);
            const sizeKb = Math.round(approxBytes / 1024);
            setImageSizeKb(sizeKb);
            setFormData(prev => ({ ...prev, zon_imagen_url: webpDataUrl }));
          }
          setIsOptimizingImage(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error optimizando imagen:', err);
      setIsOptimizingImage(false);
      alert('Error al procesar la imagen.');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Está seguro de eliminar permanentemente el atractivo turístico "${nombre}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/zonas?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Acceso denegado o error al eliminar la zona.');
        return;
      }

      deleteZonaFromStorage(id);
      setStatusMessage({ type: 'success', text: `Zona "${nombre}" eliminada exitosamente.` });
      setTimeout(() => setStatusMessage(null), 4000);
      await reloadData();
    } catch (err: any) {
      console.error(err);
      deleteZonaFromStorage(id);
      reloadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.zon_nombre.trim()) {
      alert('Por favor ingrese el nombre de la zona turística.');
      return;
    }

    const payload: Omit<TblZonaTuristica, 'zon_id'> = {
      ...formData,
      zon_puntos_interes: puntosInteresText.split('\n').map(s => s.trim()).filter(Boolean),
      zon_recomendaciones: recomendacionesText.split('\n').map(s => s.trim()).filter(Boolean),
    };

    setIsSubmitting(true);

    try {
      if (editingId) {
        const res = await fetch('/api/zonas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, zon_id: editingId }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(data.error || 'No fue posible actualizar la zona.');
          setIsSubmitting(false);
          return;
        }
        syncZonaToStorage(data.data || { ...payload, zon_id: editingId });
        setStatusMessage({ type: 'success', text: 'Zona turística actualizada en Aiven MySQL exitosamente.' });
      } else {
        const res = await fetch('/api/zonas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(data.error || 'No fue posible registrar la nueva zona.');
          setIsSubmitting(false);
          return;
        }
        if (data.data) {
          syncZonaToStorage(data.data);
        }
        setStatusMessage({ type: 'success', text: 'Nueva zona turística registrada en Aiven MySQL exitosamente.' });
      }

      setIsModalOpen(false);
      setTimeout(() => setStatusMessage(null), 4000);
      await reloadData();
    } catch (err: any) {
      alert(`Error al procesar la solicitud: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredZonas = zonas.filter(z => {
    const matchesSearch = z.zon_nombre.toLowerCase().includes(searchTerm.toLowerCase()) || z.zon_descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStation = selectedStationFilter === 'todos' || z.zon_estacion_id === selectedStationFilter;
    return matchesSearch && matchesStation;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 transition-colors duration-200">
      {/* Notificación de Estado */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-fade-in ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold">{statusMessage.text}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-bold mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Módulo de Gestión Travel Group Perú</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            CRUD de Zonas Turísticas a Pie
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Levantamiento, registro, optimización de imágenes WebP y actualización de atractivos turísticos diseñados a pie desde las estaciones ferroviarias (Aiven MySQL SSOT).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Panel</span>
          </Link>

          <button
            onClick={handleOpenCreate}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Zona</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar zona turística por nombre..."
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-72">
          <select
            value={selectedStationFilter}
            onChange={(e) => setSelectedStationFilter(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          >
            <option value="todos">Todas las Estaciones ({estaciones.length})</option>
            {estaciones.map(e => (
              <option key={e.est_id} value={e.est_id}>
                {e.est_nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3">Zona Turística</th>
                <th className="p-3">Estación (Lectura)</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Distancia / Tiempo Ida</th>
                <th className="p-3">Ida y Vuelta</th>
                <th className="p-3">Dificultad</th>
                <th className="p-3">Entrada</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredZonas.map((z) => {
                const est = estaciones.find(e => e.est_id === z.zon_estacion_id);
                return (
                  <tr key={z.zon_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={z.zon_imagen_url}
                          alt={z.zon_nombre}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs">{z.zon_nombre}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{z.zon_resumen_corto}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold">
                        <Train className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
                        <span>{est?.est_nombre || 'No asignada'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                        {z.zon_categoria}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {formatDistance(z.zon_distancia_metros)} (~{formatDurationMin(z.zon_tiempo_caminata_min)})
                    </td>
                    <td className="p-3 text-emerald-800 dark:text-emerald-400 font-bold">
                      {formatDistance(z.zon_distancia_metros * 2)} (~{formatDurationMin(z.zon_tiempo_caminata_min * 2)})
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        z.zon_dificultad === 'Fácil'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : z.zon_dificultad === 'Moderado'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                      }`}>
                        {z.zon_dificultad}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200 font-bold">
                      {z.zon_precio_entrada_pen === 0 ? 'Gratis' : formatCurrencyPEN(z.zon_precio_entrada_pen)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(z)}
                          className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          title="Editar Zona"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(z.zon_id, z.zon_nombre)}
                          className="p-1 rounded-lg bg-red-50 dark:bg-red-950 hover:bg-red-100 text-red-600 dark:text-red-400 transition-colors"
                          title="Eliminar Zona"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                  Travel Group Perú • Formulario Institucional
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingId ? 'Editar Zona Turística' : 'Registrar Nueva Zona'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nombre del Atractivo: *</label>
                  <input
                    type="text"
                    required
                    value={formData.zon_nombre}
                    onChange={(e) => setFormData({ ...formData, zon_nombre: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Ej: Jardines Ecológicos de Mandor"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Estación de Partida (Solo Lectura): *</label>
                  <select
                    value={formData.zon_estacion_id}
                    onChange={(e) => {
                      const newEstId = e.target.value;
                      const targetEst = estaciones.find(est => est.est_id === newEstId);
                      setFormData(prev => ({
                        ...prev,
                        zon_estacion_id: newEstId,
                        zon_latitud: (!editingId && targetEst) ? Number((Number(targetEst.est_latitud) + 0.003).toFixed(6)) : prev.zon_latitud,
                        zon_longitud: (!editingId && targetEst) ? Number((Number(targetEst.est_longitud) + 0.003).toFixed(6)) : prev.zon_longitud,
                      }));
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {estaciones.map(e => (
                      <option key={e.est_id} value={e.est_id}>
                        {e.est_nombre} ({e.est_ciudad})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Categoría: *</label>
                  <select
                    value={formData.zon_categoria}
                    onChange={(e) => setFormData({ ...formData, zon_categoria: e.target.value as CategoriaTuristica })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="naturaleza">Naturaleza</option>
                    <option value="arqueologia">Arqueología</option>
                    <option value="historia">Historia</option>
                    <option value="gastronomia">Gastronomía</option>
                    <option value="fotografia">Fotografía</option>
                    <option value="aventura">Aventura</option>
                    <option value="descanso">Descanso</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Resumen Corto: *</label>
                  <input
                    type="text"
                    required
                    value={formData.zon_resumen_corto}
                    onChange={(e) => setFormData({ ...formData, zon_resumen_corto: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Descripción resumida en 1 línea para tarjetas del catálogo..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Descripción Detallada: *</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.zon_descripcion}
                    onChange={(e) => setFormData({ ...formData, zon_descripcion: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* SECCIÓN DE CARGA DE IMAGEN (100% GRATIS CON COMPRESIÓN WEBP) */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>Fotografía del Atractivo Turístico</span>
                      </label>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Compresión automática a WebP en el navegador (Cero costo de servidor o buckets externos).
                      </p>
                    </div>

                    <div className="flex items-center bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('upload')}
                        className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                          imageUploadMode === 'upload'
                            ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>Subir Archivo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('url')}
                        className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                          imageUploadMode === 'url'
                            ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Ingresar URL</span>
                      </button>
                    </div>
                  </div>

                  {imageUploadMode === 'upload' ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={handleImageFileSelect}
                        className="hidden"
                        id="zona-image-upload-input"
                      />
                      <label
                        htmlFor="zona-image-upload-input"
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white dark:bg-slate-900"
                      >
                        {isOptimizingImage ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Optimizando y comprimiendo imagen a WebP...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-1" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              Haga clic para seleccionar una fotografía desde su equipo
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              Formatos admitidos: JPG, PNG, WEBP (se escala a máx 1000px y comprime automáticamente)
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        value={formData.zon_imagen_url}
                        onChange={(e) => setFormData({ ...formData, zon_imagen_url: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-[11px] focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Previsualizador */}
                  {formData.zon_imagen_url && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <img
                        src={formData.zon_imagen_url}
                        alt="Previsualización"
                        className="w-16 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold text-[10px]">
                            <Sparkles className="w-2.5 h-2.5" />
                            {imageSizeKb ? `WebP Optimizado (~${imageSizeKb} KB)` : 'Imagen Activa'}
                          </span>
                          <span className="text-[10px] text-slate-400">Persistencia directa en Aiven MySQL</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {formData.zon_imagen_url.startsWith('data:') ? 'Imagen codificada en Base64 WebP' : formData.zon_imagen_url}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Distancia a pie (un tramo en metros): *</label>
                  <input
                    type="number"
                    required
                    min={50}
                    step={50}
                    value={formData.zon_distancia_metros}
                    onChange={(e) => {
                      const dist = Number(e.target.value);
                      const autoMin = Math.round(dist / 80);
                      setFormData({ 
                        ...formData, 
                        zon_distancia_metros: dist,
                        zon_tiempo_caminata_min: autoMin || 5
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tiempo de caminata (min): *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.zon_tiempo_caminata_min}
                    onChange={(e) => setFormData({ ...formData, zon_tiempo_caminata_min: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dificultad: *</label>
                  <select
                    value={formData.zon_dificultad}
                    onChange={(e) => setFormData({ ...formData, zon_dificultad: e.target.value as NivelDificultad })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Fácil">Fácil (Sendero llano)</option>
                    <option value="Moderado">Moderado (Desnivel medio)</option>
                    <option value="Exigente">Exigente (Gradas y pendientes)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Precio Entrada (S/):</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.zon_precio_entrada_pen}
                    onChange={(e) => setFormData({ ...formData, zon_precio_entrada_pen: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Puntos de Interés */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Puntos de Interés (uno por línea):</label>
                  <textarea
                    rows={2}
                    value={puntosInteresText}
                    onChange={(e) => setPuntosInteresText(e.target.value)}
                    placeholder="Mirador de aves&#10;Cascada natural"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Recomendaciones */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Recomendaciones (una por línea):</label>
                  <textarea
                    rows={2}
                    value={recomendacionesText}
                    onChange={(e) => setRecomendacionesText(e.target.value)}
                    placeholder="Llevar repelente&#10;Zapatillas de trekking"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isOptimizingImage}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando en Aiven MySQL...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingId ? 'Guardar Cambios' : 'Crear Registro'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
