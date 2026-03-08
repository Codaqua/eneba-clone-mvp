/**
 * admin.js
 * 
 * Lógica del panel de administración (Crear/Editar/Borrar productos).
 * Protegido por rol 'admin'.
 */

import { api } from '../api/client.js';
import { ENDPOINTS } from '../api/endpoints.js';
import { session } from '../auth/session.js';

export const initAdminPage = () => {
    const adminContent = document.getElementById('admin-content');
    const prodForm = document.getElementById('prod-form');
    const formTitle = document.getElementById('form-title');
    const btnCancel = document.getElementById('btn-cancel');
    const btnSave = document.getElementById('btn-save');
    const inputId = document.getElementById('prod-id');
    const tbody = document.getElementById('admin-products-tbody');

    // Verificamos Auth y Rol
    if (!session.isAuthenticated() || session.getRole() !== 'admin') {
        alert("Acceso denegado. Se requiere cuenta de Administrador.");
        window.location.href = 'auth.html';
        return;
    }

    if (adminContent) adminContent.style.display = 'grid';

    // Rellenar tabla
    const loadAdminProducts = async () => {
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando catálogo...</td></tr>';

        try {
            const products = await api.get(ENDPOINTS.products);
            tbody.innerHTML = '';

            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay productos en el catálogo.</td></tr>';
                return;
            }

            products.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div style="display:flex; align-items:center; gap:0.8rem;">
                            <img src="${p.image_url || 'https://placehold.co/40x50'}" alt="${p.title}" onerror="this.src='https://placehold.co/40x50/1a1a1a/ffffff?text=X';">
                            <div style="font-weight:600;">${p.title}</div>
                        </div>
                    </td>
                    <td><span class="platform-badge" style="position:static; padding:4px 8px;">${p.platform}</span></td>
                    <td style="font-weight:700; color:#10b981;">${p.price.toFixed(2)}€</td>
                    <td>${p.stock} uds</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-admin-edit" title="Editar datos del juego">Editar</button>
                            <button class="btn-admin-delete" title="Eliminar juego permanentemente">Borrar</button>
                        </div>
                    </td>
                `;

                // Bind Eventos
                tr.querySelector('.btn-admin-edit').onclick = () => loadProductIntoForm(p);
                tr.querySelector('.btn-admin-delete').onclick = async () => {
                    if (confirm(`¿Estás seguro de que deseas ELIMINAR "${p.title}" del catálogo? esta acción no se puede deshacer.`)) {
                        try {
                            await api.delete(`${ENDPOINTS.products}/${p.id}`);
                            loadAdminProducts();
                            if (inputId.value === String(p.id)) resetForm();
                        } catch (err) {
                            alert("Error al eliminar el producto.");
                        }
                    }
                };

                tbody.appendChild(tr);
            });

        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="5" style="color:#ef4444; text-align:center;">Error al conectar con la base de datos.</td></tr>';
        }
    };

    // Card/Form Logic
    const loadProductIntoForm = (product) => {
        formTitle.textContent = `Modificando: ${product.title}`;
        btnSave.textContent = "Actualizar Cambios";
        btnCancel.style.display = 'block';

        inputId.value = product.id;
        document.getElementById('prod-title').value = product.title || '';
        document.getElementById('prod-description').value = product.description || '';
        const activePlatforms = (product.platform || "").split(",").map(s => s.trim());
        document.querySelectorAll('input[name="platform"]').forEach(cb => {
            cb.checked = activePlatforms.includes(cb.value);
        });

        document.getElementById('prod-price').value = product.price;
        document.getElementById('prod-discount').value = product.discount || 0;
        document.getElementById('prod-stock').value = product.stock || 0;
        document.getElementById('prod-image').value = product.image_url || '';

        const gallery = document.getElementById('prod-gallery');
        if (gallery) {
            gallery.value = (product.additional_images || "").split(",").join("\n");
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        prodForm.reset();
        inputId.value = '';
        formTitle.textContent = 'Añadir Nuevo Juego';
        btnSave.textContent = "Guardar Producto";
        btnCancel.style.display = 'none';
    };

    if (btnCancel) btnCancel.onclick = resetForm;

    // CRUD Submission
    if (prodForm) {
        prodForm.onsubmit = async (e) => {
            e.preventDefault();
            const id = inputId.value;

            const selectedPlatforms = Array.from(document.querySelectorAll('input[name="platform"]:checked'))
                .map(cb => cb.value)
                .join(", ");

            const galleryUrls = document.getElementById('prod-gallery').value
                .split("\n")
                .map(s => s.trim())
                .filter(s => s !== "")
                .join(",");

            const productData = {
                title: document.getElementById('prod-title').value,
                description: document.getElementById('prod-description').value || null,
                platform: selectedPlatforms || "PC", // Valor por defecto si nada está marcado
                price: parseFloat(document.getElementById('prod-price').value),
                discount: parseFloat(document.getElementById('prod-discount').value) || 0,
                stock: parseInt(document.getElementById('prod-stock').value) || 0,
                image_url: document.getElementById('prod-image').value || null,
                additional_images: galleryUrls || null
            };

            try {
                if (id) {
                    await api.put(`${ENDPOINTS.products}/${id}`, productData);
                    alert("¡Producto actualizado correctamente!");
                } else {
                    await api.post(ENDPOINTS.products, productData);
                    alert("¡Nuevo juego añadido al catálogo!");
                }
                resetForm();
                loadAdminProducts();
            } catch (error) {
                alert("Hubo un error al procesar la solicitud. Revisa los datos.");
            }
        };
    }

    loadAdminProducts();
};
