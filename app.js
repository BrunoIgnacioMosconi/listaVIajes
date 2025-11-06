// Default list
const defaultList = [
  { emoji: '👔', name: 'Ropa', items: [
    'Ambo', 'Bermudas', 'Buzos', 'Camisas', 'Campera liviana',
    'Jean', 'Mallas', 'Pantalones', 'Pijama', 'Pullover', 'Remeras'
  ]},
  { emoji: '🧥', name: 'Ropa de abrigo', items: [
    'Bufanda', 'Campera abrigada', 'Gorro', 'Guantes',
    'Piloto/Impermeable'
  ]},
  { emoji: '🏃‍♂️', name: 'Ropa deportiva', items: [
    'Buzo/campera técnica', 'Calzas/Mallas de running', 'Gorra/Visera deportiva',
    'Jogger deportivo', 'Medias deportivas', 'Remera',
    'Rompeviento', 'Short deportivo', 'Toalla de gym'
  ]},
    { emoji: '👟', name: 'Calzado', items: [
     'Crocs / Ojotas', 'Zapatillas / Deportivas', 'Zapatos'
    ]},
  { emoji: '🩲', name: 'Ropa Interior', items: ['Calzoncillos', 'Medias / Medias zapatos'] },
    { emoji: '🎩', name: 'Accesorios', items: [
        'Almohada de viaje', 'Antifaz para dormir', 'Botella de agua reutilizable',
        'Cinturón', 'Corbata', 'Gorra', 'Lentes de sol', 'Paraguas', 'Reloj'
    ]},
    { emoji: '🧴', name: 'Higiene Personal', items: [
        'Afeitadora', 'Algodón', 'Bolsa para ropa sucia', 'Cepillo de dientes', 'Cortauñas', 'Cremas',
        'Dentífrico', 'Desodorante', 'Espuma de afeitar', 'Hilo dental', 'Hisopos',
        'Jabón', 'Ortodoncias', 'Papel higiénico', 'Peine', 'Perfume',
        'Protector Solar', 'Rodillo quita pelusa', 'Shampoo', 'Toalla'
    ]},
  { emoji: '📄', name: 'Documentos de viaje', items: [
    'Copias de documentos (físicas/digitales)', 'Libreta y birome', 'Papeles alojamientos',
    'Pasajes/QR (Tienda León, etc.)', 'Seguro de viaje', 'Victorinox'
  ]},
  { emoji: '💳', name: 'Documentos personales y dinero', items: [
    'Carnet de conducir', 'Cédula', 'Credencial de la ofi', 'DNI', 'Efectivo (y USD)',
    'Llaves auto (duplicado)', 'Llaves depto', 'Pasaporte',
    'Tarjeta de Crédito / Débito (de la empresa también)', 'Visa'
  ]},
    { emoji: '🔌', name: 'Electrónicos', items: [
        'Adaptador', 'AirTag', 'Auriculares (personal/trabajo)', 'Cargador inalámbrico',
        'Cargadores (Notebook, celular)', 'Celular',
        ,'Mouse', 'Notebook', 'Parlante', 'Zapatilla eléctrica'
    ]},
  { emoji: '💊', name: 'Salud', items: [
    'Antialérgico', 'Curitas', 'Ibuprofeno/Paracetamol', 'Medicamentos', 'OFF'
  ]},
  { emoji: '🧉', name: 'Mate y Snacks', items: [
    'Bebida viaje', 'Bombilla', 'Conservadora', 'Galletitas', 'Golosinas',
    'Mate', 'Termos', 'Yerba'
  ]},
  { emoji: '🛏️', name: 'Ropa de Cama', items: ['Sábanas'] },
  { emoji: '🎮', name: 'Entretenimiento', items: [
    'Cartas', 'Juegos de mesa', 'Kindle/Libro', 'Playlists/Series descargadas'
  ]}
];

let list = [];
let checks = {};
let editCat = null;
let editItem = null;

// Init
function init() {
    const saved = localStorage.getItem('list');
    list = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultList));
    checks = JSON.parse(localStorage.getItem('checks') || '{}');

    // Initialize missing checks
    list.forEach((cat, ci) => {
        cat.items.forEach((_, ii) => {
            const key = `${ci}-${ii}`;
            if (checks[key] === undefined) checks[key] = false;
        });
    });
    localStorage.setItem('checks', JSON.stringify(checks));

    render();
    updateProgress();

    // Events
    document.getElementById('menuBtn').onclick = () => openModal('menuModal');
    document.getElementById('addCategoryBtn').onclick = () => { editCat = null; openModal('categoryModal'); };
    document.getElementById('saveCategoryBtn').onclick = saveCategory;
    document.getElementById('saveItemBtn').onclick = saveItem;
    document.getElementById('resetAllBtn').onclick = resetChecks;
    document.getElementById('exportBtn').onclick = exportData;
    document.getElementById('importBtn').onclick = () => document.getElementById('importFileInput').click();
    document.getElementById('resetDataBtn').onclick = resetAll;
    document.getElementById('importFileInput').onchange = e => importData(e.target.files[0]);

    document.querySelectorAll('.modal-close, .btn-secondary[data-modal]').forEach(btn => {
        btn.onclick = () => closeModal(btn.dataset.modal || btn.closest('.modal').id);
    });

    document.querySelectorAll('.modal').forEach(m => {
        m.addEventListener('click', e => {
            if (e.target === m) closeModal(m.id);
        });
    });

    document.getElementById('categoryName').addEventListener('keypress', e => {
        if (e.key === 'Enter') saveCategory();
    });
    document.getElementById('itemName').addEventListener('keypress', e => {
        if (e.key === 'Enter') saveItem();
    });
}

// Render
function render() {
    const container = document.getElementById('checklistContainer');
    if (!list.length) {
        container.innerHTML = '<div style="text-align:center;padding:3rem;color:#64748b"><h2>📝 No hay categorías</h2><p>Agregá una con el botón ➕</p></div>';
        return;
    }
    container.innerHTML = list.map((cat, ci) => {
        const done = cat.items.filter((_, ii) => checks[`${ci}-${ii}`]).length;
        return `
            <div class="category" data-ci="${ci}">
                <div class="category-header">
                    <div class="category-title" onclick="this.closest('.category').classList.toggle('collapsed')">
                        <span>${cat.emoji}</span><span>${cat.name}</span><span class="toggle-icon">▼</span>
                    </div>
                    <div class="category-actions">
                        <button class="category-btn" onclick="addItemModal(${ci})">➕</button>
                        <button class="category-btn" onclick="editCategoryModal(${ci})">✏️</button>
                        <button class="category-btn" onclick="deleteCat(${ci})">🗑️</button>
                    </div>
                    <div class="category-stats">${done}/${cat.items.length}</div>
                </div>
                <div class="items-list">
                    ${cat.items.map((item, ii) => {
                        const key = `${ci}-${ii}`;
                        const checked = checks[key];
                        return `
                            <div class="item ${checked ? 'checked' : ''}">
                                <input type="checkbox" id="i${key}" ${checked ? 'checked' : ''} onchange="toggleCheck('${key}', this.checked)">
                                <label for="i${key}">${item}</label>
                                <div class="item-actions">
                                    <button class="item-btn" onclick="editItemModal(${ci}, ${ii})">✏️</button>
                                    <button class="item-btn" onclick="deleteItem(${ci}, ${ii})">🗑️</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    <button class="add-item-btn" onclick="addItemModal(${ci})">➕ Agregar item</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateProgress() {
    const total = Object.keys(checks).length;
    const done = Object.values(checks).filter(Boolean).length;
    document.getElementById('progress').textContent = `${done}/${total}`;
}

// Categories
function saveCategory() {
    const emoji = document.getElementById('categoryEmoji').value.trim() || '📦';
    const name = document.getElementById('categoryName').value.trim();
    if (!name) return notify('⚠️ El nombre es obligatorio');

    if (editCat !== null) {
        list[editCat] = { ...list[editCat], emoji, name };
        notify('✅ Categoría actualizada');
    } else {
        list.push({ emoji, name, items: [] });
        notify('✅ Categoría agregada');
    }
    save();
    closeModal('categoryModal');
}

function editCategoryModal(ci) {
    editCat = ci;
    document.getElementById('categoryModalTitle').textContent = '✏️ Editar Categoría';
    document.getElementById('categoryEmoji').value = list[ci].emoji;
    document.getElementById('categoryName').value = list[ci].name;
    openModal('categoryModal');
}

function deleteCat(ci) {
    if (!confirm(`¿Eliminar "${list[ci].name}"?`)) return;
    list[ci].items.forEach((_, ii) => delete checks[`${ci}-${ii}`]);
    list.splice(ci, 1);

    // Reindex checks
    const newChecks = {};
    list.forEach((cat, nci) => {
        cat.items.forEach((_, ii) => {
            const oldKey = `${ci > nci ? nci : nci + 1}-${ii}`;
            if (checks[oldKey] !== undefined) newChecks[`${nci}-${ii}`] = checks[oldKey];
        });
    });
    checks = newChecks;
    save();
    notify('✅ Categoría eliminada');
}

// Items
function saveItem() {
    const name = document.getElementById('itemName').value.trim();
    if (!name) return notify('⚠️ El nombre es obligatorio');

    if (editItem !== null) {
        list[editCat].items[editItem] = name;
        notify('✅ Item actualizado');
    } else {
        list[editCat].items.push(name);
        checks[`${editCat}-${list[editCat].items.length - 1}`] = false;
        notify('✅ Item agregado');
    }
    save();
    closeModal('itemModal');
}

function addItemModal(ci) {
    editCat = ci;
    editItem = null;
    document.getElementById('itemModalTitle').textContent = '➕ Nuevo Item';
    document.getElementById('itemName').value = '';
    openModal('itemModal');
}

function editItemModal(ci, ii) {
    editCat = ci;
    editItem = ii;
    document.getElementById('itemModalTitle').textContent = '✏️ Editar Item';
    document.getElementById('itemName').value = list[ci].items[ii];
    openModal('itemModal');
}

function deleteItem(ci, ii) {
    if (!confirm(`¿Eliminar "${list[ci].items[ii]}"?`)) return;
    delete checks[`${ci}-${ii}`];
    list[ci].items.splice(ii, 1);

    // Reindex
    list[ci].items.forEach((_, ni) => {
        if (ni >= ii) {
            const oldKey = `${ci}-${ni + 1}`;
            const newKey = `${ci}-${ni}`;
            if (checks[oldKey] !== undefined) {
                checks[newKey] = checks[oldKey];
                delete checks[oldKey];
            }
        }
    });
    save();
    notify('✅ Item eliminado');
}

// Checks
function toggleCheck(key, checked) {
    checks[key] = checked;
    localStorage.setItem('checks', JSON.stringify(checks));
    updateProgress();
    updateCategoryStats(key);
}

function updateCategoryStats(key) {
    const [ci] = key.split('-').map(Number);
    const category = list[ci];
    if (!category) return;

    const done = category.items.filter((_, ii) => checks[`${ci}-${ii}`]).length;
    const statsElement = document.querySelector(`[data-ci="${ci}"] .category-stats`);
    if (statsElement) {
        statsElement.textContent = `${done}/${category.items.length}`;
    }
}

function resetChecks() {
    if (!confirm('¿Desmarcar todos?')) return;
    Object.keys(checks).forEach(k => checks[k] = false);
    localStorage.setItem('checks', JSON.stringify(checks));
    render();
    updateProgress();
    closeModal('menuModal');
    notify('✅ Checks reseteados');
}

function resetAll() {
    if (!confirm('⚠️ ¿BORRAR TODO?')) return;
    if (!confirm('¿Seguro? Se perderá todo.')) return;
    localStorage.clear();
    list = JSON.parse(JSON.stringify(defaultList));
    checks = {};

    // Initialize checks for default list
    list.forEach((cat, ci) => {
        cat.items.forEach((_, ii) => {
            checks[`${ci}-${ii}`] = false;
        });
    });

    save();
    closeModal('menuModal');
    notify('✅ Todo borrado');
}

// Export/Import
function exportData() {
    const data = { list, checks, date: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `checklist-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    notify('✅ Lista exportada');
}

function importData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.list) return notify('❌ Archivo inválido');
            list = data.list;
            checks = data.checks || {};
            save();
            closeModal('menuModal');
            notify('✅ Lista importada');
        } catch {
            notify('❌ Error al leer archivo');
        }
    };
    reader.readAsText(file);
}

// Utils
function save() {
    localStorage.setItem('list', JSON.stringify(list));
    localStorage.setItem('checks', JSON.stringify(checks));
    render();
    updateProgress();
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function notify(msg) {
    // Remove previous notifications
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(notification => notification.remove());

    const n = document.createElement('div');
    n.className = 'notification-toast';
    n.innerHTML = `
        <span>${msg}</span>
        <button onclick="this.parentElement.remove()" style="margin-left:0.5rem;background:none;border:none;cursor:pointer;color:inherit;font-size:1.2rem;padding:0">✕</button>
    `;
    n.style.cssText = 'position:fixed;top:6rem;left:50%;transform:translateX(-50%);background:white;padding:1rem 1.5rem;border-radius:8px;box-shadow:0 10px 15px rgba(0,0,0,0.1);z-index:3000;font-weight:500;display:flex;align-items:center;max-width:90vw';

    document.body.appendChild(n);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (n && n.parentElement) {
            n.remove();
        }
    }, 3000);
}

// Global variable to control update interval
let updateCheckInterval = null;

// PWA
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js')
        .then(registration => {
            console.log('SW registered successfully');

            // Clear any previous interval to avoid duplicates
            if (updateCheckInterval) {
                clearInterval(updateCheckInterval);
            }

            // Check for updates every hour
            updateCheckInterval = setInterval(() => {
                console.log('🔍 Checking for updates...');
                registration.update();
            }, 600000); // 1 hour

            // Listen for when an update is found
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('New version found, installing...');

                newWorker.addEventListener('statechange', () => {
                    console.log('New SW state:', newWorker.state);

                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // New version available, show notification
                            console.log('New version ready to activate');
                            showUpdateNotification();
                        } else {
                            // First installation
                            console.log('First SW installation');
                        }
                    }
                });
            });

            // Check if there's already a SW waiting
            if (registration.waiting) {
                console.log('SW already waiting');
                showUpdateNotification();
            }
        })
        .catch(error => {
            console.log('Error registrando SW:', error);
        });
}

function showUpdateNotification() {
    // Remove previous notification if exists
    const existing = document.querySelector('.update-notification');
    if (existing) existing.remove();

    const updateDiv = document.createElement('div');
    updateDiv.className = 'update-notification';
    updateDiv.innerHTML = `
        <div style="position:fixed;top:0;left:0;right:0;background:#4ade80;color:white;padding:1rem;text-align:center;z-index:9999;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
            <div style="font-weight:600;margin-bottom:0.5rem">🔄 Nueva versión disponible</div>
            <button id="updateNowBtn" style="background:white;color:#16a34a;border:none;padding:0.5rem 1rem;border-radius:4px;font-weight:600;cursor:pointer;margin-right:0.5rem">Actualizar ahora</button>
            <button id="updateLaterBtn" style="background:transparent;color:white;border:1px solid white;padding:0.5rem 1rem;border-radius:4px;cursor:pointer">Después</button>
        </div>
    `;
    document.body.appendChild(updateDiv);

    document.getElementById('updateNowBtn').addEventListener('click', updateApp);
    document.getElementById('updateLaterBtn').addEventListener('click', () => updateDiv.remove());
}

function updateApp() {
    console.log('Updating app...');

    // Remove update bar
    const updateNotif = document.querySelector('.update-notification');
    if (updateNotif) {
        updateNotif.remove();
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration && registration.waiting) {
                // Listen for when new SW takes control
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (!refreshing) {
                        refreshing = true;
                        window.location.reload();
                    }
                });

                // Send message to waiting SW
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            } else {
                // No SW waiting, reload anyway
                window.location.reload();
            }
        });
    } else {
        window.location.reload();
    }
}

let deferredPrompt;
let installPromptShown = false;

window.addEventListener('beforeinstallprompt', e => {
    console.log('beforeinstallprompt event fired');
    e.preventDefault();
    deferredPrompt = e;

    // Show install button
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'block';
    }

    // Optional: show notification about install possibility
    if (!installPromptShown) {
        notify('📲 ¡Puedes instalar esta app!');
        installPromptShown = true;
    }
});

// Detect if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('App installed successfully');
    notify('✅ App instalada correctamente');
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
    deferredPrompt = null;
});

document.getElementById('installBtn').onclick = async () => {
    console.log('Install button clicked');
    if (!deferredPrompt) {
        console.log('No deferred prompt available');
        notify('⚠️ No se puede instalar en este momento');
        return;
    }

    try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        console.log('User choice:', choiceResult.outcome);

        if (choiceResult.outcome === 'accepted') {
            notify('📲 Instalando app...');
        } else {
            notify('ℹ️ Instalación cancelada');
        }

        deferredPrompt = null;
        document.getElementById('installBtn').style.display = 'none';
    } catch (error) {
        console.error('Error during installation:', error);
        notify('❌ Error al instalar');
    }
};

// Start
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

// Installation debug
window.addEventListener('load', () => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App running in standalone mode (already installed)');
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    } else {
        console.log('App running in browser (not installed)');
    }

    // Check PWA installation support
    if ('serviceWorker' in navigator && 'onbeforeinstallprompt' in window) {
        console.log('Browser supports PWA installation');
    } else {
        console.log('Browser does NOT support PWA installation');
    }
});
