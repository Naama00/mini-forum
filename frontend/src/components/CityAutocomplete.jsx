import { useMemo, useState } from "react";
import cities from "../utils/israeliCities";

export default function CityAutocomplete({ label, name, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const normalized = value.trim().toLowerCase();

  const filteredCities = useMemo(() => {
    if (!normalized) return cities;
    return cities.filter((city) => city.toLowerCase().includes(normalized));
  }, [normalized]);

  const suggestions = normalized ? filteredCities : filteredCities.slice(0, 15);

  return (
    <div className="relative">
      <label className="text-xs tracking-widest text-slate-400 mb-2 uppercase block">{label}</label>
      <input
        className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-sans text-sm outline-none rtl transition-colors focus:border-[#ccff00]/50 focus:bg-[#ccff00]/5 placeholder:text-slate-500 w-full"
        name={name}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#08101d]/95 shadow-2xl backdrop-blur-xl text-right rtl">
          {suggestions.map((city) => (
            <li
              key={city}
              className="cursor-pointer px-4 py-2 text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange({ target: { name, value: city } });
                setOpen(false);
              }}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
