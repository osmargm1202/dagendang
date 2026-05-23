<!DOCTYPE html>

<html class="light" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>DAgendaNG - Diario Digital</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">tailwind.config = {darkMode: "class", theme: {extend: {colors: {"on-tertiary": "#ffffff", "primary-fixed": "#d5e3ff", "surface-container": "#f0edee", "inverse-surface": "#303031", background: "#fcf8f9", "tertiary-container": "#003268", "secondary-fixed-dim": "#ffb3ac", "on-primary-fixed-variant": "#1f477b", "on-secondary": "#ffffff", "on-error": "#ffffff", "error-container": "#ffdad6", "on-tertiary-fixed-variant": "#00468c", "surface-dim": "#dcd9da", "on-surface-variant": "#43474f", "tertiary-fixed": "#d6e3ff", tertiary: "#001d42", "tertiary-fixed-dim": "#a9c7ff", "secondary-fixed": "#ffdad6", "border-dark": "#2D3748", "dark-surface": "#161F2C", "surface-container-low": "#f6f3f4", "primary-container": "#003366", "primary-fixed-dim": "#a7c8ff", "inverse-primary": "#a7c8ff", "on-secondary-fixed-variant": "#930010", "on-secondary-fixed": "#410003", "on-tertiary-container": "#669cf1", "on-surface": "#1b1b1c", "on-background": "#1b1b1c", "border-light": "#E5E3E0", "surface-tint": "#3a5f94", "surface-bright": "#fcf8f9", "on-tertiary-fixed": "#001b3d", "on-primary-fixed": "#001b3c", "surface-variant": "#e5e2e3", "surface-container-lowest": "#ffffff", "ivory-bg": "#FCFBF9", "dark-bg": "#0B111B", "secondary-container": "#da3433", "surface-container-high": "#eae7e8", "surface-container-highest": "#e5e2e3", "on-primary-container": "#799dd6", surface: "#fcf8f9", "on-primary": "#ffffff", "inverse-on-surface": "#f3f0f1", secondary: "#b6171e", outline: "#737780", "on-secondary-container": "#fffbff", "outline-variant": "#c3c6d1", "on-error-container": "#93000a", error: "#ba1a1a", primary: "#001e40"}, borderRadius: {DEFAULT: "0.125rem", lg: "0.25rem", xl: "0.5rem", full: "0.75rem"}, spacing: {"margin-mobile": "20px", gutter: "24px", "stack-md": "16px", "section-padding": "64px", "margin-desktop": "40px", "container-max": "1280px", "stack-sm": "8px", "stack-lg": "32px"}, fontFamily: {"headline-lg-mobile": ["Playfair Display"], "label-md": ["Inter"], "label-sm": ["Inter"], "body-md": ["Inter"], "display-xl": ["Playfair Display"], "headline-lg": ["Playfair Display"], "headline-md": ["Playfair Display"], "headline-sm": ["Playfair Display"], "body-lg": ["Inter"], headline: ["Playfair Display"], display: ["Playfair Display"], body: ["Inter"], label: ["Inter"]}, fontSize: {"headline-lg-mobile": ["32px", {lineHeight: "40px", fontWeight: "700"}], "label-md": ["14px", {lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "600"}], "label-sm": ["12px", {lineHeight: "16px", fontWeight: "500"}], "body-md": ["16px", {lineHeight: "24px", fontWeight: "400"}], "display-xl": ["64px", {lineHeight: "72px", letterSpacing: "-0.02em", fontWeight: "700"}], "headline-lg": ["40px", {lineHeight: "48px", fontWeight: "700"}], "headline-md": ["28px", {lineHeight: "36px", fontWeight: "600"}], "headline-sm": ["20px", {lineHeight: "28px", fontWeight: "600"}], "body-lg": ["18px", {lineHeight: "30px", fontWeight: "400"}]}}}};</script>
<style>
        body {
            background-color: theme('colors.ivory-bg');
            color: theme('colors.on-background');
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        /* Custom Reveal Animations */
        @keyframes slideUpFade {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .reveal-on-load {
            opacity: 0;
        }

        @media (prefers-reduced-motion: no-preference) {
            .reveal-on-load {
                animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .delay-100 { animation-delay: 100ms; }
            .delay-200 { animation-delay: 200ms; }
            .delay-300 { animation-delay: 300ms; }
        }

        @media (prefers-reduced-motion: reduce) {
            .reveal-on-load {
                opacity: 1;
                animation: none;
            }
        }
    </style>
</head>
<body class="antialiased min-h-screen flex flex-col font-body-md text-body-md">
<!-- TopNavBar -->
<header class="bg-background dark:bg-dark-bg docked full-width top-0 sticky z-50 border-b border-outline-variant dark:border-dark-surface flat no shadows">
<div class="flex flex-col items-center w-full px-margin-desktop max-w-container-max mx-auto py-stack-md">
<!-- Top bar with Logo and Actions -->
<div class="flex w-full justify-between items-center mb-stack-md">
<div class="flex items-center space-x-4">
<button class="md:hidden text-primary">
<span class="material-symbols-outlined text-2xl">menu</span>
</button>
<!-- Date -->
<span class="hidden md:block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Martes, 24 de Octubre 2023
                    </span>
</div>
<!-- Brand Logo -->
<a class="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary dark:text-primary-fixed" href="#">
                    DAgendaNG
                </a>
<!-- Actions -->
<div class="flex items-center space-x-gutter">
<button aria-label="Toggle Dark Mode" class="text-primary hover:text-secondary transition-all duration-300 hover:scale-110">
<span class="material-symbols-outlined" data-icon="dark_mode">dark_mode</span>
</button>
<button aria-label="Search" class="text-primary hover:text-secondary transition-all duration-300 hover:scale-110">
<span class="material-symbols-outlined" data-icon="search">search</span>
</button>
<button class="hidden md:flex items-center justify-center bg-primary text-on-primary px-4 py-2 rounded font-label-md text-label-md uppercase tracking-wider hover:bg-tertiary-container hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 transition-all duration-300">
                        Suscribirse
                    </button>
</div>
</div>
<!-- Navigation Links -->
<nav class="hidden md:flex w-full justify-center space-x-gutter border-t border-outline-variant pt-stack-sm">
<a class="relative text-secondary dark:text-secondary-fixed-dim pb-1 font-label-md text-label-md uppercase tracking-wider transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-secondary dark:after:bg-secondary-fixed-dim" href="#">Inicio</a>
<a class="relative text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-on-primary-fixed pb-1 font-label-md text-label-md uppercase tracking-wider transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary dark:after:bg-on-primary-fixed after:transition-all after:duration-300 hover:after:w-full" href="#">Economía</a>
<a class="relative text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-on-primary-fixed pb-1 font-label-md text-label-md uppercase tracking-wider transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary dark:after:bg-on-primary-fixed after:transition-all after:duration-300 hover:after:w-full" href="#">Política</a>
<a class="relative text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-on-primary-fixed pb-1 font-label-md text-label-md uppercase tracking-wider transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary dark:after:bg-on-primary-fixed after:transition-all after:duration-300 hover:after:w-full" href="#">Nacionales</a>
<a class="relative text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-on-primary-fixed pb-1 font-label-md text-label-md uppercase tracking-wider transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary dark:after:bg-on-primary-fixed after:transition-all after:duration-300 hover:after:w-full" href="#">Internacionales</a>
<a class="relative text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-on-primary-fixed pb-1 font-label-md text-label-md uppercase tracking-wider transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary dark:after:bg-on-primary-fixed after:transition-all after:duration-300 hover:after:w-full" href="#">Opinión</a>
</nav>
</div>
</header>
<!-- Top Banner Ad -->
<div class="w-full bg-surface-container-low border-b border-border-light py-stack-sm flex justify-center items-center h-24">
<div class="text-center">
<span class="font-label-sm text-label-sm text-outline block mb-1">Publicidad</span>
<div class="w-[728px] h-[90px] bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-md text-label-md border border-outline-variant border-dashed">
                Anúnciate aquí | Contacto: (809) 555-0100
            </div>
</div>
</div>
<main class="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-padding">
<!-- Main Grid Layout -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-gutter">
<!-- Left Column: Reto Diario (2.5/12 approx -> 3 cols for tailwind simplicity) -->
<aside class="col-span-1 md:col-span-3 space-y-section-padding">
<!-- Interactive Card -->
<div class="bg-surface border border-border-light rounded-lg p-stack-lg flex flex-col items-center text-center">
<span class="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-stack-sm animate-pulse">Reto Diario</span>
<h3 class="font-headline-sm text-headline-sm text-primary mb-stack-md">¿Cuánto sabes de economía dominicana?</h3>
<p class="font-body-md text-body-md text-on-surface-variant mb-stack-lg">¡Participa en nuestra trivia diaria y gana premios exclusivos para suscriptores!</p>
<button class="w-full bg-secondary text-on-secondary py-3 px-6 rounded font-label-md text-label-md uppercase tracking-wider hover:bg-secondary-container hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 transition-all duration-300">
                        PARTICIPAR
                    </button>
</div>
<!-- Trending / Latest Small list -->
<div>
<h4 class="font-headline-sm text-headline-sm text-primary border-b border-border-light pb-stack-sm mb-stack-md">Último Minuto</h4>
<ul class="space-y-stack-md">
<li class="border-b border-border-light pb-stack-md">
<span class="font-label-sm text-label-sm text-secondary block mb-1">10:45 AM</span>
<a class="font-body-md text-body-md text-primary hover:text-secondary transition-colors font-medium" href="#">Banco Central mantiene tasa de política monetaria en 7.50%</a>
</li>
<li class="border-b border-border-light pb-stack-md">
<span class="font-label-sm text-label-sm text-secondary block mb-1">09:30 AM</span>
<a class="font-body-md text-body-md text-primary hover:text-secondary transition-colors font-medium" href="#">Avanzan negociaciones para tratado de libre comercio regional</a>
</li>
<li class="border-b border-border-light pb-stack-md">
<span class="font-label-sm text-label-sm text-secondary block mb-1">08:15 AM</span>
<a class="font-body-md text-body-md text-primary hover:text-secondary transition-colors font-medium" href="#">Sector turismo reporta crecimiento récord en el primer trimestre</a>
</li>
</ul>
</div>
</aside>
<!-- Center Column: Main News (6.5/12 approx -> 6 cols) -->
<section class="col-span-1 md:col-span-6 border-l border-r border-border-light px-gutter">
<!-- Lead Story -->
<article class="mb-section-padding reveal-on-load group cursor-pointer transition-all duration-500 hover:-translate-y-1">
<div class="overflow-hidden mb-stack-md">
<img alt="Lead story image" class="w-full aspect-[16/9] object-cover bg-surface-variant transition-transform duration-700 ease-out group-hover:scale-[1.03]" data-alt="A sweeping, high-contrast editorial photograph of a modern solar farm at sunrise. The image captures rows of gleaming solar panels stretching into the distance, reflecting the golden light of the early morning sun. The sky above is a crisp, clear blue, contrasting with the dark metallic structures. The composition is structured and architectural, embodying a premium, serious journalistic tone appropriate for a broadsheet discussing national energy policy." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsiurleza5TDBCICVDDzB3byYzSnmXxW-F-ESc_AfEHYNLYhsK7K0wR6tkqy4b4mZuXRquUxXRaPBGnp3JPWmuF3j-MSC2BXvqRId8ubTNvT5UJYr7sphUTOzqE5_sSUhUwadEDs7w_qay0U4f2i5NWzpkO_3ucD5a4QmBtIh9NzccaU58p0iXR9hheVtuqPmuqv2ec4iwJ_wEejLWdVD8n_Y9fiNneb9lZcgaUKxolr4S0fa1RW8bwTZLm6Q627HMbl4dNnDdaM1f"/>
</div>
<div class="flex items-center space-x-2 mb-stack-sm">
<span class="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Nacionales</span>
<span class="text-outline-variant">•</span>
<span class="font-label-sm text-label-sm text-outline">Hace 2 horas</span>
</div>
<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-stack-md leading-tight group-hover:text-secondary transition-colors duration-300">
                        Gobierno anuncia ambicioso plan de transición energética para 2030
                    </h1>
<p class="font-body-lg text-body-lg text-on-surface-variant mb-stack-md">
                        El nuevo proyecto busca reducir la dependencia de combustibles fósiles en un 40% durante la próxima década, impulsando inversiones multimillonarias en energía solar y eólica a lo largo del territorio nacional, con el objetivo de estabilizar la red y reducir los costos a largo plazo.
                    </p>
<div class="flex items-center space-x-3">
<div class="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-label-md text-label-md text-primary">
                            RM
                        </div>
<span class="font-label-sm text-label-sm text-on-surface font-medium">Por Roberto Mateo</span>
</div>
</article>
<!-- Secondary News Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter border-t border-border-light pt-section-padding">
<!-- Article 1 -->
<article class="reveal-on-load delay-100 group cursor-pointer transition-all duration-500 hover:-translate-y-1">
<div class="overflow-hidden mb-stack-sm">
<img alt="Economy news" class="w-full aspect-video object-cover bg-surface-variant transition-transform duration-700 ease-out group-hover:scale-[1.03]" data-alt="A close-up, sharp macro photograph of international currency notes and a rising financial chart on a digital screen. The lighting is moody and focused, highlighting the texture of the paper money and the glowing red and green lines of the graph. The aesthetic is clean and analytical, fitting a serious economic report for a high-end digital newspaper." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS3dKYUkl_NDDUwou28UBi8ZTvcjVED8Of2UY6gxYpYnXhWPCqO1ANOUwS4R8xyaDhREL9tjAHYMOJIzzeBVz6-_dFswkSH-QleoTLbrEEyQrdZrA5kClzGipceGRnI-6Z93_ruoihjwK5PGh8YJxovUQbc9DB1Dofb5FU1SPrVY7IhwaW4LeH-sJIWPlfomvqyvZhk5FJ2TZAI894h4zAeBnWJHHfofl2lCpSJzTnBZgK0rjRYOmfpGFkNQqFy8EryzERIMeirRdV"/>
</div>
<span class="font-label-sm text-label-sm text-primary uppercase tracking-widest block mb-1">Economía</span>
<h3 class="font-headline-sm text-headline-sm text-primary mb-2 group-hover:text-secondary transition-colors duration-300">
                            Inflación muestra signos de desaceleración en el último trimestre
                        </h3>
<p class="font-body-md text-body-md text-on-surface-variant line-clamp-3">Los precios de los productos de la canasta básica se estabilizan tras meses de volatilidad impulsada por factores externos.</p>
</article>
<!-- Article 2 -->
<article class="reveal-on-load delay-200 group cursor-pointer transition-all duration-500 hover:-translate-y-1">
<div class="overflow-hidden mb-stack-sm">
<img alt="Politics news" class="w-full aspect-video object-cover bg-surface-variant transition-transform duration-700 ease-out group-hover:scale-[1.03]" data-alt="A wide, formal shot of the exterior of a stately, neoclassical government building with large stone columns. The building is captured in neutral, overcast daylight, giving it an imposing, objective presence. The composition is strictly symmetrical, emphasizing authority and institutional weight, suitable for a serious political news section." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAv5c96GNS2Ro5TWcWHYA7dU5CxHEc-5y3xeYN2ZSDH3LG67maP41HhAWub89ImL6A14isy9-8HtiiVb8g8AyDeJlcWBzBOuTIyrr-3bydqBg0bQivdl0C9ldPZC-THtyOe3cj7796BChGoHbIUVvLyFgHmTWdDF1aN6Q6VZFfK_hSgVAeW7jfFbkhpxjQVLXPsnXr3R5ERimxMGKu4HXf6H96IjBAhRlJIVEmDcWskOLfAncoiXqfgFa0UNmD2wSnFhP1QD-1okLd_"/>
</div>
<span class="font-label-sm text-label-sm text-primary uppercase tracking-widest block mb-1">Política</span>
<h3 class="font-headline-sm text-headline-sm text-primary mb-2 group-hover:text-secondary transition-colors duration-300">
                            Congreso aprueba nueva ley de ordenamiento territorial
                        </h3>
<p class="font-body-md text-body-md text-on-surface-variant line-clamp-3">La legislación busca regular el crecimiento urbano y proteger zonas de alto valor agrícola tras intensos debates legislativos.</p>
</article>
</div>
</section>
<!-- Right Column: Editorial & Ads (3/12 approx -> 3 cols) -->
<aside class="col-span-1 md:col-span-3 space-y-section-padding reveal-on-load delay-300">
<!-- Editorial Column -->
<div class="bg-surface-container-low border border-border-light p-stack-lg">
<div class="flex items-center justify-between mb-stack-md border-b border-border-light pb-stack-sm">
<h4 class="font-headline-sm text-headline-sm text-primary">La Columna</h4>
<span class="material-symbols-outlined text-secondary" data-icon="edit_note">edit_note</span>
</div>
<div class="flex items-center space-x-4 mb-stack-md">
<img alt="Tony D. Reyes" class="w-16 h-16 rounded-full object-cover grayscale" data-alt="A classic, high-contrast black and white portrait of a mature male columnist in a tailored suit. He looks directly at the camera with a serious, intellectual expression. The lighting is dramatic, characteristic of premium editorial portraiture, highlighting the lines of experience on his face. The background is completely dark, ensuring the focus remains on the subject." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_cDxwc5ktXKzGJTp-IL4WtWmqurQPpYyNXJ09C9ZkW8RWuQVLhqKAIUz8lI_Iy3prj_0DspZNcrEAC-r3vhLB5KzZqp2xW0dAkzQLGDyOv5no0Mks_1397gnnDREmWjnGtylHRH4b_g9aKH2UI2NwEXGZY5cZwMic1dwWf-lhffS7jw9s1S6WoXKCJPI85XgEB292ZEdJTxMOGGuUBVcqBrgablxe3GuuYsl8iG3zTTSvCg3OHXdtyywArfMW3UlLGLzLVCkVQ8pk"/>
<div>
<span class="font-label-md text-label-md text-primary font-bold block">Tony D. Reyes</span>
<span class="font-label-sm text-label-sm text-outline block">Editor en Jefe</span>
</div>
</div>
<h3 class="font-headline-md text-headline-md text-primary mb-stack-sm italic">
                        El verdadero costo de la energía
                    </h3>
<p class="font-body-md text-body-md text-on-surface-variant mb-stack-md">
                        Las promesas de hoy deben medirse contra la capacidad real de ejecución de mañana. El anuncio gubernamental suena bien en papel, pero la historia nos ha enseñado a ser escépticos ante planes a tan largo plazo...
                    </p>
<a class="font-label-md text-label-md text-secondary hover:text-primary transition-colors flex items-center group" href="#">
                        Leer artículo completo <span class="material-symbols-outlined ml-1 text-sm transform transition-transform group-hover:translate-x-1" data-icon="arrow_forward">arrow_forward</span>
</a>
</div>
<!-- Sidebar Ad -->
<div class="w-full bg-surface-container-low border border-outline-variant border-dashed p-4 flex flex-col items-center justify-center text-center min-h-[300px]">
<span class="font-label-sm text-label-sm text-outline block mb-2">Publicidad</span>
<span class="font-label-md text-label-md text-on-surface-variant">
                        Espacio Publicitario Disponible<br/><br/>
                        Contáctenos al:<br/>
                        (809) 555-0100
                    </span>
</div>
</aside>
</div>
</main>
<!-- Footer -->
<footer class="bg-surface-container-highest dark:bg-dark-surface full-width mt-stack-lg border-t border-outline-variant dark:border-dark-surface flat no shadows">
<div class="flex flex-col md:flex-row justify-between items-center w-full py-stack-lg px-margin-desktop max-w-container-max mx-auto">
<div class="mb-stack-md md:mb-0 text-center md:text-left">
<a class="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed block mb-2" href="#">
                    DAgendaNG
                </a>
<p class="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant">
                    © 2024 DAgendaNG - De Agenda con Nelson Gómez. Todos los derechos reservados.
                </p>
</div>
<nav class="flex flex-wrap justify-center gap-gutter">
<a class="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors" href="#">Privacidad</a>
<a class="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors" href="#">Términos de Uso</a>
<a class="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors" href="#">Publicidad</a>
<a class="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors" href="#">Contacto</a>
</nav>
</div>
</footer>
</body></html>
