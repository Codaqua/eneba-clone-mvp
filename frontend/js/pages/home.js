/**
 * home.js
 * 
 * Lógica para la página de Inicio (Hero y Ofertas Destacadas).
 */

import { api } from '../api/client.js';
import { ENDPOINTS } from '../api/endpoints.js';
import { createProductCardHTML } from '../components/cards.js';
import { cartStorage, favStorage } from '../components/navbar.js';

export const initHome = async () => {
    const featuredContainer = document.getElementById('featured-products');
    if (!featuredContainer) return;

    try {
        // Obtenemos los productos y mostramos los 4 primeros como "destacados"
        const products = await api.get(ENDPOINTS.products);
        const featured = products.slice(0, 4);

        if (featured.length === 0) {
            featuredContainer.innerHTML = '<p>No hay ofertas destacadas actualmente.</p>';
            return;
        }

        featuredContainer.innerHTML = '';
        featured.forEach(product => {
            const cardHTML = createProductCardHTML(product);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHTML;
            const cardElement = tempDiv.firstElementChild;

            // Re-bind eventos (igual que en store.js)
            const addBtn = cardElement.querySelector('.btn-add-direct');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const added = cartStorage.add(product);
                    if (added) {
                        alert(`¡${product.title} añadido al carrito!`);
                    } else {
                        alert('Este producto ya está en tu carrito.');
                    }
                });
            }

            const favBtn = cardElement.querySelector('.btn-fav');
            if (favBtn) {
                favBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const added = favStorage.toggle(product.id);
                    favBtn.classList.toggle('active');
                    favBtn.textContent = added ? '❤️' : '🤍';
                });
            }

            // 3. Eventos ADMIN (Edit/Delete) - Si es admin
            const deleteBtn = cardElement.querySelector('.btn-admin-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm(`¿Seguro que quieres borrar "${product.title}"?`)) {
                        try {
                            await api.delete(`${ENDPOINTS.products}/${product.id}`);
                            initHome(); // Recarga la home
                        } catch (err) {
                            alert("No tienes permisos o ocurrió un error.");
                        }
                    }
                });
            }

            const editBtn = cardElement.querySelector('.btn-admin-edit');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.location.href = `admin.html?id=${product.id}`;
                });
            }

            featuredContainer.appendChild(cardElement);
        });

    } catch (error) {
        console.error("Error loading home products:", error);
        featuredContainer.innerHTML = '<p>Lo sentimos, no pudimos cargar las ofertas.</p>';
    }
};
