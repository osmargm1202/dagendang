--
-- PostgreSQL database dump
--

\restrict NUEl61Rdvg6cvryR9ag9hhdZ4jag7AEwGokO4pJcKNuf0IFbTHMSxt7dDyf0nTm

-- Dumped from database version 15.17
-- Dumped by pg_dump version 17.8 (Debian 17.8-0+deb13u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: articletype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.articletype AS ENUM (
    'opinion',
    'editorial',
    'mercados',
    'finanzas',
    'empresas',
    'nacional',
    'economia'
);


ALTER TYPE public.articletype OWNER TO postgres;

--
-- Name: newssourcetype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.newssourcetype AS ENUM (
    'rss',
    'atom',
    'web'
);


ALTER TYPE public.newssourcetype OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: advertisements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advertisements (
    id uuid NOT NULL,
    title character varying,
    image_url character varying,
    link_url character varying,
    "position" character varying,
    is_active boolean,
    rotation_seconds integer,
    created_at timestamp without time zone
);


ALTER TABLE public.advertisements OWNER TO postgres;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    author character varying(100),
    type character varying(50) NOT NULL,
    published_at timestamp without time zone,
    is_active boolean,
    image_url character varying(500),
    status character varying(50),
    is_premium boolean,
    ad_image_url character varying(500),
    ad_link character varying(500)
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_id_seq OWNER TO postgres;

--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    slug character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean,
    "order" integer
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: exchange_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exchange_rates (
    id integer NOT NULL,
    usd_buy double precision NOT NULL,
    usd_sell double precision NOT NULL,
    eur_buy double precision NOT NULL,
    eur_sell double precision NOT NULL,
    date date NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.exchange_rates OWNER TO postgres;

--
-- Name: exchange_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exchange_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exchange_rates_id_seq OWNER TO postgres;

--
-- Name: exchange_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exchange_rates_id_seq OWNED BY public.exchange_rates.id;


--
-- Name: fuel_prices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fuel_prices (
    id integer NOT NULL,
    gasoline_premium double precision NOT NULL,
    gasoline_regular double precision NOT NULL,
    diesel_optimum double precision NOT NULL,
    diesel_regular double precision NOT NULL,
    date date NOT NULL,
    created_at timestamp without time zone,
    glp double precision DEFAULT '132.6'::double precision NOT NULL,
    gas_natural double precision DEFAULT '43.9'::double precision NOT NULL
);


ALTER TABLE public.fuel_prices OWNER TO postgres;

--
-- Name: fuel_prices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fuel_prices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fuel_prices_id_seq OWNER TO postgres;

--
-- Name: fuel_prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fuel_prices_id_seq OWNED BY public.fuel_prices.id;


--
-- Name: news_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.news_sources (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    url character varying(500) NOT NULL,
    type public.newssourcetype,
    category character varying(50) NOT NULL,
    is_active boolean
);


ALTER TABLE public.news_sources OWNER TO postgres;

--
-- Name: news_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.news_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_sources_id_seq OWNER TO postgres;

--
-- Name: news_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.news_sources_id_seq OWNED BY public.news_sources.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name character varying(100),
    email character varying(100) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    role character varying(50),
    is_active boolean,
    gemini_api_key character varying(255),
    gemini_model character varying(50),
    is_premium boolean,
    backup_limit_gb integer,
    backup_frequency_hours integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: exchange_rates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exchange_rates ALTER COLUMN id SET DEFAULT nextval('public.exchange_rates_id_seq'::regclass);


--
-- Name: fuel_prices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fuel_prices ALTER COLUMN id SET DEFAULT nextval('public.fuel_prices_id_seq'::regclass);


--
-- Name: news_sources id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_sources ALTER COLUMN id SET DEFAULT nextval('public.news_sources_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: advertisements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advertisements (id, title, image_url, link_url, "position", is_active, rotation_seconds, created_at) FROM stdin;
3b770eab-a93b-41fc-8405-7294499afae7	Banco de Plata	/uploads/1cb376ed0ef549b1bf27a0c31a7a2240.png	https://google.com	header	t	5	2026-03-13 16:21:27.703634
c15fd2ca-961a-4128-9847-5cfc393fa167	Banco de Oro	/uploads/3dab0531413543adb810148ca9bee8fc.png	https://google.com	header	t	5	2026-03-13 16:16:00.603889
f56c973d-cfa9-4ec2-9615-25e45eb5ba6a	Inferior	/uploads/3f726567554d4a00aac5e9ae86cb1e9e.jpeg	https://google.com	content_middle	t	5	2026-03-13 16:16:00.603158
34d7e16b-46fb-44b6-9d85-a363108eccd3	Lateral	/uploads/9a9a11755dc34d68ba3f2bb09e238549.png	https://google.com	sidebar_top	t	5	2026-03-13 16:16:00.600107
e84b91bc-eeb1-4271-8b9c-105fc96f0efc	Lateral Inferior	/uploads/da8d47e1dce5497c9e7c10733758423d.png	https://google.com	sidebar_bottom	t	5	2026-03-13 16:32:32.897328
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
a7c572705629
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles (id, title, content, author, type, published_at, is_active, image_url, status, is_premium, ad_image_url, ad_link) FROM stdin;
7	Renovables y baterías en República Dominicana: un avance necesario que deja lecciones de planificación	La reciente decisión de la Comisión Nacional de Energía de exigir sistemas de almacenamiento con baterías en los nuevos proyectos renovables de más de 20 MW representa, sin duda, un paso importante para fortalecer el sistema eléctrico dominicano. El anuncio, realizado por Edward Veras durante Energyear Caribe 2024, busca garantizar que el crecimiento de la energía solar y eólica ocurra sin comprometer la estabilidad de la red.\n\nLa lógica técnica es clara: a medida que aumentan las energías renovables variables, el almacenamiento se vuelve una herramienta clave para gestionar la intermitencia. Las baterías permiten almacenar energía cuando hay abundancia de generación y liberarla cuando el sistema lo requiere, ayudando a mantener el equilibrio entre oferta y demanda.\n\nLa medida, respaldada por el presidente Luis Abinader, también refleja el compromiso del país con su transición energética. La República Dominicana ha experimentado un crecimiento notable en proyectos renovables y se ha posicionado como uno de los mercados más dinámicos del Caribe en este sector.\n\nSin embargo, este avance también deja una lección importante sobre la planificación del sistema eléctrico. Durante los últimos años se otorgó un número considerable de concesiones a proyectos renovables, muchas de las cuales aún no se han materializado, mientras que otros proyectos sí lograron entrar en operación en un sistema que todavía no estaba completamente preparado para integrarlos.\n\nEl resultado ha sido conocido por el sector: episodios de curtailment —recortes de generación— que han afectado a algunas plantas renovables. En ciertos casos, estas reducciones en la energía despachada han provocado pérdidas económicas significativas e incluso dificultades para cumplir con compromisos financieros asociados a los proyectos.\n\nLa exigencia de baterías apunta precisamente a corregir ese tipo de desequilibrios. No obstante, muchos actores del sector consideran que esta decisión pudo haberse anticipado con mayor rapidez, evitando parte de las pérdidas que ya se han producido.\n\nDicho esto, la política energética siempre se construye en tiempo real, ajustándose a una industria que evoluciona rápidamente. Lo positivo es que las autoridades han reconocido el desafío y están tomando medidas para fortalecer la resiliencia del sistema eléctrico.\n\nLa transición energética dominicana sigue siendo una historia de éxito en desarrollo. Pero también es un recordatorio de que, en un sector tan complejo como el eléctrico, la planificación anticipada es tan importante como la inversión. Prever a tiempo permite crecer con mayor estabilidad, proteger las inversiones y asegurar que el avance hacia una matriz energética más limpia beneficie a todos.	Tony Reyes	empresas	2026-03-11 19:56:03.778478	t	/uploads/f181e1f086c042fc8952504197eb7a73.jfif	published	f	\N	\N
6	Experiencia, no apariencia: el verdadero reto en el desarrollo energético del país 	El crecimiento del sector energético en la República Dominicana ha traído consigo una mayor cantidad de proyectos de generación eléctrica, especialmente en energías renovables. Sin embargo, detrás de cada planta que finalmente entra en operación existe un proceso largo y complejo que muchas veces pasa desapercibido para el público: la permisología, el diseño de ingeniería y la interconexión al sistema eléctrico.\n\nEstas etapas son determinantes para el éxito de cualquier proyecto. Obtener licencias, preparar estudios técnicos, cumplir con los requisitos regulatorios y coordinar con distintas instituciones del Estado puede tomar meses o incluso años si no se maneja correctamente. En teoría, un proyecto bien estructurado debería poder completar estas fases en un plazo cercano a los 18 o 24 meses. En la práctica, sin embargo, la historia suele ser diferente.\n\nEn el sector se conocen casos de proyectos que han tardado más de cuatro años en avanzar desde la etapa inicial hasta el punto en que pueden comenzar su construcción. No siempre se trata de problemas regulatorios o burocráticos. En muchos casos, los retrasos se deben simplemente a una mala gestión del proceso técnico y administrativo.\n\nParte del problema radica en cómo se eligen los asesores y gestores de estos proyectos. En un mercado cada vez más competitivo, algunas empresas se presentan como las más idóneas basándose en su tamaño, en oficinas impresionantes o en una imagen corporativa sólida. Pero el desarrollo energético es un negocio donde la apariencia pesa mucho menos que la experiencia real y la capacidad técnica.\n\nContar con equipos que conozcan profundamente la normativa dominicana, las instituciones involucradas y la lógica operativa del sistema eléctrico puede marcar la diferencia entre un proyecto que avanza con fluidez y uno que queda atrapado durante años en procesos administrativos o revisiones técnicas.\n\nAl mismo tiempo, el sector energético dominicano cuenta con un número creciente de integradores de servicios y consultoras más pequeñas que poseen una gran capacidad técnica y una experiencia acumulada considerable, pero que muchas veces pasan desapercibidas frente a firmas más grandes o más visibles.\n\nDar espacio a estas empresas también puede ser positivo para el desarrollo del sector. No solo amplía la competencia, sino que permite aprovechar talento especializado que, en muchos casos, trabaja con estructuras más ágiles y con una comprensión muy directa de los procesos locales.\n\nEn una industria donde el tiempo tiene un costo financiero enorme —especialmente cuando los proyectos dependen de financiamiento internacional o de compromisos contractuales— elegir bien a los asesores técnicos y gestores puede ser tan importante como seleccionar la tecnología de generación o el terreno donde se construirá la planta.\n\nEl crecimiento energético de la República Dominicana depende de inversiones, planificación y buena regulación. Pero también depende de algo más simple: contar con los profesionales adecuados para llevar los proyectos desde el papel hasta la realidad. Y en ese camino, a veces la experiencia y la capacidad se encuentran en lugares menos visibles de lo que muchos imaginan.	Tony Reyes	economia	2026-03-11 19:53:17.544911	t	/uploads/fe4901d2c1994295a94541f132014615.jpg	published	t	\N	
11	Medición precisa del recurso energético: Asunto clave para éxito en un proyecto voltaico	En la discusión sobre el futuro energético de la República Dominicana suele hablarse de inversión, de capacidad instalada o de nuevas tecnologías. Sin embargo, existe un elemento menos visible, pero absolutamente determinante para el éxito de cualquier proyecto de generación eléctrica: la medición precisa del recurso energético disponible en el lugar donde se pretende producir electricidad.\n\nAntes de construir una planta solar, eólica o incluso evaluar determinadas condiciones climáticas para proyectos térmicos, es indispensable conocer con exactitud qué recurso existe realmente en el terreno. No se trata de estimaciones generales ni de datos regionales. La viabilidad técnica y económica de un proyecto energético depende, en gran medida, de información obtenida directamente en el sitio donde se planea desarrollar la instalación.\n\nPor esa razón, la instalación de estaciones meteorológicas cercanas al área del proyecto se ha convertido en una práctica esencial dentro de la industria energética. En el caso de la República Dominicana, la normativa establece que estas estaciones deben ubicarse a menos de cinco kilómetros del sitio del proyecto. El objetivo es claro: garantizar que los datos recolectados reflejen con la mayor precisión posible las condiciones reales del lugar.\n\nEste tipo de mediciones no es un simple requisito administrativo. Durante períodos prolongados —usualmente de alrededor de un año— se recopila información sobre variables como radiación solar, velocidad y dirección del viento, temperatura, humedad y otros parámetros climáticos. Con estos datos es posible construir modelos de simulación energética que permiten estimar cuánta electricidad podrá producir una instalación en condiciones reales.\n\nLa diferencia entre contar con datos confiables o basarse en aproximaciones puede traducirse en millones de dólares. Una sobreestimación del recurso puede llevar a inversiones que luego no cumplen las expectativas de producción; una subestimación, por el contrario, puede hacer que proyectos viables nunca se desarrollen.\n\nPor ello, más que un simple trámite técnico, la medición del recurso energético debería entenderse como un paso fundamental para tomar decisiones responsables en materia de inversión y planificación energética. En un país que busca diversificar su matriz eléctrica y aumentar la participación de energías renovables, la calidad de la información disponible es tan importante como la tecnología que finalmente se instale.\n\nEn última instancia, la transición energética no se construye solo con paneles solares o turbinas eólicas. También se construye con datos confiables, mediciones rigurosas y estudios que permitan comprender con precisión el potencial real de cada territorio. Solo así será posible desarrollar proyectos sostenibles, eficientes y capaces de responder a las necesidades energéticas del país en el largo plazo.	Tony Reyes	mercados	2026-03-12 02:41:27.304242	t	/uploads/ae1eec3fa3004040863edd0e62fa518a.jfif	published	f	/uploads/8d26d445ee6f44758a1e2437214c4447.jpg	https://google.com
8	El eslabón debil de la transición energética dominicana: la transmisión eléctrica	La República Dominicana vive un momento de expansión económica que, aunque positivo, trae consigo un desafío inevitable: la creciente demanda de energía. A medida que el país crece, también lo hace la necesidad de electricidad confiable, abundante y sostenible. En el año 2025, el consumo eléctrico ha aumentado cerca de un 6 %, una señal clara de que la economía está en movimiento, pero también una advertencia de que el sistema energético debe evolucionar con la misma velocidad.\n\nEl desafío no es menor. Si el país aspira a cumplir metas ambiciosas de desarrollo —como la aspiración de duplicar el tamaño de su economía en la próxima década— el sistema eléctrico tendrá que acompañar ese crecimiento. Sin una infraestructura energética sólida, cualquier estrategia de desarrollo económico corre el riesgo de quedarse corta.\n\nLa conversación pública sobre energía suele concentrarse en la generación: más plantas, más capacidad instalada, más proyectos renovables. Pero existe otro componente igual de importante y, muchas veces, menos visible: la infraestructura de transmisión eléctrica.\n\nSin una red robusta de alta tensión, la energía que se produce simplemente no puede llegar de manera eficiente a los centros de consumo. Esto se vuelve especialmente relevante cuando se habla de energías renovables. En el caso dominicano, gran parte del potencial solar y eólico del país se encuentra en regiones alejadas de los grandes centros urbanos, como el noroeste o el sur profundo. Allí existe abundancia de recursos naturales, pero sin líneas de transmisión suficientes, ese potencial queda limitado.\n\nPor esa razón, el fortalecimiento de la red eléctrica nacional debería ocupar un lugar central en la agenda energética del país. Invertir en miles de kilómetros de nuevas líneas de transmisión no solo permitiría integrar mayor cantidad de energía renovable al sistema, sino también mejorar la estabilidad y eficiencia del sistema eléctrico en su conjunto.\n\nUna estrategia interesante sería estructurar grandes procesos de licitación para la expansión de la red de alta tensión, dividiendo los proyectos en distintos tramos. Esto permitiría acelerar la ejecución de las obras y abrir el sector a una mayor participación de empresas nacionales e internacionales, fomentando la competencia, la innovación y el desarrollo de capacidades técnicas dentro del país.\n\nLa expansión de la infraestructura eléctrica no es solo una cuestión técnica; es una decisión estratégica de desarrollo nacional. Un sistema de transmisión moderno facilita la inversión en nuevos proyectos energéticos, fortalece la seguridad energética y crea las condiciones para que el país continúe creciendo de manera sostenida.\n\nLa República Dominicana tiene ante sí una oportunidad histórica. Con una planificación adecuada, inversiones oportunas y una visión de largo plazo, el país puede construir un sistema energético más resiliente, capaz de sostener su crecimiento económico y, al mismo tiempo, avanzar hacia una matriz energética más limpia.\n\nEl futuro energético dominicano no dependerá únicamente de cuánta energía se produzca, sino de qué tan bien seamos capaces de transportarla, integrarla y gestionarla. Invertir hoy en infraestructura eléctrica es, en esencia, invertir en el futuro del país.	Tony Reyes	empresas	2026-03-11 20:08:09.69653	t	/uploads/7f7a7cefaa8e4a5aaa065e091d68b94a.jpg	published	f	\N	\N
10	Energía, inversión y desarrollo: el momento de fortalecer el sistema eléctrico dominicano	La República Dominicana atraviesa uno de los momentos más dinámicos de su historia reciente en materia energética. La expansión de proyectos de generación —especialmente renovables—, el crecimiento sostenido de la demanda eléctrica y el interés de inversionistas internacionales reflejan que el país se está consolidando como uno de los mercados energéticos más activos del Caribe. Sin embargo, este crecimiento también plantea una pregunta inevitable: ¿está el sistema eléctrico preparado para sostener el ritmo de desarrollo que la economía dominicana exige?\n\nEl debate energético suele centrarse en la construcción de nuevas plantas de generación. Paneles solares, parques eólicos y nuevas tecnologías ocupan titulares y atraen inversión. Pero el verdadero desafío estructural del sistema eléctrico dominicano no está únicamente en producir más energía, sino en cómo transportarla, gestionarla y estabilizarla.\n\nHoy resulta cada vez más evidente que la infraestructura de transmisión eléctrica debe convertirse en una prioridad nacional. Gran parte del potencial renovable del país se encuentra en zonas alejadas de los grandes centros de consumo, particularmente en el noroeste y el sur profundo. Sin una red de alta tensión robusta, moderna y expandida, ese potencial corre el riesgo de quedarse limitado, afectando tanto la seguridad energética como la competitividad del país.\n\nLa expansión de la red de transmisión no es simplemente un asunto técnico; es una inversión estratégica para el desarrollo económico. Una red eléctrica fuerte permite integrar más energías renovables, reducir pérdidas, mejorar la estabilidad del sistema y, sobre todo, generar confianza entre inversionistas que evalúan instalar proyectos industriales o productivos en el país.\n\nEn paralelo, el crecimiento acelerado de la generación renovable ha puesto sobre la mesa otro elemento clave del futuro energético: el almacenamiento de energía. Los sistemas de baterías de gran escala, conocidos como BESS, se están convirtiendo en una herramienta fundamental para gestionar la variabilidad de fuentes como el sol y el viento. Más que una tecnología complementaria, el almacenamiento empieza a ser una pieza central en la arquitectura de los sistemas eléctricos modernos.\n\nEn el caso dominicano, incentivar la instalación de sistemas BESS no solo ayudaría a estabilizar la red y reducir episodios de recorte de generación renovable, sino que también abriría nuevas oportunidades de mercado en servicios energéticos, regulación de frecuencia y gestión de picos de demanda. En otras palabras, el almacenamiento no debe verse únicamente como un requisito técnico, sino como un nuevo sector de desarrollo dentro de la economía energética.\n\nPero el impacto de estas decisiones va más allá del sector eléctrico. Un sistema energético moderno, estable y competitivo es uno de los factores más importantes para atraer grandes inversiones industriales. Empresas manufactureras, centros de datos, industrias tecnológicas o grandes instalaciones productivas buscan países donde la electricidad sea confiable, accesible y sostenible.\n\nLa República Dominicana tiene condiciones favorables para convertirse en un polo regional de inversión productiva. Su estabilidad económica, su ubicación estratégica y su creciente participación de energías renovables son ventajas importantes. Sin embargo, para aprovechar plenamente esas oportunidades será necesario continuar fortaleciendo la infraestructura energética, especialmente en transmisión, almacenamiento y planificación del sistema.\n\nEl desarrollo del sector eléctrico no debe verse únicamente como una cuestión técnica o regulatoria. Es, en esencia, una política de desarrollo nacional. Invertir en transmisión, incentivar el almacenamiento energético y crear condiciones de mercado que estimulen nuevas inversiones industriales significa generar empleo formal, impulsar el crecimiento económico y avanzar hacia un modelo de desarrollo más sostenible.\n\nLa transición energética dominicana ya está en marcha. Ahora el desafío es asegurar que ese proceso esté acompañado de una visión de largo plazo, donde la planificación, la infraestructura y la innovación permitan que la energía se convierta en uno de los principales motores del progreso económico y social del país.	Redacción Ejecutiva, La Agenda	editorial	2026-03-12 02:23:32.47787	t	/uploads/15eed8817185497f9676821ac0d128ab.png	published	f	\N	\N
12	El tiempo perdido en el tráfico: una factura silenciosa para las familias dominicanas	En la República Dominicana, el tráfico se ha convertido en una parte inevitable de la vida cotidiana. Para miles de personas, especialmente en las grandes zonas urbanas, pasar más de dos horas al día en el tránsito no es una excepción: es la rutina. Lo que muchas veces se percibe como una molestia diaria tiene, en realidad, un impacto profundo en la economía familiar, en la productividad del país y, sobre todo, en la calidad de vida de las personas.\n\nQuienes se desplazan cada día para trabajar saben que el trayecto entre la casa y la oficina puede consumir una parte importante de su jornada. En muchos casos, el problema no es solo el tiempo normal de desplazamiento, sino el tiempo adicional que se pierde debido a la congestión vial. Ese tiempo extra —que podría destinarse a descansar, compartir con la familia o estudiar— termina atrapado entre motores encendidos y filas interminables de vehículos.\n\nUn ejercicio teórico ayuda a dimensionar el problema. Supongamos que 10,000 personas pasan, en promedio, cuatro horas adicionales al día atrapadas en el tráfico. Si ese escenario se repite durante 24 días al mes —una jornada laboral típica— el resultado es sorprendente.\n\nEn un solo día, esas 10,000 personas acumulan 40,000 horas perdidas en el tránsito. En un mes, la cifra alcanza 960,000 horas de vida atrapadas en el tráfico. Es casi un millón de horas que no se destinan al descanso, al tiempo con los hijos o a cualquier actividad que contribuya al bienestar personal.\n\nPero el impacto no se limita al tiempo. También existe un costo económico directo asociado al combustible que se consume en medio de la congestión. Un vehículo atrapado en tráfico pesado puede gastar fácilmente un galón adicional de combustible por día debido a las constantes aceleraciones, frenadas y al tiempo que el motor permanece encendido sin avanzar.\n\nSi asumimos un precio promedio cercano a los 300 pesos dominicanos por galón, el cálculo vuelve a ser revelador. Para 10,000 conductores, ese consumo adicional representa 3 millones de pesos diarios en combustible desperdiciado. En un mes laboral de 24 días, la cifra asciende a 72 millones de pesos gastados únicamente por el exceso de tráfico.\n\nDetrás de estos números hay algo aún más importante: el costo humano. Cada una de esas horas perdidas pertenece a un padre o una madre que llega más tarde a casa, a una persona que podría estar descansando después de una jornada laboral, o a alguien que quisiera dedicar tiempo a estudiar o a compartir con sus seres queridos.\n\nEl problema es incluso más complejo para quienes dependen del transporte público. Muchos trabajadores pasan tiempos similares —o incluso mayores— desplazándose entre autobuses, carros de concho o estaciones de transporte colectivo. Para ellos, el trayecto no solo es largo, sino también físicamente agotador.\n\nEn la práctica, el tráfico termina robando uno de los recursos más valiosos que tiene cualquier persona: el tiempo. Un recurso que no se puede recuperar ni reemplazar.\n\nResolver el problema del tránsito no es sencillo. Requiere planificación urbana, inversión en transporte público eficiente, infraestructura vial moderna y una visión de movilidad sostenible. Pero también requiere reconocer que el tráfico no es solo un inconveniente urbano: es un problema económico y social que afecta directamente la vida de miles de familias.\n\nCada hora que una persona pasa atrapada en el tráfico es una hora menos para vivir plenamente. Y cuando se suman miles de esas horas cada día, el costo para la sociedad dominicana resulta mucho mayor de lo que solemos imaginar.	Tony Reyes	opinion	2026-03-12 20:14:19.642563	t	/uploads/c6cfb3429d7843e79e3b2d73f3c93be4.png	published	f	/uploads/2b9c316b90d442dcb2b37316196d46a0.png	https://www.google.com/
13	El respeto a la autoridad: una condición indispensable para la convivencia	En los últimos años se ha vuelto cada vez más común observar escenas de tensión, confrontación e incluso violencia entre ciudadanos y las personas encargadas de brindar servicios o ejercer algún tipo de autoridad. Policías, agentes de seguridad, servidores públicos, personal médico, empleados de empresas privadas y funcionarios administrativos cumplen diariamente una función esencial: organizar la vida colectiva y ofrecer servicios que permiten que la sociedad funcione.\n\nSin embargo, con demasiada frecuencia olvidamos que detrás de cada uniforme, de cada ventanilla de atención o de cada puesto de trabajo hay un ser humano que merece respeto.\n\nRespetar a la autoridad designada no significa aceptar abusos ni someterse a la humillación. Significa comprender que toda sociedad necesita orden, reglas y personas encargadas de hacerlas cumplir. Cuando un agente de seguridad regula el tránsito, cuando un servidor público organiza un turno en un hospital o cuando un empleado establece un procedimiento para atender a los usuarios, lo hace dentro de un marco institucional que busca servir a todos de la forma más justa posible.\n\nHace pocos días presencié una escena profundamente lamentable en un centro de salud. Un hombre y una mujer, molestos porque un servidor del centro no les daba prioridad en la atención, comenzaron a discutir con él. Lo que inició como una reclamación verbal escaló rápidamente: lo insultaron, lo empujaron y generaron un ambiente de tensión en un lugar donde precisamente se necesita calma y respeto.\n\nEl servidor, sorprendido por la agresión, reaccionó defendiendo el empujón recibido. Aquello bastó para que la situación se desbordara en una discusión mayor. Ambos lados fueron a reportar lo ocurrido, pero cuando volvieron a encontrarse frente a frente, el conflicto terminó en agresiones físicas en pleno centro médico.\n\nEl desenlace fue el peor posible: la intervención de la policía y la fiscalía, con los involucrados detenidos.\n\nMientras todo esto ocurría, las personas que habían provocado el incidente tenían un familiar enfermo en el centro de salud. En lugar de poder acompañarlo y concentrarse en su bienestar, terminaron envueltos en un proceso judicial que los obligó a dejarlo solo, vulnerable y desatendido. Una situación dolorosa que pudo evitarse con algo tan sencillo como la prudencia y el respeto.\n\nPor otro lado, el joven servidor público quedó expuesto a consecuencias laborales que pueden incluir sanciones o incluso la pérdida de su trabajo, quizás por no haber reaccionado de la manera ideal ante una agresión inesperada. Es posible que las autoridades del centro hubieran preferido que soportara el empujón sin responder, para evitar que el incidente escalara y afectara la imagen de la institución.\n\nPero la verdad es que ninguna persona debería ser obligada a aceptar la violencia como parte de su trabajo.\n\nEste tipo de situaciones reflejan un problema más profundo: la dificultad que a veces tenemos como sociedad para manejar los conflictos con serenidad y respeto.\n\nCuando un ciudadano no está de acuerdo con una decisión o con el trato recibido por parte de una autoridad o de un servidor, existen canales institucionales para reclamar. Siempre se puede acudir a un supervisor, a una dirección administrativa o a los mecanismos formales de queja y denuncia. Reclamar es un derecho; agredir nunca lo es.\n\nLa diferencia entre una sociedad civilizada y una sociedad dominada por el caos radica precisamente en la manera en que gestionamos nuestras diferencias.\n\nEl respeto a la autoridad no debe confundirse con sumisión. Un ciudadano digno puede y debe defender sus derechos cuando considera que han sido vulnerados. Pero esa defensa debe hacerse con firmeza, sí, pero también con respeto, con argumentos y dentro de los canales establecidos.\n\nSi cada desacuerdo termina en gritos, empujones o violencia, no solo se destruye la convivencia social, sino que las personas terminan generándose problemas mucho mayores que los que inicialmente enfrentaban.\n\nLa tolerancia, la paciencia y la capacidad de diálogo son virtudes fundamentales para construir una mejor sociedad.\n\nLos dominicanos y dominicanas tenemos la oportunidad de reflexionar sobre esto cada vez que interactuamos con un policía, un médico, un empleado público, un agente de seguridad o cualquier persona que ejerza una función de servicio o autoridad. Tratar con respeto a quienes cumplen estas funciones no nos hace más pequeños; al contrario, nos engrandece como ciudadanos.\n\nSi logramos cultivar una cultura donde el respeto, la prudencia y el diálogo prevalezcan sobre la violencia y la confrontación, estaremos dando un paso importante hacia un país más justo, más ordenado y más humano.\n\nPorque al final, el respeto no es una señal de debilidad: es la base misma de la convivencia.	Tony Reyes	opinion	2026-03-12 21:46:50.894746	t	/uploads/33fb6ad31cc7421797d597a130e4f771.png	published	f	/uploads/ca751e2e8f0f47c88d1f04c929bfaecf.png	https://www.google.com/
14	Más inclusión financiera, pero menos capacidad de ahorro: el reto económico de los dominicanos	La inclusión financiera en la República Dominicana continúa mostrando avances importantes en los últimos años. Sin embargo, diversos indicadores revelan que todavía existen desafíos significativos para lograr que más ciudadanos y pequeñas empresas participen plenamente del sistema financiero formal y logren una verdadera estabilidad económica.\n\nUn análisis reciente sobre el comportamiento financiero de los dominicanos (el Informe de la Encuesta Nacional de Inclusión y Educación Financiera (ENIEF) 2023) muestra cómo la población administra su dinero, accede a servicios financieros y enfrenta decisiones económicas en su vida cotidiana. El estudio, realizado mediante entrevistas a miles de hogares en todo el territorio nacional, busca comprender las dinámicas financieras de los ciudadanos mayores de 18 años y aportar información útil para el diseño de políticas públicas y estrategias empresariales.\n\nMás dominicanos utilizan servicios financieros\n\nUno de los hallazgos más relevantes es el crecimiento sostenido en el acceso a productos financieros formales. Actualmente, alrededor del 55 % de la población adulta posee al menos un producto financiero, como cuentas de ahorro, créditos o instrumentos de inversión. Esta cifra representa un aumento con respecto a mediciones anteriores y refleja un mayor acercamiento de los ciudadanos al sistema financiero.\n\nAsimismo, la llamada inclusión financiera potencial, que mide tanto a quienes ya utilizan servicios financieros como a quienes desean integrarse al sistema, alcanza aproximadamente 65.6 % de la población, lo que demuestra un creciente interés en acceder a estos servicios.\n\nEntre los productos financieros más utilizados por los dominicanos destacan:\n\nCuentas de ahorro\n\nCuentas de nómina\n\nTarjetas de crédito\n\nPréstamos personales\n\nLas cuentas de ahorro continúan siendo el instrumento financiero más común, seguidas por las cuentas de nómina vinculadas al empleo formal.\n\nEl ahorro continúa siendo una debilidad\n\nA pesar del crecimiento en el acceso a servicios financieros, la capacidad de ahorro sigue siendo una de las principales debilidades económicas de los hogares dominicanos.\n\nMás de la mitad de la población adulta no logró ahorrar ni invertir durante el último año, lo que pone de manifiesto la vulnerabilidad financiera de muchas familias frente a situaciones imprevistas o crisis económicas.\n\nEntre quienes sí logran ahorrar, las principales motivaciones incluyen:\n\ncubrir gastos cotidianos\n\nprepararse para emergencias\n\natender necesidades de salud\n\nfinanciar educación o mejoras en el hogar\n\nLa información también sugiere que muchos hogares todavía dependen de mecanismos informales para enfrentar imprevistos financieros, como préstamos de familiares o amigos, lo que refleja las limitaciones que aún existen para acceder a crédito formal en ciertos sectores de la población.\n\nLa digitalización impulsa el acceso financiero\n\nOtro cambio importante observado en los últimos años es el crecimiento de los servicios financieros digitales.\n\nEl uso de la banca por internet prácticamente se ha duplicado, impulsado por la expansión del acceso a internet y el uso masivo de teléfonos inteligentes en el país. Cada vez más ciudadanos utilizan aplicaciones móviles y plataformas digitales para realizar pagos, transferencias y consultas bancarias.\n\nEste avance tecnológico abre nuevas oportunidades para ampliar la inclusión financiera, especialmente en comunidades donde el acceso físico a sucursales bancarias es limitado.\n\nEl alto nivel de cobertura de internet y telefonía móvil en el país crea además un entorno favorable para el crecimiento de la banca digital, los pagos electrónicos y nuevas plataformas financieras que podrían transformar la manera en que los ciudadanos interactúan con el sistema financiero.\n\nLa educación financiera comienza a mostrar resultados\n\nLas iniciativas de educación financiera impulsadas en los últimos años también comienzan a reflejar resultados positivos.\n\nEntre quienes han participado en programas de capacitación financiera, una gran mayoría afirma haber mejorado su capacidad para ahorrar, controlar sus ingresos y administrar mejor sus gastos.\n\nIncluso, una parte de los participantes decidió abrir una cuenta bancaria después de recibir formación financiera, lo que demuestra el impacto directo que estas iniciativas pueden tener en la inclusión económica de la población.\n\nNo obstante, las preocupaciones económicas siguen siendo frecuentes en muchos hogares. Entre las principales inquietudes financieras de los dominicanos destacan la falta de ahorros para emergencias, la incertidumbre sobre el retiro y el temor a perder el empleo.\n\nUn desafío para el desarrollo económico\n\nLos resultados reflejan avances importantes en la inclusión financiera del país, pero también evidencian que aún existe una brecha considerable entre el acceso a servicios financieros y la verdadera estabilidad económica de los hogares.\n\nPara las pequeñas y medianas empresas, este panorama también representa una oportunidad. Una mayor inclusión financiera puede facilitar el acceso al crédito productivo, estimular la inversión y mejorar la capacidad de crecimiento del sector empresarial.\n\nEn este contexto, el fortalecimiento de la educación financiera, la expansión de los servicios digitales y un acceso más equitativo al crédito serán factores clave para consolidar un sistema financiero más inclusivo, dinámico y resiliente.\n\nEl desafío hacia el futuro consiste en transformar el acceso a servicios financieros en oportunidades reales de desarrollo económico y bienestar para millones de dominicanos.	Tony Reyes	economia	2026-03-12 22:10:38.163641	t	/uploads/c3d1ff5a5b47481d93fed290750c009d.png	published	f	/uploads/c54b7451d8b74930a9b2c5aa44499bbb.png	https://www.google.com
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, slug, name, is_active, "order") FROM stdin;
1	mercados	Mercados	t	0
2	empresas	Empresas	t	0
3	economia	Economía	t	0
4	opinion	Opinión	t	0
5	editorial	Editorial	t	0
\.


--
-- Data for Name: exchange_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exchange_rates (id, usd_buy, usd_sell, eur_buy, eur_sell, date, created_at) FROM stdin;
1	58.75	59.25	63.45	64.15	2026-03-11	2026-03-11 21:57:40.049938
\.


--
-- Data for Name: fuel_prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fuel_prices (id, gasoline_premium, gasoline_regular, diesel_optimum, diesel_regular, date, created_at, glp, gas_natural) FROM stdin;
1	290.1	272.5	239.1	221.6	2026-03-11	2026-03-11 21:57:40.055287	132.6	43.9
\.


--
-- Data for Name: news_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.news_sources (id, name, url, type, category, is_active) FROM stdin;
1	Listín Diario	https://listindiario.com/rss/portada.html	rss	economia	t
3	El Nuevo Diario	https://elnuevodiario.com.do/feed/	rss	economia	t
2	Diario Libre	https://www.diariolibre.com/rss/portada.xml	rss	economia	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, hashed_password, role, is_active, gemini_api_key, gemini_model, is_premium, backup_limit_gb, backup_frequency_hours) FROM stdin;
3	Delio Siret	deliosiret@gmail.com	$2b$12$8Bgb1wUEZ23gxv599sfEYuGJWq41FC7nRcIki066icWZfaokW62P6	subscriber	t	\N	gemini-flash-lite-latest	f	\N	\N
2	Tony Reyes	tonydreyes@gmail.com	$2b$12$VujQFl92xGMHYNAsd9eYL.I8E1Lmnae7gC0mzSGfzSeWkrAgOxZ.6	admin	t	\N	gemini-flash-lite-latest	f	10	2
1	Delio Siret	deliosiret@hotmail.com	$2b$12$VujQFl92xGMHYNAsd9eYL.I8E1Lmnae7gC0mzSGfzSeWkrAgOxZ.6	admin	t	AIzaSyAOMf4qbqRbFoKTGxz-EROvGTi8-ACfZpk	gemini-flash-lite-latest	f	10	2
\.


--
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articles_id_seq', 14, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- Name: exchange_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exchange_rates_id_seq', 100, true);


--
-- Name: fuel_prices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fuel_prices_id_seq', 1, true);


--
-- Name: news_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_sources_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: advertisements advertisements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT advertisements_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: exchange_rates exchange_rates_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_date_key UNIQUE (date);


--
-- Name: exchange_rates exchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_pkey PRIMARY KEY (id);


--
-- Name: fuel_prices fuel_prices_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fuel_prices
    ADD CONSTRAINT fuel_prices_date_key UNIQUE (date);


--
-- Name: fuel_prices fuel_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fuel_prices
    ADD CONSTRAINT fuel_prices_pkey PRIMARY KEY (id);


--
-- Name: news_sources news_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_sources
    ADD CONSTRAINT news_sources_pkey PRIMARY KEY (id);


--
-- Name: news_sources news_sources_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_sources
    ADD CONSTRAINT news_sources_url_key UNIQUE (url);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_advertisements_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_advertisements_position ON public.advertisements USING btree ("position");


--
-- Name: ix_advertisements_title; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_advertisements_title ON public.advertisements USING btree (title);


--
-- Name: ix_articles_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_articles_id ON public.articles USING btree (id);


--
-- Name: ix_categories_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_categories_id ON public.categories USING btree (id);


--
-- Name: ix_categories_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_categories_slug ON public.categories USING btree (slug);


--
-- Name: ix_exchange_rates_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_exchange_rates_id ON public.exchange_rates USING btree (id);


--
-- Name: ix_fuel_prices_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_fuel_prices_id ON public.fuel_prices USING btree (id);


--
-- Name: ix_news_sources_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_news_sources_id ON public.news_sources USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_full_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_full_name ON public.users USING btree (full_name);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- PostgreSQL database dump complete
--

\unrestrict NUEl61Rdvg6cvryR9ag9hhdZ4jag7AEwGokO4pJcKNuf0IFbTHMSxt7dDyf0nTm

