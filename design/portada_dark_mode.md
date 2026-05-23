<!DOCTYPE html>

<html class="dark" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>DAgendaNG - De Agenda con Nelson Gómez</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Playfair+Display:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">tailwind.config = {darkMode: "class", theme: {extend: {colors: {"on-tertiary": "#ffffff", "primary-fixed": "#d5e3ff", "surface-container": "#f0edee", "inverse-surface": "#303031", background: "#fcf8f9", "tertiary-container": "#003268", "secondary-fixed-dim": "#ffb3ac", "on-primary-fixed-variant": "#1f477b", "on-secondary": "#ffffff", "on-error": "#ffffff", "error-container": "#ffdad6", "on-tertiary-fixed-variant": "#00468c", "surface-dim": "#dcd9da", "on-surface-variant": "#43474f", "tertiary-fixed": "#d6e3ff", tertiary: "#001d42", "tertiary-fixed-dim": "#a9c7ff", "secondary-fixed": "#ffdad6", "border-dark": "#2D3748", "dark-surface": "#161F2C", "surface-container-low": "#f6f3f4", "primary-container": "#003366", "primary-fixed-dim": "#a7c8ff", "inverse-primary": "#a7c8ff", "on-secondary-fixed-variant": "#930010", "on-secondary-fixed": "#410003", "on-tertiary-container": "#669cf1", "on-surface": "#1b1b1c", "on-background": "#1b1b1c", "border-light": "#E5E3E0", "surface-tint": "#3a5f94", "surface-bright": "#fcf8f9", "on-tertiary-fixed": "#001b3d", "on-primary-fixed": "#001b3c", "surface-variant": "#e5e2e3", "surface-container-lowest": "#ffffff", "ivory-bg": "#FCFBF9", "dark-bg": "#0B111B", "secondary-container": "#da3433", "surface-container-high": "#eae7e8", "surface-container-highest": "#e5e2e3", "on-primary-container": "#799dd6", surface: "#fcf8f9", "on-primary": "#ffffff", "inverse-on-surface": "#f3f0f1", secondary: "#b6171e", outline: "#737780", "on-secondary-container": "#fffbff", "outline-variant": "#c3c6d1", "on-error-container": "#93000a", error: "#ba1a1a", primary: "#001e40"}, borderRadius: {DEFAULT: "0.125rem", lg: "0.25rem", xl: "0.5rem", full: "0.75rem"}, spacing: {"margin-mobile": "20px", gutter: "24px", "stack-md": "16px", "section-padding": "64px", "margin-desktop": "40px", "container-max": "1280px", "stack-sm": "8px", "stack-lg": "32px"}, fontFamily: {"headline-lg-mobile": ["Playfair Display"], "label-md": ["Inter"], "label-sm": ["Inter"], "body-md": ["Inter"], "display-xl": ["Playfair Display"], "headline-lg": ["Playfair Display"], "headline-md": ["Playfair Display"], "headline-sm": ["Playfair Display"], "body-lg": ["Inter"], headline: ["Playfair Display"], display: ["Playfair Display"], body: ["Inter"], label: ["Inter"]}, fontSize: {"headline-lg-mobile": ["32px", {lineHeight: "40px", fontWeight: "700"}], "label-md": ["14px", {lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "600"}], "label-sm": ["12px", {lineHeight: "16px", fontWeight: "500"}], "body-md": ["16px", {lineHeight: "24px", fontWeight: "400"}], "display-xl": ["64px", {lineHeight: "72px", letterSpacing: "-0.02em", fontWeight: "700"}], "headline-lg": ["40px", {lineHeight: "48px", fontWeight: "700"}], "headline-md": ["28px", {lineHeight: "36px", fontWeight: "600"}], "headline-sm": ["20px", {lineHeight: "28px", fontWeight: "600"}], "body-lg": ["18px", {lineHeight: "30px", fontWeight: "400"}]}}}};</script>
<style>
        body { background-color: theme('colors.dark-bg'); color: theme('colors.on-tertiary'); }
        .border-layout { border-color: theme('colors.border-dark'); border-width: 1px; }
    </style>
</head>
<body class="antialiased min-h-screen flex flex-col font-body-md text-body-md bg-dark-bg text-on-tertiary">
<!-- TopNavBar -->
<header class="bg-background dark:bg-dark-bg text-primary dark:text-on-primary-fixed docked full-width top-0 sticky border-b border-outline-variant dark:border-dark-surface z-50 transition-colors duration-300">
<div class="flex flex-col items-center w-full px-margin-desktop max-w-container-max mx-auto py-4">
<div class="flex justify-between items-center w-full mb-4">
<a class="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary dark:text-primary-fixed" href="#">DAgendaNG</a>
<div class="flex gap-4">
<button aria-label="Toggle Dark Mode" class="hover:text-secondary dark:hover:text-secondary-fixed-dim transition-all duration-200" onclick="document.documentElement.classList.toggle('dark')">
<span class="material-symbols-outlined" data-icon="dark_mode">dark_mode</span>
</button>
<button aria-label="Search" class="hover:text-secondary dark:hover:text-secondary-fixed-dim transition-all duration-200">
<span class="material-symbols-outlined" data-icon="search">search</span>
</button>
</div>
</div>
<nav class="flex gap-6 overflow-x-auto w-full justify-center hide-scrollbar">
<a class="font-label-md text-label-md uppercase tracking-wider text-secondary dark:text-secondary-fixed-dim border-b-2 border-secondary dark:border-secondary-fixed-dim pb-1 opacity-80 scale-95 transition-transform hover:text-secondary dark:hover:text-secondary-fixed-dim transition-all duration-200" href="#">Inicio</a>
<a class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-on-primary-fixed transition-colors hover:text-secondary dark:hover:text-secondary-fixed-dim transition-all duration-200 pb-1" href="#">Economía</a>
<a class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-on-primary-fixed transition-colors hover:text-secondary dark:hover:text-secondary-fixed-dim transition-all duration-200 pb-1" href="#">Política</a>
<a class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-on-primary-fixed transition-colors hover:text-secondary dark:hover:text-secondary-fixed-dim transition-all duration-200 pb-1" href="#">Nacionales</a>
<a class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-on-primary-fixed transition-colors hover:text-secondary dark:hover:text-secondary-fixed-dim transition-all duration-200 pb-1" href="#">Internacionales</a>
<a class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-on-primary-fixed transition-colors hover:text-secondary dark:hover:text-secondary-fixed-dim transition-all duration-200 pb-1" href="#">Opinión</a>
</nav>
</div>
</header>
<!-- Ad Banner Top -->
<div class="w-full bg-dark-surface py-2 border-b border-border-dark flex justify-center items-center">
<div class="bg-inverse-surface text-on-surface-variant px-8 py-4 text-center border-layout w-full max-w-[728px] mx-auto">
<p class="font-label-sm text-label-sm uppercase tracking-wider mb-1">Publicidad</p>
<p class="font-headline-sm text-headline-sm text-white">Anúnciate aquí</p>
<p class="font-label-md text-label-md text-primary-fixed-dim mt-2">Llama al 809-XXX-XXXX</p>
</div>
</div>
<!-- Main Content Grid -->
<main class="flex-grow w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg grid grid-cols-1 md:grid-cols-12 gap-gutter">
<!-- Left Column: Reto Diario (2.5/12) -->
<aside class="md:col-span-3 lg:col-span-3 xl:col-span-2.5 flex flex-col gap-stack-lg border-r border-border-dark pr-gutter">
<div class="bg-dark-surface border-layout p-4 rounded-lg">
<div class="flex items-center gap-2 mb-4 pb-2 border-b border-border-dark">
<span class="material-symbols-outlined text-secondary" data-icon="extension">extension</span>
<h3 class="font-headline-sm text-headline-sm text-white">Reto Diario</h3>
</div>
<div class="space-y-4">
<img alt="Reto" class="w-full h-32 object-cover rounded" data-alt="A close up shot of a person playing a newspaper crossword puzzle with a pen in hand. The setting is a dimly lit room with dramatic shadows, creating an intellectual and focused mood. The aesthetic is modern and sophisticated, fitting a premium digital news platform in dark mode." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAolITZ29vP-1S_QcsL-NCGLrfyc_Ure7098R9muUUDSh9LkaSoglMDNaRp1PzdqKEVPxt2B7_loAP9jpVV30Mrz9Zcm70_Clo0kH-BBff3WBqxkpoNnQaSogMTtjeaQ8P8StKPoCyT13H8NyAlYCHONAmQxgDWp0cjIQms95EI21D3mlxRK4FMOI_sZiYG0YkTPeP9_Jr2lAeSC9fBUiENPW0WHE3bUcPoZAf5CNlSYNXAcuAJ0x2zG447gH2LNAmDrsOJNBSzUHsF"/>
<p class="font-body-md text-body-md text-surface-variant">¿Cuánto sabes sobre la actualidad política de esta semana? Pon a prueba tus conocimientos.</p>
<button class="w-full bg-primary text-white border border-primary font-label-md text-label-md py-2 rounded hover:bg-tertiary-container transition-colors">Jugar Ahora</button>
</div>
</div>
<!-- Mini Ad -->
<div class="border-layout p-4 text-center mt-4 bg-dark-surface">
<p class="font-label-sm text-label-sm text-outline-variant mb-2">Espacio Patrocinado</p>
<div class="w-full h-48 bg-dark-bg flex items-center justify-center border-layout">
<span class="text-surface-variant">300x250</span>
</div>
</div>
</aside>
<!-- Center Column: Main News (6.5/12) -->
<section class="md:col-span-6 lg:col-span-6 xl:col-span-7 flex flex-col gap-stack-lg px-2">
<!-- Lead Story -->
<article class="flex flex-col gap-4 border-b border-border-dark pb-stack-lg">
<div class="relative w-full h-[400px]">
<img alt="Lead Story" class="w-full h-full object-cover" data-alt="A wide angle photograph of a political debate stage illuminated by dramatic spotlights against a dark background. Two prominent figures are engaged in discussion. The mood is tense and serious, reflecting high stakes. The lighting is cinematic, enhancing the premium, authoritative editorial style of the news platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_r0rI3JrHyPx4fmEb7sw6RC6W1HCZIhZbXquuKAwXwTJ-uJJznKY6ajBoxOY65m7nQY0HV31FfkYs9sGIGVWhA9dfV63wnXWC2btb6aUX1hzbETR99VHQxZOJq35COS3-EWCDxdr31AsO23CIOLtr9EnWEG417AZjkxyy-ui2hUU9PLBjV2lpdOPHAcEl_8J4ZiJRmXqVnG2j3hR7UvMsZ9MswfYgyEfbrAIomoQszYU0pqwBettq6eO4sIzBVGK37lOQGDXNztoZ"/>
<div class="absolute bottom-4 left-4">
<span class="bg-secondary text-white font-label-sm text-label-sm uppercase px-2 py-1 rounded">Último Minuto</span>
</div>
</div>
<div>
<a class="font-label-md text-label-md text-primary-fixed-dim uppercase tracking-wider hover:underline" href="#">Política</a>
<h1 class="font-headline-lg text-headline-lg text-white mt-2 mb-4 leading-tight hover:text-surface-variant transition-colors cursor-pointer">El Senado aprueba reforma fiscal tras maratónica sesión de 14 horas</h1>
<p class="font-body-lg text-body-lg text-surface-variant mb-4">La nueva legislación impositiva superó su último obstáculo legislativo con 18 votos a favor y 14 en contra, marcando un cambio significativo en la política económica del gobierno.</p>
<div class="flex items-center gap-4 text-outline-variant font-label-sm text-label-sm">
<span class="">Por Juan Pérez</span>
<span class="">•</span>
<span class="">Hace 2 horas</span>
</div>
</div>
</article>
<!-- Secondary Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">
<!-- Story 1 -->
<article class="flex flex-col gap-3 border-b border-border-dark pb-4 md:border-b-0 md:border-r md:pr-4">
<img alt="Economy" class="w-full h-48 object-cover" data-alt="A stylized image of stock market graphs and charts glowing softly in red and green against a dark blue screen. The scene represents financial analysis and economic trends. The mood is analytical and modern. The lighting is low-key, focusing on the illuminated data points, aligning with the dark mode aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxH3ZSJDptnvlvM81Ayrz99tov_FoG7xk7lMAKxhwaoqnBcqYo6DPM-uOXd2XBtSrbZODTPBW0F-t56hbrCDo0c_bJ2MjTmrshItCLybk3ddt6_bXgPQxVzJKN0z-vcSW-lzggICRTuFy6GkGip2wW9udTkRFnbiFfMJM4Ld1UffnswHI8HM0e3Cy5pDERaLxYsE6n3RwzrXidTOBwWKdeWjeokhmxVKra0Cx8mQrxGtDx2ojZF-omBbCJ_ECRhIJ_dnALMH91i2p5"/>
<a class="font-label-sm text-label-sm text-on-tertiary-container uppercase tracking-wider" href="#">Economía</a>
<h2 class="font-headline-md text-headline-md text-white hover:text-surface-variant cursor-pointer">Mercados reaccionan con cautela ante anuncio del Banco Central</h2>
</article>
<!-- Story 2 -->
<article class="flex flex-col gap-3 pb-4">
<img alt="International" class="w-full h-48 object-cover" data-alt="A photograph of a busy international airport terminal seen through large glass windows at twilight. Silhouettes of travelers are visible against the deep blue sky. The mood is transient and global. The lighting relies on the contrast between the indoor terminal lights and the darkening exterior, fitting a sophisticated news context." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTu314_OHUmB66P9lq0VShDHg14tOhRU8bUsR6Qt3W-DwdiKpuRNdH49rI_1O0KHDr2sEfrgi9V_eKrcHPFr1TkOLJusvlavjNc-7nGb0Ld-bc7zlj6Iq8aMz0UBFGaUy--h02JiYdhpBsOJaP11LWBFE4dHe2dRGvpm0fLVWWMHYCt7T97et5YPpfypoUCB51PfhbOTkB_jyfJUMsIAQYOcfTaguitpmaow3H1w9kjG2hEvDtWTQ75d7zFW-qVlpcpyVkmDFmdTHq"/>
<a class="font-label-sm text-label-sm text-on-tertiary-container uppercase tracking-wider" href="#">Internacionales</a>
<h2 class="font-headline-md text-headline-md text-white hover:text-surface-variant cursor-pointer">Nueva coalición de gobierno asume el poder en el país vecino</h2>
</article>
</div>
</section>
<!-- Right Column: Editorial & Ads (3/12) -->
<aside class="md:col-span-3 lg:col-span-3 xl:col-span-2.5 flex flex-col gap-stack-lg border-l border-border-dark pl-gutter">
<!-- Columnista -->
<div class="bg-dark-surface border-layout p-5 relative overflow-hidden group">
<div class="absolute top-0 right-0 w-16 h-16 bg-tertiary-container opacity-20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
<div class="flex items-center gap-3 mb-4 pb-2 border-b border-border-dark">
<span class="material-symbols-outlined text-primary-fixed-dim" data-icon="edit_note">edit_note</span>
<h3 class="font-label-md text-label-md uppercase tracking-wider text-primary-fixed-dim">La Columna</h3>
</div>
<div class="flex items-center gap-4 mb-4">
<img alt="Tony D. Reyes" class="w-16 h-16 rounded-full object-cover border-2 border-border-dark grayscale" data-alt="A professional headshot portrait of an older gentleman with glasses, looking directly at the camera with a serious expression. The portrait is in black and white, adding an editorial and authoritative feel. The background is a stark, dark grey. The lighting is soft but defining, highlighting his features." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmW02l3C60dLNqQ4jnn_2d0F9kZe2Pw1ylIjQA5ZObyBgfxC11VbPOHTTwNZDRDxA5dW3I9-xDYzVV-zcCkk3yiFwX6poSLCmf0mkS-IMOoI07Qp8TIZwL9QyJfsrBOBRVg2ilSGqZmgER4wmmWY-UkwqwMU4bqtFPsvtTfnVvVFSJj_FAH_xsucwS7KKG0ASuQWfu3eEgfbpLkEsNkej6HPmSaDXgJfjpn5U_99UxnTrmNJrv1S6zkHfSr_YqQlwgS4SmEv45Ek8V"/>
<div>
<h4 class="font-headline-sm text-headline-sm text-white">Tony D. Reyes</h4>
<p class="font-label-sm text-label-sm text-outline-variant">De Agenda</p>
</div>
</div>
<h2 class="font-headline-md text-headline-md text-white italic mb-3 hover:text-primary-fixed-dim cursor-pointer">Los retos de la nueva legislación</h2>
<p class="font-body-md text-body-md text-surface-variant line-clamp-4">En medio del fragor del debate legislativo, pocos se han detenido a analizar las implicaciones a largo plazo de las medidas aprobadas anoche. Es imperativo mirar más allá de la coyuntura política inmediata.</p>
<a class="inline-block mt-4 text-primary-fixed-dim font-label-md text-label-md hover:underline" href="#">Leer artículo completo →</a>
</div>
<!-- Ad List -->
<div class="flex flex-col gap-4">
<div class="border-layout h-[250px] flex flex-col items-center justify-center p-4 text-center bg-dark-surface">
<span class="material-symbols-outlined text-outline-variant mb-2 text-4xl" data-icon="campaign">campaign</span>
<p class="font-label-md text-label-md text-white mb-1">Espacio Publicitario</p>
<p class="font-label-sm text-label-sm text-surface-variant">Contáctanos: publicidad@dagendang.com</p>
</div>
<div class="border-layout h-[250px] flex flex-col items-center justify-center p-4 text-center bg-dark-surface">
<span class="material-symbols-outlined text-outline-variant mb-2 text-4xl" data-icon="shopping_bag">shopping_bag</span>
<p class="font-label-md text-label-md text-white mb-1">Tu marca aquí</p>
<p class="font-label-sm text-label-sm text-surface-variant">Llama al 809-XXX-XXXX</p>
</div>
</div>
</aside>
</main>
<!-- Footer -->
<footer class="bg-surface-container-highest dark:bg-dark-surface text-primary dark:text-primary-fixed full-width mt-stack-lg border-t border-outline-variant dark:border-dark-surface">
<div class="flex flex-col md:flex-row justify-between items-center w-full py-stack-lg px-margin-desktop max-w-container-max mx-auto">
<div class="mb-4 md:mb-0 text-center md:text-left">
<h2 class="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed mb-2">DAgendaNG</h2>
<p class="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant">© 2024 DAgendaNG - De Agenda con Nelson Gómez. Todos los derechos reservados.</p>
</div>
<nav class="flex gap-4">
<a class="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors" href="#">Privacidad</a>
<a class="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors" href="#">Términos de Uso</a>
<a class="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors" href="#">Publicidad</a>
<a class="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors" href="#">Contacto</a>
</nav>
</div>
</footer>
</body></html>
