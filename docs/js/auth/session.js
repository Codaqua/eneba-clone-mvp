/**
 * session.js
 * 
 * Gestión de la sesión del usuario (JWT y Roles).
 */

export const session = {
    // Guarda el token y el rol tras un login exitoso
    login: (token, role) => {
        sessionStorage.setItem('eneba_token', token);
        sessionStorage.setItem('eneba_role', role);
    },

    // Recupera el token guardado
    getToken: () => {
        return sessionStorage.getItem('eneba_token');
    },

    // Recupera el rol del usuario actual
    getRole: () => {
        return sessionStorage.getItem('eneba_role');
    },

    // Verifica si hay una sesión activa (token existente)
    isAuthenticated: () => {
        return !!sessionStorage.getItem('eneba_token');
    },

    // Función centralizada para cerrar sesión
    logout: () => {
        sessionStorage.removeItem('eneba_token');
        sessionStorage.removeItem('eneba_role');

        // LIMPIEZA PRIVADA: Borramos carrito y favoritos al cerrar sesión
        localStorage.removeItem('eneba_cart');
        localStorage.removeItem('eneba_favs');

        window.location.href = 'index.html'; // Redirigir siempre a la Home
    }
};
