import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const [innerValue, setInnerValue] = useState(value);

  // Sync internal state with prop
  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  // Handle local change and trigger callback
  const handleChange = (e) => {
    const val = e.target.value;
    setInnerValue(val);
    onChange(val);
  };

  const handleClear = () => {
    setInnerValue('');
    onChange('');
  };

  return (
    <div className="search-bar">
      <Search className="search-bar__icon" size={18} />
      <input
        type="text"
        className="search-bar__input form-input"
        placeholder={placeholder}
        value={innerValue}
        onChange={handleChange}
      />
      {innerValue && (
        <button className="search-bar__clear" onClick={handleClear} type="button" title="Clear search">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
