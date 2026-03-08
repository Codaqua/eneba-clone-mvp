/**
 * store.js
 * 
 * Lógica del catálogo: Peticiones al backend, renderizado y filtros reactivos (live filters).
 */

import { api } from '../api/client.js';
import { ENDPOINTS } from '../api/endpoints.js';
import { createProductCardHTML, createSkeletonCardHTML } from '../components/cards.js';
import { cartStorage, favStorage } from '../components/navbar.js';
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

export const initStore = async () => {
    const container = document.getElementById('products-container');
    const filterForm = document.getElementById('filter-form');
    const platformInputs = document.querySelectorAll('input[name="platform"]');
    const priceInputs = [document.getElementById('price-min'), document.getElementById('price-max')];

    if (!container || !filterForm) return;

    // Estado local de búsqueda (se inicializa con la URL)
    let currentSearch = new URLSearchParams(window.location.search).get('search') || '';

    // Inicializar estado de los inputs desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlPlatform = urlParams.get('platform');
    if (urlPlatform) {
        const radio = document.querySelector(`input[name="platform"][value="${urlPlatform}"]`);
        if (radio) radio.checked = true;
    }
    const urlMin = urlParams.get('price_min');
    const urlMax = urlParams.get('price_max');
    if (urlMin) priceInputs[0].value = urlMin;
    if (urlMax) priceInputs[1].value = urlMax;

    // Función principal de carga
    const loadProducts = async () => {
        container.innerHTML = Array(8).fill(null).map(createSkeletonCardHTML).join('');

        try {
            const fetchParams = new URLSearchParams();

            const activePlatformEl = document.querySelector('input[name="platform"]:checked');
            const activePlatform = activePlatformEl ? activePlatformEl.value : '';
            const activeMin = priceInputs[0].value;
            const activeMax = priceInputs[1].value;

            if (activePlatform) fetchParams.append('platform', activePlatform);
            if (activeMin) fetchParams.append('price_min', activeMin);
            if (activeMax) fetchParams.append('price_max', activeMax);

            // Actualizar URL sin recargar la página
            const newUrlParams = new URLSearchParams(fetchParams);
            if (currentSearch) newUrlParams.set('search', currentSearch);
            window.history.replaceState({}, '', `${window.location.pathname}?${newUrlParams.toString()}`);

            let products = await api.get(`${ENDPOINTS.products}?${fetchParams.toString()}`);

            // Filtro local por búsqueda reactiva
            if (currentSearch) {
                const term = currentSearch.toLowerCase();
                products = products.filter(p =>
                    p.title.toLowerCase().includes(term) ||
                    (p.description && p.description.toLowerCase().includes(term))
                );
            }

            if (products.length === 0) {
                container.innerHTML = `
                    <div class="no-results" style="grid-column: 1/-1;">
                        <img src="https://www.shutterstock.com/image-vector/cute-little-monster-crying-loudly-260nw-1569124693.jpg" alt="No products found">
                        <h3>¡Ups! No hay juegos con esos filtros</h3>
                        <p>Prueba a cambiar tu búsqueda o plataformas.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = '';
            products.forEach(product => {
                const cardHTML = createProductCardHTML(product);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cardHTML;
                const cardElement = tempDiv.firstElementChild;

                // 1. Evento añadir al carrito
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

                // 2. Evento FAVORITO (Corazón)
                const favBtn = cardElement.querySelector('.btn-fav');
                if (favBtn) {
                    favBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const added = favStorage.toggle(product.id);
                        favBtn.classList.toggle('active');
                        favBtn.textContent = added ? '❤️' : '🤍';
                    });
                }

                // 3. Eventos ADMIN (Edit/Delete)
                const deleteBtn = cardElement.querySelector('.btn-admin-delete');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        if (confirm(`¿Seguro que quieres borrar "${product.title}"?`)) {
                            try {
                                await api.delete(`${ENDPOINTS.products}/${product.id}`);
                                loadProducts(); // Recarga la lista
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
                        // Redirigimos al panel con el ID para edición directa
                        window.location.href = `admin.html?id=${product.id}`;
                    });
                }

                container.appendChild(cardElement);
            });

        } catch (error) {
            console.error("Error loading products:", error);
            container.innerHTML = '<p style="color: red; grid-column: 1/-1;">Error al cargar el catálogo.</p>';
        }
    };

    /**
     * REACTIVIDAD: Listener de búsqueda desde la Navbar
     */
    window.addEventListener('live-search', (e) => {
        currentSearch = e.detail.query;
        loadProducts();
    });

    /**
     * REACTIVIDAD: Listener para cambios inmediatos (Plataformas)
     */
    platformInputs.forEach(input => {
        input.addEventListener('change', () => loadProducts());
    });

    /**
     * REACTIVIDAD: Listener con Debounce para precios
     */
    const debouncedLoad = debounce(() => loadProducts(), 500);
    priceInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', debouncedLoad);
        }
    });

    // Ocultar botón redundante
    const applyBtn = document.getElementById('apply-filters');
    if (applyBtn) applyBtn.style.display = 'none';

    // Botón Ir Arriba (Back to Top)
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Carga inicial
    loadProducts();
};
