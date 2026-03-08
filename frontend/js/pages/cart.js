/**
 * cart.js
 * 
 * Lógica para la gestión del carrito de la compra y liquidación (checkout).
 */

import { cartStorage } from '../components/navbar.js';
import { session } from '../auth/session.js';

export const initCartPage = () => {
    const cartContent = document.getElementById('cart-content');
    const emptyMsg = document.getElementById('empty-cart-view');
    const itemsContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('subtotal-val');
    const totalEl = document.getElementById('total-val');
    const checkoutForm = document.getElementById('checkout-form');

    // Elementos del Modal
    const successModal = document.getElementById('success-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    if (!cartContent || !emptyMsg) return;

    // Protección de Rol
    if (session.getRole() !== 'client') {
        alert("Inicia sesión como cliente para ver tu carrito.");
        window.location.href = 'auth.html';
        return;
    }

    const renderCart = () => {
        const cart = cartStorage.get();

        if (cart.length === 0) {
            cartContent.style.display = 'none';
            emptyMsg.style.display = 'block';
            return;
        }

        cartContent.style.display = 'grid';
        emptyMsg.style.display = 'none';
        itemsContainer.innerHTML = '';

        let subtotal = 0;

        cart.forEach(item => {
            const priceFinal = item.discount > 0
                ? (item.price * (1 - item.discount / 100))
                : item.price;

            subtotal += priceFinal;

            const itemHTML = `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image_url}" alt="${item.title}" onerror="this.src='https://placehold.co/80x100/1a1a1a/ffffff?text=Error';">
                    <div class="cart-item-info">
                        <h3>${item.title}</h3>
                        <p>${item.platform}</p>
                    </div>
                    <div class="cart-item-price">${priceFinal.toFixed(2)}€</div>
                    <button class="btn-remove-item" data-id="${item.id}" title="Eliminar del carrito">🗑️</button>
                </div>
            `;
            itemsContainer.innerHTML += itemHTML;
        });

        // Actualizar Totales
        subtotalEl.textContent = `${subtotal.toFixed(2)}€`;
        totalEl.textContent = `${subtotal.toFixed(2)}€`;

        // Bind eventos de eliminación
        itemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.onclick = (e) => {
                const id = parseInt(e.target.dataset.id);
                cartStorage.remove(id);
                renderCart();
            };
        });
    };

    // Manejo de Checkout
    if (checkoutForm) {
        checkoutForm.onsubmit = (e) => {
            e.preventDefault();

            const fullName = document.getElementById('full-name').value;
            const address = document.getElementById('address').value;
            const city = document.getElementById('city').value;
            const zip = document.getElementById('zip').value;

            // En lugar de confirm simple, disparamos el MODAL
            successModal.classList.add('active');

            // Limpiamos carrito
            localStorage.removeItem('eneba_cart');
        };
    }

    // Cerrar modal y redirigir
    if (modalCloseBtn) {
        modalCloseBtn.onclick = () => {
            successModal.classList.remove('active');
            window.location.href = 'index.html';
        };
    }

    renderCart();
};
