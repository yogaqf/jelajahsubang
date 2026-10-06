"use client";

import { useEffect, useState } from "react";
import {
  Bike,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Driver, ServiceArea } from "@/db/schema";
import { useAppAlert } from "@/components/ui/app-alert";

type DriverWithArea = Driver & { area?: ServiceArea | null };

export default function AdminDriversPage() {
  const { ask } = useAppAlert();
  const [drivers, setDrivers] = useState<DriverWithArea[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    areaId: "",
    name: "",
    phone: "",
    whatsapp: "",
    vehicleType: "Honda Vario 160",
    vehiclePlate: "T 1234 XX",
    commissionPercent: 80,
    notes: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadDrivers() {
    setLoading(true);
    try {
      const [res, areaRes] = await Promise.all([fetch("/api/sharelok/drivers"), fetch("/api/sharelok/areas")]);
      const [data, areaData] = await Promise.all([res.json(), areaRes.json()]);
      setDrivers(Array.isArray(data) ? data : []);
      setAreas(Array.isArray(areaData) ? areaData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  function handleOpenAdd() {
    setEditingId(null);
    setFormData({
      areaId: areas.find((area) => area.isActive)?.id || areas[0]?.id || "",
      name: "",
      phone: "",
      whatsapp: "",
      vehicleType: "Honda Beat",
      vehiclePlate: "T ",
      commissionPercent: 80,
      notes: "Standby area Subang Kota",
      isActive: true,
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(d: DriverWithArea) {
    setEditingId(d.id);
    setFormData({
      areaId: d.areaId || "",
      name: d.name,
      phone: d.phone,
      whatsapp: d.whatsapp || "",
      vehicleType: d.vehicleType || "",
      vehiclePlate: d.vehiclePlate || "",
      commissionPercent: d.commissionPercent,
      notes: d.notes || "",
      isActive: d.isActive,
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await fetch("/api/sharelok/drivers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
      } else {
        await fetch("/api/sharelok/drivers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      await loadDrivers();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!await ask("Data driver ini akan dihapus permanen.", { title: "Hapus driver?", tone: "danger", confirmLabel: "Ya, hapus" })) return;
    try {
      await fetch(`/api/sharelok/drivers?id=${id}`, { method: "DELETE" });
      await loadDrivers();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleActive(d: DriverWithArea) {
    try {
      await fetch("/api/sharelok/drivers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: d.id, isActive: !d.isActive }),
      });
      await loadDrivers();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
            Armada Driver & Kurir Pengantaran
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Kelola data kurir antar pesanan makanan ke rumah pelanggan di Subang.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDrivers}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" />
            Tambah Driver
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5">Nama Kurir</th>
                <th className="px-4 py-3.5">Kontak</th>
                <th className="px-4 py-3.5">Kendaraan & Plat</th>
                <th className="px-4 py-3.5">Komisi Ongkir</th>
                <th className="px-4 py-3.5">Area / Catatan</th>
                <th className="px-4 py-3.5">Status Siaga</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                    <Bike className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                    Belum ada data driver.
                  </td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 font-bold">
                          <Bike className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900">{d.name}</div>
                          <div className="text-[10px] text-zinc-400">ID: {d.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 space-y-1">
                      {d.whatsapp && (
                        <a
                          href={`https://wa.me/${d.whatsapp}`}
                          target="_blank"
                          className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium hover:underline"
                        >
                          <MessageCircle className="h-3 w-3" /> {d.whatsapp}
                        </a>
                      )}
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <Phone className="h-3 w-3" /> {d.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-800">{d.vehicleType || "Motor"}</div>
                      <div className="font-mono text-[11px] text-zinc-500">{d.vehiclePlate || "-"}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-emerald-700">{d.commissionPercent}%</div>
                      <div className="text-[10px] text-zinc-400">dari total ongkir</div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs text-zinc-500">
                      <div className="font-bold text-emerald-700">{d.area?.name || "Belum diatur"}</div><div className="mt-1 text-[10px]">{d.notes || "-"}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleActive(d)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                          d.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        }`}
                      >
                        {d.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Siaga (Aktif)
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-zinc-400" /> Off / Libur
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT DRIVER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">
                {editingId ? "Edit Driver" : "Tambah Driver Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div><label className="mb-1 block font-semibold text-zinc-700">Area operasional *</label><select required value={formData.areaId} onChange={(e) => setFormData({ ...formData, areaId: e.target.value })} className="w-full rounded-xl border border-zinc-300 p-2.5"><option value="">Pilih area</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}{area.isActive ? "" : " (belum tersedia)"}</option>)}</select></div>
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Nama Lengkap Driver *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kang Asep Kurniawan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    No. Telepon *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    No. WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="628123456789"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <label className="block font-semibold text-emerald-900 mb-1">
                  Persentase Komisi Ongkir Driver *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={formData.commissionPercent || ""}
                    onChange={(e) => setFormData({ ...formData, commissionPercent: Math.min(100, Math.max(0, Number(e.target.value))) })}
                    className="w-28 rounded-xl border border-emerald-300 bg-white p-2.5 text-xs font-bold text-zinc-800 focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="font-bold text-emerald-800">%</span>
                  <span className="text-[11px] leading-relaxed text-emerald-800">
                    Contoh: ongkir Rp10.000 × {formData.commissionPercent}% = {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(10000 * formData.commissionPercent / 100)} untuk driver.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Tipe Kendaraan
                  </label>
                  <input
                    type="text"
                    placeholder="Honda Vario 160"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Plat Nomor
                  </label>
                  <input
                    type="text"
                    placeholder="T 4521 WX"
                    value={formData.vehiclePlate}
                    onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Catatan / Area Siaga
                </label>
                <textarea
                  rows={2}
                  placeholder="Standby area Subang Kota & Ciater..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-zinc-700">Driver Siaga (Bisa Ditugaskan)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-zinc-600 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {editingId ? "Simpan Perubahan" : "Tambah Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
