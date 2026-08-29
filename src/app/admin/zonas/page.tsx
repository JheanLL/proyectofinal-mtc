'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getZonasTuristicas, 
  getEstaciones, 
  createZonaTuristica, 
  updateZonaTuristica, 
  deleteZonaTuristica 
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
  Footprints, 
  ArrowLeft, 
  Save, 
  X, 
  Check,
  Search,
  Compass,
  AlertCircle
} from 'lucide-react';
import { formatDistance, formatDurationMin, formatCurrencyPEN } from '@/lib/utils';

export default function AdminZonasCrudPage() {
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStationFilter, setSelectedStationFilter] = useState('todos');

  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const reloadData = () => {
    setZonas(getZonasTuristicas());
    setEstaciones(getEstaciones());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setPuntosInteresText(initialFormState.zon_puntos_interes.join('\n'));
    setRecomendacionesText(initialFormState.zon_recomendaciones.join('\n'));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zona: TblZonaTuristica) => {
    setEditingId(zona.zon_id);
    const { zon_id, ...rest } = zona;
    setFormData(rest);
    setPuntosInteresText(zona.zon_puntos_interes.join('\n'));
    setRecomendacionesText(zona.zon_recomendaciones.join('\n'));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar la zona turística "${nombre}"?`)) {
      deleteZonaTuristica(id);
      reloadData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.zon_nombre.trim()) {
      alert('Por favor ingresa el nombre de la zona turística.');
      return;
    }

    const payload: Omit<TblZonaTuristica, 'zon_id'> = {
      ...formData,
      zon_puntos_interes: puntosInteresText.split('\n').map(s => s.trim()).filter(Boolean),
      zon_recomendaciones: recomendacionesText.split('\n').map(s => s.trim()).filter(Boolean),
    };

    if (editingId) {
      updateZonaTuristica(editingId, payload);
    } else {
      createZonaTuristica(payload);
    }

    setIsModalOpen(false);
    reloadData();
  };

  // Filtered Zonas
  const filteredZonas = zonas.filter(z => {
    const matchesSearch = z.zon_nombre.toLowerCase().includes(searchTerm.toLowerCase()) || z.zon_descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStation = selectedStationFilter === 'todos' || z.zon_estacion_id === selectedStationFilter;
    return matchesSearch && matchesStation;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Módulo de Gestión Travel Group Perú</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CRUD de Zonas Turísticas a Pie
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Levantamiento, registro y actualización de atractivos turísticos diseñados exclusivamente a pie desde las estaciones ferroviarias (solo lectura de estaciones).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Panel Admin</span>
          </Link>

          <button
            onClick={handleOpenCreate}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nueva Zona</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar zona turística por nombre..."
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-72">
          <select
            value={selectedStationFilter}
            onChange={(e) => setSelectedStationFilter(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4">Zona Turística</th>
                <th className="p-4">Estación (Solo Lectura)</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Distancia / Tiempo Ida</th>
                <th className="p-4">Ida y Vuelta Total</th>
                <th className="p-4">Dificultad</th>
                <th className="p-4">Tarifa Entrada</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredZonas.map((z) => {
                const est = estaciones.find(e => e.est_id === z.zon_estacion_id);
                return (
                  <tr key={z.zon_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={z.zon_imagen_url}
                          alt={z.zon_nombre}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{z.zon_nombre}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{z.zon_resumen_corto}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <Train className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{est?.est_nombre || 'No asignada'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">Estación de origen peatonal</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {z.zon_categoria}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {formatDistance(z.zon_distancia_metros)} (~{formatDurationMin(z.zon_tiempo_caminata_min)})
                    </td>
                    <td className="p-4 text-emerald-800 font-bold">
                      {formatDistance(z.zon_distancia_metros * 2)} (~{formatDurationMin(z.zon_tiempo_caminata_min * 2)})
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        z.zon_dificultad === 'Fácil'
                          ? 'bg-emerald-100 text-emerald-800'
                          : z.zon_dificultad === 'Moderado'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {z.zon_dificultad}
                      </span>
                    </td>
                    <td className="p-4 text-slate-800 font-bold">
                      {z.zon_precio_entrada_pen === 0 ? 'Gratis' : formatCurrencyPEN(z.zon_precio_entrada_pen)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(z)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Editar Zona"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(z.zon_id, z.zon_nombre)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Eliminar Zona"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Form for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Travel Group Perú • Formulario
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingId ? 'Editar Zona Turística a Pie' : 'Registrar Nueva Zona Turística'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nombre de la Zona Turística: *</label>
                  <input
                    type="text"
                    required
                    value={formData.zon_nombre}
                    onChange={(e) => setFormData({ ...formData, zon_nombre: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Ej: Jardines Ecológicos y Catarata de Mandor"
                  />
                </div>

                {/* Estación Asignada (Solo lectura de estaciones) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estación Ferroviaria de Partida: *</label>
                  <select
                    value={formData.zon_estacion_id}
                    onChange={(e) => setFormData({ ...formData, zon_estacion_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {estaciones.map(e => (
                      <option key={e.est_id} value={e.est_id}>
                        {e.est_nombre} ({e.est_ciudad})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Solo lectura para Travel Group Perú</span>
                </div>

                {/* Categoría */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría Turística: *</label>
                  <select
                    value={formData.zon_categoria}
                    onChange={(e) => setFormData({ ...formData, zon_categoria: e.target.value as CategoriaTuristica })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="naturaleza">Naturaleza</option>
                    <option value="arqueologia">Arqueología</option>
                    <option value="historia">Historia</option>
                    <option value="gastronomia">Gastronomía</option>
                    <option value="fotografia">Fotografía</option>
                    <option value="aventura">Aventura</option>
                    <option value="cultura">Cultura</option>
                    <option value="descanso">Descanso</option>
                  </select>
                </div>

                {/* Resumen corto */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Resumen Corto: *</label>
                  <input
                    type="text"
                    required
                    value={formData.zon_resumen_corto}
                    onChange={(e) => setFormData({ ...formData, zon_resumen_corto: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Breve descripción de 1 línea..."
                  />
                </div>

                {/* Descripción Detallada */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Descripción Completa: *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.zon_descripcion}
                    onChange={(e) => setFormData({ ...formData, zon_descripcion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Descripción detallada del atractivo..."
                  />
                </div>

                {/* Distancia y Tiempos */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Distancia a pie (un tramo en metros): *</label>
                  <input
                    type="number"
                    required
                    min={50}
                    step={50}
                    value={formData.zon_distancia_metros}
                    onChange={(e) => {
                      const dist = Number(e.target.value);
                      const autoMin = Math.round(dist / 80); // ~80m por minuto a pie
                      setFormData({ 
                        ...formData, 
                        zon_distancia_metros: dist,
                        zon_tiempo_caminata_min: autoMin || 5
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-emerald-700 mt-0.5 block">
                    Ida y vuelta total: <strong>{formatDistance(formData.zon_distancia_metros * 2)}</strong>
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiempo de caminata (un tramo en min): *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.zon_tiempo_caminata_min}
                    onChange={(e) => setFormData({ ...formData, zon_tiempo_caminata_min: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-emerald-700 mt-0.5 block">
                    Ida y vuelta total: <strong>~{formatDurationMin(formData.zon_tiempo_caminata_min * 2)}</strong>
                  </span>
                </div>

                {/* Dificultad y Desnivel */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dificultad de la caminata: *</label>
                  <select
                    value={formData.zon_dificultad}
                    onChange={(e) => setFormData({ ...formData, zon_dificultad: e.target.value as NivelDificultad })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Fácil">Fácil (Sendero llano)</option>
                    <option value="Moderado">Moderado (Desnivel medio)</option>
                    <option value="Exigente">Exigente (Gradas y pendientes)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Desnivel Acumulado (metros):</label>
                  <input
                    type="number"
                    value={formData.zon_desnivel_metros}
                    onChange={(e) => setFormData({ ...formData, zon_desnivel_metros: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Tarifa y Horario */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Entrada (S/ PEN, 0 para gratis):</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={formData.zon_precio_entrada_pen}
                    onChange={(e) => setFormData({ ...formData, zon_precio_entrada_pen: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Horario de Atención:</label>
                  <input
                    type="text"
                    value={formData.zon_horario_atencion}
                    onChange={(e) => setFormData({ ...formData, zon_horario_atencion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="06:00 - 18:00 (Lunes a Domingo)"
                  />
                </div>

                {/* Imagen URL */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">URL de Imagen del Atractivo:</label>
                  <input
                    type="url"
                    value={formData.zon_imagen_url}
                    onChange={(e) => setFormData({ ...formData, zon_imagen_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                {/* Puntos de Interés */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Puntos de Interés en el Camino (1 por línea):</label>
                  <textarea
                    rows={3}
                    value={puntosInteresText}
                    onChange={(e) => setPuntosInteresText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Mirador del río&#10;Puente artesanal&#10;Cascada"
                  />
                </div>

                {/* Recomendaciones */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Recomendaciones para el Caminante (1 por línea):</label>
                  <textarea
                    rows={3}
                    value={recomendacionesText}
                    onChange={(e) => setRecomendacionesText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Llevar calzado de trekking&#10;Usar bloqueador solar"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Guardar Cambios' : 'Crear Registro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
