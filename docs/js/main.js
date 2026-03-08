/**
 * main.js
 * 
 * Punto de entrada de la aplicación.
 * Orquesta la carga de los componentes según la URL de la página.
 */

import { initNavbar } from './components/navbar.js';
import { initHome } from './pages/home.js';
import { initStore } from './pages/store.js';
import { initCartPage } from './pages/cart.js';
import { initAuthPage } from './pages/auth.js';
import { initFavoritesPage } from './pages/favorites.js';
import { initAdminPage } from './pages/admin.js';
import { initProductPage } from './pages/product.js';

// Cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {

    // 1. Inicializamos los componentes comunes a todas las páginas (Navbar, Cart listener)
    initNavbar();

    // 2. Routing básico frontend (MVP) según el nombre de archivo o path
    const path = window.location.pathname;

    if (path.includes('index.html') || path.endsWith('/')) {
        initHome();
    }
    else if (path.includes('store.html')) {
        initStore();
    }
    else if (path.includes('cart.html')) {
        initCartPage();
    }
    else if (path.includes('admin.html')) {
        initAdminPage();
    }
    else if (path.includes('auth.html')) {
        initAuthPage();
    }
    else if (path.includes('favorites.html')) {
        initFavoritesPage();
    }
    else if (path.includes('product.html')) {
        initProductPage();
    }
});
