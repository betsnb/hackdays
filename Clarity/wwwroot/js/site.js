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
                window.location.href = '/PaginaInicio';
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

    const onboardingSteps = 5;
    let currentStep = 1;
    const onboardingData = {};

    // Tags (paso 3)
    let tags = [];

    function goToStep(step) {
        currentStep = step;
        document.querySelectorAll('.sh-ob-step').forEach(function(s) {
            s.classList.toggle('active', parseInt(s.dataset.step) === step);
        });
        // Progress bar
        const pct = ((step - 1) / onboardingSteps) * 100;
        document.getElementById('ob-progress-bar').style.width = pct + '%';
        // Back btn
        document.getElementById('ob-back').style.visibility = step > 1 ? 'visible' : 'hidden';
    }

    function nextStep() {
        // Validar paso actual
        if (currentStep === 1) {
            const v = document.getElementById('ob-nombre').value.trim();
            if (!v) { document.getElementById('ob-nombre').focus(); return; }
            onboardingData.nombre = v;
        }
        if (currentStep === 2) {
            const sel = document.querySelector('.ob-option-btn.selected');
            if (!sel) return;
            onboardingData.nivel = sel.dataset.value;
        }
        if (currentStep === 3) {
            onboardingData.materias = tags;
        }
        if (currentStep === 4) {
            onboardingData.horas = document.getElementById('ob-slider').value;
        }
        if (currentStep === 5) {
            const sel = document.querySelector('.ob-goal-card.selected');
            if (!sel) return;
            onboardingData.objetivo = sel.dataset.value;
            showFinish();
            return;
        }
        goToStep(currentStep + 1);
    }

    function showFinish() {
        document.querySelectorAll('.sh-ob-step').forEach(function(s){ s.classList.remove('active'); });
        document.getElementById('ob-finish').classList.add('active');
        document.getElementById('ob-progress-bar').style.width = '100%';
        document.getElementById('ob-footer').style.display = 'none';
        setTimeout(function() {
            window.location.href = '/PaginaInicio';
        }, 2800);
    }

    // Opción pills (paso 2)
    document.querySelectorAll('.ob-option-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            this.closest('.ob-options').querySelectorAll('.ob-option-btn').forEach(function(b){ b.classList.remove('selected'); });
            this.classList.add('selected');
        });
    });

    // Goal cards (paso 5)
    document.querySelectorAll('.ob-goal-card').forEach(function(card) {
        card.addEventListener('click', function() {
            document.querySelectorAll('.ob-goal-card').forEach(function(c){ c.classList.remove('selected'); });
            this.classList.add('selected');
        });
    });

    // Tags (paso 3)
    const tagInput = document.getElementById('ob-tag-input');
    const tagContainer = document.getElementById('ob-tags');
    const TAG_SUGGESTIONS = ['Matemáticas','Física','Química','Programación','Historia','Inglés','Biología','Cálculo','Estadística','Literatura'];

    function addTag(val) {
        val = val.trim();
        if (!val || tags.includes(val)) return;
        tags.push(val);
        const chip = document.createElement('span');
        chip.className = 'ob-tag';
        chip.innerHTML = val + ' <button class="ob-tag-remove" data-tag="' + val + '">×</button>';
        tagContainer.insertBefore(chip, tagInput);
        chip.querySelector('.ob-tag-remove').addEventListener('click', function() {
            tags = tags.filter(function(t){ return t !== val; });
            chip.remove();
        });
    }

    if (tagInput) {
        tagInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag(this.value);
                this.value = '';
            }
        });
    }

    // Sugerencias de tags
    document.querySelectorAll('.ob-tag-suggestion').forEach(function(s) {
        s.addEventListener('click', function() {
            addTag(this.textContent);
        });
    });

    // Slider label
    const slider = document.getElementById('ob-slider');
    const sliderVal = document.getElementById('ob-slider-val');
    if (slider) {
        slider.addEventListener('input', function() {
            sliderVal.textContent = this.value + (this.value == 1 ? ' hora' : ' horas');
        });
    }

    // Botones nav del modal
    const btnNext = document.getElementById('ob-next');
    const btnBack = document.getElementById('ob-back');
    if (btnNext) btnNext.addEventListener('click', nextStep);
    if (btnBack) btnBack.addEventListener('click', function() {
        if (currentStep > 1) goToStep(currentStep - 1);
    });

})();