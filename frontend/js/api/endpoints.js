/**
 * endpoints.js
 *
 * Centraliza todas las URLs de la API.
 * Detecta automáticamente si estamos en desarrollo local o producción.
 *
 * ⚙️  PARA DESPLEGAR: Cuando tengas tu URL de Render, reemplaza el valor
 *    de RENDER_BACKEND_URL con tu dirección real.
 */

// 👇 CAMBIA ESTO con tu URL real de Render cuando la tengas
const RENDER_BACKEND_URL = 'https://tu-app.onrender.com';

const getBaseUrl = () => {
    const isLocalhost = window.location.hostname === 'localhost'
        || window.location.hostname === '127.0.0.1';
    return isLocalhost ? 'http://127.0.0.1:8000' : RENDER_BACKEND_URL;
};

export const BASE_URL = getBaseUrl();

export const ENDPOINTS = {
    products: `${BASE_URL}/products`,
    seed: `${BASE_URL}/seed`,
    auth: `${BASE_URL}/auth`,
    adminUsers: `${BASE_URL}/admin/users`,
};
