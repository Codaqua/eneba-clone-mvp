/**
 * navbar.js
 * 
 * Gestión de la barra de navegación, estado global del carrito y buscador reactivo.
 * Restricciones por rol para Carrito y Favoritos.
 */

import { session } from '../auth/session.js';

/**
 * Función de utilidad Debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export const cartStorage = {
    get: () => {
        if (session.getRole() !== 'client') return [];
        const data = localStorage.getItem('eneba_cart');
        return data ? JSON.parse(data) : [];
    },
    set: (cart) => {
        if (session.getRole() === 'client') {
            localStorage.setItem('eneba_cart', JSON.stringify(cart));
            updateCartCounter();
        }
    },
    add: (product) => {
        if (session.getRole() !== 'client') {
            alert("Debes iniciar sesión como Cliente para usar el carrito.");
            return false;
        }
        const cart = cartStorage.get();
        if (!cart.find(item => item.id === product.id)) {
            cart.push(product);
            cartStorage.set(cart);
            return true;
        }
        return false;
    },
    remove: (productId) => {
        if (session.getRole() !== 'client') return;
        let cart = cartStorage.get();
        cart = cart.filter(item => item.id !== productId);
        cartStorage.set(cart);
    }
};

export const favStorage = {
    get: () => {
        if (session.getRole() !== 'client') return [];
        const data = localStorage.getItem('eneba_favs');
        return data ? JSON.parse(data) : [];
    },
    toggle: (productId) => {
        if (session.getRole() !== 'client') {
            alert("Inicia sesión como Cliente para guardar favoritos.");
            return false;
        }
        let favs = favStorage.get();
        const index = favs.indexOf(productId);
        if (index > -1) {
            favs.splice(index, 1);
        } else {
            favs.push(productId);
        }
        localStorage.setItem('eneba_favs', JSON.stringify(favs));
        return index === -1;
    },
    isFav: (productId) => {
        if (session.getRole() !== 'client') return false;
        return favStorage.get().includes(productId);
    }
};

export const updateCartCounter = () => {
    const countSpans = document.querySelectorAll('.cart-count');
    const cart = cartStorage.get();
    countSpans.forEach(span => {
        span.textContent = cart.length;
        if (cart.length > 0) {
            span.style.transform = 'scale(1.2)';
            setTimeout(() => { span.style.transform = 'scale(1)'; }, 200);
        }
    });
};

export const initNavbar = () => {
    updateCartCounter();

    const cartIcons = document.querySelectorAll('.cart-icon');
    cartIcons.forEach(icon => icon.href = 'cart.html');

    const navLinksContainer = document.querySelector('.nav-links');
    if (navLinksContainer) {
        const dynamicContent = navLinksContainer.querySelectorAll('.dynamic-content');
        dynamicContent.forEach(l => l.remove());

        const loginLink = Array.from(navLinksContainer.querySelectorAll('a')).find(a => a.textContent === 'Login' || a.textContent === 'Logout' || a.classList.contains('user-menu-trigger'));
        if (loginLink) loginLink.remove();

        if (session.isAuthenticated()) {

            const role = session.getRole();
            const userName = role === 'admin' ? 'Administrador' : 'Cliente';

            // Ocultar carrito para Admin
            if (role === 'admin') {
                const cartIcon = navLinksContainer.querySelector('.cart-icon');
                if (cartIcon) cartIcon.style.display = 'none';

                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.textContent = 'Gestión';
                adminLink.className = 'dynamic-content';
                adminLink.style.color = 'var(--accent)';
                navLinksContainer.appendChild(adminLink);
            } else if (role === 'client') {
                const favLink = document.createElement('a');
                favLink.href = 'favorites.html';
                favLink.textContent = 'Favoritos ❤️';
                favLink.className = 'dynamic-content';
                navLinksContainer.appendChild(favLink);
            }

            // --- MENU DE USUARIO REFINADO ---
            const userMenuContainer = document.createElement('div');
            userMenuContainer.className = 'user-menu-container dynamic-content';
            userMenuContainer.innerHTML = `
                <button class="user-menu-trigger" title="${userName}">
                    <svg class="user-svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                </button>
                <div class="user-dropdown">
                    <div class="dropdown-header">${userName}</div>
                    <a href="#" class="dropdown-item">Perfil</a>
                    ${role === 'client' ? '<a href="#" class="dropdown-item">Historial de compras</a>' : ''}
                    <hr class="dropdown-divider">
                    <button class="dropdown-item logout-option">Cerrar sesión</button>
                </div>
            `;
            navLinksContainer.appendChild(userMenuContainer);

            const trigger = userMenuContainer.querySelector('.user-menu-trigger');
            const dropdown = userMenuContainer.querySelector('.user-dropdown');
            const logoutBtn = userMenuContainer.querySelector('.logout-option');

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });

            document.addEventListener('click', () => {
                dropdown.classList.remove('active');
            });

            logoutBtn.addEventListener('click', () => {
                session.logout();
            });

        } else {
            const newLogin = document.createElement('a');
            newLogin.href = 'auth.html';
            newLogin.textContent = 'Login';
            newLogin.className = 'dynamic-content';
            navLinksContainer.appendChild(newLogin);
        }
    }

    // Buscador REACTIVO
    const searchInputs = document.querySelectorAll('.search-bar input');
    searchInputs.forEach(input => {
        const handleSearch = debounce(() => {
            const query = input.value.trim();
            const isOnStorePage = window.location.pathname.includes('store.html');
            if (query.length >= 3 || query.length === 0) {
                if (isOnStorePage) {
                    const searchEvent = new CustomEvent('live-search', { detail: { query } });
                    window.dispatchEvent(searchEvent);
                    const url = new URL(window.location);
                    if (query) url.searchParams.set('search', query);
                    else url.searchParams.delete('search');
                    window.history.replaceState({}, '', url);
                } else if (query.length >= 3) {
                    window.location.href = `store.html?search=${encodeURIComponent(query)}`;
                }
            }
        }, 400);
        input.addEventListener('input', handleSearch);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = input.value.trim();
                window.location.href = `store.html?search=${encodeURIComponent(query)}`;
            }
        });
    });
};
