import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine
from . import models
from .routers import auth, products, admin, seed

# Inicializar Base de Datos
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Eneba Clone API")

# Configuración de CORS: Permite peticiones desde GitHub Pages y desarrollo local
ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    # Añadir aquí la URL de GitHub Pages cuando la tengas:
    # "https://TU-USUARIO.github.io",
    "*",  # Permite todos los orígenes temporalmente (ajustar en producción)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar archivos estáticos solo en desarrollo local
# En producción (Render), el frontend se sirve desde GitHub Pages
IS_DEV = os.getenv("ENVIRONMENT", "production") == "development"
if IS_DEV:
    try:
        app.mount("/static", StaticFiles(directory="frontend"), name="static")
    except Exception:
        pass  # Si la carpeta no existe, ignorar

# Incluir Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(admin.router)
app.include_router(seed.router)

@app.get("/")
def root():
    return {"message": "Eneba Clone API is running ✅"}
