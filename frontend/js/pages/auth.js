/**
 * auth.js
 * 
 * Lógica de autenticación genérica para Clientes y Administradores.
 */

import { ENDPOINTS } from '../api/endpoints.js';
import { session } from '../auth/session.js';

export const initAuthPage = () => {
    const loginForm = document.getElementById('generic-login-form');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Verificando...';

            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(`${ENDPOINTS.products.replace('/products', '/auth/login')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error al iniciar sesión");
            }

            const data = await response.json();

            // Guardamos sesión
            session.login(data.access_token, data.role);

            // Feedback y Redirección
            if (data.role === 'admin') {
                alert("¡Bienvenido, Administrador! Redirigiendo al panel...");
                window.location.href = 'admin.html';
            } else {
                alert(`¡Hola! Has iniciado sesión como Cliente.`);
                window.location.href = 'index.html';
            }

        } catch (error) {
            alert(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    });
};
