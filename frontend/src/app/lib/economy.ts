const DIVISA_API_URL = "https://divisa.or-gm.com/";
const MICM_HOME_URL = "https://micm.gob.do/";
const FUEL_CSV_URL = "https://micm.gob.do/transparencias/datos-abiertos/precios-de-combustibles/precios-de-combustibles-2010-2026.csv";

export interface CurrencyRate {
  code: string;
  name: string;
  rate_dop: number;
  source_rate: number;
}

export interface ExchangeRatePayload {
  id: number;
  source: string;
  base_code: string;
  date: string;
  created_at: string;
  usd_buy: number;
  usd_sell: number;
  eur_buy: number;
  eur_sell: number;
  rates: CurrencyRate[];
}

export interface FuelPricePayload {
  id: number;
  source: string;
  date: string;
  created_at: string;
  gasoline_premium: number;
  gasoline_regular: number;
  diesel_optimum: number;
  diesel_regular: number;
  glp: number;
  gas_natural: number | null;
}

const CURRENCIES: Array<{ code: string; name: string }> = [
  { code: "USD", name: "Dólar estadounidense" },
  { code: "EUR", name: "Euro" },
  { code: "CAD", name: "Dólar canadiense" },
  { code: "GBP", name: "Libra esterlina" },
  { code: "MXN", name: "Peso mexicano" },
  { code: "JPY", name: "Yen japonés" },
  { code: "CNY", name: "Yuan chino" },
];

const MONTHS: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function parseNumber(value: string | undefined) {
  if (!value) return 0;
  const normalized = value.trim().replace(/,/g, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function csvSplit(line: string) {
  // MICM file is semicolon-separated and does not currently quote values.
  return line.split(";").map((part) => part.trim());
}

function rowDate(row: Record<string, string>) {
  const year = Number(row["AO"] || row["AÑO"] || row["ANO"]);
  const monthName = (row["MES"] || "").trim().toLowerCase();
  const day = Number(row["DIA DESDE"] || 1);
  const month = MONTHS[monthName] ?? 0;
  if (!Number.isFinite(year) || !Number.isFinite(day)) return todayIso();
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;|&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPriceNearLabel(text: string, labelPattern: RegExp) {
  const matches = Array.from(text.matchAll(/\$\s*([0-9]+(?:[.,][0-9]+)?)/g));
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const currentEnd = (match.index || 0) + match[0].length;
    const nextStart = matches[index + 1]?.index || text.length;
    const labelWindow = text.slice(currentEnd, nextStart);
    if (labelPattern.test(normalizeText(labelWindow))) return parseNumber(match[1]);
  }
  return 0;
}

function parseMicmHomeFuelPrices(html: string): FuelPricePayload | null {
  const text = stripHtml(html);
  const gasolinePremium = extractPriceNearLabel(text, /gasolina premium/);
  const gasolineRegular = extractPriceNearLabel(text, /gasolina regular/);
  const dieselOptimum = extractPriceNearLabel(text, /gasoil optimo/);
  const dieselRegular = extractPriceNearLabel(text, /gasoil regular/);
  const glp = extractPriceNearLabel(text, /gas licuado|glp/);
  const gasNatural = extractPriceNearLabel(text, /gas natural|gnl|gnc/);

  if (!gasolinePremium && !gasolineRegular && !dieselOptimum && !dieselRegular && !glp && !gasNatural) {
    return null;
  }

  const date = todayIso();
  return {
    id: 0,
    source: "MICM portada",
    date,
    created_at: new Date().toISOString(),
    gasoline_premium: gasolinePremium,
    gasoline_regular: gasolineRegular,
    diesel_optimum: dieselOptimum,
    diesel_regular: dieselRegular,
    glp,
    gas_natural: gasNatural || null,
  };
}

function toFuelPayload(row: Record<string, string>, index: number): FuelPricePayload {
  const date = rowDate(row);
  return {
    id: index,
    source: "MICM Datos Abiertos",
    date,
    created_at: `${date}T00:00:00.000Z`,
    gasoline_premium: parseNumber(row["GASOLINA PREMIUM"]),
    gasoline_regular: parseNumber(row["GASOLINA REGULAR"]),
    diesel_optimum: parseNumber(row["GASOIL OPTIMO"] || row["GASOIL OPTIMO "]),
    diesel_regular: parseNumber(row["GASOIL REGULAR"]),
    glp: parseNumber(row["GLP"] || row["GLP "]),
    gas_natural: null,
  };
}

async function scrapeMicmHomeFuelPrices() {
  const res = await fetch(MICM_HOME_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DAgendaNG/1.0; +https://dagendang.com)",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 60 * 60 },
  });
  if (!res.ok) throw new Error(`MICM home request failed: ${res.status}`);
  return parseMicmHomeFuelPrices(await res.text());
}

async function fetchFuelRows() {
  const res = await fetch(FUEL_CSV_URL, { next: { revalidate: 60 * 60 * 6 } });
  if (!res.ok) throw new Error(`MICM fuel request failed: ${res.status}`);

  const csv = await res.text();
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  const headers = csvSplit(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line, index) => {
    const values = csvSplit(line);
    const row: Record<string, string> = {};
    headers.forEach((header, headerIndex) => {
      row[header] = values[headerIndex] || "";
    });
    return toFuelPayload(row, index + 1);
  });
}

export async function getExchangeRateData(): Promise<ExchangeRatePayload | null> {
  try {
    const res = await fetch(DIVISA_API_URL, { next: { revalidate: 60 * 60 } });
    if (!res.ok) return null;

    const data = await res.json();
    const conversionRates = data?.conversion_rates as Record<string, number> | undefined;
    const dop = conversionRates?.DOP;
    if (!conversionRates || typeof dop !== "number") return null;

    const rates = CURRENCIES.map(({ code, name }) => {
      const sourceRate = conversionRates[code];
      const rateDop = code === "USD" ? dop : dop / sourceRate;
      return {
        code,
        name,
        rate_dop: Number(rateDop.toFixed(4)),
        source_rate: sourceRate,
      };
    }).filter((rate) => Number.isFinite(rate.rate_dop) && Number.isFinite(rate.source_rate));

    const date = typeof data.time_last_update_utc === "string"
      ? new Date(data.time_last_update_utc).toISOString().slice(0, 10)
      : todayIso();

    const usd = rates.find((rate) => rate.code === "USD")?.rate_dop || dop;
    const eur = rates.find((rate) => rate.code === "EUR")?.rate_dop || 0;

    return {
      id: 0,
      source: "divisa.or-gm.com",
      base_code: data.base_code || "USD",
      date,
      created_at: `${date}T00:00:00.000Z`,
      usd_buy: usd,
      usd_sell: usd,
      eur_buy: eur,
      eur_sell: eur,
      rates,
    };
  } catch (error) {
    console.error("Error fetching divisa.or-gm.com rates:", error);
    return null;
  }
}

export async function getExchangeRateHistory() {
  const latest = await getExchangeRateData();
  return latest ? [latest] : [];
}

export async function getFuelPriceData(): Promise<FuelPricePayload | null> {
  try {
    const scraped = await scrapeMicmHomeFuelPrices();
    if (scraped) return scraped;
  } catch (error) {
    console.error("Error scraping MICM home fuel prices:", error);
  }

  try {
    const rows = await fetchFuelRows();
    return rows.at(-1) || null;
  } catch (error) {
    console.error("Error fetching MICM fuel prices:", error);
    return null;
  }
}

export async function getFuelPriceHistory(days = 30) {
  try {
    const rows = await fetchFuelRows();
    return rows.slice(-days);
  } catch (error) {
    console.error("Error fetching MICM fuel history:", error);
    return [];
  }
}
