# 📘 Guía Maestra de Arquitectura: Eneba Clone MVP

Esta guía está diseñada para que estudiantes y desarrolladores junior entiendan no solo **qué** hace la aplicación, sino **cómo** está organizada y **por qué** hemos tomado ciertas decisiones técnicas.

---

## 🌟 1. Todas las Funcionalidades

### 🛒 Experiencia del Usuario (Client)
- **Home Dinámico**: Carrusel de juegos destacados y sección de "Últimas Novedades" (ordenados por fecha de actualización).
- **Catálogo Inteligente (Tienda)**: 
    - Búsqueda en tiempo real (Live Search).
    - Filtros por plataforma (PC, PS5, Xbox, Switch).
    - Filtro de rango de precios con respuesta inmediata.
- **Detalle del Producto**: 
    - Galería multimedia con carrusel de imágenes adicionales.
    - Badges de plataforma y descuentos dinámicos.
- **Persistencia**: Sistema de **Favoritos** y **Carrito de Compras** que se mantienen aunque cierres el navegador (LocalStorage).
- **Diseño Premium**: Animaciones suaves, botón "Ir Arriba" dinámico y estados visuales para "Cargando" o "Sin resultados".

### 👑 Gestión de Administración (Admin)
- **Monitoreo**: Ver todos los usuarios registrados y quiénes han iniciado sesión.
- **CRUD de Productos**: Panel para Crear, Editar (con pre-carga de datos) y Eliminar juegos.
- **Multi-Plataforma**: Capacidad de asignar varias plataformas a un solo juego mediante checkboxes.

---

## 🏗️ 2. El Backend: Arquitectura Modular (FastAPI)

Hemos pasado de un único archivo a una **Estructura por Responsabilidades**. Esto evita que el código sea un "espagueti" difícil de leer.

### 📂 Carpeta `/backend`
| Archivo | Responsabilidad (¿Qué hace?) | ¿Por qué es importante? |
| :--- | :--- | :--- |
| `main.py` | **El Director de Orquesta**. Punto de entrada del servidor. | Solo se encarga de arrancar la app, configurar CORS y conectar los "Routers". |
| `database.py` | **El Puente a la DB**. Configura la conexión con SQLAlchemy. | Usa `dotenv` para leer la URL de la base de datos de forma segura desde un `.env`. |
| `models.py` | **El ADN de los datos**. Define cómo son las tablas en la DB. | Aquí definimos que un `Product` tiene título, precio, fecha de actualización, etc. |
| `schemas.py` | **El Contrato de Datos**. Define cómo viaja la información (JSON). | Usa Pydantic para validar que, por ejemplo, el precio sea un número y no un texto. |
| `auth_utils.py`| **La Bóveda de Seguridad**. Hashing y JWT. | Contiene la lógica para encriptar contraseñas y generar tokens secretos de sesión. |
| `dependencies.py`| **Los Guardianes**. Filtros de seguridad. | Funciones que comprueban si un usuario está logueado o si es administrador antes de dejarle pasar. |
| `.env` | **Caja Fuerte**. Guarda secretos y contraseñas de la DB. | **¡Nunca se sube a GitHub!** Protege tus credenciales del mundo exterior. |

### 📂 Carpeta `/backend/routers`
Aquí dividimos las rutas de la API por temática:
- `auth.py`: Todo lo relativo a `/register` y `/login`.
- `products.py`: Todo sobre el catálogo y el CRUD de productos.
- `seed.py`: Un "botón mágico" para llenar la base de datos con juegos de prueba inicialmente.
- `admin.py`: Herramientas de visualización de usuarios para el administrador.

---

## 🎨 3. El Frontend: Basado en Componentes (Vanilla JS)

Usamos **Módulos ES6**, lo que nos permite importar y exportar funciones entre archivos como si fueran piezas de LEGO.

### 📂 Estructura de Estilos `/frontend/css`
- `base.css`: El corazón visual. Define los colores (Variables CSS), la fuente Inter y el reset básico.
- `layout.css`: El esqueleto. Define dónde va el Header, el Main y el Footer.
- `components.css`: Piezas reutilizables. Estilos para los botones, las tarjetas de juegos, y los modales.
- `pages/*.css`: Estilos únicos que solo existen en una página específica (ej. el degradado circular del estado "Sin resultados" en la tienda).

### 📂 Estructura de Lógica `/frontend/js`
- `main.js`: **El Cerebro**. Detecta en qué página estás y arranca la lógica necesaria (ej. si estás en `admin.html`, carga `admin.js`).
- **`/api`**:
    - `client.js`: Un envoltorio de `fetch` que añade automáticamente el token de seguridad a todas las peticiones.
    - `endpoints.js`: Un diccionario donde guardamos todas las direcciones de la API para no escribirlas mil veces.
- **`/auth`**:
    - `session.js`: Guarda y recupera el JWT y el rol del usuario del `localStorage`.
- **`/components`**:
    - `cards.js`: Genera el HTML de las tarjetas de productos. ¡Es la misma lógica para Index y Store!
    - `navbar.js`: Controla el menú superior (si muestra "Login" o el nombre del usuario logueado).
- **`/pages`**:
    - Aquí reside la lógica específica de cada vista: `store.js` maneja los filtros, `product.js` el carrusel, etc.

---

## 🛠️ 4. Buenas Prácticas y Conceptos Clave

1. **DRY (Don't Repeat Yourself)**: Si algo se usa más de una vez (como la tarjeta de un juego), se crea un componente (`cards.js`). No dupliques código.
2. **SoC (Separation of Concerns)**: El HTML solo tiene la estructura, el CSS solo el diseño y el JS solo la lógica. Nunca mezcles estilos inline o lógica pesada en el HTML.
3. **Seguridad en Capas**: 
    - Las contraseñas se guardan en el backend como "hashes" ilegibles.
    - El frontend nunca decide si eres admin; lo decide el backend verificando tu token JWT.
4. **UX Reactiva**: Los filtros de la tienda no necesitan que le des a "Buscar"; reaccionan al instante mientras escribes o seleccionas una plataforma.
5. **Arquitectura Modular**: Al separar el backend en routers, si quieres añadir una sección de "Noticias", solo tienes que crear un `news.py` en la carpeta routers. El resto del sistema ni se entera.

---

*Esta arquitectura no es solo para este proyecto; es el estándar que verás en aplicaciones profesionales de gran escala.*
