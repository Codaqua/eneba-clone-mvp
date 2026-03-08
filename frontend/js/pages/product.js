/**
 * product.js
 * 
 * Lógica para la página de detalle del producto.
 * Carga datos del backend y permite acciones de carrito/favoritos.
 */

import { api } from '../api/client.js';
import { ENDPOINTS } from '../api/endpoints.js';
import { cartStorage, favStorage, updateCartCounter } from '../components/navbar.js';
import { session } from '../auth/session.js';

export const initProductPage = async () => {
    const container = document.getElementById('product-detail-container');
    const loading = document.getElementById('product-loading');
    const error = document.getElementById('product-error');

    // 1. Obtener ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        showError();
        return;
    }

    try {
        // 2. Cargar datos del producto
        const product = await api.get(`${ENDPOINTS.products}/${productId}`);

        if (!product) {
            showError();
            return;
        }

        renderProduct(product);

    } catch (err) {
        console.error("Error loading product detail:", err);
        showError();
    }

    function renderProduct(product) {
        const role = session.getRole();
        const isAdmin = role === 'admin';

        // Ocultar cargando, mostrar contenedor
        loading.style.display = 'none';
        container.style.display = 'grid';

        // --- CARRUSEL DE IMÁGENES ---
        const carouselInner = document.getElementById('carousel-inner');
        const indicatorsContainer = document.getElementById('carousel-indicators');
        const btnPrev = document.getElementById('prev-btn');
        const btnNext = document.getElementById('next-btn');

        // Combinar portada con imágenes adicionales
        const allImages = [product.image_url, ...(product.additional_images || "").split(",")]
            .map(url => url.trim())
            .filter(url => url !== "" && url !== "null" && url !== "undefined");

        if (allImages.length === 0) {
            allImages.push('https://placehold.co/800x1000/1a1a1a/ffffff?text=No+Image');
        }

        carouselInner.innerHTML = allImages.map(url => `
            <div class="carousel-item">
                <img src="${url}" alt="${product.title}" onerror="this.src='https://placehold.co/800x1000/1a1a1a/ffffff?text=Image+Error';">
            </div>
        `).join("");

        indicatorsContainer.innerHTML = allImages.map((_, i) => `
            <div class="indicator ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join("");

        // Lógica de Movimiento
        let currentIndex = 0;
        const totalSlides = allImages.length;

        const updateCarousel = () => {
            carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
            document.querySelectorAll('.indicator').forEach((ind, i) => {
                ind.classList.toggle('active', i === currentIndex);
            });
        };

        if (totalSlides > 1) {
            btnPrev.onclick = () => {
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                updateCarousel();
            };
            btnNext.onclick = () => {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateCarousel();
            };
            document.querySelectorAll('.indicator').forEach(ind => {
                ind.onclick = () => {
                    currentIndex = parseInt(ind.dataset.index);
                    updateCarousel();
                };
            });
        } else {
            btnPrev.style.display = 'none';
            btnNext.style.display = 'none';
            indicatorsContainer.style.display = 'none';
        }

        // --- INFO Y PLATAFORMAS ---
        document.getElementById('detail-title').textContent = product.title;
        document.getElementById('detail-description-text').textContent = product.description || 'Sin descripción disponible.';

        const platformsContainer = document.getElementById('detail-platforms-container');
        platformsContainer.innerHTML = (product.platform || "").split(",")
            .map(s => s.trim())
            .filter(s => s !== "")
            .map(p => `<span class="platform-badge" style="position:static;">${p}</span>`)
            .join("");

        // Precios
        const priceFinal = product.discount > 0
            ? (product.price * (1 - product.discount / 100)).toFixed(2)
            : product.price.toFixed(2);

        document.getElementById('detail-price-final').textContent = `${priceFinal}€`;

        const priceOriginal = document.getElementById('detail-price-original');
        if (product.discount > 0) {
            priceOriginal.textContent = `${product.price.toFixed(2)}€`;
            priceOriginal.style.display = 'inline';
        } else {
            priceOriginal.style.display = 'none';
        }

        // --- ACCIONES ---
        const favBtn = document.getElementById('btn-detail-fav');
        const addCartBtn = document.getElementById('btn-detail-add-cart');

        if (isAdmin) {
            favBtn.style.display = 'none';
            addCartBtn.style.display = 'none';
        } else {
            updateFavButtonStyle(product.id);
            favBtn.onclick = () => {
                favStorage.toggle(product.id);
                updateFavButtonStyle(product.id);
            };

            addCartBtn.onclick = () => {
                const added = cartStorage.add(product);
                if (added) alert(`¡${product.title} añadido al carrito!`);
                else alert('Este producto ya está en tu carrito.');
            };
        }
    }

    function updateFavButtonStyle(id) {
        const favBtn = document.getElementById('btn-detail-fav');
        const isFav = favStorage.isFav(id);
        favBtn.textContent = isFav ? '❤️' : '🤍';
        favBtn.classList.toggle('active', isFav);
    }

    function showError() {
        if (loading) loading.style.display = 'none';
        if (container) container.style.display = 'none';
        if (error) error.style.display = 'block';
    }
};
