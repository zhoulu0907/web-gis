import { useState, useRef, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useSensorStore } from '../store/sensorStore';

/**
 * 搜索定位组件
 * 顶部居中，Toolbar 下方（top-16）
 * 模糊匹配站名，选中后 flyTo + 弹出 Popup
 */
export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stations = useSensorStore((s) => s.stations);
  const openStationPopup = useSensorStore((s) => s.openStationPopup);

  const results = useMemo(() => {
    if (!query.trim() || !stations) return [];
    const q = query.trim().toLowerCase();
    return stations.features
      .filter((f) => {
        const name = ((f.properties as Record<string, unknown>).name as string).toLowerCase();
        return name.includes(q);
      })
      .slice(0, 8)
      .map((f) => ({
        id: f.id as number,
        name: (f.properties as Record<string, unknown>).name as string,
      }));
  }, [query, stations]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (stationId: number) => {
    setQuery('');
    setOpen(false);
    openStationPopup?.(stationId);
  };

  return (
    <div ref={containerRef} className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-64">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78909c]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query.trim()) setOpen(true); }}
          placeholder="搜索站点..."
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[rgba(0,160,233,0.3)] bg-[rgba(0,21,41,0.8)] text-[#e2e8f0] placeholder-[#78909c] backdrop-blur-md focus:outline-none focus:border-[rgba(0,160,233,0.6)]"
        />
      </div>
      {open && results.length > 0 && (
        <div className="mt-1 rounded border border-[rgba(0,160,233,0.3)] bg-[rgba(0,21,41,0.9)] backdrop-blur-md overflow-hidden">
          {results.map((r) => (
            <button
              key={r.id}
              className="w-full text-left px-3 py-2 text-xs text-[#e2e8f0] hover:bg-[rgba(0,160,233,0.15)] transition-colors"
              onClick={() => handleSelect(r.id)}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
