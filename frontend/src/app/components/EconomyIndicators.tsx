"use client";

import { useState, useEffect } from "react";

interface ExchangeRate {
  usd_buy: number;
  usd_sell: number;
  eur_buy: number;
  eur_sell: number;
  date: string;
}

interface FuelPrice {
  gasoline_premium: number;
  gasoline_regular: number;
  diesel_optimum: number;
  diesel_regular: number;
  glp: number;
  gas_natural: number;
  date: string;
}

interface Props {
  initialRates: any;
  initialFuel: any;
}

export default function EconomyIndicators({ initialRates, initialFuel }: Props) {
  const [showHistory, setShowHistory] = useState<"none" | "usd" | "eur" | "fuel">("none");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async (type: "usd" | "eur" | "fuel") => {
    setIsLoading(true);
    const endpoint = type === "fuel" ? "/api/economy/fuel-prices/history" : "/api/economy/exchange-rate/history";
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      // Reverse to get chronological order for chart
      setHistoryData(data.reverse());
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (type: "usd" | "eur" | "fuel" | "none") => {
    if (type === "none" || showHistory === type) {
      setShowHistory("none");
    } else {
      setShowHistory(type);
      fetchHistory(type);
    }
  };

  const renderChart = (data: any[], keys: string[], colors: string[]) => {
    if (data.length < 2) return <div className="text-center py-10 text-muted-foreground italic text-xs uppercase tracking-widest font-bold">Datos históricos insuficientes para graficar</div>;

    const width = 400;
    const height = 150;
    const padding = 20;

    // Find min and max for all requested keys
    let allValues: number[] = [];
    data.forEach(d => keys.forEach(k => allValues.push(d[k])));
    const min = Math.min(...allValues) * 0.995;
    const max = Math.max(...allValues) * 1.005;

    const getX = (index: number) => (index / (data.length - 1)) * (width - padding * 2) + padding;
    const getY = (val: number) => height - ((val - min) / (max - min)) * (height - padding * 2) - padding;

    return (
      <div className="relative w-full h-[180px] mt-4 animate-in fade-in duration-500">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" strokeWidth="1" className="text-border/30" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeWidth="1" className="text-border/30" />

          {keys.map((key, idx) => {
            const points = data.map((d, i) => `${getX(i)},${getY(d[key])}`).join(" ");
            return (
              <g key={key}>
                <polyline
                  fill="none"
                  stroke={colors[idx]}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                  className="drop-shadow-sm"
                />
                {/* Area under curve */}
                <polyline
                  fill={colors[idx]}
                  fillOpacity="0.05"
                  points={`${getX(0)},${height - padding} ${points} ${getX(data.length - 1)},${height - padding}`}
                />
                {/* Last point pulse */}
                <circle cx={getX(data.length - 1)} cy={getY(data[data.length - 1][key])} r="3" fill={colors[idx]} className="animate-pulse" />
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between text-[8px] uppercase font-black text-muted-foreground mt-1 px-1 tracking-tighter">
          <span>{new Date(data[0].date).toLocaleDateString()}</span>
          <span>HISTÓRICO 30 DÍAS</span>
          <span>{new Date(data[data.length - 1].date).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Tasa de Cambio */}
      <div
        className={`bg-card border border-border rounded shadow-sm p-5 transition-all duration-300 hover:shadow-md cursor-pointer group ${showHistory !== 'none' && showHistory !== 'fuel' ? 'ring-2 ring-dr-blue/20' : ''}`}
        onClick={() => handleToggle(showHistory === 'usd' ? 'eur' : (showHistory === 'eur' ? 'none' : 'usd'))}
      >
        <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
          <h3 className="font-bold text-lg text-primary tracking-wide uppercase">TASA DE CAMBIO</h3>
          <div className="text-[10px] bg-dr-blue/10 text-dr-blue px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">
            {showHistory === 'usd' ? 'USD HIST' : (showHistory === 'eur' ? 'EUR HIST' : 'HISTORIAL DIARIO')}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`flex justify-between items-center p-2 rounded transition-colors ${showHistory === 'usd' ? 'bg-dr-blue/5' : 'group-hover:bg-muted/30'}`}>
            <div className="flex items-center gap-2">
              <span className={`font-bold transition-colors ${showHistory === 'usd' ? 'text-dr-blue' : 'text-foreground'}`}>USD</span>
              <span className="text-xs text-muted-foreground">Dólar</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Compra: <span className="font-bold text-foreground">RD$ {initialRates?.usd_buy?.toFixed(2) || "58.70"}</span></div>
              <div className="text-sm text-muted-foreground">Venta: <span className="font-bold text-dr-red">RD$ {initialRates?.usd_sell?.toFixed(2) || "59.20"}</span></div>
            </div>
          </div>

          {(showHistory === 'usd') && (
            isLoading ? <div className="h-[180px] flex items-center justify-center text-[10px] font-bold uppercase animate-pulse">Cargando histórico USD...</div> : renderChart(historyData, ["usd_buy", "usd_sell"], ["#1e3a8a", "#e11d48"])
          )}

          <hr className="border-border/50" />

          <div className={`flex justify-between items-center p-2 rounded transition-colors ${showHistory === 'eur' ? 'bg-dr-blue/5' : 'group-hover:bg-muted/30'}`}>
            <div className="flex items-center gap-2">
              <span className={`font-bold transition-colors ${showHistory === 'eur' ? 'text-dr-blue' : 'text-foreground'}`}>EUR</span>
              <span className="text-xs text-muted-foreground">Euro</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Compra: <span className="font-bold text-foreground">RD$ {initialRates?.eur_buy?.toFixed(2) || "63.40"}</span></div>
              <div className="text-sm text-muted-foreground">Venta: <span className="font-bold text-dr-red">RD$ {initialRates?.eur_sell?.toFixed(2) || "64.10"}</span></div>
            </div>
          </div>

          {(showHistory === 'eur') && (
            isLoading ? <div className="h-[180px] flex items-center justify-center text-[10px] font-bold uppercase animate-pulse">Cargando histórico EUR...</div> : renderChart(historyData, ["eur_buy", "eur_sell"], ["#1e3a8a", "#e11d48"])
          )}
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4 italic uppercase font-bold tracking-tighter">Fuente: Banco Central de la R.D.</p>
      </div>

      {/* Combustibles */}
      <div
        className={`bg-card border border-border rounded shadow-sm p-5 transition-all duration-300 hover:shadow-md cursor-pointer group ${showHistory === 'fuel' ? 'ring-2 ring-dr-red/20' : ''}`}
        onClick={() => handleToggle('fuel')}
      >
        <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
          <h3 className="font-bold text-lg text-primary tracking-wide uppercase">COMBUSTIBLES</h3>
          <div className="text-[10px] bg-dr-red/10 text-dr-red px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
            {showHistory === 'fuel' ? 'GRAFICO ACTIVO' : 'HISTORIAL SEMANAL'}
          </div>
        </div>

        <div className="space-y-3">
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between group-hover:px-1 transition-all">
              <span className="text-muted-foreground">Gasolina Premium</span>
              <span className="font-bold text-foreground">RD$ {initialFuel?.gasoline_premium?.toFixed(2) || "290.10"}</span>
            </li>
            <li className="flex justify-between group-hover:px-1 transition-all">
              <span className="text-muted-foreground">Gasolina Regular</span>
              <span className="font-bold text-foreground">RD$ {initialFuel?.gasoline_regular?.toFixed(2) || "272.50"}</span>
            </li>
            <li className="flex justify-between group-hover:px-1 transition-all">
              <span className="text-muted-foreground">Gasoil Óptimo</span>
              <span className="font-bold text-foreground">RD$ {initialFuel?.diesel_optimum?.toFixed(2) || "239.10"}</span>
            </li>
            <li className="flex justify-between group-hover:px-1 transition-all">
              <span className="text-muted-foreground">Gasoil Regular</span>
              <span className="font-bold text-foreground">RD$ {initialFuel?.diesel_regular?.toFixed(2) || "221.60"}</span>
            </li>
          </ul>

          {(showHistory === 'fuel') && (
            isLoading ? (
              <div className="h-[180px] flex items-center justify-center text-[10px] font-bold uppercase animate-pulse text-dr-red">Cargando histórico Combustibles...</div>
            ) : renderChart(historyData, ["gasoline_premium", "gasoline_regular"], ["#991b1b", "#dc2626"])
          )}

          <div className="space-y-3 text-sm">
            <li className="flex justify-between mt-2 pt-2 border-t border-border group-hover:px-1 transition-all list-none">
              <span className="text-muted-foreground">Gas Licuado (GLP)</span>
              <span className="font-bold text-foreground">RD$ {initialFuel?.glp?.toFixed(2) || "132.60"}</span>
            </li>
            <li className="flex justify-between group-hover:px-1 transition-all list-none">
              <span className="text-muted-foreground">Gas Natural Vehicular</span>
              <span className="font-bold text-foreground">RD$ {initialFuel?.gas_natural?.toFixed(2) || "43.90"}</span>
            </li>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4 italic uppercase font-bold tracking-tighter">Actualizado semanalmente (MICM)</p>
      </div>
    </div>
  );
}
