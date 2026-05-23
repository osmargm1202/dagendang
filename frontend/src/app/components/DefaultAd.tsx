type DefaultAdProps = {
  position: string;
  className?: string;
};

type DefaultAd = {
  business: string;
  logo?: string;
  services: string;
  phone: string;
  email: string;
  label: string;
};

const DEFAULT_ADS: Record<string, DefaultAd> = {
  header: {
    business: "ORGM",
    logo: "/ads/logos/orgm.png",
    services: "Diseño / Instalaciones Electromecánicas BT / MT / AT 0.12-138 kV",
    phone: "809-405-9420",
    email: "osmar@or-gm.com",
    label: "Publicidad",
  },
  home_middle: {
    business: "KERIMET INVESTMENT SRL",
    logo: "/ads/logos/kerimet.png",
    services: "Instalaciones de GLP, suministro de materiales y tuberías para sistemas de gas. Medidores de gas.",
    phone: "849-750-3480",
    email: "kerimetinvestmentsrl@gmail.com",
    label: "Publicidad",
  },
};

const GENERIC_AD: DefaultAd = {
  business: "Anúnciate aquí",
  services: "Tu negocio puede llegar a lectores de DAgendaNG.",
  phone: "829-988-3375",
  email: "",
  label: "Espacio disponible",
};

function getDefaultAd(position: string) {
  return DEFAULT_ADS[position] || GENERIC_AD;
}

export default function DefaultAd({ position, className = "" }: DefaultAdProps) {
  const ad = getDefaultAd(position);
  const isGeneric = ad === GENERIC_AD;

  return (
    <div
      className={`relative w-full min-h-20 overflow-hidden border border-border-light bg-surface-container-low text-[#001e40] dark:border-border-dark dark:bg-[#001e40] dark:text-white md:aspect-[728/90] ${className}`}
      aria-label={`${ad.label}: ${ad.business}`}
    >
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(0,30,64,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(0,30,64,.16)_1px,transparent_1px)] [background-size:120px_45px] dark:[background-image:linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)]" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[#001e40]/5 [clip-path:polygon(30%_0,100%_0,100%_100%,0_100%)] dark:bg-white/5" />

      <div className="relative z-10 flex h-full min-h-20 flex-col justify-center gap-2 p-4 md:flex-row md:items-center md:gap-4 md:px-7">
        {ad.logo && (
          <div className="h-16 w-32 shrink-0 overflow-hidden p-1 md:w-40">
            {/* eslint-disable-next-line @next/next/no-img-element -- fallback ad supports remote/static logos without Next image config friction. */}
            <img src={ad.logo} alt={`${ad.business} logo`} className="h-full w-full object-contain" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b6171e]">{ad.label}</div>
          <h3 className={`${isGeneric ? "font-sans text-xl uppercase tracking-[0.16em] md:text-2xl" : "font-sans text-2xl uppercase tracking-[0.12em] md:text-3xl"} font-black leading-tight text-[#001e40] dark:text-[#fff4da]`}>
            {ad.business}
          </h3>
          <p className="line-clamp-1 text-sm text-muted-foreground dark:text-slate-200 md:text-base">
            {ad.services}
          </p>
          {isGeneric && (
            <div className="mt-1">
              <p className="text-base font-bold text-[#001e40] dark:text-[#fff4da]">Tel. {ad.phone}</p>
              {ad.email && <p className="text-xs text-muted-foreground dark:text-slate-300">{ad.email}</p>}
            </div>
          )}
        </div>

        {!isGeneric && (
          <div className="min-w-[205px] text-left md:text-right">
            <p className="text-lg font-bold text-[#001e40] dark:text-[#fff4da]">Tel. {ad.phone}</p>
            {ad.email && <p className="text-xs text-muted-foreground dark:text-slate-300">{ad.email}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
