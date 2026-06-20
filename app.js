/* ==========================================================================
   Cardakar Logistics - Interactive JavaScript Behavior
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Menu Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on link
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // 2. FAQ Accordion Interaction
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle active state for clicked FAQ
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });

    // 3. Interactive Fuel Map Dashboard (Teaser MVP)
    const fuelData = {
        caracas: {
            reports: 28,
            stations: [
                { id: 'ccs-1', name: 'E/S El Condor', type: 'Diésel', status: 'success', statusText: 'Disponible', x: 275, y: 95, time: 'Hace 5 min' },
                { id: 'ccs-2', name: 'E/S Blandín', type: 'Gasolina', status: 'warning', statusText: 'Cola 30 min', x: 290, y: 105, time: 'Hace 15 min' },
                { id: 'ccs-3', name: 'E/S Parque Cristal', type: 'Gasolina', status: 'danger', statusText: 'Sin Combustible', x: 305, y: 90, time: 'Hace 1 hora' }
            ]
        },
        carabobo: {
            reports: 19,
            stations: [
                { id: 'cbb-1', name: 'E/S Bohío', type: 'Diésel', status: 'success', statusText: 'Disponible', x: 190, y: 110, time: 'Hace 8 min' },
                { id: 'cbb-2', name: 'E/S Prebo', type: 'Gasolina', status: 'success', statusText: 'Disponible', x: 175, y: 120, time: 'Hace 20 min' },
                { id: 'cbb-3', name: 'E/S El Prado', type: 'Diésel', status: 'warning', statusText: 'Cola (Poco)', x: 185, y: 135, time: 'Hace 35 min' }
            ]
        },
        zulia: {
            reports: 34,
            stations: [
                { id: 'zul-1', name: 'E/S Lago Pista', type: 'Diésel', status: 'warning', statusText: 'Cola 2 Horas', x: 80, y: 110, time: 'Hace 3 min' },
                { id: 'zul-2', name: 'E/S Doble R', type: 'Gasolina', status: 'danger', statusText: 'Sin Combustible', x: 65, y: 125, time: 'Hace 45 min' },
                { id: 'zul-3', name: 'E/S Delicias', type: 'Diésel', status: 'success', statusText: 'Disponible', x: 90, y: 125, time: 'Hace 12 min' }
            ]
        },
        lara: {
            reports: 15,
            stations: [
                { id: 'lar-1', name: 'E/S Venezuela', type: 'Gasolina', status: 'success', statusText: 'Disponible', x: 135, y: 115, time: 'Hace 10 min' },
                { id: 'lar-2', name: 'E/S Monumental', type: 'Diésel', status: 'danger', statusText: 'Sin Combustible', x: 145, y: 130, time: 'Hace 50 min' }
            ]
        }
    };

    const stateSelect = document.getElementById('state-select');
    const stationsContainer = document.getElementById('stations-container');
    const mapPinsGroup = document.getElementById('map-pins');
    const hudActiveReports = document.getElementById('hud-active-reports');

    function generateMockStateData(stateKey, stateName) {
        // Random number of reports
        const reportsCount = Math.floor(Math.random() * 12) + 4;
        
        // Define coordinates box overlaying Venezuela representation
        // Safe range: X: 120 to 480, Y: 90 to 240
        const stations = [
            {
                id: `${stateKey}-1`,
                name: `E/S ${stateName} Central`,
                type: Math.random() > 0.5 ? 'Diésel' : 'Gasolina',
                status: 'success',
                statusText: 'Disponible',
                x: Math.floor(Math.random() * 250) + 150,
                y: Math.floor(Math.random() * 100) + 100,
                time: 'Hace 10 min'
            },
            {
                id: `${stateKey}-2`,
                name: `E/S Las Morochas`,
                type: Math.random() > 0.5 ? 'Diésel' : 'Gasolina',
                status: Math.random() > 0.6 ? 'warning' : (Math.random() > 0.4 ? 'success' : 'danger'),
                statusText: Math.random() > 0.6 ? 'Cola (Poco)' : (Math.random() > 0.4 ? 'Disponible' : 'Sin Combustible'),
                x: Math.floor(Math.random() * 250) + 150,
                y: Math.floor(Math.random() * 100) + 100,
                time: 'Hace 25 min'
            }
        ];

        fuelData[stateKey] = {
            reports: reportsCount,
            stations: stations
        };
    }

    function renderStateData(stateKey) {
        // If state doesn't have data in main database, generate it dynamically
        if (!fuelData[stateKey]) {
            const optionText = stateSelect ? stateSelect.options[stateSelect.selectedIndex].text : 'Estado';
            generateMockStateData(stateKey, optionText);
        }

        const data = fuelData[stateKey];
        if (!data) return;

        // Update HUD counter
        if (hudActiveReports) {
            hudActiveReports.textContent = data.reports;
        }

        // Render station sidebar items
        if (stationsContainer) {
            stationsContainer.innerHTML = '';
            data.stations.forEach(station => {
                const stationEl = document.createElement('div');
                stationEl.className = 'station-item';
                stationEl.setAttribute('data-id', station.id);
                
                stationEl.innerHTML = `
                    <div class="station-info">
                        <h4>${station.name}</h4>
                        <p>${station.type} • ${station.time}</p>
                    </div>
                    <span class="status-indicator ${station.status}">${station.statusText}</span>
                `;
                
                stationEl.addEventListener('click', () => {
                    highlightStation(station.id);
                });
                
                stationsContainer.appendChild(stationEl);
            });
        }

        // Render Map Pins inside SVG
        if (mapPinsGroup) {
            mapPinsGroup.innerHTML = '';
            data.stations.forEach(station => {
                const pinGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                pinGroup.setAttribute('class', 'map-pin');
                pinGroup.setAttribute('id', `pin-${station.id}`);
                pinGroup.setAttribute('data-id', station.id);

                // Glow ring
                const glowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                glowCircle.setAttribute('cx', station.x);
                glowCircle.setAttribute('cy', station.y);
                glowCircle.setAttribute('r', '10');
                glowCircle.setAttribute('fill', getStatusColor(station.status));
                glowCircle.setAttribute('opacity', '0.4');

                // Inner core dot
                const coreCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                coreCircle.setAttribute('cx', station.x);
                coreCircle.setAttribute('cy', station.y);
                coreCircle.setAttribute('r', '5');
                coreCircle.setAttribute('fill', getStatusColor(station.status));

                // Pulsing animation
                const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                anim.setAttribute('attributeName', 'r');
                anim.setAttribute('values', '5;12;5');
                anim.setAttribute('dur', '2s');
                anim.setAttribute('repeatCount', 'indefinite');
                glowCircle.appendChild(anim);

                pinGroup.appendChild(glowCircle);
                pinGroup.appendChild(coreCircle);
                
                pinGroup.addEventListener('click', () => {
                    highlightStation(station.id);
                });

                mapPinsGroup.appendChild(pinGroup);
            });
        }
    }

    function getStatusColor(status) {
        switch (status) {
            case 'success': return '#10b981'; // Green
            case 'warning': return '#f59e0b'; // Orange
            case 'danger': return '#ef4444';  // Red
            default: return '#94a3b8';
        }
    }

    function highlightStation(stationId) {
        // Highlight sidebar item
        document.querySelectorAll('.station-item').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('data-id') === stationId) {
                el.classList.add('active');
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        // Highlight SVG Pin
        document.querySelectorAll('.map-pin').forEach(el => {
            const innerCircles = el.querySelectorAll('circle');
            if (innerCircles.length >= 2) {
                innerCircles[1].setAttribute('r', '5'); // Reset core size
            }
            
            if (el.getAttribute('data-id') === stationId) {
                if (innerCircles.length >= 2) {
                    innerCircles[1].setAttribute('r', '8'); // Make core look bigger when active
                }
            }
        });
    }

    // Set up State Dropdown Selector Event
    if (stateSelect) {
        stateSelect.addEventListener('change', (e) => {
            renderStateData(e.target.value);
        });
    }

    // Set up Fuel Reporting Form Event
    const fuelReportForm = document.getElementById('fuel-report-form');
    const reportFeedback = document.getElementById('report-feedback');

    if (fuelReportForm) {
        fuelReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const stationName = document.getElementById('report-station').value;
            const fuelType = document.getElementById('report-fuel').value;
            const status = document.getElementById('report-status').value;
            
            const selectedState = stateSelect ? stateSelect.value : 'caracas';
            const optionText = stateSelect ? stateSelect.options[stateSelect.selectedIndex].text : 'Estado';

            // Define status Text
            let statusText = 'Disponible';
            if (status === 'warning') statusText = 'Cola (Poco)';
            if (status === 'danger') statusText = 'Sin Combustible';

            // Create new station ID
            const newStationId = `${selectedState}-new-${Date.now()}`;
            
            // Random positioning in a safe map coordinate box
            const newStation = {
                id: newStationId,
                name: stationName,
                type: fuelType,
                status: status,
                statusText: statusText,
                x: Math.floor(Math.random() * 250) + 150,
                y: Math.floor(Math.random() * 100) + 100,
                time: 'Hace un momento'
            };

            // Add to database
            if (!fuelData[selectedState]) {
                fuelData[selectedState] = { reports: 0, stations: [] };
            }
            fuelData[selectedState].stations.unshift(newStation);
            fuelData[selectedState].reports += 1;

            // Rerender map and sidebar list
            renderStateData(selectedState);

            // Highlight the newly reported station
            highlightStation(newStationId);

            // Feedback notification message
            if (reportFeedback) {
                reportFeedback.textContent = '¡Reporte registrado con éxito en la base de datos! Pendiente de cruce GPS.';
                reportFeedback.className = 'report-feedback-msg success-msg active';
                
                setTimeout(() => {
                    reportFeedback.textContent = '';
                    reportFeedback.className = 'report-feedback-msg';
                }, 5000);
            }

            // Clear inputs
            document.getElementById('report-station').value = '';
            document.getElementById('report-fuel').selectedIndex = 0;
            document.getElementById('report-status').selectedIndex = 0;
        });
    }

    // ==========================================================================
    // Multi-Step KYC Form Controller (Phase 1 Frictionless Basic Registration)
    // ==========================================================================
    const kycForm = document.getElementById('kyc-multi-step-form');
    const stepPanels = document.querySelectorAll('.form-step-panel');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');
    const loadingOverlay = document.getElementById('form-loading-overlay');
    const successOverlay = document.getElementById('form-success-overlay');
    const closeSuccessBtn = document.getElementById('close-success-btn');
    
    let currentStep = 1;

    // Step navigation
    document.querySelectorAll('.next-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
            }
        });
    });

    document.querySelectorAll('.prev-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            goToStep(currentStep - 1);
        });
    });

    function validateStep(step) {
        const activePanel = document.querySelector(`.form-step-panel[data-step="${step}"]`);
        if (!activePanel) return false;
        
        const inputs = activePanel.querySelectorAll('input, select');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.reportValidity()) {
                isValid = false;
            }
        });
        return isValid;
    }

    function goToStep(step) {
        if (step < 1 || step > 3) return;

        // Hide active panel and show target panel
        stepPanels.forEach(panel => {
            panel.classList.remove('active');
            if (parseInt(panel.getAttribute('data-step')) === step) {
                panel.classList.add('active');
            }
        });

        currentStep = step;
        
        const formSection = document.getElementById('onboarding-form-section');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Cédula Verification (CNE Registry lookup)
    const kycIdInput = document.getElementById('kyc-id');
    const btnVerifyId = document.getElementById('btn-verify-id');
    const verifyIdFeedback = document.getElementById('verify-id-feedback');
    const kycFullnameInput = document.getElementById('kyc-fullname');
    const btnStep1SubmitBasic = document.getElementById('btn-step1-submit-basic');
    const linkBypassVerify = document.getElementById('link-bypass-verify');

    let verificationAbortController = null;

    // Helper function to switch to manual entry
    function enableManualEntry(message = 'Modo de ingreso manual activado. Por favor, ingresa tu nombre completo manualmente abajo.') {
        if (verificationAbortController) {
            verificationAbortController.abort();
            verificationAbortController = null;
        }
        showFeedback(verifyIdFeedback, message, 'warning');
        if (kycFullnameInput) {
            kycFullnameInput.value = '';
            kycFullnameInput.readOnly = false;
            kycFullnameInput.placeholder = 'Ingresa tu Nombre y Apellido';
            kycFullnameInput.focus();
        }
        if (btnStep1SubmitBasic) {
            btnStep1SubmitBasic.disabled = true; // Deshabilitado hasta que escriba algo
        }
        if (btnVerifyId) {
            btnVerifyId.disabled = false;
        }
    }

    if (linkBypassVerify) {
        linkBypassVerify.addEventListener('click', (e) => {
            e.preventDefault();
            // Asegurarnos de que el ID en el input oculto también se actualice con lo que haya escrito el usuario
            const type = document.getElementById('kyc-id-type').value;
            const numVal = document.getElementById('kyc-id-num').value.trim();
            if (numVal) {
                let cleanNum = type !== 'P' ? numVal.replace(/\D/g, '') : numVal;
                if (cleanNum) {
                    kycIdInput.value = `${type}-${cleanNum}`;
                }
            } else {
                kycIdInput.value = '';
            }
            enableManualEntry();
        });
    }

    if (btnVerifyId && kycIdInput) {
        btnVerifyId.addEventListener('click', async () => {
            const type = document.getElementById('kyc-id-type').value;
            const numVal = document.getElementById('kyc-id-num').value.trim();
            if (!numVal) {
                showFeedback(verifyIdFeedback, 'Por favor, ingresa tu número de documento.', 'error');
                return;
            }

            let cleanNum = numVal;
            if (type !== 'P') {
                cleanNum = numVal.replace(/\D/g, '');
            }
            if (!cleanNum) {
                showFeedback(verifyIdFeedback, 'Formato de documento inválido.', 'error');
                return;
            }

            const formattedId = `${type}-${cleanNum}`;
            kycIdInput.value = formattedId;

            showFeedback(verifyIdFeedback, 'Verificando en registro electoral...', 'loading');
            btnVerifyId.disabled = true;

            // Setup abort controller for client timeout (3.5s)
            verificationAbortController = new AbortController();
            const timeoutId = setTimeout(() => {
                if (verificationAbortController) {
                    verificationAbortController.abort();
                }
            }, 3500);

            try {
                const response = await fetch(`/api/verify-cedula/${formattedId}`, {
                    signal: verificationAbortController.signal
                });
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error('Error en el servidor');
                }
                const data = await response.json();
                if (data.exists) {
                    if (data.source === 'cne_offline_validated') {
                        kycFullnameInput.value = ''; // Don't use the fake name
                        kycFullnameInput.readOnly = false; // Unlock field
                        showFeedback(verifyIdFeedback, `CNE temporalmente fuera de línea. Por favor, escribe tu nombre manualmente.`, 'warning');
                        kycFullnameInput.focus();
                    } else {
                        kycFullnameInput.value = data.fullname; // Use real name from CNE
                        kycFullnameInput.readOnly = false; // Keep it unlocked just in case
                        showFeedback(verifyIdFeedback, `Cédula validada con éxito.`, 'success');
                        if (btnStep1SubmitBasic) btnStep1SubmitBasic.disabled = false;
                    }
                } else {
                    throw new Error('No se encontró el ciudadano');
                }
            } catch (err) {
                clearTimeout(timeoutId);
                console.error(err);
                // Allow manual entry on ANY error
                kycFullnameInput.value = '';
                kycFullnameInput.readOnly = false;
                showFeedback(verifyIdFeedback, `CNE no responde. Escribe tu nombre manualmente para continuar.`, 'warning');
                kycFullnameInput.focus();
            } finally {
                verificationAbortController = null;
                btnVerifyId.disabled = false;
            }
        });
    }

    // Validación en tiempo real si el campo de nombre completo es editable (modo manual)
    if (kycFullnameInput && btnStep1SubmitBasic) {
        const handleNameInput = () => {
            if (!kycFullnameInput.readOnly) {
                // Habilitar el botón si tiene al menos 2 caracteres
                btnStep1SubmitBasic.disabled = kycFullnameInput.value.trim().length < 2;
            }
        };
        kycFullnameInput.addEventListener('input', handleNameInput);
        kycFullnameInput.addEventListener('change', handleNameInput);
    }

    // Step 1 Submit: Basic Registration
    if (btnStep1SubmitBasic) {
        btnStep1SubmitBasic.addEventListener('click', async () => {
            try {
                const phoneVal = document.getElementById('kyc-phone').value.trim();
                if (!phoneVal) {
                    alert('Por favor ingresa tu número de teléfono (WhatsApp).');
                    return;
                }

                if (loadingOverlay) loadingOverlay.classList.add('active');

                const payload = {
                    driver_id: 'cdk_' + Math.random().toString(36).substring(2, 11),
                    personal_data: {
                        fullname: document.getElementById('kyc-fullname').value,
                        national_id: document.getElementById('kyc-id').value || 'V-00000000',
                        phone: phoneVal,
                    },
                    vehicles: [],
                    telemetry_opt_in: {
                        has_physical_gps: false,
                        gps_imei: null,
                        gps_provider: null
                    },
                    status: 'Pre_Registered'
                };

                // Save payload globally in case we need it to update in Step 3
                window.currentDriverPayload = payload;

                // 1. Post to local server simulation with timeout
                try {
                    const localAbort = new AbortController();
                    const localTimeout = setTimeout(() => localAbort.abort(), 3000);
                    
                    const localResp = await fetch('/api/register-basic', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        signal: localAbort.signal
                    });
                    clearTimeout(localTimeout);
                    const localData = await localResp.json();
                    console.log('Saved basic registration to local server memory:', localData);
                } catch (err) {
                    console.error('Error saving basic registration to local server:', err);
                }

                // 2. Post to n8n webhook (status = Pre_Registered)
                const webhookUrl = 'https://chatbot-isp-n8n.ha4i6p.easypanel.host/webhook/cardakar-kyc-intake';
                try {
                    const hookAbort = new AbortController();
                    const hookTimeout = setTimeout(() => hookAbort.abort(), 2500);
                    
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fullname: payload.personal_data.fullname,
                            national_id: payload.personal_data.national_id,
                            phone: payload.personal_data.phone,
                            status: 'Pre_Registered'
                        }),
                        signal: hookAbort.signal
                    });
                    clearTimeout(hookTimeout);
                } catch (err) {
                    console.log('%c[Webhook Status] n8n Webhook post completed. Error ignored: ' + err.message, 'color: #94a3b8;');
                }

                if (loadingOverlay) loadingOverlay.classList.remove('active');
                
                // Proceed to Step 2: Certification Decision
                goToStep(2);
            } catch (fatalError) {
                if (loadingOverlay) loadingOverlay.classList.remove('active');
                alert("Error crítico de sistema: " + fatalError.message);
                console.error(fatalError);
            }
        });
    }

    // Step 2: Decision Continue Button
    const btnDecisionContinue = document.getElementById('btn-decision-continue');
    if (btnDecisionContinue) {
        btnDecisionContinue.addEventListener('click', () => {
            const certifyRadiosNew = document.getElementsByName('certify_now_new');
            let certifyValue = 'yes';
            certifyRadiosNew.forEach(r => {
                if (r.checked) certifyValue = r.value;
            });

            if (certifyValue === 'yes') {
                goToStep(3);
            } else {
                // Set success card text for basic registration (short access)
                const successDesc = successOverlay.querySelector('.success-card p');
                const successDetails = successOverlay.querySelector('.success-details');
                if (successDesc) {
                    successDesc.innerHTML = 'Tus datos básicos de identidad han sido pre-inscritos con éxito en la plataforma.';
                }
                if (successDetails) {
                    successDetails.innerHTML = `
                        <p><strong>Estatus actual:</strong> Pre-Inscrito (Falta Documentación).</p>
                        <p style="margin-top: 8px; color: var(--text-muted);">Para finalizar tu afiliación y poder recibir fletes, ve a la pestaña <strong>"Cédula Digital"</strong> en el menú superior para cargar tus documentos de verificación (Licencia, RCV, etc.).</p>
                    `;
                }

                if (successOverlay) successOverlay.classList.add('active');
            }
        });
    }

    function showFeedback(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = 'feedback-msg ' + type;
    }

    // Dynamic Vehicle Rows Management
    const vehiclesContainer = document.getElementById('vehicles-container');
    const btnAddVehicle = document.getElementById('btn-add-vehicle');
    let vehicleIndexCounter = 1;

    if (vehiclesContainer && btnAddVehicle) {
        btnAddVehicle.addEventListener('click', () => {
            const index = vehicleIndexCounter++;
            const row = document.createElement('div');
            row.className = 'vehicle-row';
            row.setAttribute('data-index', index);
            row.innerHTML = `
                <div class="form-group">
                    <label>Tipo de Vehículo:</label>
                    <select class="kyc-vehicle-type" name="vehicle_type[]" required>
                        <option value="" disabled selected>Selecciona una opción</option>
                        <option value="NPR">NPR / Tritón</option>
                        <option value="Gandola">Gandola (Chuto + Batea)</option>
                        <option value="Cava Cuarto">Cava Cuarto / Furgón</option>
                        <option value="Volqueta">Volqueta</option>
                        <option value="Plataforma">Plataforma</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Placa del Vehículo:</label>
                    <div class="input-with-delete">
                        <input type="text" class="kyc-plate" name="plate[]" placeholder="Ej. A12B34C" required>
                        <button type="button" class="btn-delete-vehicle" title="Eliminar vehículo">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            vehiclesContainer.appendChild(row);
            
            // Attach delete listener
            row.querySelector('.btn-delete-vehicle').addEventListener('click', () => {
                row.remove();
                updateDeleteButtonsVisibility();
            });

            updateDeleteButtonsVisibility();
        });

        // Attach delete listener to the initial row
        const initialDeleteBtn = vehiclesContainer.querySelector('.btn-delete-vehicle');
        if (initialDeleteBtn) {
            initialDeleteBtn.addEventListener('click', (e) => {
                const row = e.target.closest('.vehicle-row');
                if (row) {
                    row.remove();
                    updateDeleteButtonsVisibility();
                }
            });
        }
        updateDeleteButtonsVisibility();
    }

    function updateDeleteButtonsVisibility() {
        if (!vehiclesContainer) return;
        const rows = vehiclesContainer.querySelectorAll('.vehicle-row');
        rows.forEach(row => {
            const delBtn = row.querySelector('.btn-delete-vehicle');
            if (delBtn) {
                delBtn.style.display = rows.length > 1 ? 'flex' : 'none';
            }
        });
    }

    // Utility: Read File as Base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Utility: Compress Image using HTML5 Canvas
    function compressImage(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL(file.type, quality);
                    const approxSize = Math.round((dataUrl.length - 22) * 3 / 4);

                    resolve({
                        dataUrl: dataUrl,
                        size: approxSize
                    });
                };
                img.onerror = err => reject(err);
            };
            reader.onerror = err => reject(err);
        });
    }

    // ==========================================================================
    // Phase 2: Carrier Portal - Document Upload Handler & File Compression
    // ==========================================================================
    const portalUploadedFilesData = {}; // Store compressed documents in memory

    const portalFileInputs = [
        { id: 'file-portal-identity', previewId: 'preview-portal-identity', key: 'identity' },
        { id: 'file-portal-selfie', previewId: 'preview-portal-selfie', key: 'selfie' },
        { id: 'file-portal-license', previewId: 'preview-portal-license', key: 'license' },
        { id: 'file-portal-medical', previewId: 'preview-portal-medical', key: 'medical' },
        { id: 'file-portal-rcv', previewId: 'preview-portal-rcv', key: 'rcv' },
        { id: 'file-portal-criminal', previewId: 'preview-portal-criminal', key: 'criminal' },
        { id: 'file-portal-property', previewId: 'preview-portal-property', key: 'property' },
        { id: 'file-portal-rif', previewId: 'preview-portal-rif', key: 'rif' },
        { id: 'file-portal-house', previewId: 'preview-portal-house', key: 'house' },
        { id: 'file-portal-inspection', previewId: 'preview-portal-inspection', key: 'inspection', multiple: true }
    ];

    portalFileInputs.forEach(fileInputConfig => {
        const inputEl = document.getElementById(fileInputConfig.id);
        const previewEl = document.getElementById(fileInputConfig.previewId);

        if (inputEl && previewEl) {
            inputEl.addEventListener('change', async (e) => {
                const files = e.target.files;
                previewEl.innerHTML = ''; // Clear preview
                
                if (!files || files.length === 0) {
                    delete portalUploadedFilesData[fileInputConfig.key];
                    return;
                }

                portalUploadedFilesData[fileInputConfig.key] = [];

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    
                    if (file.type === 'application/pdf') {
                        // PDF Preview
                        const pdfIcon = document.createElement('div');
                        pdfIcon.className = 'preview-pdf-icon';
                        pdfIcon.textContent = 'PDF';
                        previewEl.appendChild(pdfIcon);

                        const base64Data = await readFileAsBase64(file);
                        portalUploadedFilesData[fileInputConfig.key].push({
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type,
                            data: base64Data
                        });
                    } else if (file.type.startsWith('image/')) {
                        // Image Compression & Preview
                        try {
                            const compressedImg = await compressImage(file, 800, 800, 0.7);
                            
                            const thumb = document.createElement('img');
                            thumb.className = 'preview-thumb';
                            thumb.src = compressedImg.dataUrl;
                            previewEl.appendChild(thumb);

                            portalUploadedFilesData[fileInputConfig.key].push({
                                fileName: file.name,
                                fileSize: compressedImg.size,
                                fileType: file.type,
                                data: compressedImg.dataUrl
                            });
                        } catch (err) {
                            console.error('Error compressing image:', err);
                        }
                    }
                }
            });
        }
    });

    // Form Submission: Basic Registration (Phase 1)
    if (kycForm) {
        kycForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (loadingOverlay) loadingOverlay.classList.add('active');

            // Gather vehicle list
            const vehicleRows = vehiclesContainer.querySelectorAll('.vehicle-row');
            const vehiclesList = [];
            vehicleRows.forEach(row => {
                const vType = row.querySelector('.kyc-vehicle-type').value;
                const vPlate = row.querySelector('.kyc-plate').value.trim().toUpperCase();
                if (vType && vPlate) {
                    vehiclesList.push({
                        vehicle_type: vType,
                        plate: vPlate
                    });
                }
            });

            // Gather all textual inputs
            const payload = {
                driver_id: (window.currentDriverPayload && window.currentDriverPayload.driver_id) || 'cdk_' + Math.random().toString(36).substring(2, 11),
                fullname: document.getElementById('kyc-fullname').value,
                national_id: document.getElementById('kyc-id').value || 'V-00000000',
                phone: document.getElementById('kyc-phone').value,
                email: document.getElementById('kyc-email') ? document.getElementById('kyc-email').value : '',
                address: document.getElementById('kyc-address') ? document.getElementById('kyc-address').value : '',
                latitude: null,
                longitude: null,
                vehicles: vehiclesList,
                telemetry_opt_in: {
                    has_physical_gps: document.getElementById('gps-yes').checked,
                    gps_imei: document.getElementById('gps-yes').checked ? document.getElementById('kyc-gps-imei').value : null,
                    gps_provider: document.getElementById('gps-yes').checked ? document.getElementById('kyc-gps-provider').value : null
                }
            };

            console.log('%c[Cardakar KYC Final Payload]', 'color: #e07a2c; font-weight: bold; font-size: 14px;', payload);

            // POST to local Node serve.js DB simulation
            try {
                const localResp = await fetch('/api/register-basic', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const localData = await localResp.json();
                console.log('Saved to server memory:', localData);
            } catch (err) {
                console.error('Error saving to server memory:', err);
            }

            // POST Webhook to n8n (Production URL)
            const webhookUrl = 'https://chatbot-isp-n8n.ha4i6p.easypanel.host/webhook/cardakar-kyc-intake';
            try {
                const hookAbort = new AbortController();
                const hookTimeout = setTimeout(() => hookAbort.abort(), 8000); // Wait up to 8s for n8n

                const hookResp = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullname: payload.fullname,
                        national_id: payload.national_id,
                        phone: payload.phone,
                        email: payload.email,
                        address: payload.address,
                        latitude: payload.latitude,
                        longitude: payload.longitude,
                        vehicles: payload.vehicles,
                        has_physical_gps: payload.telemetry_opt_in.has_physical_gps,
                        gps_imei: payload.telemetry_opt_in.gps_imei,
                        gps_provider: payload.telemetry_opt_in.gps_provider,
                        status: 'Pre_Registered'
                    }),
                    signal: hookAbort.signal
                });
                clearTimeout(hookTimeout);

                if (!hookResp.ok) {
                    throw new Error(`Servidor devolvió error: ${hookResp.status}`);
                }
            } catch (err) {
                if (loadingOverlay) loadingOverlay.classList.remove('active');
                alert("Hubo un problema al enviar tu registro. Por favor intenta de nuevo. (" + err.message + ")");
                return; // Stop on error
            }

            // Update success details text for complete (vehicle) registration
            const successDesc = successOverlay.querySelector('.success-card p');
            const successDetails = successOverlay.querySelector('.success-details');
            if (successDesc) {
                successDesc.innerHTML = '¡Tu registro fue recibido. Pronto recibirás un correo de confirmación!';
            }
            if (successDetails) {
                successDetails.innerHTML = `
                    <p><strong>Estatus actual:</strong> Pre-Inscrito (Falta Documentación).</p>
                    <p style="margin-top: 8px; color: var(--text-muted);">Para terminar de certificar la unidad y habilitar tu Cédula Digital, ahora debes subir las fotos de tus documentos. Al hacer clic en <b>Entendido</b>, te llevaremos directamente a la carga de documentos.</p>
                `;
            }

            if (loadingOverlay) loadingOverlay.classList.remove('active');
            if (successOverlay) successOverlay.classList.add('active');
        });
    }

    // Close Success overlay and reset form
    if (closeSuccessBtn && successOverlay && kycForm) {
        closeSuccessBtn.addEventListener('click', () => {
            const certifyRadioYes = document.querySelector('input[name="certify_now_new"][value="yes"]');
            const isCertifying = certifyRadioYes && certifyRadioYes.checked;
            const savedIdVal = document.getElementById('kyc-id').value;

            successOverlay.classList.remove('active');
            kycForm.reset();
            
            // Clear dynamic vehicle rows except first
            if (vehiclesContainer) {
                const rows = vehiclesContainer.querySelectorAll('.vehicle-row');
                for (let i = 1; i < rows.length; i++) {
                    rows[i].remove();
                }
                updateDeleteButtonsVisibility();
            }

            if (btnStep1SubmitBasic) btnStep1SubmitBasic.disabled = true;
            if (verifyIdFeedback) verifyIdFeedback.textContent = '';

            // Go back to Step 1
            goToStep(1);

            // Redirect to Phase B document upload if they chose to certify
            if (isCertifying && savedIdVal) {
                const searchIdInput = document.getElementById('portal-search-id-num');
                const typeSelect = document.getElementById('portal-id-type');
                
                const parts = savedIdVal.split('-');
                if (parts.length === 2) {
                    if (typeSelect) typeSelect.value = parts[0];
                    if (searchIdInput) searchIdInput.value = parts[1];
                } else {
                    if (searchIdInput) searchIdInput.value = savedIdVal;
                }
                
                // Switch tab to Phase B
                const tabCedula = document.querySelector('.proto-tab[data-view="cedula"]');
                if (tabCedula) {
                    tabCedula.click();
                }
                
                // Log in automatically to open document upload form
                const btnPortalLogin = document.getElementById('btn-portal-login');
                if (btnPortalLogin) {
                    setTimeout(() => btnPortalLogin.click(), 300);
                }
            }
        });
    }

    // Initialize Caracas as default state
    renderStateData('caracas');


    // 4. Reveal Sections on Scroll (Smooth Fade In)
    const revealElements = [
        ...document.querySelectorAll('.benefit-card'),
        ...document.querySelectorAll('.timeline-item'),
        document.querySelector('.kyc-form-container'),
        document.querySelector('.map-dashboard'),
        document.querySelector('.faq-container')
    ];

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        if (el) {
            // Apply initial transition styles via JS to avoid flashing if JS is disabled
            el.style.opacity = '0';
            el.style.transform = 'translateY(25px)';
            el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            revealObserver.observe(el);
        }
    });

    // Dynamically inject styles for revealed state
    const revealStyle = document.createElement('style');
    revealStyle.innerHTML = `
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(revealStyle);

    // ==========================================================================
    // GPS Field Toggling logic (Step 4)
    // ==========================================================================
    const gpsYesRadio = document.getElementById('gps-yes');
    const gpsNoRadio = document.getElementById('gps-no');
    const gpsPhysicalFields = document.getElementById('gps-physical-fields');
    const gpsSmartphoneFields = document.getElementById('gps-smartphone-fields');
    const gpsImeiInput = document.getElementById('kyc-gps-imei');
    const gpsProviderInput = document.getElementById('kyc-gps-provider');

    function toggleGpsFields() {
        if (gpsYesRadio && gpsYesRadio.checked) {
            if (gpsPhysicalFields) gpsPhysicalFields.style.display = 'grid';
            if (gpsSmartphoneFields) gpsSmartphoneFields.style.display = 'none';
            if (gpsImeiInput) gpsImeiInput.required = true;
            if (gpsProviderInput) gpsProviderInput.required = true;
        } else if (gpsNoRadio && gpsNoRadio.checked) {
            if (gpsPhysicalFields) gpsPhysicalFields.style.display = 'none';
            if (gpsSmartphoneFields) gpsSmartphoneFields.style.display = 'block';
            if (gpsImeiInput) {
                gpsImeiInput.required = false;
                gpsImeiInput.value = '';
            }
            if (gpsProviderInput) {
                gpsProviderInput.required = false;
                gpsProviderInput.value = '';
            }
        }
    }

    if (gpsYesRadio && gpsNoRadio) {
        gpsYesRadio.addEventListener('change', toggleGpsFields);
        gpsNoRadio.addEventListener('change', toggleGpsFields);
        toggleGpsFields(); // Run initially
    }

    // ==========================================================================
    // Fase B: Portal del Chofer y Control de Acceso (Cédula Digital)
    // ==========================================================================
    const portalLoginSection = document.getElementById('portal-login-section');
    const portalProfileSection = document.getElementById('portal-profile-section');
    const portalSearchId = document.getElementById('portal-search-id');
    const btnPortalLogin = document.getElementById('btn-portal-login');
    const btnPortalLogout = document.getElementById('btn-portal-logout');
    const portalLoginFeedback = document.getElementById('portal-login-feedback');
    const portalStatusBox = document.getElementById('portal-status-box');
    const portalUploadDocsForm = document.getElementById('portal-upload-docs-form');
    const statusToggleBtns = document.querySelectorAll('.status-toggle-btn');
    
    // Mobile card mock elements
    const driverCardScreen = document.getElementById('driver-card-screen');
    const cardDriverName = document.getElementById('card-driver-name');
    const cardDriverId = document.getElementById('card-driver-id');
    const cardDriverVehicle = document.getElementById('card-driver-vehicle');
    const cardDriverPlate = document.getElementById('card-driver-plate');
    const accessStatusTitle = document.getElementById('access-status-title');
    const accessStatusDesc = document.getElementById('access-status-desc');
    const statusIconBox = document.getElementById('status-icon-box');

    let currentDriver = null;

    if (btnPortalLogin && portalSearchId) {
        btnPortalLogin.addEventListener('click', async () => {
            const type = document.getElementById('portal-id-type').value;
            const numVal = document.getElementById('portal-search-id-num').value.trim();
            if (!numVal) {
                showFeedback(portalLoginFeedback, 'Ingresa tu número de documento.', 'error');
                return;
            }

            let cleanNum = numVal;
            if (type !== 'P') {
                cleanNum = numVal.replace(/\D/g, '');
            }
            if (!cleanNum) {
                showFeedback(portalLoginFeedback, 'Formato de documento inválido.', 'error');
                return;
            }

            const formattedId = `${type}-${cleanNum}`;
            portalSearchId.value = formattedId;

            showFeedback(portalLoginFeedback, 'Cargando perfil...', 'loading');

            try {
                const response = await fetch(`/api/driver/${formattedId}`);
                if (!response.ok) {
                    throw new Error('Chofer no encontrado');
                }
                const data = await response.json();
                if (data.success && data.driver) {
                    currentDriver = data.driver;
                    showFeedback(portalLoginFeedback, '', '');
                    portalLoginSection.style.display = 'none';
                    portalProfileSection.style.display = 'block';
                    renderPortalProfile();
                } else {
                    throw new Error('Datos incorrectos');
                }
            } catch (err) {
                showFeedback(portalLoginFeedback, 'Cédula no pre-inscrita. Por favor realiza el registro básico en la pestaña de Onboarding.', 'error');
                console.error(err);
            }
        });
    }

    if (btnPortalLogout) {
        btnPortalLogout.addEventListener('click', () => {
            currentDriver = null;
            portalProfileSection.style.display = 'none';
            portalLoginSection.style.display = 'block';
            portalSearchId.value = '';
            const portalSearchIdNum = document.getElementById('portal-search-id-num');
            if (portalSearchIdNum) portalSearchIdNum.value = '';
            const portalIdType = document.getElementById('portal-id-type');
            if (portalIdType) portalIdType.value = 'V';
            resetDriverCardMockup();
        });
    }

    function renderPortalProfile() {
        if (!currentDriver) return;

        // Render status banner in portal
        portalStatusBox.className = 'status-alert-box';
        let statusHtml = '';
        let showForm = false;

        const status = currentDriver.status;
        if (status === 'Pre_Registered') {
            portalStatusBox.classList.add('pre-registered');
            statusHtml = `<strong>Estatus: Pre-Inscrito (Falta Documentación)</strong><br>Tu registro básico está completo, pero debes subir los documentos obligatorios a continuación para activar tu acreditación.`;
            showForm = true;
        } else if (status === 'Pending_Audit') {
            portalStatusBox.classList.add('pending-audit');
            statusHtml = `<strong>Estatus: En Auditoría (Pendiente de Aprobación)</strong><br>Hemos recibido tus documentos y nuestro equipo técnico los está auditando. Te notificaremos vía WhatsApp al ser aprobado.`;
            showForm = false;
        } else if (status === 'Active') {
            portalStatusBox.classList.add('active');
            statusHtml = `<strong>Estatus: Activo (Acreditado)</strong><br>¡Felicidades! Tu unidad está verificada y activa. Ya puedes presentarte en planta y cargar fletes autorizados. Tu Cédula Digital está habilitada.`;
            showForm = false;
        } else if (status === 'Rejected') {
            portalStatusBox.classList.add('rejected');
            statusHtml = `<strong>Estatus: Rechazado (Trámite con observaciones)</strong><br>La documentación cargada no cumple con las políticas de seguridad de Cardakar. Por favor, revisa y vuelve a subir los archivos.`;
            showForm = true;
        }

        portalStatusBox.innerHTML = statusHtml;
        portalUploadDocsForm.style.display = showForm ? 'block' : 'none';

        if (showForm) {
            const licenseNumInput = document.getElementById('portal-license-num');
            const addressInput = document.getElementById('portal-address');
            if (licenseNumInput) licenseNumInput.value = currentDriver.license_number || '';
            if (addressInput) addressInput.value = currentDriver.address || '';
        }

        // Render mobile card mockup
        updateDriverCardMockup();
    }

    function updateDriverCardMockup() {
        if (!currentDriver) return;

        if (cardDriverName) cardDriverName.textContent = currentDriver.fullname;
        if (cardDriverId) cardDriverId.textContent = currentDriver.national_id;

        // Licencia
        const cardDriverLicense = document.getElementById('card-driver-license');
        if (cardDriverLicense) {
            cardDriverLicense.textContent = currentDriver.license_number 
                ? `5ta (${currentDriver.license_number})` 
                : `5ta (5-${currentDriver.national_id.replace(/\D/g, '')})`;
        }

        // Serial único
        const cardDriverSerial = document.getElementById('card-driver-serial');
        if (cardDriverSerial) {
            const cleanId = currentDriver.national_id.replace(/[^a-zA-Z0-9]/g, '');
            cardDriverSerial.textContent = `CDK-${cleanId}-2026`;
        }

        // Fechas de emisión y vencimiento
        const cardDriverIssued = document.getElementById('card-driver-issued');
        const cardDriverExpires = document.getElementById('card-driver-expires');
        
        let issueDate = new Date();
        if (currentDriver.created_at) {
            issueDate = new Date(currentDriver.created_at);
        }
        
        let expDate = new Date(issueDate);
        expDate.setFullYear(issueDate.getFullYear() + 1);

        const formatDate = (date) => {
            const d = String(date.getDate()).padStart(2, '0');
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const y = date.getFullYear();
            return `${d}/${m}/${y}`;
        };

        if (cardDriverIssued) cardDriverIssued.textContent = formatDate(issueDate);
        if (cardDriverExpires) cardDriverExpires.textContent = formatDate(expDate);

        // Barcode label
        const barcodeLabel = document.querySelector('.barcode-box span');
        if (barcodeLabel) {
            const cleanId = currentDriver.national_id.replace(/\D/g, '');
            barcodeLabel.textContent = `CDK-${cleanId}00`;
        }

        // Get primary vehicle details
        const primaryVehicle = (currentDriver.vehicles && currentDriver.vehicles.length > 0)
            ? currentDriver.vehicles[0]
            : { vehicle_type: 'Gandola', plate: 'A12B34C' };

        if (cardDriverVehicle) cardDriverVehicle.textContent = primaryVehicle.vehicle_type;
        if (cardDriverPlate) cardDriverPlate.textContent = primaryVehicle.plate;

        // Photo logic (if driver has selfie or uploaded it)
        const photoEl = document.getElementById('card-driver-photo');
        if (photoEl) {
            if (currentDriver.selfie_url) {
                photoEl.src = currentDriver.selfie_url;
            } else if (portalUploadedFilesData.selfie && portalUploadedFilesData.selfie.length > 0) {
                photoEl.src = portalUploadedFilesData.selfie[0].data;
            } else {
                photoEl.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
            }
        }

        // Update active classes on mockup card
        if (currentDriver.status === 'Active') {
            driverCardScreen.classList.remove('state-suspendido');
            driverCardScreen.classList.add('state-activo');
            if (accessStatusTitle) accessStatusTitle.textContent = "Acceso Autorizado";
            if (accessStatusDesc) accessStatusDesc.textContent = "Unidad certificada y activa en la base de datos de Cardakar.";
            if (statusIconBox) {
                statusIconBox.innerHTML = `
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #10b981;">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
            }
        } else {
            driverCardScreen.classList.remove('state-activo');
            driverCardScreen.classList.add('state-suspendido');
            if (accessStatusTitle) accessStatusTitle.textContent = "Acceso Denegado";
            
            if (currentDriver.status === 'Pre_Registered') {
                if (accessStatusDesc) accessStatusDesc.textContent = "Unidad pre-inscrita. Falta subir documentos en el portal.";
            } else if (currentDriver.status === 'Pending_Audit') {
                if (accessStatusDesc) accessStatusDesc.textContent = "Documentación en revisión. Auditoría pendiente.";
            } else {
                if (accessStatusDesc) accessStatusDesc.textContent = "Acceso denegado. Documentación rechazada o vencida.";
            }

            if (statusIconBox) {
                statusIconBox.innerHTML = `
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #ef4444;">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                `;
            }
        }
    }

    function resetDriverCardMockup() {
        if (cardDriverName) cardDriverName.textContent = "Juan Carlos Pérez";
        if (cardDriverId) cardDriverId.textContent = "V-12.345.678";
        if (cardDriverVehicle) cardDriverVehicle.textContent = "Gandola (Mack)";
        if (cardDriverPlate) cardDriverPlate.textContent = "A12B34C";

        const cardDriverLicense = document.getElementById('card-driver-license');
        if (cardDriverLicense) cardDriverLicense.textContent = "5ta (5-12345678)";

        const cardDriverSerial = document.getElementById('card-driver-serial');
        if (cardDriverSerial) cardDriverSerial.textContent = "CDK-V12345678-2026";

        const cardDriverIssued = document.getElementById('card-driver-issued');
        const cardDriverExpires = document.getElementById('card-driver-expires');
        if (cardDriverIssued) cardDriverIssued.textContent = "12/06/2026";
        if (cardDriverExpires) cardDriverExpires.textContent = "12/06/2027";

        const barcodeLabel = document.querySelector('.barcode-box span');
        if (barcodeLabel) barcodeLabel.textContent = "CDK-78419200";

        const photoEl = document.getElementById('card-driver-photo');
        if (photoEl) photoEl.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';

        driverCardScreen.classList.remove('state-suspendido');
        driverCardScreen.classList.add('state-activo');
        if (accessStatusTitle) accessStatusTitle.textContent = "Acceso Autorizado";
        if (accessStatusDesc) accessStatusDesc.textContent = "Unidad certificada y activa en la base de datos de Cardakar.";
        if (statusIconBox) {
            statusIconBox.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #10b981;">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
        }
    }

    // Handle Upload Documents form submit
    if (portalUploadDocsForm) {
        portalUploadDocsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentDriver) return;

            const portalLicenseNum = document.getElementById('portal-license-num').value.trim();
            if (!portalLicenseNum) {
                alert('Por favor, ingresa tu número de licencia.');
                return;
            }

            const portalAddress = document.getElementById('portal-address').value.trim();
            if (!portalAddress) {
                alert('Por favor, ingresa tu dirección de habitación.');
                return;
            }

            if (loadingOverlay) loadingOverlay.classList.add('active');

            // Capture GPS Coordinates
            let lat = 10.4806;
            let lng = -66.9036; // Default to Caracas Centro if error or denied
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 4000,
                        maximumAge: 60000,
                        enableHighAccuracy: true
                    });
                });
                lat = position.coords.latitude;
                lng = position.coords.longitude;
            } catch (err) {
                console.warn('Geolocation capture failed or denied:', err.message);
            }

            // Populate hidden fields
            const latInput = document.getElementById('portal-latitude');
            const lngInput = document.getElementById('portal-longitude');
            if (latInput) latInput.value = lat;
            if (lngInput) lngInput.value = lng;

            const payload = {
                driver_id: currentDriver.driver_id,
                fullname: currentDriver.fullname,
                national_id: currentDriver.national_id,
                phone: currentDriver.phone,
                license_number: portalLicenseNum,
                vehicles: currentDriver.vehicles,
                has_physical_gps: currentDriver.has_physical_gps,
                gps_imei: currentDriver.gps_imei,
                gps_provider: currentDriver.gps_provider,
                address: portalAddress,
                latitude: lat,
                longitude: lng,
                documents: portalUploadedFilesData // Base64 files gathered
            };

            // Post to backend server to transition status to Pending_Audit
            try {
                const localResp = await fetch('/api/update-documents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        national_id: currentDriver.national_id,
                        license_number: portalLicenseNum,
                        address: portalAddress,
                        latitude: lat,
                        longitude: lng,
                        documents: Object.keys(portalUploadedFilesData) // send only keys to local mem or fake URL
                    })
                });
                const localData = await localResp.json();
                console.log('Documents updated locally:', localData);
            } catch (err) {
                console.error('Error updating locally:', err);
            }

            // Post to n8n webhook (which triggers Telegram notification with doc URLs)
            const webhookUrl = 'https://chatbot-isp-n8n.ha4i6p.easypanel.host/webhook/cardakar-kyc-intake';
            try {
                await Promise.race([
                    fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500))
                ]);
            } catch (err) {
                console.log('%c[Webhook Status] n8n Webhook post completed. Error ignored: ' + err.message, 'color: #94a3b8;');
            }

            // Reset form files
            portalUploadDocsForm.reset();
            portalFileInputs.forEach(cfg => {
                const prev = document.getElementById(cfg.previewId);
                if (prev) prev.innerHTML = '';
            });
            for (let member in portalUploadedFilesData) delete portalUploadedFilesData[member];

            // Re-fetch profile to load updated status (Pending_Audit)
            try {
                const response = await fetch(`/api/driver/${currentDriver.national_id}`);
                const data = await response.json();
                if (data.success && data.driver) {
                    currentDriver = data.driver;
                    renderPortalProfile();
                }
            } catch (err) {
                console.error(err);
            }

            if (loadingOverlay) loadingOverlay.classList.remove('active');
        });
    }

    // Force Status (Debug console in demo portal)
    statusToggleBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const status = btn.getAttribute('data-status');
            const targetId = currentDriver ? currentDriver.national_id : 'V-12.345.678';
            
            try {
                const response = await fetch('/api/update-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        national_id: targetId,
                        status: status
                    })
                });
                const data = await response.json();
                if (data.success) {
                    if (currentDriver) {
                        currentDriver = data.driver;
                        renderPortalProfile();
                    } else {
                        // Just mock toggle the default view
                        updateMockDefaultCardStatus(status);
                    }
                }
            } catch (err) {
                console.error('Error overrides status:', err);
            }
        });
    });

    function updateMockDefaultCardStatus(status) {
        if (!driverCardScreen) return;
        driverCardScreen.classList.remove('state-activo', 'state-suspendido');
        if (status === 'activo') {
            driverCardScreen.classList.add('state-activo');
            if (accessStatusTitle) accessStatusTitle.textContent = "Acceso Autorizado";
            if (accessStatusDesc) accessStatusDesc.textContent = "Unidad certificada y activa en la base de datos de Cardakar.";
            if (statusIconBox) {
                statusIconBox.innerHTML = `
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #10b981;">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
            }
        } else {
            driverCardScreen.classList.add('state-suspendido');
            if (accessStatusTitle) accessStatusTitle.textContent = "Acceso Denegado";
            if (accessStatusDesc) accessStatusDesc.textContent = "Unidad suspendida. Razón: KYC Expirado o Documentación Desactualizada.";
            if (statusIconBox) {
                statusIconBox.innerHTML = `
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #ef4444;">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                `;
            }
        }
    }

    updateMockDefaultCardStatus('activo'); // Run initially

    // ==========================================================================
    // Fase C: Motor de Telemetría (Portal B2B Tracking)
    // ==========================================================================
    const masterRouteCoordinates = [
        [10.4806, -66.9036], // Caracas (Salida) [0]
        [10.4350, -66.9850], // Tazón [1]
        [10.3950, -67.1200], // Paracotos [2]
        [10.2796, -67.2452], // Las Tejerías [3]
        [10.2250, -67.3800], // El Consejo [4]
        [10.2222, -67.4333], // La Victoria [5]
        [10.2469, -67.5958], // Maracay [6]
        [10.2319, -67.7011], // Mariara [7]
        [10.2000, -67.8500], // Guacara [8]
        [10.1628, -68.0075], // Valencia [9]
        [10.2200, -68.1200], // Tocuyito [10]
        [10.2500, -68.2500], // Bejuma (Alrededores) [11]
        [10.2800, -68.4500], // Nirgua (Alrededores) [12]
        [10.3200, -68.6000], // Chivacoa [13]
        [10.3391, -68.7403], // San Felipe [14]
        [10.2800, -68.9000], // Urachiche [15]
        [10.1500, -69.1000], // Yaritagua [16]
        [10.0682, -69.3472]  // Barquisimeto (Llegada) [17]
    ];

    let activeDriversList = [];
    let currentSelectedDriver = null;
    let dynamicRouteCoordinates = [];
    let accumulatedTelemetry = [];

    let map;
    let truckMarker;
    let routePolyline;
    let simulationInterval = null;
    let currentCoordIndex = 0;
    
    let offlineBuffer = [];
    let isOffline = false;
    let isDelivered = false;
    
    let b2bMapInitialized = false;

    const b2bDriverSelect = document.getElementById('b2b-driver-select');
    const simOfflineZone = document.getElementById('sim-offline-zone');
    const bufferCountEl = document.getElementById('buffer-count');
    const offlineBufferStatusPanel = document.getElementById('offline-buffer-status');
    const hudConnStatus = document.getElementById('hud-conn-status');
    const simTripStatus = document.getElementById('sim-trip-status');
    const tripTagStatus = document.getElementById('trip-tag-status');
    const coordLogStream = document.getElementById('coord-log-stream');
    const hudSpeed = document.getElementById('hud-speed');
    const hudLastGps = document.getElementById('hud-last-gps');
    const btnGenerateManifest = document.getElementById('btn-generate-manifest');

    // Load active drivers from backend API
    async function loadActiveDrivers() {
        if (!b2bDriverSelect) return;
        
        try {
            const resp = await fetch('/api/drivers/active');
            const data = await resp.json();
            if (data.success && data.drivers && data.drivers.length > 0) {
                activeDriversList = data.drivers;
            } else {
                throw new Error("No active drivers in DB");
            }
        } catch (err) {
            console.warn('API Active drivers load failed, using local mock defaults:', err.message);
            activeDriversList = [
                {
                    driver_id: 'cdk_12345678',
                    fullname: 'JUAN CARLOS PÉREZ',
                    national_id: 'V-12.345.678',
                    phone: '+58 412 1234567',
                    license_number: '5-12345678',
                    vehicles: [{ vehicle_type: 'Gandola', plate: 'A12B34C' }],
                    has_physical_gps: true,
                    gps_imei: '860123456789012',
                    gps_provider: 'Satelital GPS',
                    status: 'Active',
                    latitude: 10.4806,
                    longitude: -66.9036
                },
                {
                    driver_id: 'cdk_13921227',
                    fullname: 'CARLOS MONTES',
                    national_id: 'V-13.921.227',
                    phone: '+58 414 9876543',
                    license_number: '5-13921227',
                    vehicles: [{ vehicle_type: 'NPR', plate: 'A88B77D' }],
                    has_physical_gps: false,
                    gps_imei: null,
                    gps_provider: null,
                    status: 'Active',
                    latitude: 10.1628,
                    longitude: -68.0075
                },
                {
                    driver_id: 'cdk_87654321',
                    fullname: 'MARÍA RODRÍGUEZ',
                    national_id: 'V-8.765.4321',
                    phone: '+58 416 1112223',
                    license_number: '5-87654321',
                    vehicles: [{ vehicle_type: 'Cava Cuarto', plate: 'A99B88E' }],
                    has_physical_gps: true,
                    gps_imei: '860987654321098',
                    gps_provider: 'Localizador Total',
                    status: 'Active',
                    latitude: 10.2469,
                    longitude: -67.5958
                }
            ];
        }

        // Populate select box
        b2bDriverSelect.innerHTML = '';
        activeDriversList.forEach(driver => {
            const opt = document.createElement('option');
            opt.value = driver.driver_id;
            opt.textContent = `${driver.fullname} (${driver.national_id}) - ${driver.vehicles && driver.vehicles.length > 0 ? driver.vehicles[0].vehicle_type : 'Gandola'}`;
            b2bDriverSelect.appendChild(opt);
        });

        // Set default selected
        if (activeDriversList.length > 0) {
            selectDriverB2B(activeDriversList[0]);
        }
    }

    function selectDriverB2B(driver) {
        currentSelectedDriver = driver;
        
        // Stop current simulation
        if (simulationInterval) clearInterval(simulationInterval);
        accumulatedTelemetry = [];
        offlineBuffer = [];
        if (bufferCountEl) bufferCountEl.textContent = "0";
        if (coordLogStream) coordLogStream.innerHTML = '<div class="log-item system">Cambiando unidad de monitoreo...</div>';
        
        // Reset controls
        isOffline = false;
        if (simOfflineZone) simOfflineZone.checked = false;
        if (offlineBufferStatusPanel) offlineBufferStatusPanel.classList.remove('active');
        isDelivered = false;
        if (simTripStatus) simTripStatus.value = "En_Ruta";
        if (tripTagStatus) {
            tripTagStatus.textContent = "En_Ruta";
            tripTagStatus.className = "trip-tag";
        }
        if (hudConnStatus) {
            hudConnStatus.textContent = "ONLINE";
            hudConnStatus.className = "hud-val success";
        }

        // Update UI info fields
        const vInfo = (driver.vehicles && driver.vehicles.length > 0) ? driver.vehicles[0] : { vehicle_type: 'Gandola', plate: 'A12B34C' };
        document.getElementById('b2b-driver-name').textContent = driver.fullname;
        document.getElementById('b2b-vehicle-name').textContent = `${vInfo.vehicle_type} (${vInfo.plate})`;
        
        // Set trip serial based on ID
        const cleanId = driver.national_id.replace(/\D/g, '');
        document.getElementById('b2b-trip-title').textContent = `Viaje #V-${cleanId.substring(0, 4)}`;

        // Map Client randomly for display realism
        const clients = ["Empresas Polar C.A.", "Cargill de Venezuela C.A.", "Alimentos Nestlé C.A.", "MONACA", "Complejo Siderúrgico Nacional"];
        const clientIndex = parseInt(cleanId) % clients.length;
        document.getElementById('b2b-client-name').textContent = clients[clientIndex];

        // Determine starting route coordinates depending on driver's initial coordinates
        // We match them closely to Caracas, Valencia, or Maracay
        let startIdx = 0; // Caracas
        const lat = parseFloat(driver.latitude);
        const lng = parseFloat(driver.longitude);
        
        if (lat && lng) {
            if (Math.abs(lat - 10.1628) < 0.2 || Math.abs(lng - -68.0075) < 0.2) {
                startIdx = 9; // Valencia
                document.getElementById('b2b-route-name').innerHTML = 'Valencia (Carabobo) &rarr; Barquisimeto (Lara)';
            } else if (Math.abs(lat - 10.2469) < 0.2 || Math.abs(lng - -67.5958) < 0.2) {
                startIdx = 6; // Maracay
                document.getElementById('b2b-route-name').innerHTML = 'Maracay (Aragua) &rarr; Barquisimeto (Lara)';
            } else {
                document.getElementById('b2b-route-name').innerHTML = 'Caracas (D.C.) &rarr; Barquisimeto (Lara)';
            }
        } else {
            document.getElementById('b2b-route-name').innerHTML = 'Caracas (D.C.) &rarr; Barquisimeto (Lara)';
        }

        // Slice route coordinates from starting index to destination (Lara)
        dynamicRouteCoordinates = masterRouteCoordinates.slice(startIdx);
        currentCoordIndex = 0;

        // Reset map track
        if (b2bMapInitialized && map) {
            // Remove previous route line
            if (routePolyline) map.removeLayer(routePolyline);
            
            // Draw new route line
            routePolyline = L.polyline(dynamicRouteCoordinates, {
                color: '#e07a2c',
                weight: 4,
                opacity: 0.8,
                dashArray: '5, 10'
            }).addTo(map);

            const startCoord = dynamicRouteCoordinates[0];
            if (truckMarker) {
                truckMarker.setLatLng(startCoord);
                if (!truckMarker._map) truckMarker.addTo(map);
            }
            map.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });

            logSystemMessage(`📡 Enlace establecido con GPS ${driver.has_physical_gps ? 'Físico' : 'Móvil'} de ${driver.fullname}.`);
            startRouteSimulation();
        }
    }

    // Load selector change
    if (b2bDriverSelect) {
        b2bDriverSelect.addEventListener('change', (e) => {
            const selectedId = e.target.value;
            const driverObj = activeDriversList.find(d => d.driver_id === selectedId);
            if (driverObj) {
                selectDriverB2B(driverObj);
            }
        });
    }

    function initB2BMap() {
        if (b2bMapInitialized) {
            if (map) map.invalidateSize();
            loadActiveDrivers();
            return;
        }

        // Initialize Map
        map = L.map('leaflet-map').setView([10.25, -68.0], 8);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Custom div icon
        const truckIcon = L.divIcon({
            html: `<div style="background-color: var(--color-secondary); width: 14px; height: 14px; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px var(--color-secondary); animation: beacon 2s infinite;"></div>`,
            className: 'truck-div-icon',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        truckMarker = L.marker(masterRouteCoordinates[0], { icon: truckIcon }).addTo(map);
        b2bMapInitialized = true;

        // Reload select triggers map update
        loadActiveDrivers();
    }

    function startRouteSimulation() {
        if (simulationInterval) clearInterval(simulationInterval);
        
        simulationInterval = setInterval(() => {
            if (isDelivered || dynamicRouteCoordinates.length === 0) return;

            currentCoordIndex = (currentCoordIndex + 1) % dynamicRouteCoordinates.length;
            const currentCoord = dynamicRouteCoordinates[currentCoordIndex];
            const speed = Math.floor(Math.random() * 20) + 65; // Speed 65-85 km/h

            if (isOffline) {
                // Buffer coordinate
                offlineBuffer.push({ coord: currentCoord, speed: speed });
                if (bufferCountEl) bufferCountEl.textContent = offlineBuffer.length;
                logTelemetryCoord(currentCoord, speed, "OFFLINE_BUFFER");
            } else {
                // Online
                if (truckMarker) {
                    truckMarker.setLatLng(currentCoord);
                    map.panTo(currentCoord);
                }
                updateTelemetryHUD(speed, currentCoord);
                logTelemetryCoord(currentCoord, speed, "ONLINE");
                
                // Add to accumulated telemetry log
                accumulatedTelemetry.push({
                    latitude: currentCoord[0],
                    longitude: currentCoord[1],
                    speed: speed,
                    timestamp: new Date().toISOString(),
                    connection: "ONLINE"
                });
            }

            if (currentCoordIndex === dynamicRouteCoordinates.length - 1) {
                logSystemMessage("🏁 Llegada a destino. Geocerca de entrega activada.");
                // Automatically switch simulation controls to Entregado
                if (simTripStatus) {
                    simTripStatus.value = "Entregado";
                    simTripStatus.dispatchEvent(new Event('change'));
                }
            }
        }, 3000);
    }

    function logTelemetryCoord(coord, speed, type = "ONLINE") {
        if (!coordLogStream) return;

        const timeStr = new Date().toLocaleTimeString();
        const lat = coord[0].toFixed(5);
        const lng = coord[1].toFixed(5);
        const logItem = document.createElement('div');
        
        if (type === "ONLINE") {
            logItem.className = 'log-item';
            logItem.textContent = `[${timeStr}] 📡 GPS: Lat ${lat}, Lng ${lng} | Velocidad: ${speed} km/h (ONLINE)`;
        } else if (type === "OFFLINE_BUFFER") {
            logItem.className = 'log-item offline';
            logItem.textContent = `[${timeStr}] 💾 BUFFERED: Lat ${lat}, Lng ${lng} | Velocidad: ${speed} km/h (OFFLINE)`;
        } else if (type === "FLUSHED") {
            logItem.className = 'log-item online';
            logItem.textContent = `[${timeStr}] 📤 TRANSMITIDO: Lat ${lat}, Lng ${lng} | Velocidad: ${speed} km/h (FLUSHED)`;
        }

        coordLogStream.appendChild(logItem);
        coordLogStream.scrollTop = coordLogStream.scrollHeight;

        const logs = coordLogStream.querySelectorAll('.log-item, .log-item.system');
        if (logs.length > 20) {
            logs[0].remove();
        }
    }

    function logSystemMessage(message) {
        if (!coordLogStream) return;
        const timeStr = new Date().toLocaleTimeString();
        const logItem = document.createElement('div');
        logItem.className = 'log-item system';
        logItem.textContent = `[${timeStr}] ${message}`;
        coordLogStream.appendChild(logItem);
        coordLogStream.scrollTop = coordLogStream.scrollHeight;
    }

    function updateTelemetryHUD(speed, coord) {
        if (hudSpeed) hudSpeed.textContent = `${speed} km/h`;
        if (hudLastGps) hudLastGps.textContent = new Date().toLocaleTimeString();
    }

    if (simOfflineZone) {
        simOfflineZone.addEventListener('change', (e) => {
            isOffline = e.target.checked;
            if (isOffline) {
                if (hudConnStatus) {
                    hudConnStatus.textContent = "OFFLINE";
                    hudConnStatus.className = "hud-val danger";
                }
                if (offlineBufferStatusPanel) offlineBufferStatusPanel.classList.add('active');
                if (hudSpeed) hudSpeed.textContent = "0 km/h";
                logSystemMessage("⚠️ Señal celular perdida. Almacenando telemetría localmente...");
            } else {
                if (hudConnStatus) {
                    hudConnStatus.textContent = "ONLINE";
                    hudConnStatus.className = "hud-val success";
                }
                if (offlineBufferStatusPanel) offlineBufferStatusPanel.classList.remove('active');
                
                if (offlineBuffer.length > 0) {
                    logSystemMessage(`📡 Enlace 4G restablecido. Volcando ${offlineBuffer.length} registros del buffer local...`);
                    
                    offlineBuffer.forEach((buf, idx) => {
                        setTimeout(() => {
                            logTelemetryCoord(buf.coord, buf.speed, "FLUSHED");
                            accumulatedTelemetry.push({
                                latitude: buf.coord[0],
                                longitude: buf.coord[1],
                                speed: buf.speed,
                                timestamp: new Date().toISOString(),
                                connection: "FLUSHED"
                            });
                        }, idx * 150);
                    });
                    
                    offlineBuffer = [];
                    if (bufferCountEl) bufferCountEl.textContent = "0";

                    // Catch up marker on map
                    const currentCoord = dynamicRouteCoordinates[currentCoordIndex];
                    if (truckMarker) {
                        truckMarker.setLatLng(currentCoord);
                        map.panTo(currentCoord);
                    }
                }
            }
        });
    }

    if (simTripStatus) {
        simTripStatus.addEventListener('change', (e) => {
            const status = e.target.value;
            if (status === 'Entregado') {
                isDelivered = true;
                if (truckMarker && map) {
                    map.removeLayer(truckMarker);
                }
                if (tripTagStatus) {
                    tripTagStatus.textContent = "Entregado";
                    tripTagStatus.className = "trip-tag delivered";
                }
                if (hudConnStatus) {
                    hudConnStatus.textContent = "GEOFENCE_OFF";
                    hudConnStatus.className = "hud-val";
                }
                if (hudSpeed) hudSpeed.textContent = "0 km/h";
                logSystemMessage("🔒 Geocerca de entrega activa. Telemetría APAGADA por privacidad del transportista.");
            } else {
                isDelivered = false;
                if (truckMarker && map) {
                    truckMarker.addTo(map);
                }
                if (tripTagStatus) {
                    tripTagStatus.textContent = "En_Ruta";
                    tripTagStatus.className = "trip-tag";
                }
                if (hudConnStatus) {
                    hudConnStatus.textContent = isOffline ? "OFFLINE" : "ONLINE";
                    hudConnStatus.className = isOffline ? "hud-val danger" : "hud-val success";
                }
                logSystemMessage("🔓 Reanudando telemetría de viaje...");
            }
        });
    }

    // Generate manifest and download JSON file for ERP integration
    if (btnGenerateManifest) {
        btnGenerateManifest.addEventListener('click', () => {
            if (!currentSelectedDriver) {
                alert('Ningún transportista seleccionado.');
                return;
            }

            const client = document.getElementById('b2b-client-name').textContent;
            const tripTitle = document.getElementById('b2b-trip-title').textContent;
            const route = document.getElementById('b2b-route-name').textContent;
            const status = document.getElementById('trip-tag-status').textContent;
            
            const vInfo = (currentSelectedDriver.vehicles && currentSelectedDriver.vehicles.length > 0) 
                ? currentSelectedDriver.vehicles[0] 
                : { vehicle_type: 'Gandola', plate: 'A12B34C' };

            const manifest = {
                manifest_id: `CDK-MNF-${currentSelectedDriver.national_id.replace(/\D/g, '')}-${Math.floor(Math.random() * 900 + 100)}`,
                company: "Inversiones Cardakar C.A.",
                division: "FreightTech B2B Solutions",
                client: client,
                trip_id: tripTitle,
                route: route,
                delivery_status: status,
                timestamp: new Date().toISOString(),
                carrier: {
                    fullname: currentSelectedDriver.fullname,
                    national_id: currentSelectedDriver.national_id,
                    phone: currentSelectedDriver.phone,
                    license: currentSelectedDriver.license_number || `5-${currentSelectedDriver.national_id.replace(/\D/g, '')}`
                },
                vehicle: {
                    type: vInfo.vehicle_type,
                    plate: vInfo.plate,
                    gps_tracking: currentSelectedDriver.has_physical_gps ? "Physical Device" : "Smartphone Tracking"
                },
                geofence_status: status === "Entregado" ? "Privacy Protection Active (GPS Off)" : "Active Tracking",
                telemetry_records_count: accumulatedTelemetry.length,
                telemetry_log: accumulatedTelemetry,
                digital_signature: "SHA256-" + Math.random().toString(36).substring(2, 12).toUpperCase() + Math.random().toString(36).substring(2, 12).toUpperCase()
            };

            // Force download file
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `manifiesto_entrega_${tripTitle.replace('#', '')}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            logSystemMessage(`💾 Manifiesto digital de entrega generado y exportado. Archivo descargado.`);
        });
    }

    // ==========================================================================
    // Banners Carousel Logic
    // ==========================================================================
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const prevBtn = document.querySelector('.carousel-button--left');
    const nextBtn = document.querySelector('.carousel-button--right');
    let currentSlide = 0;
    let carouselInterval = null;

    function showSlide(index) {
        if (slides.length === 0) return;
        
        // Wrap index around
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        // Toggle active class on slides
        slides.forEach((slide, idx) => {
            slide.classList.toggle('active', idx === currentSlide);
        });

        // Toggle active class on indicators
        indicators.forEach((indicator, idx) => {
            indicator.classList.toggle('active', idx === currentSlide);
        });
    }

    function startCarouselTimer() {
        if (carouselInterval) clearInterval(carouselInterval);
        carouselInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000); // Swap every 5 seconds
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            startCarouselTimer(); // Reset timer
        });

        nextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
            startCarouselTimer(); // Reset timer
        });
    }

    indicators.forEach((indicator, idx) => {
        indicator.addEventListener('click', () => {
            showSlide(idx);
            startCarouselTimer(); // Reset timer
        });
    });

    // Start Carousel if elements exist
    if (slides.length > 0) {
        showSlide(0);
        startCarouselTimer();
    }

    // ==========================================================================
    // Videos Play/Pause Controls
    // ==========================================================================
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        const video = card.querySelector('.showcase-video');
        const overlay = card.querySelector('.video-overlay-play');
        const playBtn = card.querySelector('.play-btn-circle');

        function togglePlay() {
            if (!video) return;
            
            if (video.paused) {
                // Pause all other videos first
                document.querySelectorAll('.showcase-video').forEach(v => {
                    if (v !== video) {
                        v.pause();
                        v.closest('.video-card').classList.remove('playing');
                    }
                });

                video.play();
                card.classList.add('playing');
            } else {
                video.pause();
                card.classList.remove('playing');
            }
        }

        if (video) video.addEventListener('click', togglePlay);
        if (overlay) overlay.addEventListener('click', togglePlay);
        if (playBtn) playBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid double triggers
            togglePlay();
        });
    });

    // ==========================================================================
    // Registration Type Selector (Camionero / Empresa)
    // ==========================================================================
    const panelCamionero = document.getElementById('form-panel-camionero');
    const panelEmpresa   = document.getElementById('form-panel-empresa');
    const btnTipoCamionero = document.getElementById('btn-tipo-camionero');
    const btnTipoEmpresa   = document.getElementById('btn-tipo-empresa');

    window.switchRegType = function(type) {
        if (type === 'camionero') {
            panelCamionero && (panelCamionero.style.display = '');
            panelEmpresa   && (panelEmpresa.style.display   = 'none');
            btnTipoCamionero && btnTipoCamionero.classList.add('active');
            btnTipoEmpresa   && btnTipoEmpresa.classList.remove('active');
        } else {
            panelCamionero && (panelCamionero.style.display = 'none');
            panelEmpresa   && (panelEmpresa.style.display   = '');
            btnTipoEmpresa   && btnTipoEmpresa.classList.add('active');
            btnTipoCamionero && btnTipoCamionero.classList.remove('active');
        }
        document.getElementById('onboarding-form-section')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ==========================================================================
    // Empresa Form — Multi-Step Navigation
    // ==========================================================================
    const empresaForm = document.getElementById('empresa-form');
    let empresaStep = 1;

    function goToEmpStep(step) {
        document.querySelectorAll('#empresa-form .form-step-panel-emp').forEach(p => {
            p.classList.remove('active');
            if (parseInt(p.getAttribute('data-step')) === step) p.classList.add('active');
        });
        empresaStep = step;
        document.getElementById('onboarding-form-section')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validateEmpStep(step) {
        const panel = document.querySelector(`#empresa-form .form-step-panel-emp[data-step="${step}"]`);
        if (!panel) return false;
        let valid = true;
        panel.querySelectorAll('input[required], select[required]').forEach(el => {
            if (!el.reportValidity()) valid = false;
        });
        return valid;
    }

    document.querySelectorAll('.next-step-btn-emp').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateEmpStep(empresaStep)) goToEmpStep(empresaStep + 1);
        });
    });

    document.querySelectorAll('.prev-step-btn-emp').forEach(btn => {
        btn.addEventListener('click', () => {
            if (empresaStep > 1) goToEmpStep(empresaStep - 1);
        });
    });

    // ==========================================================================
    // Empresa Form — Submit
    // ==========================================================================
    if (empresaForm) {
        empresaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loadingOverlayEl = document.getElementById('form-loading-overlay');
            const successOverlayEl = document.getElementById('form-success-overlay');
            if (loadingOverlayEl) loadingOverlayEl.style.display = 'flex';

            const rifType = document.getElementById('emp-rif-type')?.value || 'J';
            const rifNum  = document.getElementById('emp-rif')?.value.trim() || '';
            const tiposChecked = Array.from(
                document.querySelectorAll('input[name="tipos_unidad[]"]:checked')
            ).map(cb => cb.value);

            const payload = {
                tipo_registro: 'empresa',
                rif: rifType + '-' + rifNum,
                nombre_empresa: document.getElementById('emp-nombre')?.value.trim(),
                nombre_contacto: document.getElementById('emp-contacto')?.value.trim(),
                phone: document.getElementById('emp-phone')?.value.trim(),
                email: document.getElementById('emp-email')?.value.trim(),
                direccion: document.getElementById('emp-direccion')?.value.trim(),
                num_unidades: document.getElementById('emp-num-unidades')?.value,
                zona_operacion: document.getElementById('emp-zona')?.value,
                tipos_unidad: tiposChecked,
                observaciones: document.getElementById('emp-observaciones')?.value.trim(),
                registered_at: new Date().toISOString()
            };

            try {
                await fetch('/api/register-empresa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (_) { /* silent */ }

            // POST to n8n — Es Empresa? node routes the payload
            const n8nWebhook = 'https://chatbot-isp-n8n.ha4i6p.easypanel.host/webhook/cardakar-kyc-intake';
            try {
                await Promise.race([
                    fetch(n8nWebhook, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }),
                    new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 8000))
                ]);
            } catch (err) {
                console.log('%c[Webhook Empresa] n8n error ignored:', 'color:#94a3b8;', err.message);
            }

            if (loadingOverlayEl) loadingOverlayEl.style.display = 'none';
            const titleEl = document.getElementById('success-title');
            const msgEl   = document.getElementById('success-msg');
            if (titleEl) titleEl.textContent = '¡Empresa Registrada!';
            if (msgEl) msgEl.textContent = (payload.nombre_empresa || 'Tu empresa') + ' ha sido pre-registrada en la red Cardakar.';
            if (successOverlayEl) successOverlayEl.style.display = 'flex';
        });
    }

});
