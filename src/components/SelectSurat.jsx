// components/SelectSurat.jsx
import React from "react";

const SelectSurat = ({ suratList, onChange, value }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
    >
      <option value="">Pilih Surat</option>
      {suratList.map((item) => (
        <option key={item.number} value={item.number}>
          {item.number}. {item.name_latin} ({item.name})
        </option>
      ))}
    </select>
  );
};

export default SelectSurat;