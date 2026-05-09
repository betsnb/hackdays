// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
/* studyhub.js — UI interactions (no API calls, all simulated) */

(function () {
    'use strict';

    /* ---- Theme Toggle ---- */
    const html         = document.documentElement;
    const themeToggle  = document.getElementById('themeToggle');
    const themeLabel   = document.getElementById('themeLabel');

    const STORAGE_KEY  = 'sh_theme';
    const saved        = localStorage.getItem(STORAGE_KEY);
    const prefersDark  = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply saved or system preference
    const initialTheme = saved || 'light';
    applyTheme(initialTheme);

    themeToggle.addEventListener('click', function () {
        const current = html.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        themeLabel.textContent = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    }

    /* ---- Tabs ---- */
    const tabs      = document.querySelectorAll('.sh-tab');
    const indicator = document.getElementById('tabIndicator');
    const panels    = {
        tabRegister: document.getElementById('panelRegister'),
        tabLogin:    document.getElementById('panelLogin'),
    };

    tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () {
            switchTab(tab.id, index);
        });
    });

    // Switch tab via footer links (data-switch attribute)
    document.querySelectorAll('[data-switch]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-switch');
            const targetTab = document.getElementById(targetId);
            const idx = Array.from(tabs).indexOf(targetTab);
            switchTab(targetId, idx);
        });
    });

    // "Iniciar sesión" nav button → switch to login tab
    const navLoginBtn = document.getElementById('navLoginBtn');
    if (navLoginBtn) {
        navLoginBtn.addEventListener('click', function (e) {
            e.preventDefault();
            switchTab('tabLogin', 1);
            document.getElementById('authCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    function switchTab(tabId, index) {
        tabs.forEach(function (t) {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });

        const active = document.getElementById(tabId);
        active.classList.add('active');
        active.setAttribute('aria-selected', 'true');

        // Slide indicator
        indicator.style.left = (index * 50) + '%';

        // Show/hide panels with animation
        Object.keys(panels).forEach(function (key) {
            const panel = panels[key];
            if (key === tabId) {
                panel.classList.remove('d-none');
                panel.style.animation = 'none';
                // Trigger reflow
                void panel.offsetWidth;
                panel.style.animation = '';
            } else {
                panel.classList.add('d-none');
            }
        });
    }

    /* ---- Password Visibility Toggle ---- */
    document.querySelectorAll('.sh-eye-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const inputId = this.getAttribute('data-target');
            const input   = document.getElementById(inputId);
            const eyeShow = this.querySelector('.eye-show');
            const eyeHide = this.querySelector('.eye-hide');

            if (input.type === 'password') {
                input.type  = 'text';
                eyeShow.classList.add('d-none');
                eyeHide.classList.remove('d-none');
            } else {
                input.type  = 'password';
                eyeShow.classList.remove('d-none');
                eyeHide.classList.add('d-none');
            }
        });
    });

    /* ---- Simulated form submit (no API) ---- */
    /* ---- Validación registro ---- */
    const regForm = {
        name:  document.getElementById('regName'),
        email: document.getElementById('regEmail'),
        pass:  document.getElementById('regPass'),
    };

    // Requisitos contraseña
    const passRules = [
        { id: 'rule-len',     test: function(v){ return v.length >= 8; },          label: 'Mínimo 8 caracteres' },
        { id: 'rule-upper',   test: function(v){ return /[A-Z]/.test(v); },        label: 'Una mayúscula' },
        { id: 'rule-number',  test: function(v){ return /[0-9]/.test(v); },        label: 'Un número' },
        { id: 'rule-special', test: function(v){ return /[^A-Za-z0-9]/.test(v); }, label: 'Un carácter especial' },
    ];

    // Insertar checklist debajo del input de contraseña
    const passWrap = regForm.pass.closest('.sh-field');
    const checklist = document.createElement('ul');
    checklist.className = 'sh-pass-rules';
    passRules.forEach(function(rule) {
        const li = document.createElement('li');
        li.id = rule.id;
        li.innerHTML = '<span class="sh-rule-icon">✗</span> ' + rule.label;
        checklist.appendChild(li);
    });
    passWrap.appendChild(checklist);

    regForm.pass.addEventListener('input', function() {
        passRules.forEach(function(rule) {
            const li = document.getElementById(rule.id);
            const ok = rule.test(regForm.pass.value);
            li.classList.toggle('ok', ok);
            li.querySelector('.sh-rule-icon').textContent = ok ? '✓' : '✗';
        });
    });

    function validateEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    function allPassRulesOk() {
        return passRules.every(function(r){ return r.test(regForm.pass.value); });
    }

    function showFieldError(input, msg) {
        input.classList.add('sh-input-error');
        let err = input.closest('.sh-input-wrap').nextElementSibling;
        if (!err || !err.classList.contains('sh-field-error')) {
            err = document.createElement('p');
            err.className = 'sh-field-error';
            input.closest('.sh-input-wrap').insertAdjacentElement('afterend', err);
        }
        err.textContent = msg;
    }

    function clearFieldError(input) {
        input.classList.remove('sh-input-error');
        const err = input.closest('.sh-input-wrap').nextElementSibling;
        if (err && err.classList.contains('sh-field-error')) err.remove();
    }

    ['regName','regEmail','regPass'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', function(){ clearFieldError(this); });
    });

    /* ---- Botón Crear cuenta ---- */
    const btnRegister = document.querySelector('#panelRegister .sh-btn-primary');
    if (btnRegister) {
        btnRegister.addEventListener('click', function() {
            let valid = true;

            if (!regForm.name.value.trim()) {
                showFieldError(regForm.name, 'Ingresa tu nombre completo.');
                valid = false;
            }
            if (!validateEmail(regForm.email.value.trim())) {
                showFieldError(regForm.email, 'Ingresa un correo válido (ej. usuario@correo.com).');
                valid = false;
            }
            if (!allPassRulesOk()) {
                showFieldError(regForm.pass, 'La contraseña no cumple todos los requisitos.');
                valid = false;
            }

            if (valid) openOnboarding();
        });
    }

    /* ---- Botón Iniciar sesión (login panel) ---- */
    const logEmail = document.getElementById('logEmail');
    const logPass  = document.getElementById('logPass');
    const btnLogin = document.querySelector('#panelLogin .sh-btn-primary');
    if (btnLogin) {
        btnLogin.addEventListener('click', function() {
            let valid = true;
            if (!validateEmail((logEmail && logEmail.value) || '')) {
                if (logEmail) showFieldError(logEmail, 'Ingresa un correo válido.');
                valid = false;
            }
            if (!logPass || !logPass.value) {
                if (logPass) showFieldError(logPass, 'Ingresa tu contraseña.');
                valid = false;
            }
            if (valid) {
                window.location.href = '/Home/PaginaInicio';
            }
        });
    }

    /* ---- Onboarding Modal ---- */
    function openOnboarding() {
        const modal = document.getElementById('sh-onboarding');
        modal.classList.remove('d-none');
        document.body.style.overflow = 'hidden';
        goToStep(1);
    }

    function closeOnboarding() {
        const modal = document.getElementById('sh-onboarding');
        modal.classList.add('d-none');
        document.body.style.overflow = '';
    }

    const onboardingSteps = 4;
    let currentStep = 1;
    const onboardingData = {
        nombre: '',
        role: '',
        bio: '',
        files: []
    };

    // Tags (paso 3)
    let tags = [];

    function goToStep(step) {
        currentStep = step;
        const wrap = document.querySelector('.sh-ob-wrap');
        
        document.querySelectorAll('.sh-ob-step').forEach(function(s) {
            s.classList.toggle('active', parseInt(s.dataset.step) === step);
        });

        if (step === 4) {
            const name = onboardingData.nombre || 'friend';
            document.getElementById('ob-greeting').textContent = `Hey ${name} — what does this week look like?`;
            updateInputCount();
            if (wrap) wrap.classList.add('wide');
        } else {
            if (wrap) wrap.classList.remove('wide');
        }

        // Progress bar
        const pct = ((step - 1) / onboardingSteps) * 100;
        document.getElementById('ob-progress-bar').style.width = pct + '%';
        // Back btn
        document.getElementById('ob-back').style.visibility = step > 1 ? 'visible' : 'hidden';
    }

    function updateInputCount() {
        const count = onboardingData.files.length + (document.getElementById('ob-text-input').value.trim() ? 1 : 0);
        const countLabel = document.getElementById('ob-input-count');
        const btnCount = document.getElementById('ob-btn-count');
        if (countLabel) countLabel.textContent = `${count} INPUTS`;
        if (btnCount) btnCount.textContent = count;
    }

    function nextStep() {
        if (currentStep === 1) {
            const v = document.getElementById('ob-nombre').value.trim();
            if (!v) { document.getElementById('ob-nombre').focus(); return; }
            onboardingData.nombre = v;
        }
        if (currentStep === 2) {
            if (!onboardingData.role) {
                alert('Por favor selecciona un rol para continuar.');
                return;
            }
        }
        if (currentStep === 3) {
            onboardingData.bio = document.getElementById('ob-bio').value.trim();
        }
        if (currentStep === 4) {
            showFinish();
            return;
        }
        goToStep(currentStep + 1);
    }

    // --- AI Wrapper (ClarityAI) ---
    window.ClarityAI = {
        async extractTasksFromUpload({ files, text, persona }) {
            const response = await fetch('/api/ai/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Persona: persona, Text: text, Files: files })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error en el backend");
            if (!data.response) throw new Error("Gemini no devolvió respuesta");
            return JSON.parse(data.response.replace(/```json/g, '').replace(/```/g, '').trim());
        },

        async dailyBriefing({ name, role, tasks, burnout }) {
            const response = await fetch('/api/ai/briefing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    Persona: { Name: name, Role: role, Activities: "" }, 
                    Tasks: tasks, 
                    Burnout: burnout 
                })
            });
            const data = await response.json();
            return JSON.parse(data.response.replace(/```json/g, '').replace(/```/g, '').trim());
        },

        async explainTask(task) {
            const response = await fetch('/api/ai/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Task: task })
            });
            const data = await response.json();
            return JSON.parse(data.response.replace(/```json/g, '').replace(/```/g, '').trim());
        },

        async generateFlashcards(topic, files = []) {
            const response = await fetch('/api/ai/flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Topic: topic, Files: files })
            });
            const data = await response.json();
            return JSON.parse(data.response.replace(/```json/g, '').replace(/```/g, '').trim());
        },

        async smartReschedule({ tasks, fixedBlocks, burnout }) {
            const response = await fetch('/api/ai/reschedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Tasks: tasks, FixedBlocks: fixedBlocks, Burnout: burnout })
            });
            const data = await response.json();
            return JSON.parse(data.response.replace(/```json/g, '').replace(/```/g, '').trim());
        }
    };

    async function showFinish() {
        document.querySelectorAll('.sh-ob-step').forEach(function(s){ s.classList.remove('active'); });
        document.getElementById('ob-finish').classList.add('active');
        document.getElementById('ob-progress-bar').style.width = '100%';
        document.getElementById('ob-footer').style.display = 'none';

        // Pipeline Stages Animation
        const stages = ['pipe-vision', 'pipe-extract', 'pipe-rank', 'pipe-schedule'];
        for (let i = 0; i < stages.length; i++) {
            const el = document.getElementById(stages[i]);
            if (el) el.classList.add('active');
            await new Promise(r => setTimeout(r, 800));
        }

        try {
            const persona = {
                Name: onboardingData.nombre,
                Role: onboardingData.role,
                Activities: onboardingData.bio
            };
            const textInput = document.getElementById('ob-text-input').value.trim();
            const files = onboardingData.files.map(f => ({ mimeType: f.type, data: f.base64 }));

            // Usando el wrapper oficial
            const parsed = await window.ClarityAI.extractTasksFromUpload({ files, text: textInput, persona });
            
            localStorage.setItem('sh_ai_raw', JSON.stringify(parsed));
            localStorage.setItem('sh_user_name', onboardingData.nombre);
            localStorage.setItem('sh_ai_plan', parsed.summary || 'Listo para empezar.');
            
        } catch (error) {
            console.error('Error llamando a Gemini:', error);
            localStorage.setItem('sh_ai_plan', 'Información procesada, ¡revisa tu dashboard!');
            alert("Error procesando tus datos con Gemini: " + error.message);
        }

        setTimeout(function() {
            window.location.href = '/Home/PaginaInicio';
        }, 1000);
    }

    // Role Selection
    document.querySelectorAll('.ob-persona-card').forEach(function(card) {
        card.addEventListener('click', function() {
            document.querySelectorAll('.ob-persona-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            onboardingData.role = this.dataset.role;
        });
    });

    // Tag Suggestions
    document.querySelectorAll('.ob-tag-suggestion').forEach(function(s) {
        s.addEventListener('click', function() {
            const bio = document.getElementById('ob-bio');
            const val = this.textContent.replace('+ ', '');
            if (!bio.value.includes(val)) {
                bio.value += (bio.value ? ', ' : '') + val;
            }
        });
    });

    // File Upload Handling
    const dropZone = document.getElementById('ob-drop-zone');
    const fileInput = document.getElementById('ob-file-input');

    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragging');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragging');
            handleFiles(e.dataTransfer.files);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    }

    // Tabs
    document.querySelectorAll('.ob-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.ob-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.ob-tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(`tab-${this.dataset.tab}`).classList.add('active');
        });
    });

    // Text Input Counter
    const textInput = document.getElementById('ob-text-input');
    if (textInput) {
        textInput.addEventListener('input', updateInputCount);
    }

    // Analyze Button
    const analyzeBtn = document.getElementById('ob-analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', showFinish);
    }

    // Sample Loader
    const loadSampleBtn = document.getElementById('ob-load-sample');
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', function() {
            onboardingData.files = [
                { name: 'fall-2026-syllabus.pdf', type: 'application/pdf', base64: '' },
                { name: 'canvas-week.png', type: 'image/png', base64: '' }
            ];
            const textInput = document.getElementById('ob-text-input');
            textInput.value = "Midterm on Friday for Physics. Read Chapter 5 by Wednesday.";
            renderFileList();
            updateInputCount();
            alert("Sample data loaded! Click Analyze to continue.");
        });
    }

    function renderFileList() {
        const fileList = document.getElementById('ob-file-list');
        fileList.innerHTML = '';
        onboardingData.files.forEach((f, idx) => {
            const item = document.createElement('div');
            item.className = 'ob-file-item';
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:0.8rem;">
                    <div style="background:rgba(255,255,255,0.05); padding:0.4rem; border-radius:6px;">📄</div>
                    <div>
                        <p style="font-weight:600; font-size:0.85rem;">${f.name}</p>
                        <p style="font-size:0.7rem; opacity:0.5;">${f.type}</p>
                    </div>
                </div>
                <button class="ob-file-remove" data-idx="${idx}" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer;">×</button>
            `;
            fileList.appendChild(item);
        });

        document.querySelectorAll('.ob-file-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.idx);
                onboardingData.files.splice(idx, 1);
                renderFileList();
                updateInputCount();
            });
        });
    }

    async function handleFiles(files) {
        for (const file of files) {
            const base64 = await toBase64(file);
            onboardingData.files.push({
                name: file.name,
                type: file.type,
                base64: base64.split(',')[1]
            });
        }
        renderFileList();
        updateInputCount();
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // Botones nav del modal
    const btnNext = document.getElementById('ob-next');
    const btnBack = document.getElementById('ob-back');
    if (btnNext) btnNext.addEventListener('click', nextStep);
    if (btnBack) btnBack.addEventListener('click', function() {
        if (currentStep > 1) goToStep(currentStep - 1);
    });

})();