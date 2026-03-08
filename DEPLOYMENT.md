# 🚀 Guía de Despliegue: Eneba Clone en Producción

**Stack gratuito**: GitHub (código) → Render.com (backend API) → GitHub Pages (frontend) → Neon.tech (base de datos, ya configurada)

> ⚠️ **Tiempo estimado**: 30-45 minutos la primera vez.

---

## 📋 Resumen General

```
Neon.tech         ←→ Render.com (FastAPI)  ←→ GitHub Pages (Frontend HTML/JS/CSS)
(PostgreSQL DB)        API en la nube              Web pública en GitHub
```

El flujo es:
1. Tú subes **todo el código** a **GitHub**.
2. Render lee el repositorio y despliega el **backend (API FastAPI)** automáticamente.
3. GitHub Pages publica la carpeta `frontend/` como una **web estática**.
4. El frontend apunta a la URL de Render para hacer las peticiones.

---

## 🔧 Paso 0: Preparar el repositorio local

Antes de subir nada, asegúrate de tener **Git instalado**.

### 0.1 — Inicializar Git en el proyecto
Abre una terminal en `D:\Desktop\Proyecto_LM` y ejecuta:

```bash
git init
git add .
git commit -m "feat: initial commit - Eneba Clone MVP"
```

> El `.gitignore` creado automáticamente excluirá `.env` y `.venv/` para que no subas secretos.

---

## 🐙 Paso 1: Subir el código a GitHub

### 1.1 — Crear el repositorio en GitHub
1. Ve a [github.com](https://github.com) e inicia sesión.
2. Haz clic en **"New repository"**.
3. Ponle un nombre, p.ej. `eneba-clone-mvp`.
4. Déjalo **Público** (necesario para GitHub Pages gratis).
5. **NO** marques "Add a README" (ya tienes archivos locales).
6. Crea el repositorio.

### 1.2 — Conectar y subir
GitHub te mostrará los comandos exactos. Serán algo así:

```bash
git remote add origin https://github.com/TU-USUARIO/eneba-clone-mvp.git
git branch -M main
git push -u origin main
```

✅ **Verificación**: Entra a tu repositorio en GitHub y deberías ver todos los archivos.

---

## ⚙️ Paso 2: Desplegar el Backend en Render.com

### 2.1 — Crear cuenta en Render
Regístrate en [render.com](https://render.com). Puedes conectarlo directamente con tu cuenta de GitHub.

### 2.2 — Crear un nuevo servicio web
1. En el Dashboard de Render, haz clic en **"New +"** → **"Web Service"**.
2. Conecta tu repositorio de GitHub (`eneba-clone-mvp`).
3. Render detectará el `render.yaml` automáticamente. Si no, configura manualmente:
   - **Name**: `eneba-clone-api` (o el que quieras)
   - **Branch**: `main`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### 2.3 — Configurar las Variables de Entorno (⚠️ CRÍTICO)
En Render, ve a la pestaña **"Environment"** de tu servicio y añade estas variables:

| Clave | Valor |
| :--- | :--- |
| `DATABASE_URL` | La URL de conexión de tu base de datos en Neon.tech |
| `SECRET_KEY` | `super_secret_key_for_eneba_clone_mvp` (¡o una más segura!) |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` |

> 💡 **¿Dónde encuentro la DATABASE_URL?** En [neon.tech](https://neon.tech), en tu proyecto → **"Connection Details"** → copia la cadena de conexión que empieza por `postgresql://...`.

### 2.4 — Desplegar
Haz clic en **"Create Web Service"**. Render tardará entre 2-5 minutos en construir y arrancar la API.

✅ **Verificación**: Una vez desplegado, Render te dará una URL del tipo:
`https://eneba-clone-api.onrender.com`

Visítala en el navegador. Deberías ver: `{"message": "Eneba Clone API is running ✅"}`

> ⚠️ **Nota sobre el plan gratuito de Render**: El servidor se "duerme" tras 15 minutos de inactividad. La primera petición tardará ~30 segundos en "despertar". Es normal.

---

## 🔗 Paso 3: Conectar el Frontend con el Backend de Render

Ahora tienes que decirle al frontend dónde está el backend en producción.

### 3.1 — Actualizar `endpoints.js`
Abre el archivo `frontend/js/api/endpoints.js` y **reemplaza la URL** de Render:

```javascript
// ANTES (placeholder):
const RENDER_BACKEND_URL = 'https://tu-app.onrender.com';

// DESPUÉS (tu URL real):
const RENDER_BACKEND_URL = 'https://eneba-clone-api.onrender.com';
```

### 3.2 — Subir el cambio a GitHub
```bash
git add frontend/js/api/endpoints.js
git commit -m "config: update Render backend URL for production"
git push
```

---

## 🌐 Paso 4: Publicar el Frontend en GitHub Pages

### 4.1 — Configurar GitHub Pages
1. En tu repositorio de GitHub, ve a **Settings** → **Pages** (en el menú lateral izquierdo).
2. En **"Source"**, selecciona **"Deploy from a branch"**.
3. Elige la rama `main` y la carpeta `/docs`.

> ⚠️ **Problema**: GitHub Pages publica desde la raíz `/` o desde `/docs`, no desde `/frontend`. Tenemos dos opciones:

**Opción A (Recomendada)**: Renombrar `frontend/` a `docs/`
```bash
# En tu terminal local:
git mv frontend docs
git commit -m "refactor: rename frontend to docs for GitHub Pages"
git push
```
Después en GitHub Pages elige la carpeta `/docs`.

**Opción B**: Dejar `frontend/` tal cual y cambiar GitHub Pages para que use la raíz `/`. Pero esto mezcla el backend y el frontend en la raíz, lo que puede causar confusión.

### 4.2 — Obtener la URL de GitHub Pages
GitHub Pages tardará 1-2 minutos en publicar la web. La URL tendrá este formato:
`https://TU-USUARIO.github.io/eneba-clone-mvp/`

Si elegiste "Opción A", las páginas estarán en:
- `https://TU-USUARIO.github.io/eneba-clone-mvp/index.html`
- `https://TU-USUARIO.github.io/eneba-clone-mvp/store.html`
- etc.

### 4.3 — Actualizar CORS en el Backend (Ultima conexión)
Para más seguridad, actualiza `backend/main.py` para restringir CORS solo a tu dominio de GitHub:

```python
# En backend/main.py:
ALLOWED_ORIGINS = [
    "http://localhost:5500",      # Desarrollo local
    "http://127.0.0.1:5500",
    "https://TU-USUARIO.github.io",  # ← Tu URL real de GitHub Pages
]
```

Luego haz commit y push. Render se actualizará automáticamente.

---

## ✅ Paso 5: Verificación Final

Comprueba que todo funciona enviando estas peticiones desde tu navegador:

1. Abre `https://TU-USUARIO.github.io/eneba-clone-mvp/index.html`
2. Los juegos del catálogo deberían cargarse (vienen de Neon.tech via Render).
3. Prueba a registrarte con un usuario nuevo.
4. Accede a la Tienda y aplica filtros.

Si algo falla, revisa la consola del navegador (F12) para ver errores de red.

---

## 🔁 Flujo de Actualizaciones Futuras

Para hacer cambios en la web después del despliegue:
1. Modifica los archivos en local.
2. `git add . && git commit -m "descripción del cambio" && git push`
3. Render redesplegará el backend automáticamente.
4. GitHub Pages actualizará el frontend en 1-2 minutos.

---

*¡Tu Eneba Clone MVP está en producción y accesible para todo el mundo!* 🎉
