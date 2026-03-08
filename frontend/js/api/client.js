/**
 * client.js
 * 
 * Un wrapper (envoltorio) sobre la Fetch API estándar.
 * Nos permite estandarizar cómo hacemos las peticiones al backend,
 * manejando errores comunes y configurando las cabeceras JSON automáticamente.
 */

import { session } from '../auth/session.js';

/**
 * Función genérica para hacer peticiones HTTP
 * @param {string} url - La URL completa del endpoint
 * @param {object} options - Opciones de fetch (método, body, etc.)
 * @returns {Promise<any>} - La respuesta parseada como JSON
 */
export const apiClient = async (url, options = {}) => {
    try {
        // Configuramos cabeceras por defecto para JSON
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers // Permite sobreescribir si es necesario
        };

        // INTERCEPTOR: Si el usuario está autenticado, añadimos el token JWT
        const token = session.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        const response = await fetch(url, config);

        // Si el backend devuelve 401 Unauthorized, cerramos sesión por seguridad
        if (response.status === 401) {
            console.warn("Token inválido o expirado. Cerrando sesión...");
            session.logout();
            throw new Error("Sesión expirada");
        }

        // Verificamos si la respuesta HTTP es exitosa (código 200-299)
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
        }

        // Si la respuesta no tiene cuerpo (ej. 204 No Content), devolvemos null
        if (response.status === 204) {
            return null;
        }

        // Parseamos y devolvemos el JSON
        return await response.json();

    } catch (error) {
        console.error('API Client Error:', error);
        throw error; // Propagamos el error para que la página lo gestione
    }
};

/**
 * Atajos útiles para los métodos HTTP más comunes
 */
export const api = {
    get: (url) => apiClient(url, { method: 'GET' }),
    post: (url, body) => apiClient(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url, body) => apiClient(url, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (url) => apiClient(url, { method: 'DELETE' })
};
