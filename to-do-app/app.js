// app.js — TaskFlow To-Do App
// Persistence: localStorage simulating db.json with "users" and "todos" arrays

document.addEventListener('DOMContentLoaded', () => {

    // ─── DB Initialization ────────────────────────────────────────────────────
    if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([]));
    if (!localStorage.getItem('todos')) localStorage.setItem('todos', JSON.stringify([]));

    // ─── DOM References ───────────────────────────────────────────────────────
    const screens = {
        login:    document.getElementById('login-screen'),
        register: document.getElementById('register-screen'),
        app:      document.getElementById('app-screen'),
    };

    const loginForm          = document.getElementById('login-form');
    const registerForm       = document.getElementById('register-form');
    const todoForm           = document.getElementById('todo-form');
    const todoList           = document.getElementById('todo-list');
    const taskCount          = document.getElementById('task-count');
    const welcomeMessage     = document.getElementById('welcome-message');
    const logoutBtn          = document.getElementById('logout-btn');
    const goToRegisterBtn    = document.getElementById('go-to-register');
    const goToLoginBtn       = document.getElementById('go-to-login');

    // ─── DB Helpers ───────────────────────────────────────────────────────────
    const getUsers  = () => JSON.parse(localStorage.getItem('users'));
    const setUsers  = (d) => localStorage.setItem('users', JSON.stringify(d));
    const getTodos  = () => JSON.parse(localStorage.getItem('todos'));
    const setTodos  = (d) => localStorage.setItem('todos', JSON.stringify(d));
    const getCurrentUser = () => {
        const u = localStorage.getItem('currentUser');
        return u ? JSON.parse(u) : null;
    };

    // ─── UI Utilities ─────────────────────────────────────────────────────────
    const showScreen = (name) => {
        Object.values(screens).forEach(el => el.classList.add('hidden-screen'));
        screens[name].classList.remove('hidden-screen');
    };

    const showError = (id, msg) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
    };

    const clearErrors = () => {
        document.querySelectorAll('.error-msg').forEach(el => {
            el.textContent = '';
            el.classList.remove('show');
        });
    };

    // ─── Badge helpers ────────────────────────────────────────────────────────
    const TYPE_CLASSES = {
        'Trabalho': 'badge-work',
        'Pessoal':  'badge-personal',
        'Estudos':  'badge-study',
    };

    const TYPE_ICONS = {
        'Trabalho': '💼',
        'Pessoal':  '👤',
        'Estudos':  '📚',
    };

    // ─── Auth ─────────────────────────────────────────────────────────────────
    const checkAuth = () => {
        const user = getCurrentUser();
        if (user) {
            welcomeMessage.textContent = `Olá, ${user.name.split(' ')[0]} 👋`;
            renderTodos();
            showScreen('app');
        } else {
            showScreen('login');
        }
    };

    // ─── Navigation ───────────────────────────────────────────────────────────
    goToRegisterBtn.addEventListener('click', () => { clearErrors(); loginForm.reset(); showScreen('register'); });
    goToLoginBtn.addEventListener('click',    () => { clearErrors(); registerForm.reset(); showScreen('login'); });

    // ─── Register ─────────────────────────────────────────────────────────────
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        const name     = document.getElementById('register-name').value.trim();
        const email    = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        let valid = true;

        if (!name)     { showError('register-name-error', 'O nome é obrigatório.'); valid = false; }
        if (!email)    { showError('register-email-error', 'O e-mail é obrigatório.'); valid = false; }
        if (!password) { showError('register-password-error', 'A senha é obrigatória.'); valid = false; }
        else if (password.length < 6) { showError('register-password-error', 'A senha deve ter pelo menos 6 caracteres.'); valid = false; }

        if (!valid) return;

        const users = getUsers();
        if (users.some(u => u.email === email)) {
            showError('register-general-error', 'Este e-mail já está em uso.');
            return;
        }

        const newUser = { id: Date.now().toString(), name, email, password };
        users.push(newUser);
        setUsers(users);

        localStorage.setItem('currentUser', JSON.stringify(newUser));
        registerForm.reset();
        checkAuth();
    });

    // ─── Login ────────────────────────────────────────────────────────────────
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        let valid = true;
        if (!email)    { showError('login-email-error', 'O e-mail é obrigatório.'); valid = false; }
        if (!password) { showError('login-password-error', 'A senha é obrigatória.'); valid = false; }
        if (!valid) return;

        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            loginForm.reset();
            checkAuth();
        } else {
            const emailExists = users.some(u => u.email === email);
            if (!emailExists) {
                showError('login-general-error', 'E-mail não cadastrado.');
            } else {
                showError('login-general-error', 'Senha incorreta.');
            }
        }
    });

    // ─── Logout ───────────────────────────────────────────────────────────────
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        checkAuth();
    });

    // ─── Todo: Add ────────────────────────────────────────────────────────────
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        const title       = document.getElementById('todo-title').value.trim();
        const type        = document.getElementById('todo-type').value;
        const description = document.getElementById('todo-description').value.trim();

        if (!title) {
            showError('todo-title-error', 'O título da tarefa é obrigatório.');
            return;
        }

        const user = getCurrentUser();
        const todos = getTodos();

        const newTodo = {
            id:          Date.now().toString(),
            userId:      user.email,
            title,
            type,
            description,
            done:        false,
        };

        todos.push(newTodo);
        setTodos(todos);
        todoForm.reset();
        renderTodos();
    });

    // ─── Todo: Toggle Done ────────────────────────────────────────────────────
    const toggleDone = (id) => {
        const todos = getTodos();
        const idx = todos.findIndex(t => t.id === id);
        if (idx === -1) return;
        todos[idx].done = true;
        setTodos(todos);
        renderTodos();
    };

    // ─── Todo: Render ─────────────────────────────────────────────────────────
    const renderTodos = () => {
        const user = getCurrentUser();
        if (!user) return;

        const all = getTodos().filter(t => t.userId === user.email);

        // Sort: pending first, done at the end
        const pending   = all.filter(t => !t.done);
        const completed = all.filter(t => t.done);
        const sorted = [...pending, ...completed];

        taskCount.textContent = `${all.length} ${all.length === 1 ? 'tarefa' : 'tarefas'}`;

        if (sorted.length === 0) {
            todoList.innerHTML = `
                <div class="flex flex-col items-center py-10 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    <p class="text-sm">Nenhuma tarefa cadastrada ainda.</p>
                </div>`;
            return;
        }

        todoList.innerHTML = sorted.map(todo => {
            const badgeClass = TYPE_CLASSES[todo.type] || 'badge-work';
            const icon       = TYPE_ICONS[todo.type]  || '';
            const doneBtn    = todo.done
                ? `<span class="btn-done completed">✓ Concluída</span>`
                : `<button class="btn-done" onclick="window.__toggleDone('${todo.id}')">Concluir</button>`;

            const descHtml = todo.description
                ? `<p class="text-slate-400 text-sm mt-1.5 leading-relaxed">${escapeHTML(todo.description)}</p>`
                : '';

            return `
            <div class="task-card ${todo.done ? 'done' : ''}">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                            <span class="text-sm font-medium inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${badgeClass}">
                                ${icon} ${escapeHTML(todo.type)}
                            </span>
                        </div>
                        <p class="task-title text-white font-medium text-[0.95rem] leading-snug">${escapeHTML(todo.title)}</p>
                        ${descHtml}
                    </div>
                    <div class="shrink-0 mt-1">${doneBtn}</div>
                </div>
            </div>`;
        }).join('');
    };

    // ─── Security: Expose toggle to global scope (used in onclick) ────────────
    window.__toggleDone = toggleDone;

    // ─── Util: Sanitize HTML output ───────────────────────────────────────────
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    };

    // ─── Bootstrap ────────────────────────────────────────────────────────────
    checkAuth();
});
