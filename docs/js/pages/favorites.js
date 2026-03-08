/**
 * favorites.js
 * 
 * Lógica para la página de favoritos del cliente.
 */

import { api } from '../api/client.js';
import { ENDPOINTS } from '../api/endpoints.js';
import { createProductCardHTML, createSkeletonCardHTML } from '../components/cards.js';
import { favStorage, cartStorage } from '../components/navbar.js';
import { session } from '../auth/session.js';

export const initFavoritesPage = async () => {
    const container = document.getElementById('favorites-container');
    if (!container) return;

    // Si no hay sesión de cliente, avisamos
    if (!session.isAuthenticated() || session.getRole() !== 'client') {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p>Inicia sesión como Cliente para ver tus favoritos.</p>
                <a href="auth.html" class="btn-primary" style="display:inline-block; margin-top:1rem;">Ir al Login</a>
            </div>
        `;
        return;
    }

    const loadFavorites = async () => {
        const favIds = favStorage.get();
        if (favIds.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 2rem; color: var(--text-secondary);">Aún no tienes juegos favoritos. ¡Explora la tienda!</p>';
            return;
        }

        // Mostrar esqueletos mientras carga
        container.innerHTML = Array(favIds.length).fill(null).map(createSkeletonCardHTML).join('');

        try {
            // Obtenemos todos los productos para filtrar por ID
            // En una App real, habría un endpoint GET /products?ids=1,2,3
            const allProducts = await api.get(ENDPOINTS.products);
            const favProducts = allProducts.filter(p => favIds.includes(p.id));

            if (favProducts.length === 0) {
                container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">No se encontraron tus favoritos en el catálogo actual.</p>';
                return;
            }

            container.innerHTML = '';
            favProducts.forEach(product => {
                const cardHTML = createProductCardHTML(product);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cardHTML;
                const cardElement = tempDiv.firstElementChild;

                // --- BIND EVENTOS (Igual que en store.js y home.js) ---

                // 1. Añadir al carrito
                const addBtn = cardElement.querySelector('.btn-add-direct');
                if (addBtn) {
                    addBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const added = cartStorage.add(product);
                        if (added) {
                            alert(`¡${product.title} añadido al carrito!`);
                        }
                    });
                }

                // 2. Quitar de favoritos (Corazón)
                const favBtn = cardElement.querySelector('.btn-fav');
                if (favBtn) {
                    favBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        favStorage.toggle(product.id);
                        // En la página de favoritos, si quitas el corazón, lo ideal es que desaparezca la tarjeta
                        cardElement.style.opacity = '0';
                        cardElement.style.transform = 'scale(0.9)';
                        setTimeout(() => {
                            cardElement.remove();
                            // Si era el último, mostramos mensaje de vacío
                            if (container.children.length === 0) {
                                container.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:2rem; color: var(--text-secondary);">Has vaciado tu lista de favoritos.</p>';
                            }
                        }, 300);
                    });
                }

                container.appendChild(cardElement);
            });

        } catch (error) {
            console.error("Error loading favorites:", error);
            container.innerHTML = '<p style="color: red; grid-column: 1/-1; text-align:center;">Error al cargar tus favoritos.</p>';
        }
    };

    loadFavorites();
};
