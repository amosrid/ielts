/* ============================================================
   IELTS GO — State · Settings · XP · UI · Tab Switch
   ============================================================ */

        function loadSaveData() {
            const saved = localStorage.getItem('ielts_roadmap_save_v4_0');
            if (saved) {
                try {
                    playerState = Object.assign(playerState, JSON.parse(saved));
                } catch(e) {
                    console.error("Save data parse error", e);
                }
            }
            if (!playerState.miniBossResults) playerState.miniBossResults = {};
            if (!playerState.speakingHistory) playerState.speakingHistory = {};
            // Check audio mute state
            const muted = localStorage.getItem('ielts_audio_muted');
            if (muted === 'true') {
                SoundFX.isMuted = true;
            }
            updateAudioIcons();
        }

        function saveGameData() {
            localStorage.setItem('ielts_roadmap_save_v4_0', JSON.stringify(playerState));
        }

        function restoreDraftsAndSettings() {
            // Restore API Key & Model Status
            updateApiKeyUI();

            // Restore Boss Essay Draft
            const savedEssay = localStorage.getItem('ielts_boss_essay_draft');
            if (savedEssay) {
                const essayInput = document.getElementById('boss-essay-input');
                if (essayInput) {
                    essayInput.value = savedEssay;
                    updateBossWordCount();
                }
            }

            // Restore Boss Prompt Choice
            const savedPrompt = localStorage.getItem('ielts_boss_selected_prompt');
            if (savedPrompt) {
                const promptSelect = document.getElementById('boss-prompt-select');
                if (promptSelect) {
                    promptSelect.value = savedPrompt;
                    changeBossPrompt(false);
                }
            }

            // Restore AI Lab Draft
            const savedAiLab = localStorage.getItem('ielts_ai_lab_draft');
            if (savedAiLab) {
                const aiInput = document.getElementById('ai-lab-input');
                if (aiInput) aiInput.value = savedAiLab;
            }
        }

        function saveAiLabDraft() {
            const text = document.getElementById('ai-lab-input').value;
            localStorage.setItem('ielts_ai_lab_draft', text);
        }

        // Master Unified Settings & Gemini API Modal Management
        function openApiKeyModal() {
            SoundFX.play('click');
            const savedKey = localStorage.getItem('ielts_gemini_api_key') || '';
            const savedModel = localStorage.getItem('ielts_gemini_model') || 'gemini-3.7-flash';
            const isVerified = localStorage.getItem('ielts_gemini_verified') === 'true';
            
            const keyInput = document.getElementById('input-gemini-key');
            if (keyInput) keyInput.value = savedKey;
            const modelSelect = document.getElementById('select-gemini-model');
            if (modelSelect) modelSelect.value = savedModel;
            
            const statusBox = document.getElementById('api-key-status-box');
            if (statusBox) {
                if (savedKey && isVerified) {
                    statusBox.className = "p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs font-mono";
                    statusBox.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400 mr-1.5"></i> Terkoneksi & Terverifikasi Aktif (${savedModel})`;
                    statusBox.classList.remove('hidden');
                } else if (savedKey && !isVerified) {
                    statusBox.className = "p-3 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs font-mono";
                    statusBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-400 mr-1.5"></i> Kunci tersimpan namun belum diuji koneksinya. Klik 'Uji & Hubungkan AI' di bawah.`;
                    statusBox.classList.remove('hidden');
                } else {
                    statusBox.classList.add('hidden');
                    statusBox.innerHTML = '';
                }
            }

            updateSettingsModalUI();
            document.getElementById('api-key-modal').classList.remove('hidden');
        }

        function onGlobalSettingsAccentChange(val) {
            localStorage.setItem('ielts_target_accent', val);
            const accentSelectSpeaking = document.getElementById('select-speaking-accent');
            if (accentSelectSpeaking) accentSelectSpeaking.value = val;
            
            // Also refresh TTS voice options if available
            if (typeof populateTTSVoiceOptions === 'function') {
                populateTTSVoiceOptions();
            }
            
            const accentNames = {
                'british_rp': 'British RP (Received Pronunciation)',
                'general_american': 'General American (US)',
                'australian': 'Australian English',
                'neutral_academic': 'Neutral Academic'
            };
            SoundFX.play('click');
            showToast(`Target Aksen Global disetel ke: ${accentNames[val] || val}`, "success");
        }

        function updateSettingsModalUI() {
            // Theme label
            const isLight = document.documentElement.classList.contains('light-mode');
            const themeLabel = document.getElementById('settings-theme-label');
            if (themeLabel) themeLabel.innerText = isLight ? 'Terang (Default)' : 'Gelap';

            // Audio FX label & icon
            const audioLabel = document.getElementById('settings-audio-label');
            const audioIcon = document.getElementById('settings-audio-icon');
            if (audioLabel) audioLabel.innerText = SoundFX.isMuted ? 'Mute' : 'Aktif';
            if (audioIcon) audioIcon.className = SoundFX.isMuted ? 'fa-solid fa-volume-xmark text-slate-500' : 'fa-solid fa-volume-high text-cyan-400';
            
            // Target accent
            const savedAccent = localStorage.getItem('ielts_target_accent') || 'british_rp';
            const accentEl = document.getElementById('select-settings-target-accent');
            if (accentEl) accentEl.value = savedAccent;
        }

        function closeApiKeyModal() {
            document.getElementById('api-key-modal').classList.add('hidden');
        }

        function toggleApiKeyVisibility() {
            const input = document.getElementById('input-gemini-key');
            const icon = document.getElementById('icon-api-eye');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fa-solid fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fa-solid fa-eye';
            }
        }

        async function testAndSaveApiKeySettings() {
            const keyInput = document.getElementById('input-gemini-key');
            const key = keyInput.value.trim();
            const model = document.getElementById('select-gemini-model').value;
            const statusBox = document.getElementById('api-key-status-box');
            const saveBtn = document.getElementById('btn-save-api-key');

            if (!key) {
                localStorage.removeItem('ielts_gemini_api_key');
                localStorage.removeItem('ielts_gemini_verified');
                statusBox.className = "p-3 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs font-mono";
                statusBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5"></i> API Key kosong. Fitur AI tidak dapat memproses permintaan real-time.`;
                statusBox.classList.remove('hidden');
                updateApiKeyUI();
                return;
            }

            // Testing connection state
            saveBtn.disabled = true;
            saveBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Menguji Koneksi...</span>`;
            statusBox.className = "p-3 rounded-xl border border-blue-500/40 bg-blue-950/30 text-blue-300 text-xs font-mono";
            statusBox.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1.5"></i> Menguji koneksi langsung ke Gemini API (${model})...`;
            statusBox.classList.remove('hidden');

            try {
                const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
                const testPayload = {
                    contents: [{ parts: [{ text: "Hello" }] }]
                };

                const response = await fetch(testUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testPayload)
                });

                if (!response.ok) {
                    let errMsg = `HTTP Error ${response.status}`;
                    if (response.status === 400) {
                        errMsg = "API Key tidak valid (Format salah atau kunci salah). Periksa kembali key Anda di Google AI Studio.";
                    } else if (response.status === 404) {
                        errMsg = `Model '${model}' tidak tersedia pada endpoint ini (HTTP 404). Silakan pilih model lain di dropdown atas (misal: Gemini 3.6 Flash atau 3.5 Flash).`;
                    } else if (response.status === 429) {
                        errMsg = `Model '${model}' sedang mengalami high-demand / quota limit (HTTP 429). Silakan pilih alternatif seperti Gemini 3.6 Flash atau 3.5 Flash Lite.`;
                    } else if (response.status === 403) {
                        errMsg = "Akses ditolak (HTTP 403). Pastikan API Key aktif dan memiliki izin di Google AI Studio.";
                    }
                    throw new Error(errMsg);
                }

                const result = await response.json();
                if (!result || !result.candidates) {
                    throw new Error("Respon dari Gemini tidak valid.");
                }

                // SUCCESS: Verified
                localStorage.setItem('ielts_gemini_api_key', key);
                localStorage.setItem('ielts_gemini_model', model);
                localStorage.setItem('ielts_gemini_verified', 'true');

                statusBox.className = "p-3 rounded-xl border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 text-xs font-mono";
                statusBox.innerHTML = `
                    <div class="font-bold flex items-center gap-1.5 text-emerald-400 mb-1">
                        <i class="fa-solid fa-circle-check"></i> KONEKSI BERHASIL & TERVERIFIKASI!
                    </div>
                    <div class="text-[11px] text-slate-300">Model <strong>${model}</strong> siap digunakan untuk AI Glitch Lab & Boss Arena.</div>
                `;

                SoundFX.play('levelup');
                triggerConfetti();
                updateApiKeyUI();
                showToast("Verifikasi Sukses! AI Connected.", "success");

                setTimeout(() => {
                    closeApiKeyModal();
                }, 1300);

            } catch (err) {
                localStorage.removeItem('ielts_gemini_verified');
                statusBox.className = "p-3 rounded-xl border border-red-500/50 bg-red-950/40 text-red-300 text-xs font-mono";
                statusBox.innerHTML = `
                    <div class="font-bold flex items-center gap-1.5 text-red-400 mb-1">
                        <i class="fa-solid fa-circle-xmark"></i> GAGAL TERHUBUNG!
                    </div>
                    <div class="text-[11px] text-slate-300 mb-2 leading-relaxed">${err.message}</div>
                    <div class="text-[10px] text-amber-400 border-t border-red-900/60 pt-1">
                        <i class="fa-solid fa-lightbulb mr-1"></i> Tip: Jika model high demand, pilih <strong>Gemini 3.6 Flash</strong> atau <strong>3.5 Flash</strong> di dropdown atas lalu klik tombol ini lagi.
                    </div>
                `;
                SoundFX.play('error');
                updateApiKeyUI();
                showToast("Verifikasi Gagal: Cek API Key atau ganti model.", "error");
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = `<i class="fa-solid fa-plug-circle-check"></i> <span>Uji & Hubungkan AI</span>`;
            }
        }

        function removeSavedApiKey() {
            localStorage.removeItem('ielts_gemini_api_key');
            localStorage.removeItem('ielts_gemini_verified');
            document.getElementById('input-gemini-key').value = '';
            const statusBox = document.getElementById('api-key-status-box');
            if (statusBox) {
                statusBox.classList.add('hidden');
                statusBox.innerHTML = '';
            }
            updateApiKeyUI();
            closeApiKeyModal();
            SoundFX.play('error');
            showToast("API Key telah dihapus dari browser.", "info");
        }

        function updateApiKeyUI() {
            const key = localStorage.getItem('ielts_gemini_api_key');
            const model = localStorage.getItem('ielts_gemini_model') || 'gemini-3.7-flash';
            const isVerified = localStorage.getItem('ielts_gemini_verified') === 'true';
            const statusLabel = document.getElementById('hud-api-key-status');
            const sidebarBadge = document.getElementById('sidebar-model-badge');
            const labDisplay = document.getElementById('ai-lab-model-display');

            if (key && isVerified) {
                if (statusLabel) {
                    statusLabel.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1"></span> AI Connected';
                    statusLabel.className = "font-mono text-[10px] text-emerald-400 font-bold flex items-center";
                }
            } else if (key && !isVerified) {
                if (statusLabel) {
                    statusLabel.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"></span> Unverified Key';
                    statusLabel.className = "font-mono text-[10px] text-amber-400 font-bold flex items-center";
                }
            } else {
                if (statusLabel) {
                    statusLabel.innerText = "Set API Key";
                    statusLabel.className = "font-mono text-[10px] text-slate-400";
                }
            }

            const modelShort = model.replace('gemini-', '').toUpperCase();
            if (sidebarBadge) sidebarBadge.innerText = modelShort;
            if (labDisplay) labDisplay.innerText = `Gemini ${modelShort}`;
        }

        // Open AI Study Prompt Modal
        function openPromptModal(stageId) {
            SoundFX.play('click');
            currentActivePromptStageId = stageId;
            const s = STAGE_DATA[stageId];
            if (!s) return;

            document.getElementById('prompt-modal-stage-badge').innerText = stageId.toUpperCase();
            document.getElementById('prompt-modal-title').innerText = s.title;
            document.getElementById('prompt-modal-analogy').innerText = s.analogy;
            document.getElementById('prompt-modal-why').innerText = s.whyHow;
            document.getElementById('prompt-modal-code').innerText = s.aiPrompt;
            document.getElementById('copy-status-indicator').innerText = '';

            document.getElementById('prompt-modal').classList.remove('hidden');
        }

        function closePromptModal() {
            document.getElementById('prompt-modal').classList.add('hidden');
            currentActivePromptStageId = null;
        }

        function copyPromptToClipboard() {
            if (!currentActivePromptStageId) return;
            const s = STAGE_DATA[currentActivePromptStageId];
            if (!s) return;

            navigator.clipboard.writeText(s.aiPrompt).then(() => {
                SoundFX.play('correct');
                const indicator = document.getElementById('copy-status-indicator');
                indicator.innerText = '✓ Copied to clipboard!';
                showToast("Prompt berhasil disalin ke clipboard!", "success");
                setTimeout(() => {
                    indicator.innerText = '';
                }, 3000);
            }).catch(() => {
                showToast("Gagal menyalin prompt.", "error");
            });
        }

        function sendPromptToAiLab() {
            if (!currentActivePromptStageId) return;
            const s = STAGE_DATA[currentActivePromptStageId];
            if (!s) return;

            SoundFX.play('click');
            closePromptModal();
            switchTab('ai-lab');
            
            const sampleInput = document.getElementById('ai-lab-input');
            sampleInput.value = s.aiPrompt;
            saveAiLabDraft();
            showToast("Master Prompt telah dimuat ke AI Glitch Lab!", "info");
        }

        function openAchievementsModal() {
            SoundFX.play('click');
            renderAchievements();
            document.getElementById('achievements-modal').classList.remove('hidden');
        }

        function closeAchievementsModal() {
            document.getElementById('achievements-modal').classList.add('hidden');
        }

        function renderAchievements() {
            const container = document.getElementById('achievements-list');
            container.innerHTML = '';

            ACHIEVEMENTS_DATA.forEach(ach => {
                const isUnlocked = !!playerState.unlockedAchievements[ach.id];
                const card = document.createElement('div');
                card.className = `p-3.5 rounded-xl border flex items-center space-x-3 transition-all ${isUnlocked ? 'bg-slate-900 border-amber-500/40 text-amber-300' : 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60'}`;
                card.innerHTML = `
                    <div class="w-10 h-10 rounded-lg ${isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-600'} flex items-center justify-center text-lg">
                        <i class="fa-solid ${ach.icon}"></i>
                    </div>
                    <div>
                        <div class="font-bold text-xs ${isUnlocked ? 'text-white' : 'text-slate-400'}">${ach.title}</div>
                        <div class="text-[11px] text-slate-400 font-sans">${ach.desc}</div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function checkAchievements() {
            ACHIEVEMENTS_DATA.forEach(ach => {
                if (!playerState.unlockedAchievements[ach.id] && ach.condition(playerState)) {
                    playerState.unlockedAchievements[ach.id] = true;
                    SoundFX.play('levelup');
                    triggerConfetti();
                    showToast(`ACHIEVEMENT UNLOCKED: [${ach.title}]!`, 'success');
                }
            });
            saveGameData();
        }

        function confirmResetProgress() {
            SoundFX.play('click');
            document.getElementById('reset-confirm-modal').classList.remove('hidden');
        }

        function closeResetModal() {
            document.getElementById('reset-confirm-modal').classList.add('hidden');
        }

        function executeResetProgress() {
            playerState = {
                xp: 0,
                level: 1,
                completedStages: {},
                miniBossResults: {},
                speakingHistory: {},
                bossUnlocked: false,
                unlockedAchievements: {}
            };
            saveGameData();
            // Clear in-progress drafts
            localStorage.removeItem('ielts_boss_essay_draft');
            localStorage.removeItem('ielts_ai_lab_draft');
            const bossInput = document.getElementById('boss-essay-input');
            if (bossInput) bossInput.value = '';
            const aiLabInput = document.getElementById('ai-lab-input');
            if (aiLabInput) aiLabInput.value = '';

            updateUI();
            closeResetModal();
            SoundFX.play('error');
            showToast("Progress dan draf telah di-reset sepenuhnya.", "info");
        }

        function addXP(amount) {
            playerState.xp += amount;
            const newLevel = Math.floor(playerState.xp / LEVEL_XP) + 1;
            if (newLevel > playerState.level) {
                playerState.level = newLevel;
                SoundFX.play('levelup');
                triggerConfetti();
                showToast(`LEVEL UP! You are now Level ${newLevel}!`, 'success');
            }
            saveGameData();
            updateUI();
            checkAchievements();
        }

        function toggleRoadmapNav(event) {
            if (event) event.stopPropagation();
            SoundFX.play('click');
            const submenu = document.getElementById('roadmap-subnav-list');
            const chevron = document.getElementById('icon-roadmap-chevron');
            
            if (submenu) {
                const isHidden = submenu.classList.contains('hidden');
                if (isHidden) {
                    submenu.classList.remove('hidden');
                    if (chevron) chevron.classList.add('rotate-90'); // right → down
                } else {
                    submenu.classList.add('hidden');
                    if (chevron) chevron.classList.remove('rotate-90'); // back to right
                }
            }
        }

        function updatePhasePills(activeTabId) {
            const pillThemes = {
                'phase1': 'bg-emerald-600 text-white shadow-md',
                'phase2': 'bg-blue-600 text-white shadow-md',
                'phase3': 'bg-purple-600 text-white shadow-md',
                'phase4': 'bg-amber-600 text-white shadow-md',
                'phase5': 'bg-cyan-600 text-white shadow-md',
                'boss': 'bg-red-600 text-white shadow-md border border-red-500/30'
            };

            document.querySelectorAll('.phase-pill-btn').forEach(btn => {
                btn.className = "phase-pill-btn p-2 rounded-xl text-center font-bold transition-all flex items-center justify-center gap-1.5 text-slate-400 hover:text-white hover:bg-slate-900";
            });

            if (pillThemes[activeTabId]) {
                document.querySelectorAll(`.pill-${activeTabId}`).forEach(btn => {
                    btn.className = `phase-pill-btn pill-${activeTabId} p-2 rounded-xl text-center font-bold transition-all flex items-center justify-center gap-1.5 ${pillThemes[activeTabId]}`;
                });
            }
        }

        function updateUI() {
            document.getElementById('hud-level-text').innerText = playerState.level;
            document.getElementById('hud-xp-text').innerText = playerState.xp;
            
            const rankIndex = Math.min(RANK_TITLES.length - 1, playerState.level - 1);
            document.getElementById('hud-level-title').innerText = RANK_TITLES[rankIndex];

            const nextXP = playerState.level * LEVEL_XP;
            document.getElementById('hud-next-xp').innerText = nextXP;
            
            const currentLevelBaseXP = (playerState.level - 1) * LEVEL_XP;
            const xpInLevel = playerState.xp - currentLevelBaseXP;
            const levelProgressPercent = Math.min(100, Math.max(0, (xpInLevel / LEVEL_XP) * 100));
            document.getElementById('hud-xp-bar').style.width = `${levelProgressPercent}%`;

            let totalCompleted = 0;
            const phaseCounts = { 'phase1': 0, 'phase2': 0, 'phase3': 0, 'phase4': 0, 'phase5': 0 };
            const now = Date.now();

            // Ensure miniBossResults exists in state
            if (!playerState.miniBossResults) playerState.miniBossResults = {};

            Object.keys(STAGE_DATA).forEach(sId => {
                const phaseKey = 'phase' + sId.charAt(5);
                const stageEntry = playerState.completedStages[sId];
                const isDone = !!stageEntry;
                
                const cb = document.getElementById(`check-${sId}`);
                if (cb) cb.checked = isDone;

                const card = document.getElementById(`card-${sId}`);
                if (card) {
                    if (isDone) {
                        // Check Spaced Repetition Interval (Review needed if > 3 days)
                        let needsReview = false;
                        if (typeof stageEntry === 'object' && stageEntry.timestamp) {
                            const daysDiff = (now - stageEntry.timestamp) / (1000 * 60 * 60 * 24);
                            if (daysDiff >= 3) needsReview = true;
                        }

                        if (needsReview) {
                            card.className = "bg-slate-900/95 border border-amber-500/50 rounded-2xl p-5 hover:border-amber-400 transition-all flex flex-col justify-between relative";
                        } else {
                            card.className = "bg-slate-900/95 border border-emerald-500/50 rounded-2xl p-5 hover:border-emerald-400 transition-all flex flex-col justify-between";
                        }
                    } else {
                        card.className = "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between";
                    }
                }

                if (isDone) {
                    totalCompleted++;
                    if (phaseCounts[phaseKey] !== undefined) phaseCounts[phaseKey]++;
                }
            });

            // Compute dynamic total stages per phase
            const phaseTotals = { phase1: 0, phase2: 0, phase3: 0, phase4: 0, phase5: 0 };
            Object.keys(STAGE_DATA).forEach(sId => {
                const pKey = 'phase' + (STAGE_DATA[sId].phase || sId.charAt(5));
                if (phaseTotals[pKey] !== undefined) phaseTotals[pKey]++;
            });

            // Update Phase Badges in Sidebar
            const b1 = document.getElementById('badge-phase1'); if (b1) b1.innerText = `${phaseCounts.phase1}/${phaseTotals.phase1 || 3}`;
            const b2 = document.getElementById('badge-phase2'); if (b2) b2.innerText = `${phaseCounts.phase2}/${phaseTotals.phase2 || 4}`;
            const b3 = document.getElementById('badge-phase3'); if (b3) b3.innerText = `${phaseCounts.phase3}/${phaseTotals.phase3 || 3}`;
            const b4 = document.getElementById('badge-phase4'); if (b4) b4.innerText = `${phaseCounts.phase4}/${phaseTotals.phase4 || 2}`;
            const b5 = document.getElementById('badge-phase5'); if (b5) b5.innerText = `${phaseCounts.phase5}/${phaseTotals.phase5 || 2}`;

            // Update Horizontal Pill Badges
            document.querySelectorAll('#pill-badge-phase1').forEach(el => el.innerText = `(${phaseCounts.phase1}/${phaseTotals.phase1 || 3})`);
            document.querySelectorAll('#pill-badge-phase2').forEach(el => el.innerText = `(${phaseCounts.phase2}/${phaseTotals.phase2 || 4})`);
            document.querySelectorAll('#pill-badge-phase3').forEach(el => el.innerText = `(${phaseCounts.phase3}/${phaseTotals.phase3 || 3})`);
            document.querySelectorAll('#pill-badge-phase4').forEach(el => el.innerText = `(${phaseCounts.phase4}/${phaseTotals.phase4 || 2})`);
            document.querySelectorAll('#pill-badge-phase5').forEach(el => el.innerText = `(${phaseCounts.phase5}/${phaseTotals.phase5 || 2})`);

            // Total Roadmap Badge
            const totalStages = Object.keys(STAGE_DATA).length || 14;
            const bRoadmap = document.getElementById('badge-roadmap-total');
            if (bRoadmap) bRoadmap.innerText = `${totalCompleted}/${totalStages}`;

            // Update Phase Mini-Boss Unlock States
            const phaseStageRequirements = {
                phase1: { required: 3, stages: ['stage1-1', 'stage1-2', 'stage1-3'], color: 'emerald' },
                phase2: { required: 4, stages: ['stage2-1', 'stage2-2', 'stage2-3', 'stage2-4'], color: 'blue' },
                phase3: { required: 3, stages: ['stage3-1', 'stage3-2', 'stage3-3'], color: 'purple' },
                phase4: { required: 2, stages: ['stage4-1', 'stage4-2'], color: 'amber' },
                phase5: { required: 2, stages: ['stage5-1', 'stage5-2'], color: 'cyan' }
            };

            Object.keys(phaseStageRequirements).forEach(phaseKey => {
                const req = phaseStageRequirements[phaseKey];
                const count = phaseCounts[phaseKey];
                const isPhaseComplete = count >= req.required;
                const isBossDefeated = !!playerState.miniBossResults[phaseKey];
                
                const card = document.getElementById(`card-mini-boss-${phaseKey}`);
                const btn = document.getElementById(`btn-mini-boss-${phaseKey}`);
                const btnIcon = document.getElementById(`btn-mini-boss-icon-${phaseKey}`);
                const btnText = document.getElementById(`btn-mini-boss-text-${phaseKey}`);
                const statusSpan = document.getElementById(`mini-boss-status-${phaseKey}`);
                const badgeSpan = document.getElementById(`mini-boss-badge-${phaseKey}`);

                if (btn && card) {
                    if (isPhaseComplete) {
                        btn.disabled = false;
                        btn.className = `w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-${req.color}-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold font-mono transition-all shadow-lg flex items-center justify-center gap-2 border border-${req.color}-400/40 cursor-pointer`;
                        if (btnIcon) btnIcon.className = "fa-solid fa-shield-halved text-amber-300";
                        
                        if (isBossDefeated) {
                            const score = playerState.miniBossResults[phaseKey].bandScore || 'Cleared';
                            if (btnText) btnText.innerText = "TANTANG ULANG / REVISI";
                            if (statusSpan) {
                                statusSpan.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold";
                                statusSpan.innerHTML = `✓ SELESAI (${score})`;
                            }
                            if (badgeSpan) badgeSpan.classList.remove('hidden');
                        } else {
                            if (btnText) btnText.innerText = "CHALLENGE MINI-BOSS";
                            if (statusSpan) {
                                statusSpan.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-bold animate-pulse";
                                statusSpan.innerHTML = `⚔️ SIAP DITANTANG`;
                            }
                            if (badgeSpan) badgeSpan.classList.add('hidden');
                        }
                    } else {
                        btn.disabled = true;
                        btn.className = "w-full md:w-auto px-5 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold font-mono transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-not-allowed";
                        if (btnIcon) btnIcon.className = "fa-solid fa-lock text-slate-500";
                        if (btnText) btnText.innerText = "CHALLENGE MINI-BOSS";
                        if (statusSpan) {
                            statusSpan.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700";
                            statusSpan.innerHTML = `🔒 TERKUNCI (${count}/${req.required} Stage)`;
                        }
                        if (badgeSpan) badgeSpan.classList.add('hidden');
                    }
                }
            });

            // Overall % calculations
            const overallPercent = Math.round((totalCompleted / totalStages) * 100);
            document.getElementById('hud-progress-percent').innerText = `${overallPercent}%`;

            // Unlock Boss Room condition (At least 8 stages or Level 3)
            if (totalCompleted >= 8 || playerState.level >= 3) {
                playerState.bossUnlocked = true;
                const lock = document.getElementById('boss-lock-icon');
                if (lock) lock.className = 'fa-solid fa-lock-open text-xs text-emerald-400';
            }
        }

        function triggerConfetti() {
            try {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.75 }
                });
            } catch(e){}
        }

        function switchTab(tabId) {
            SoundFX.play('click');
            closeSidebarOnMobile();
            // Handle virtual 'roadmap' shortcut
            if (tabId === 'roadmap') {
                const nextIncomplete = Object.keys(STAGE_DATA).find(sId => !playerState.completedStages[sId]);
                if (nextIncomplete) {
                    tabId = 'phase' + nextIncomplete.charAt(5);
                } else {
                    tabId = 'phase1';
                }
            }

            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.nav-btn').forEach(el => {
                el.classList.remove('nav-btn-active', 'active', 'bg-slate-800/80', 'border-indigo-500/30', 'border-emerald-500/30', 'border-rose-500/30', 'border-cyan-500/40', 'text-white', 'text-indigo-300', 'bg-indigo-950/30', 'bg-cyan-950/30', 'border-indigo-500/40');
            });
            document.querySelectorAll('.nav-sub-btn').forEach(el => {
                el.classList.remove('nav-sub-btn-active', 'active', 'bg-slate-800', 'text-white', 'font-bold');
            });

            const isPhaseOrBoss = tabId.startsWith('phase') || tabId === 'boss';

            const activeTab = document.getElementById(`tab-${tabId}`);
            if (activeTab) activeTab.classList.remove('hidden');

            const activeNav = document.getElementById(`nav-${tabId}`);
            if (activeNav) {
                activeNav.classList.add('nav-btn-active', 'active');
            }

            // If navigating to a phase or boss, highlight roadmap parent & show submenu
            if (isPhaseOrBoss) {
                const navRoadmap = document.getElementById('nav-roadmap-main');
                if (navRoadmap) navRoadmap.classList.add('nav-btn-active', 'active');
                
                const submenu = document.getElementById('roadmap-subnav-list');
                if (submenu && submenu.classList.contains('hidden')) {
                    submenu.classList.remove('hidden');
                    const chevron = document.getElementById('icon-roadmap-chevron');
                    if (chevron) chevron.classList.add('rotate-90');
                }
                updatePhasePills(tabId);
            }

            if (tabId === 'dashboard') {
                renderDashboard();
            } else if (tabId === 'vocab-logger') {
                initVocabLogger();
            } else if (tabId === 'speaking-lab') {
                initSpeakingLabUI();
                const badge = document.getElementById('speaking-lab-new-badge');
                if (badge) badge.classList.remove('badge-blink');
            } else if (tabId === 'synthesis-lab') {
                initSynthesisLabUI();
            }
        }

        // =========================================================================
        // DUAL MANDATORY STAGE QUEST SYSTEM (Step 1: MCQ → Step 2: Essay Writing)
        // =========================================================================

// IeltsGo v6.3 — SIDEBAR BURGER MENU + LIGHT/DARK MODE
        // =========================================================================

        function toggleSidebar() {
            const sidebar = document.getElementById('main-sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            const burger = document.getElementById('btn-burger');
            if (!sidebar) return;

            const isHidden = sidebar.classList.contains('hidden');
            if (isHidden) {
                // Open
                sidebar.classList.remove('hidden');
                if (overlay) overlay.classList.remove('hidden');
                if (burger) burger.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            } else {
                // Close
                sidebar.classList.add('hidden');
                if (overlay) overlay.classList.add('hidden');
                if (burger) burger.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        }

        // Close sidebar when user taps a nav item on mobile
        function closeSidebarOnMobile() {
            if (window.innerWidth < 1024) {
                const sidebar = document.getElementById('main-sidebar');
                const overlay = document.getElementById('sidebar-overlay');
                const burger = document.getElementById('btn-burger');
                if (sidebar) sidebar.classList.add('hidden');
                if (overlay) overlay.classList.add('hidden');
                if (burger) burger.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        }

        function toggleColorMode() {
            const html = document.documentElement;
            const isLight = html.classList.contains('light-mode');
            if (isLight) {
                // Switch to dark
                html.classList.remove('light-mode');
                html.classList.add('dark');
                localStorage.setItem('ielts_color_mode', 'dark');
                _updateColorModeIcons('dark');
                showToast("Beralih ke Mode Malam (Deep Slate)", "info");
            } else {
                // Switch to light
                html.classList.add('light-mode');
                html.classList.remove('dark');
                localStorage.setItem('ielts_color_mode', 'light');
                _updateColorModeIcons('light');
                showToast("Beralih ke Mode Siang (Clean Academy)", "info");
            }
            if (typeof updateSettingsModalUI === 'function') updateSettingsModalUI();
        }

        function _updateColorModeIcons(mode) {
            const icon = mode === 'light' ? 'fa-moon' : 'fa-sun';
            const title = mode === 'light' ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang';
            ['btn-color-mode-desktop', 'btn-color-mode-mobile'].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
                    btn.title = title;
                }
            });
        }

        function initColorMode() {
            const saved = localStorage.getItem('ielts_color_mode');
            if (saved === 'dark') {
                document.documentElement.classList.remove('light-mode');
                document.documentElement.classList.add('dark');
                _updateColorModeIcons('dark');
            } else {
                document.documentElement.classList.add('light-mode');
                document.documentElement.classList.remove('dark');
                _updateColorModeIcons('light');
            }
        }

        // =========================================================================
        // IeltsGo v6.0 — STREAK & STUDY HABIT TRACKER ENGINE
        // =========================================================================
        function calculateStreak() {
            try {
                const streakDataRaw = localStorage.getItem('ielts_study_streak_v1');
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                
                let streakData = { count: 1, lastDate: todayStr };
                if (streakDataRaw) {
                    streakData = JSON.parse(streakDataRaw);
                }

                if (streakData.lastDate) {
                    const last = new Date(streakData.lastDate);
                    const today = new Date(todayStr);
                    const diffTime = today - last;
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        streakData.count += 1;
                        streakData.lastDate = todayStr;
                    } else if (diffDays > 1) {
                        streakData.count = 1;
                        streakData.lastDate = todayStr;
                    }
                } else {
                    streakData.lastDate = todayStr;
                }

                localStorage.setItem('ielts_study_streak_v1', JSON.stringify(streakData));
                
                // Update HUD badges
                const streakSidebar = document.getElementById('badge-streak-sidebar');
                if (streakSidebar) streakSidebar.innerText = `🔥 ${streakData.count}d`;
                const dashStreak = document.getElementById('dash-streak-count');
                if (dashStreak) dashStreak.innerText = `${streakData.count} Hari`;

                return streakData.count;
            } catch (e) {
                console.error("Streak calculation error:", e);
                return 1;
            }
        }

        // =========================================================================
        // IeltsGo v6.0 — DASHBOARD ENGINE
        // =========================================================================
        function renderDashboard() {
            // 1. Greeting based on local time
            const hour = new Date().getHours();
            let greeting = 'Selamat Malam!';
            if (hour >= 4 && hour < 11) greeting = 'Selamat Pagi!';
            else if (hour >= 11 && hour < 15) greeting = 'Selamat Siang!';
            else if (hour >= 15 && hour < 19) greeting = 'Selamat Sore!';
            const greetEl = document.getElementById('dash-greeting-badge');
            if (greetEl) greetEl.innerText = `${greeting} 🎯 Siap Latihan IELTS?`;

            // 2. Level & XP Progression
            const levelEl = document.getElementById('dash-level-text');
            if (levelEl) levelEl.innerText = `Level ${playerState.level}`;

            const nextXP = playerState.level * LEVEL_XP;
            const currentLevelBaseXP = (playerState.level - 1) * LEVEL_XP;
            const xpInLevel = playerState.xp - currentLevelBaseXP;
            const levelProgressPercent = Math.min(100, Math.max(0, (xpInLevel / LEVEL_XP) * 100));

            const xpFraction = document.getElementById('dash-xp-fraction');
            if (xpFraction) xpFraction.innerText = `${playerState.xp} / ${nextXP} XP`;
            const xpBar = document.getElementById('dash-xp-bar-inner');
            if (xpBar) xpBar.style.width = `${levelProgressPercent}%`;

            // 3. Next Incomplete Stage CTA
            const nextStage = getNextIncompleteStage();
            const btnHeroContinue = document.getElementById('dash-hero-continue-text');
            if (btnHeroContinue) {
                if (nextStage) {
                    btnHeroContinue.innerText = `Lanjut ${nextStage.title.split(':')[0]}`;
                } else {
                    btnHeroContinue.innerText = "Tantang 60-Min Boss Arena";
                }
            }

            // 4. Phase Progress Breakdown
            const phaseCounts = { phase1: 0, phase2: 0, phase3: 0, phase4: 0, phase5: 0 };
            const phaseTotals = { phase1: 0, phase2: 0, phase3: 0, phase4: 0, phase5: 0 };
            let totalDone = 0;
            Object.keys(STAGE_DATA).forEach(sId => {
                const pKey = 'phase' + (STAGE_DATA[sId].phase || sId.charAt(5));
                if (phaseTotals[pKey] !== undefined) phaseTotals[pKey]++;
                if (playerState.completedStages && playerState.completedStages[sId]) {
                    totalDone++;
                    if (phaseCounts[pKey] !== undefined) phaseCounts[pKey]++;
                }
            });

            const totalAllStages = Object.keys(STAGE_DATA).length || 14;
            const overallPercent = Math.round((totalDone / totalAllStages) * 100);
            const overallEl = document.getElementById('dash-overall-percent');
            if (overallEl) overallEl.innerText = `${overallPercent}% Selesai`;

            // Update Phase Bars
            const updatePhaseRow = (pKey, count, total) => {
                const bar = document.getElementById(`dash-${pKey}-bar`);
                const label = document.getElementById(`dash-${pKey}-label`);
                const pct = Math.round((count / (total || 1)) * 100);
                if (bar) bar.style.width = `${pct}%`;
                if (label) label.innerText = `${count}/${total || 1}`;
            };
            updatePhaseRow('p1', phaseCounts.phase1, phaseTotals.phase1 || 3);
            updatePhaseRow('p2', phaseCounts.phase2, phaseTotals.phase2 || 4);
            updatePhaseRow('p3', phaseCounts.phase3, phaseTotals.phase3 || 3);
            updatePhaseRow('p4', phaseCounts.phase4, phaseTotals.phase4 || 2);
            updatePhaseRow('p5', phaseCounts.phase5, phaseTotals.phase5 || 2);

            // Boss Badge
            const bossBadge = document.getElementById('dash-boss-badge');
            if (bossBadge) {
                if (totalDone >= totalAllStages) {
                    bossBadge.className = "text-[10px] bg-red-900/60 text-red-300 px-2.5 py-1 rounded-md border border-red-500/50 font-bold animate-pulse";
                    bossBadge.innerText = "Terbuka! Siap Dikerjakan";
                } else {
                    bossBadge.className = "text-[10px] bg-slate-950 text-slate-500 px-2.5 py-1 rounded-md border border-slate-800";
                    bossBadge.innerText = `Terkunci (${totalDone}/${totalAllStages} Selesai)`;
                }
            }

            // 5. Vocab Bank Snapshot & CEFR Breakdown
            const totalVocabs = vocabBank.length;
            const dueVocabs = getVocabsDueToday().length;
            const totalVocabBadge = document.getElementById('dash-vocab-total-badge');
            if (totalVocabBadge) totalVocabBadge.innerText = `${totalVocabs} Kata`;
            const dueCountEl = document.getElementById('dash-vocab-due-count');
            if (dueCountEl) dueCountEl.innerText = `${dueVocabs} Kata`;

            const cefrCounts = { C2: 0, C1: 0, B2: 0, B1: 0, A2: 0, A1: 0 };
            vocabBank.forEach(v => {
                if (cefrCounts[v.cefr] !== undefined) cefrCounts[v.cefr]++;
            });
            ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'].forEach(lvl => {
                const el = document.getElementById(`dash-cefr-${lvl.toLowerCase()}-count`);
                if (el) el.innerText = cefrCounts[lvl] || 0;
            });

            // 6. Speaking Lab Snapshot
            const targetAccent = localStorage.getItem('ielts_target_accent') || 'british_rp';
            const accentLabelMap = {
                'british_rp': '🇬🇧 British RP',
                'general_american': '🇺🇸 General US',
                'australian': '🇦🇺 Australian',
                'neutral_academic': '🌍 Neutral Academic'
            };
            const spkAccentTag = document.getElementById('dash-speaking-accent-tag');
            if (spkAccentTag) spkAccentTag.innerText = accentLabelMap[targetAccent] || '🇬🇧 British RP';

            const spkHistory = playerState.speakingHistory || {};
            const updateSpkStatus = (mode, elId) => {
                const el = document.getElementById(elId);
                if (el) {
                    if (spkHistory[mode]) {
                        el.className = "text-emerald-400 font-bold text-xs";
                        el.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i> Selesai`;
                    } else {
                        el.className = "text-slate-500 font-bold text-xs";
                        el.innerHTML = `<i class="fa-solid fa-circle-xmark mr-1"></i> Belum`;
                    }
                }
            };
            updateSpkStatus('part1', 'dash-spk-part1-status');
            updateSpkStatus('part2', 'dash-spk-part2-status');
            updateSpkStatus('part3', 'dash-spk-part3-status');

            // 7. Achievements Preview
            const unlockedList = Object.keys(playerState.unlockedAchievements || {}).filter(k => !!playerState.unlockedAchievements[k]);
            const badgeCountEl = document.getElementById('dash-badges-unlocked-count');
            if (badgeCountEl) badgeCountEl.innerText = `${unlockedList.length} / ${ACHIEVEMENTS_DATA.length}`;

            const badgePreviewContainer = document.getElementById('dash-badges-preview-list');
            if (badgePreviewContainer) {
                if (unlockedList.length === 0) {
                    badgePreviewContainer.innerHTML = `<div class="col-span-3 text-center py-4 text-slate-500 font-mono text-[11px]">Belum ada trophy yang terbuka. Selesaikan stage untuk membuka medali!</div>`;
                } else {
                    const recentBadges = unlockedList.slice(-3).reverse();
                    badgePreviewContainer.innerHTML = recentBadges.map(id => {
                        const ach = ACHIEVEMENTS_DATA.find(a => a.id === id) || { title: id, icon: 'fa-medal', xp: 50 };
                        return `
                            <div class="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 flex items-center space-x-2">
                                <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                                    <i class="fa-solid ${ach.icon}"></i>
                                </div>
                                <div class="overflow-hidden">
                                    <div class="font-bold text-[11px] text-slate-200 truncate">${ach.title}</div>
                                    <div class="text-[9px] text-amber-400 font-mono">+${ach.xp} XP</div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            // Render Daily Affirmation Ritual Card (v6.4)
            renderDailyAffirmationUI();
        }

        function getNextIncompleteStage() {
            const allStageIds = Object.keys(STAGE_DATA);
            for (let id of allStageIds) {
                if (!playerState.completedStages || !playerState.completedStages[id] || !playerState.completedStages[id].completed) {
                    return { id, ...STAGE_DATA[id] };
                }
            }
            return null;
        }

        function continueNextIncompleteStage() {
            SoundFX.play('click');
            const nextStage = getNextIncompleteStage();
            if (nextStage) {
                const phaseKey = 'phase' + (nextStage.phase || (nextStage.id ? nextStage.id.charAt(5) : '1'));
                switchTab(phaseKey);
                setTimeout(() => {
                    const card = document.getElementById(`card-${nextStage.id}`);
                    if (card) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        card.classList.add('ring-2', 'ring-emerald-400');
                        setTimeout(() => card.classList.remove('ring-2', 'ring-emerald-400'), 2500);
                    }
                }, 200);
            } else {
                switchTab('boss');
            }
        }

        // =========================================================================
