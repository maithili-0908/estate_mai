import React, { useState } from "react";
import { FiX, FiUpload, FiCheck } from "react-icons/fi";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";

const AMENITY_LIST = [
  "Pool", "Gym", "Garage", "Garden", "Fireplace", "Terrace",
  "Smart Home", "Home Theater", "Wine Cellar", "Concierge",
  "Private Beach", "Spa", "Tennis Court", "Guest House",
];

export default function PropertyFormModal({ property, onClose }) {
  const { addProperty, updateProperty, user, filterOptions } = useApp();
  const isEdit = Boolean(property);
  const propertyTypes = (filterOptions?.propertyTypes || ["All", "House"]).filter((type) => type !== "All");
  const statusOptions = (filterOptions?.statusOptions || ["All", "For Sale", "For Rent", "Sold", "Pending"]).filter((status) => status !== "All");

  const [form, setForm] = useState({
    title: property?.title || "",
    address: property?.address || "",
    city: property?.city || "",
    state: property?.state || "",
    type: property?.type || "House",
    status: property?.status || "For Sale",
    price: property?.price || "",
    size: property?.size || "",
    bedrooms: property?.bedrooms || "",
    bathrooms: property?.bathrooms || "",
    garage: property?.garage || 0,
    yearBuilt: property?.yearBuilt || new Date().getFullYear(),
    description: property?.description || "",
    amenities: property?.amenities || [],
    lat: property?.lat || 40.7128,
    lng: property?.lng || -74.0060,
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (a) => set("amenities", form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]);

  const handleSubmit = async () => {
    setLoading(true);
    const priceLabel = Number(form.price) >= 1000000
      ? `$${(Number(form.price) / 1000000).toFixed(1)}M`
      : `$${Number(form.price).toLocaleString()}`;

    const data = {
      ...form,
      price: Number(form.price),
      priceLabel: form.status === "For Rent" ? `${priceLabel}/mo` : priceLabel,
      size: Number(form.size),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      garage: Number(form.garage),
      yearBuilt: Number(form.yearBuilt),
      agentId: user?.agentId || "a1",
      images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
      featured: false,
      tags: [],
    };

    try {
      if (isEdit) {
        await updateProperty(property.id, data);
        toast.success("Listing updated successfully");
      } else {
        await addProperty(data);
        toast.success("Listing added successfully");
      }

      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-card-hover border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-serif font-bold text-lg text-ink">{isEdit ? "Edit Listing" : "Add New Listing"}</h2>
            <p className="text-xs text-stone-400">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors"><FiX /></button>
        </div>

        {/* Progress */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          {["Basic Info", "Details", "Amenities"].map((s, i) => (
            <button key={s} onClick={() => setStep(i + 1)}
              className={`flex-1 py-3 text-xs font-semibold transition-all ${
                step === i + 1 ? "text-gold border-b-2 border-gold bg-white" :
                step > i + 1 ? "text-green-600" : "text-stone-400"
              }`}>
              {step > i + 1 ? <span className="inline-flex items-center gap-1"><FiCheck className="text-green-500" />{s}</span> : s}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Step 1 */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Property Title *</label>
                <input type="text" required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Modern Downtown Penthouse" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Type *</label>
                  <select value={form.type} onChange={(e) => set("type", e.target.value)} className="select-field">
                    {propertyTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Status *</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value)} className="select-field">
                    {statusOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Full Address *</label>
                <input type="text" required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main Street" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">City *</label>
                  <input type="text" required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="New York" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">State *</label>
                  <input type="text" required value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="NY" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  Price ({form.status === "For Rent" ? "monthly $" : "$"}) *
                </label>
                <input type="number" required value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 1500000" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Describe this property..." className="input-field resize-none" />
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Bedrooms *</label>
                  <input type="number" min={0} required value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Bathrooms *</label>
                  <input type="number" min={0} required value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Size (sq ft) *</label>
                  <input type="number" min={0} required value={form.size} onChange={(e) => set("size", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Garage Spaces</label>
                  <input type="number" min={0} value={form.garage} onChange={(e) => set("garage", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Year Built</label>
                  <input type="number" value={form.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)} className="input-field" />
                </div>
              </div>

              {/* Image upload placeholder */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Images</label>
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-gold/50 transition-colors cursor-pointer bg-stone-50">
                  <FiUpload className="text-2xl text-stone-400 mx-auto mb-2" />
                  <p className="text-sm text-stone-500 font-medium">Click to upload images</p>
                  <p className="text-xs text-stone-400 mt-1">PNG, JPG up to 10MB each (backend required)</p>
                </div>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Select Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITY_LIST.map((a) => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-sm transition-all ${
                      form.amenities.includes(a)
                        ? "bg-gold/10 border-gold/40 text-gold-700 font-medium"
                        : "border-stone-200 text-stone-600 hover:border-stone-300 bg-white"
                    }`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${form.amenities.includes(a) ? "bg-gold" : "bg-stone-200"}`}>
                      {form.amenities.includes(a) && <FiCheck className="text-ink text-[9px]" />}
                    </div>
                    {a}
                  </button>
                ))}
              </div>
              {form.amenities.length > 0 && (
                <p className="text-xs text-stone-400 mt-3">{form.amenities.length} amenities selected</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-stone-200 sticky bottom-0 bg-white">
          <button onClick={step > 1 ? () => setStep(s => s - 1) : onClose}
            className="btn-ghost border border-stone-200 rounded-xl">
            {step > 1 ? "<- Back" : "Cancel"}
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary">Continue -></button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-primary disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />Saving...</span>
              ) : isEdit ? "Save Changes" : "Add Listing"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
