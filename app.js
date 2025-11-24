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
        'Mouse', 'Notebook', 'Parlante', 'Zapatilla eléctrica'
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
let currentListId = 'default'; // ID de la lista actual

function ensureCategoryNotes(targetList = list) {
    if (!Array.isArray(targetList)) return;
    targetList.forEach(cat => {
        if (!cat || typeof cat !== 'object') return;
        if (typeof cat.note !== 'string') cat.note = '';
    });
}

// List management functions
function getSavedLists() {
    const saved = localStorage.getItem('savedLists');
    return saved ? JSON.parse(saved) : {};
}

function saveCurrentListAs() {
    const listName = document.getElementById('newListName').value.trim();
    if (!listName) return notify('⚠️ Ingresá un nombre para la lista');
    
    const savedLists = getSavedLists();
    const listId = Date.now().toString();
    
    savedLists[listId] = {
        name: listName,
        list: JSON.parse(JSON.stringify(list)),
        checks: JSON.parse(JSON.stringify(checks)),
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
    document.getElementById('newListName').value = '';
    renderSavedLists();
    notify(`✅ Lista "${listName}" guardada`);
}

function loadList(listId) {
    if (listId === 'default') {
        currentListId = 'default';
        list = JSON.parse(JSON.stringify(defaultList));
        checks = {};
        ensureCategoryNotes();
        list.forEach((cat, ci) => {
            cat.items.forEach((_, ii) => {
                checks[`${ci}-${ii}`] = false;
            });
        });
    } else {
        const savedLists = getSavedLists();
        if (savedLists[listId]) {
            currentListId = listId;
            list = JSON.parse(JSON.stringify(savedLists[listId].list));
            checks = JSON.parse(JSON.stringify(savedLists[listId].checks));
            ensureCategoryNotes();
        }
    }
    
    save();
    updateCurrentListName();
    closeModal('listsModal');
    notify(`✅ Lista cargada`);
}

function deleteList(listId) {
    const savedLists = getSavedLists();
    if (!savedLists[listId]) return;
    
    const listName = savedLists[listId].name;
    if (!confirm(`¿Eliminar la lista "${listName}"?`)) return;
    
    delete savedLists[listId];
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
    
    if (currentListId === listId) {
        loadList('default');
    }
    
    renderSavedLists();
    notify(`✅ Lista "${listName}" eliminada`);
}

function renderSavedLists() {
    const container = document.getElementById('savedListsContainer');
    const savedLists = getSavedLists();
    const listIds = Object.keys(savedLists);
    
    // Always show default list at the top
    const isDefaultActive = currentListId === 'default';
    let html = `
        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: ${isDefaultActive ? '#dbeafe' : '#f8fafc'}; border-radius: 8px; margin-bottom: 0.5rem; border: 2px solid #e2e8f0;">
            <div style="flex: 1;">
                <div style="font-weight: 600; color: #1e293b;">📋 Lista predeterminada</div>
                <div style="font-size: 0.75rem; color: #64748b;">Lista original con todos los items</div>
            </div>
            ${!isDefaultActive ? `<button class="btn-primary" onclick="loadList('default')" style="padding: 0.4rem 0.8rem; font-size: 0.875rem;">Cargar</button>` : '<span style="color: #2563eb; font-weight: 600; font-size: 0.875rem;">Activa</span>'}
        </div>
    `;
    
    if (listIds.length === 0) {
        html += '<p style="color: #94a3b8; text-align: center; padding: 1rem; margin-top: 0.5rem;">No hay listas personalizadas guardadas</p>';
    } else {
        html += '<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;"><div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Listas personalizadas:</div>';
        html += listIds.map(listId => {
            const listData = savedLists[listId];
            const isActive = currentListId === listId;
            return `
                <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: ${isActive ? '#dbeafe' : '#f8fafc'}; border-radius: 8px; margin-bottom: 0.5rem;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #1e293b;">${listData.name}</div>
                        <div style="font-size: 0.75rem; color: #64748b;">${new Date(listData.createdAt).toLocaleDateString()}</div>
                    </div>
                    ${!isActive ? `<button class="btn-primary" onclick="loadList('${listId}')" style="padding: 0.4rem 0.8rem; font-size: 0.875rem;">Cargar</button>` : '<span style="color: #2563eb; font-weight: 600; font-size: 0.875rem;">Activa</span>'}
                    <button class="btn-secondary" onclick="deleteList('${listId}')" style="padding: 0.4rem 0.8rem; font-size: 0.875rem;">🗑️</button>
                </div>
            `;
        }).join('');
        html += '</div>';
    }
    
    container.innerHTML = html;
}

function updateCurrentListName() {
    const nameElement = document.getElementById('currentListName');
    if (!nameElement) return;
    
    if (currentListId === 'default') {
        nameElement.textContent = 'Lista predeterminada';
    } else {
        const savedLists = getSavedLists();
        if (savedLists[currentListId]) {
            nameElement.textContent = savedLists[currentListId].name;
        }
    }
}

// Init
function init() {
    // Load current list context
    const savedCurrentId = localStorage.getItem('currentListId');
    if (savedCurrentId && savedCurrentId !== 'default') {
        const savedLists = getSavedLists();
        if (savedLists[savedCurrentId]) {
            currentListId = savedCurrentId;
            list = JSON.parse(JSON.stringify(savedLists[savedCurrentId].list));
            checks = JSON.parse(JSON.stringify(savedLists[savedCurrentId].checks));
        } else {
            // If list doesn't exist anymore, load default
            currentListId = 'default';
            list = JSON.parse(JSON.stringify(defaultList));
            checks = {};
        }
    } else {
        // Load default list
        currentListId = 'default';
        const saved = localStorage.getItem('list');
        list = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultList));
        checks = JSON.parse(localStorage.getItem('checks') || '{}');
    }

    ensureCategoryNotes();

    // Initialize missing checks
    list.forEach((cat, ci) => {
        cat.items.forEach((_, ii) => {
            const key = `${ci}-${ii}`;
            if (checks[key] === undefined) checks[key] = false;
        });
    });
    
    save();
    updateCurrentListName();

    // Events
    document.getElementById('menuBtn').onclick = () => openModal('menuModal');
    document.getElementById('currentListName').ondblclick = toggleAllCategories;
    document.getElementById('addCategoryBtn').onclick = () => {
        editCat = null;
        document.getElementById('categoryModalTitle').textContent = '➕ Nueva Categoría';
        document.getElementById('categoryEmoji').value = '';
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryNote').value = '';
        openModal('categoryModal');
    };
    document.getElementById('saveCategoryBtn').onclick = saveCategory;
    document.getElementById('saveItemBtn').onclick = saveItem;
    document.getElementById('resetAllBtn').onclick = resetChecks;
    document.getElementById('exportBtn').onclick = exportData;
    document.getElementById('importBtn').onclick = () => document.getElementById('importFileInput').click();
    document.getElementById('resetDataBtn').onclick = resetAll;
    document.getElementById('importFileInput').onchange = e => importData(e.target.files[0]);
    document.getElementById('manageListsBtn').onclick = () => {
        renderSavedLists();
        closeModal('menuModal');
        openModal('listsModal');
    };
    document.getElementById('saveNewListBtn').onclick = saveCurrentListAs;

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
    document.getElementById('newListName').addEventListener('keypress', e => {
        if (e.key === 'Enter') saveCurrentListAs();
    });
}

// Toggle all categories
function toggleAllCategories() {
    const categories = document.querySelectorAll('.category');
    if (categories.length === 0) return;
    
    // Check if any category is expanded
    const anyExpanded = Array.from(categories).some(cat => !cat.classList.contains('collapsed'));
    
    // If any is expanded, collapse all. Otherwise, expand all
    categories.forEach(cat => {
        if (anyExpanded) {
            cat.classList.add('collapsed');
        } else {
            cat.classList.remove('collapsed');
        }
    });
    
    notify(anyExpanded ? '📦 Todas minimizadas' : '📂 Todas expandidas');
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
                ${cat.note ? `<div class="category-note">${cat.note}</div>` : ''}
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
    const note = document.getElementById('categoryNote').value.trim();
    if (!name) return notify('⚠️ El nombre es obligatorio');

    if (editCat !== null) {
        list[editCat] = { ...list[editCat], emoji, name, note };
        notify('✅ Categoría actualizada');
    } else {
        list.push({ emoji, name, note, items: [] });
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
    document.getElementById('categoryNote').value = list[ci].note || '';
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
    save(); // Use save() to handle proper context
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
    save(); // Use save() to handle proper context
    closeModal('menuModal');
    notify('✅ Checks reseteados');
}

function resetAll() {
    if (!confirm('⚠️ ¿BORRAR TODO?')) return;
    if (!confirm('¿Seguro? Se perderá todo.')) return;
    localStorage.clear();
    list = JSON.parse(JSON.stringify(defaultList));
    checks = {};
    ensureCategoryNotes();

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
    const data = {
        currentList: { list, checks },
        currentListId: currentListId,
        savedLists: getSavedLists(),
        defaultListData: { list: localStorage.getItem('list'), checks: localStorage.getItem('checks') },
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `checklist-todas-listas-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    notify('✅ Todas las listas exportadas');
}

function importData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            
            // Check if it's the new format (with all lists) or old format (single list)
            if (data.savedLists !== undefined) {
                // New format - import all lists
                if (!confirm('¿Importar todas las listas? Esto reemplazará las listas actuales.')) return;
                
                // Import saved lists
                localStorage.setItem('savedLists', JSON.stringify(data.savedLists));
                
                // Import default list data if exists
                if (data.defaultListData && data.defaultListData.list) {
                    localStorage.setItem('list', data.defaultListData.list);
                    localStorage.setItem('checks', data.defaultListData.checks || '{}');
                }
                
                // Load the list that was active when exported
                if (data.currentListId) {
                    loadList(data.currentListId);
                } else {
                    loadList('default');
                }
                
                closeModal('menuModal');
                notify('✅ Todas las listas importadas');
            } else if (data.list) {
                // Old format - import as current list only
                if (!confirm('¿Importar esta lista? Se cargará en la lista actual.')) return;
                list = data.list;
                checks = data.checks || {};
                ensureCategoryNotes();
                save();
                closeModal('menuModal');
                notify('✅ Lista importada');
            } else {
                notify('❌ Archivo inválido');
            }
        } catch {
            notify('❌ Error al leer archivo');
        }
    };
    reader.readAsText(file);
}

// Utils
function save() {
    // Save to current list context
    if (currentListId === 'default') {
        localStorage.setItem('list', JSON.stringify(list));
        localStorage.setItem('checks', JSON.stringify(checks));
    } else {
        const savedLists = getSavedLists();
        if (savedLists[currentListId]) {
            savedLists[currentListId].list = JSON.parse(JSON.stringify(list));
            savedLists[currentListId].checks = JSON.parse(JSON.stringify(checks));
            localStorage.setItem('savedLists', JSON.stringify(savedLists));
        }
    }
    localStorage.setItem('currentListId', currentListId);
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
