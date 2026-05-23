interface CurrencyRate {
  code: string;
  name: string;
  rate_dop: number;
}

interface ExchangeRate {
  source?: string;
  date: string;
  rates?: CurrencyRate[];
  usd_sell?: number;
  eur_sell?: number;
}

interface FuelPrice {
  gasoline_premium: number;
  gasoline_regular: number;
  diesel_optimum: number;
  diesel_regular: number;
  glp: number;
  gas_natural?: number | null;
  date: string;
  source?: string;
}

interface Props {
  initialRates: ExchangeRate | null;
  initialFuel: FuelPrice | null;
}

const FALLBACK_RATES: CurrencyRate[] = [
  { code: "USD", name: "Dólar", rate_dop: 58.7 },
  { code: "EUR", name: "Euro", rate_dop: 63.4 },
  { code: "CAD", name: "Dólar CAD", rate_dop: 42.6 },
  { code: "GBP", name: "Libra esterlina", rate_dop: 74.0 },
  { code: "MXN", name: "Peso mexicano", rate_dop: 3.4 },
  { code: "JPY", name: "Yen japonés", rate_dop: 0.37 },
  { code: "CNY", name: "Yuan chino", rate_dop: 8.1 },
];

function formatMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "RD$ --.--";
  return `RD$ ${value.toFixed(2)}`;
}

function ratesFromPayload(payload: ExchangeRate | null) {
  if (payload?.rates?.length) return payload.rates;

  return FALLBACK_RATES.map((rate) => {
    if (rate.code === "USD" && payload?.usd_sell) return { ...rate, rate_dop: payload.usd_sell };
    if (rate.code === "EUR" && payload?.eur_sell) return { ...rate, rate_dop: payload.eur_sell };
    return rate;
  });
}

function formatDate(value: string | undefined) {
  if (!value) return "actualización pendiente";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export default function EconomyIndicators({ initialRates, initialFuel }: Props) {
  const currencyRates = ratesFromPayload(initialRates);
  const fuelItems = [
    { label: "Gasolina Premium", value: initialFuel?.gasoline_premium },
    { label: "Gasolina Regular", value: initialFuel?.gasoline_regular },
    { label: "Gasoil Óptimo", value: initialFuel?.diesel_optimum },
    { label: "Gasoil Regular", value: initialFuel?.diesel_regular },
    { label: "Gas Licuado (GLP)", value: initialFuel?.glp },
    ...(typeof initialFuel?.gas_natural === "number" ? [{ label: "Gas Natural (GNL-GNC)", value: initialFuel.gas_natural }] : []),
  ];

  return (
    <div className="space-y-8">
      <section className="bg-card border border-border rounded shadow-sm p-5 transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
          <h3 className="font-bold text-lg text-primary tracking-wide uppercase">DIVISAS</h3>
          <div className="text-[10px] bg-dr-blue/10 text-dr-blue px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
            DOP
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {currencyRates.map((rate) => (
            <div key={rate.code} className="grid grid-cols-[56px_minmax(0,1fr)_104px] items-center gap-3 min-h-[56px] rounded border border-border/50 bg-muted/10 px-3 py-2">
              <span className="font-black text-foreground text-sm tracking-widest">{rate.code}</span>
              <span className="text-xs leading-tight text-muted-foreground min-h-[32px] flex items-center">{rate.name}</span>
              <span className="text-right font-black text-foreground tabular-nums text-sm">{formatMoney(rate.rate_dop)}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4 italic uppercase font-bold tracking-tighter">
          Fuente: {initialRates?.source || "divisa.or-gm.com"} · {formatDate(initialRates?.date)}
        </p>
      </section>

      <section className="bg-card border border-border rounded shadow-sm p-5 transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
          <h3 className="font-bold text-lg text-primary tracking-wide uppercase">COMBUSTIBLES</h3>
          <div className="text-[10px] bg-dr-red/10 text-dr-red px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
            MICM
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {fuelItems.map((item) => (
            <div key={item.label} className="grid grid-cols-[minmax(0,1fr)_104px] items-center gap-3 min-h-[56px] rounded border border-border/50 bg-muted/10 px-3 py-2">
              <span className="text-xs leading-tight text-muted-foreground min-h-[32px] flex items-center">{item.label}</span>
              <span className="text-right font-black text-foreground tabular-nums text-sm">{formatMoney(item.value)}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4 italic uppercase font-bold tracking-tighter">
          Fuente: {initialFuel?.source || "MICM"} · {formatDate(initialFuel?.date)}
        </p>
      </section>
    </div>
  );
}
