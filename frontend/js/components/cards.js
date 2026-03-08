/**
 * cards.js
 * 
 * Componentes visuales para las tarjetas de producto.
 */

import { favStorage } from './navbar.js';
import { session } from '../auth/session.js';

export const createProductCardHTML = (product) => {
    const isFav = favStorage.isFav(product.id);
    const role = session.getRole();
    const isAdmin = role === 'admin';

    // Verificamos si la imagen es válida
    const isValidURL = (url) => {
        if (!url) return false;
        const clean = String(url).trim().toLowerCase();
        if (clean === 'string' || clean === '' || clean === 'undefined' || clean === 'null') {
            return false;
        }
        return clean.startsWith('http') || clean.startsWith('/') || clean.startsWith('.');
    };

    const imageSource = isValidURL(product.image_url)
        ? product.image_url
        : 'https://placehold.co/400x500/1a1a1a/ffffff?text=No+Image';

    const discountHTML = product.discount > 0
        ? `<span class="discount-badge">-${product.discount}%</span>`
        : '';

    const priceFinal = product.discount > 0
        ? (product.price * (1 - product.discount / 100)).toFixed(2)
        : product.price.toFixed(2);

    const priceOriginalHTML = product.discount > 0
        ? `<span class="price-original">${product.price.toFixed(2)}€</span>`
        : '';
    const platforms = (product.platform || "").split(",").map(s => s.trim()).filter(s => s !== "");
    const platformBadgesHTML = `
        <div class="platform-badges-container">
            ${platforms.map(p => `<span class="platform-badge">${p}</span>`).join("")}
        </div>
    `;

    // Controles de ADMIN
    const adminControls = isAdmin ? `
        <div class="admin-card-controls">
            <button class="btn-admin-edit" data-id="${product.id}" title="Editar">✏️</button>
            <button class="btn-admin-delete" data-id="${product.id}" title="Eliminar">🗑️</button>
        </div>
    ` : '';

    // Botón favoritos (Solo Clientes)
    const favButtonHTML = role === 'client' ? `
        <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${product.id}" title="Añadir a favoritos">
            ${isFav ? '❤️' : '🤍'}
        </button>
    ` : '';

    // Botón carrito (Solo Clientes)
    const cartButtonHTML = role === 'client' ? `
        <button class="btn-add-direct" data-id="${product.id}">Añadir al carrito</button>
    ` : '';

    return `
        <article class="product-card" data-id="${product.id}">
            ${discountHTML}
            ${platformBadgesHTML}
            ${favButtonHTML}
            ${adminControls}

            <a href="product.html?id=${product.id}" class="product-card-link" style="text-decoration: none; color: inherit; display: contents;">
                <img src="${imageSource}" alt="${product.title}" class="product-image" 
                     onerror="this.src='https://placehold.co/400x500/1a1a1a/ffffff?text=Image+Error'; this.onerror=null;">
                
                <div class="product-info">
                    <h3 class="product-title" title="${product.title}">${product.title}</h3>
                    <div class="product-price-container">
                        ${priceOriginalHTML}
                        <span class="price-final">${priceFinal}€</span>
                    </div>
                </div>
            </a>
            <div class="product-card-actions" style="padding: 0 1rem 1rem 1rem;">
                ${cartButtonHTML}
            </div>
        </article>
    `;
};

export const createSkeletonCardHTML = () => `
    <article class="product-card skeleton">
        <div class="skeleton-img"></div>
        <div class="product-info">
            <div class="skeleton-text title"></div>
            <div class="skeleton-text price"></div>
        </div>
    </article>
`;
