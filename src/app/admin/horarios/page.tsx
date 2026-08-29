'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getHorariosTren, 
  getEstaciones, 
  createHorarioTren, 
  updateHorarioTren, 
  deleteHorarioTren 
} from '@/lib/db/store';
import { 
  TblHorarioTren, 
  TblEstacion, 
  TipoServicioTren 
} from '@/types/database';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Train, 
  Clock, 
  DollarSign, 
  ArrowLeft, 
  Save, 
  X, 
  Check,
  Search,
  Coffee
} from 'lucide-react';
import { formatCurrencyPEN, formatCurrencyUSD, formatDurationMin } from '@/lib/utils';

export default function AdminHorariosCrudPage() {
  const [horarios, setHorarios] = useState<TblHorarioTren[]>([]);
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState: Omit<TblHorarioTren, 'hor_id'> = {
    hor_codigo_tren: 'VIS-99',
    hor_estacion_origen_id: 'est_03',
    hor_estacion_destino_id: 'est_04',
    hor_servicio_tipo: 'Vistadome',
    hor_hora_salida: '07:30',
    hor_hora_llegada: '09:00',
    hor_duracion_min: 90,
    hor_tarifa_regular_pen: 180,
    hor_tarifa_turista_usd: 75,
    hor_dias_operacion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    hor_asientos_disponibles: 36,
    hor_incluye_refrigerio: true,
  };

  const [formData, setFormData] = useState<Omit<TblHorarioTren, 'hor_id'>>(initialFormState);

  const reloadData = () => {
    setHorarios(getHorariosTren());
    setEstaciones(getEstaciones());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (horario: TblHorarioTren) => {
    setEditingId(horario.hor_id);
    const { hor_id, ...rest } = horario;
    setFormData(rest);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, codigo: string) => {
    if (confirm(`¿Eliminar la frecuencia de tren "${codigo}"?`)) {
      deleteHorarioTren(id);
      reloadData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.hor_codigo_tren.trim()) {
      alert('Por favor ingresa el código del tren.');
      return;
    }

    if (formData.hor_estacion_origen_id === formData.hor_estacion_destino_id) {
      alert('La estación de origen y destino no pueden ser iguales.');
      return;
    }

    if (editingId) {
      updateHorarioTren(editingId, formData);
    } else {
      createHorarioTren(formData);
    }

    setIsModalOpen(false);
    reloadData();
  };

  const filteredHorarios = horarios.filter(h => 
    h.hor_codigo_tren.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.hor_servicio_tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <Train className="w-3.5 h-3.5" />
            <span>Módulo de Gestión PeruRail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CRUD de Horarios, Rutas y Tarifas de Tren
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Administración de servicios ferroviarios, frecuencias diarias, tiempos de tránsito y tarifas de billetes en Soles (PEN) y Dólares (USD).
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
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Frecuencia de Tren</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código de tren o tipo de servicio..."
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4">Código / Servicio</th>
                <th className="p-4">Origen ➔ Destino</th>
                <th className="p-4">Salida / Llegada</th>
                <th className="p-4">Duración</th>
                <th className="p-4">Tarifa Regular (PEN)</th>
                <th className="p-4">Tarifa Turista (USD)</th>
                <th className="p-4">Refrigerio</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHorarios.map((h) => {
                const orig = estaciones.find(e => e.est_id === h.hor_estacion_origen_id);
                const dest = estaciones.find(e => e.est_id === h.hor_estacion_destino_id);
                return (
                  <tr key={h.hor_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-900 text-sm">{h.hor_codigo_tren}</div>
                      <span className="inline-block text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded mt-0.5">
                        {h.hor_servicio_tipo}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      <div>{orig?.est_nombre || 'Origen'}</div>
                      <div className="text-slate-400 font-normal text-[11px]">➔ {dest?.est_nombre || 'Destino'}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      <div>{h.hor_hora_salida} ➔ {h.hor_hora_llegada}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {formatDurationMin(h.hor_duracion_min)}
                    </td>
                    <td className="p-4 font-bold text-red-700 text-sm">
                      {formatCurrencyPEN(h.hor_tarifa_regular_pen)}
                    </td>
                    <td className="p-4 text-slate-700 font-semibold">
                      {formatCurrencyUSD(h.hor_tarifa_turista_usd)}
                    </td>
                    <td className="p-4">
                      {h.hor_incluye_refrigerio ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                          <Coffee className="w-3 h-3" /> Incluido
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">No incluido</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(h)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Editar Frecuencia"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(h.hor_id, h.hor_codigo_tren)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Eliminar Frecuencia"
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                  PeruRail • Tarifario & Logística
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingId ? 'Editar Frecuencia de Tren' : 'Registrar Nueva Frecuencia de Tren'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Código */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código del Tren: *</label>
                  <input
                    type="text"
                    required
                    value={formData.hor_codigo_tren}
                    onChange={(e) => setFormData({ ...formData, hor_codigo_tren: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="Ej: EXP-61"
                  />
                </div>

                {/* Tipo de Servicio */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Servicio: *</label>
                  <select
                    value={formData.hor_servicio_tipo}
                    onChange={(e) => setFormData({ ...formData, hor_servicio_tipo: e.target.value as TipoServicioTren })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Expedition">Expedition</option>
                    <option value="Vistadome">Vistadome</option>
                    <option value="Vistadome Observatory">Vistadome Observatory</option>
                    <option value="Hiram Bingham">Hiram Bingham</option>
                    <option value="Tren Local">Tren Local</option>
                  </select>
                </div>

                {/* Estación Origen */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estación de Origen: *</label>
                  <select
                    value={formData.hor_estacion_origen_id}
                    onChange={(e) => setFormData({ ...formData, hor_estacion_origen_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {estaciones.map(e => (
                      <option key={e.est_id} value={e.est_id}>
                        {e.est_nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estación Destino */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estación de Destino: *</label>
                  <select
                    value={formData.hor_estacion_destino_id}
                    onChange={(e) => setFormData({ ...formData, hor_estacion_destino_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {estaciones.map(e => (
                      <option key={e.est_id} value={e.est_id}>
                        {e.est_nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Horas */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hora de Salida: *</label>
                  <input
                    type="time"
                    required
                    value={formData.hor_hora_salida}
                    onChange={(e) => setFormData({ ...formData, hor_hora_salida: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hora de Llegada: *</label>
                  <input
                    type="time"
                    required
                    value={formData.hor_hora_llegada}
                    onChange={(e) => setFormData({ ...formData, hor_hora_llegada: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {/* Duración */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duración (minutos): *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={formData.hor_duracion_min}
                    onChange={(e) => setFormData({ ...formData, hor_duracion_min: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {/* Asientos */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Asientos Disponibles:</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.hor_asientos_disponibles}
                    onChange={(e) => setFormData({ ...formData, hor_asientos_disponibles: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {/* Tarifas */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarifa Regular (S/ PEN): *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    step={1}
                    value={formData.hor_tarifa_regular_pen}
                    onChange={(e) => setFormData({ ...formData, hor_tarifa_regular_pen: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarifa Turista ($ USD): *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    step={1}
                    value={formData.hor_tarifa_turista_usd}
                    onChange={(e) => setFormData({ ...formData, hor_tarifa_turista_usd: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {/* Refrigerio toggle */}
                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="refrigerio"
                    checked={formData.hor_incluye_refrigerio}
                    onChange={(e) => setFormData({ ...formData, hor_incluye_refrigerio: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="refrigerio" className="font-bold text-slate-700 cursor-pointer">
                    Incluye servicio de refrigerio o snacks a bordo
                  </label>
                </div>
              </div>

              {/* Actions */}
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
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Guardar Cambios' : 'Crear Frecuencia'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
