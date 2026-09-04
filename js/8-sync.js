// =========================================================================
// IELTSGO CLOUD SYNC & DEVICE-LINKED BACKUP SERVICE (v1.0)
// Supports: Supabase Cloud Vault, Smart Merge, QR Code Pairing, and Offline JSON Export
// =========================================================================

const IeltsSyncService = {
    // Config Keys in localStorage
    KEYS: {
        SUPABASE_URL: 'ielts_sync_supabase_url',
        SUPABASE_KEY: 'ielts_sync_supabase_key',
        PAIRING_CODE: 'ielts_sync_pairing_code',
        LAST_SYNC: 'ielts_sync_last_timestamp',
        AUTO_SYNC: 'ielts_sync_auto_enabled'
    },

    supabaseClient: null,
    syncDebounceTimer: null,

    // Initialize Supabase Client
    getClient() {
        if (this.supabaseClient) return this.supabaseClient;
        const url = localStorage.getItem(this.KEYS.SUPABASE_URL) || '';
        const key = localStorage.getItem(this.KEYS.SUPABASE_KEY) || '';

        if (!url || !key) return null;

        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            try {
                this.supabaseClient = window.supabase.createClient(url, key);
                return this.supabaseClient;
            } catch (err) {
                console.error('[Sync] Failed to initialize Supabase client:', err);
                return null;
            }
        }
        return null;
    },

    resetClient() {
        this.supabaseClient = null;
    },

    // 1. Gather all local state into a single cohesive payload
    createLocalBundle() {
        const playerStateRaw = localStorage.getItem('ielts_roadmap_save_v4_0');
        let playerState = null;
        try { playerState = playerStateRaw ? JSON.parse(playerStateRaw) : null; } catch(e) {}

        const vocabBankRaw = localStorage.getItem('ielts_vocab_bank_v1');
        let vocabBank = [];
        try { vocabBank = vocabBankRaw ? JSON.parse(vocabBankRaw) : []; } catch(e) {}

        const streakRaw = localStorage.getItem('ielts_study_streak_v1');
        let streak = null;
        try { streak = streakRaw ? JSON.parse(streakRaw) : null; } catch(e) {}

        const affirmationRaw = localStorage.getItem('ielts_daily_affirmation_v1');
        let affirmation = null;
        try { affirmation = affirmationRaw ? JSON.parse(affirmationRaw) : null; } catch(e) {}

        const synthesisRaw = localStorage.getItem('ielts_synthesis_sessions_v1');
        let synthesis = [];
        try { synthesis = synthesisRaw ? JSON.parse(synthesisRaw) : []; } catch(e) {}

        const targetAccent = localStorage.getItem('ielts_target_accent') || 'british_rp';

        return {
            schemaVersion: '1.0',
            exportedAt: Date.now(),
            deviceInfo: (navigator.userAgent.includes('Mobile') ? 'Mobile Phone' : 'Desktop/Laptop') + ' • ' + new Date().toLocaleDateString(),
            data: {
                playerState: playerState || (typeof window.playerState !== 'undefined' ? window.playerState : null),
                vocabBank: (Array.isArray(vocabBank) && vocabBank.length) ? vocabBank : (typeof window.vocabBank !== 'undefined' ? window.vocabBank : []),
                streak: streak || (typeof window.streakData !== 'undefined' ? window.streakData : null),
                affirmation: affirmation,
                synthesis: synthesis,
                targetAccent: targetAccent
            }
        };
    },

    // 2. Smart Merge: Unions vocab, takes highest stage & XP, combines sessions without loss
    mergeRemoteBundle(remoteBundle) {
        if (!remoteBundle || !remoteBundle.data) {
            throw new Error("Format data cloud tidak valid atau kosong.");
        }

        const remote = remoteBundle.data;
        let changeSummary = [];

        // A. Merge Vocab Bank (Union by lowercase word)
        if (Array.isArray(remote.vocabBank) && remote.vocabBank.length) {
            let localVocab = [];
            try {
                localVocab = JSON.parse(localStorage.getItem('ielts_vocab_bank_v1') || '[]');
            } catch(e) { localVocab = []; }

            const wordMap = new Map();
            // Load local first
            localVocab.forEach(v => {
                if (v && v.word) wordMap.set(v.word.toLowerCase().trim(), v);
            });

            let newWordsCount = 0;
            // Merge remote items
            remote.vocabBank.forEach(rv => {
                if (!rv || !rv.word) return;
                const key = rv.word.toLowerCase().trim();
                if (!wordMap.has(key)) {
                    wordMap.set(key, rv);
                    newWordsCount++;
                } else {
                    // If exists in both, keep the one with higher mastery/reviews
                    const existing = wordMap.get(key);
                    const existingReviews = existing.srReviewCount || 0;
                    const remoteReviews = rv.srReviewCount || 0;
                    if (remoteReviews > existingReviews) {
                        wordMap.set(key, { ...existing, ...rv });
                    }
                }
            });

            const mergedVocab = Array.from(wordMap.values());
            localStorage.setItem('ielts_vocab_bank_v1', JSON.stringify(mergedVocab));
            if (typeof window.vocabBank !== 'undefined') {
                window.vocabBank = mergedVocab;
            }
            if (newWordsCount > 0) {
                changeSummary.push(`+${newWordsCount} Kosakata baru digabung`);
            }
        }

        // B. Merge Player State (XP, Level, Completed Stages)
        if (remote.playerState) {
            let localPlayer = null;
            try {
                localPlayer = JSON.parse(localStorage.getItem('ielts_roadmap_save_v4_0') || 'null');
            } catch(e) {}
            if (!localPlayer && typeof window.playerState !== 'undefined') {
                localPlayer = window.playerState;
            }

            if (!localPlayer) {
                localStorage.setItem('ielts_roadmap_save_v4_0', JSON.stringify(remote.playerState));
                if (typeof window.playerState !== 'undefined') window.playerState = remote.playerState;
                changeSummary.push(`Data pemain dimuat (Lv.${remote.playerState.level || 1})`);
            } else {
                // Merge completed stages (union)
                const mergedCompleted = {
                    ...(localPlayer.completedStages || {}),
                    ...(remote.playerState.completedStages || {})
                };

                // Merge unlocked stages (union)
                const localUnlocked = localPlayer.unlockedStages || ['1-1'];
                const remoteUnlocked = remote.playerState.unlockedStages || ['1-1'];
                const mergedUnlocked = Array.from(new Set([...localUnlocked, ...remoteUnlocked]));

                // XP: Take highest
                const mergedXP = Math.max(localPlayer.xp || 0, remote.playerState.xp || 0);

                const mergedPlayer = {
                    ...localPlayer,
                    ...remote.playerState,
                    xp: mergedXP,
                    completedStages: mergedCompleted,
                    unlockedStages: mergedUnlocked
                };

                localStorage.setItem('ielts_roadmap_save_v4_0', JSON.stringify(mergedPlayer));
                if (typeof window.playerState !== 'undefined') window.playerState = mergedPlayer;
                changeSummary.push(`Roadmap diselaraskan (${Object.keys(mergedCompleted).length} stage selesai)`);
            }
        }

        // C. Merge Study Streak
        if (remote.streak) {
            let localStreak = null;
            try { localStreak = JSON.parse(localStorage.getItem('ielts_study_streak_v1') || 'null'); } catch(e) {}
            
            const localCount = localStreak ? (localStreak.count || localStreak.currentStreak || 1) : 1;
            const remoteCount = remote.streak ? (remote.streak.count || remote.streak.currentStreak || 1) : 1;
            const mergedCount = Math.max(localCount, remoteCount);
            
            const localDate = localStreak ? (localStreak.lastDate || localStreak.lastStudyDate || '') : '';
            const remoteDate = remote.streak ? (remote.streak.lastDate || remote.streak.lastStudyDate || '') : '';
            const mergedDate = (remoteDate > localDate) ? remoteDate : (localDate || remoteDate);

            const mergedStreak = {
                count: mergedCount,
                lastDate: mergedDate,
                currentStreak: mergedCount,
                longestStreak: Math.max(localStreak?.longestStreak || mergedCount, remote.streak.longestStreak || mergedCount),
                lastStudyDate: mergedDate
            };
            localStorage.setItem('ielts_study_streak_v1', JSON.stringify(mergedStreak));
            if (typeof window.streakData !== 'undefined') window.streakData = mergedStreak;
        }

        // D. Merge Synthesis Sessions (Union by session id)
        if (Array.isArray(remote.synthesis) && remote.synthesis.length) {
            let localSynth = [];
            try { localSynth = JSON.parse(localStorage.getItem('ielts_synthesis_sessions_v1') || '[]'); } catch(e) {}
            const sessionMap = new Map();
            localSynth.forEach(s => s && s.id && sessionMap.set(s.id, s));
            remote.synthesis.forEach(s => s && s.id && sessionMap.set(s.id, s));
            const mergedSynth = Array.from(sessionMap.values()).slice(0, 50); // keep up to 50 recent
            localStorage.setItem('ielts_synthesis_sessions_v1', JSON.stringify(mergedSynth));
        }

        // E. Accent Preference
        if (remote.targetAccent) {
            localStorage.setItem('ielts_target_accent', remote.targetAccent);
        }

        // Update Last Sync Timestamp
        localStorage.setItem(this.KEYS.LAST_SYNC, Date.now().toString());

        // CRITICAL: Reload all in-memory variables from localStorage!
        if (typeof loadSaveData === 'function') loadSaveData();
        if (typeof loadVocabBank === 'function') loadVocabBank();
        if (typeof calculateStreak === 'function') calculateStreak();
        if (typeof loadDailyAffirmationState === 'function') loadDailyAffirmationState();
        if (typeof loadSynthesisSessions === 'function') loadSynthesisSessions();

        // Refresh live UI
        if (typeof updateUI === 'function') updateUI();
        if (typeof renderVocabBank === 'function') renderVocabBank();
        if (typeof updateVocabBadges === 'function') updateVocabBadges();
        if (typeof renderRoadmapStages === 'function') renderRoadmapStages();
        if (typeof updateStreakUI === 'function') updateStreakUI();

        return changeSummary.length ? changeSummary.join(', ') : 'Semua data sudah mutakhir dan identik.';
    },

    // 3. Generate a friendly human-readable sync code (e.g. IELTS-8392-KP)
    generatePairingCode() {
        const nums = Math.floor(1000 + Math.random() * 9000);
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const c1 = chars.charAt(Math.floor(Math.random() * chars.length));
        const c2 = chars.charAt(Math.floor(Math.random() * chars.length));
        return `IELTS-${nums}-${c1}${c2}`;
    },

    // 4. Push local data to Supabase Vault
    async pushToCloud(customCode = null) {
        const client = this.getClient();
        if (!client) {
            throw new Error("Konfigurasi Supabase belum terisi. Buka tab 'Konfigurasi Cloud' terlebih dahulu.");
        }

        let code = customCode || localStorage.getItem(this.KEYS.PAIRING_CODE);
        if (!code) {
            code = this.generatePairingCode();
            localStorage.setItem(this.KEYS.PAIRING_CODE, code);
        }

        const bundle = this.createLocalBundle();

        const { data, error } = await client
            .from('sync_vault')
            .upsert({
                sync_code: code.trim().toUpperCase(),
                payload: bundle,
                updated_at: new Date().toISOString()
            }, { onConflict: 'sync_code' });

        if (error) {
            console.error('[Sync] Push error:', error);
            throw new Error(`Gagal mengupload ke cloud: ${error.message}`);
        }

        localStorage.setItem(this.KEYS.LAST_SYNC, Date.now().toString());
        return { code, bundle };
    },

    // 5. Pull and merge data from Supabase Vault by pairing code
        // 5.1 Inspect what is in the Cloud Vault without merging
    async fetchCloudSnapshotInfo(code) {
        const client = this.getClient();
        if (!client || !code) return null;

        try {
            const { data, error } = await client
                .from('sync_vault')
                .select('*')
                .eq('sync_code', code.trim().toUpperCase())
                .single();

            if (error || !data) return null;

            const payload = data.payload || {};
            const d = payload.data || {};
            const vocabCount = Array.isArray(d.vocabBank) ? d.vocabBank.length : 0;
            const xp = d.playerState ? (d.playerState.xp || 0) : 0;
            const level = d.playerState ? (d.playerState.level || 1) : 1;
            const stagesCount = d.playerState && d.playerState.completedStages ? Object.keys(d.playerState.completedStages).length : 0;

            return {
                code: data.sync_code,
                updatedAt: data.updated_at,
                deviceInfo: payload.deviceInfo || 'Perangkat Tidak Diketahui',
                vocabCount,
                xp,
                level,
                stagesCount
            };
        } catch (e) {
            console.warn('[Sync] Failed to fetch cloud info:', e);
            return null;
        }
    },

    async pullFromCloud(code) {
        const client = this.getClient();
        if (!client) {
            throw new Error("Konfigurasi Supabase belum terisi. Buka tab 'Konfigurasi Cloud' terlebih dahulu.");
        }

        if (!code || !code.trim()) {
            throw new Error("Masukkan Kode Sinkronisasi (contoh: IELTS-7842-KM).");
        }

        const cleanCode = code.trim().toUpperCase();

        const { data, error } = await client
            .from('sync_vault')
            .select('*')
            .eq('sync_code', cleanCode)
            .single();

        if (error || !data) {
            throw new Error(`Data dengan kode '${cleanCode}' tidak ditemukan di Cloud Vault. Pastikan kode sudah benar.`);
        }

        // Save this pairing code locally so subsequent syncs are automatic
        localStorage.setItem(this.KEYS.PAIRING_CODE, cleanCode);

        // Merge payload
        const summary = this.mergeRemoteBundle(data.payload);
        return { code: cleanCode, summary, updatedAt: data.updated_at };
    },

    // 6. Background Auto-Sync Trigger (Debounced 5s to avoid spamming API)
    triggerAutoSync() {
        const autoEnabled = localStorage.getItem(this.KEYS.AUTO_SYNC) !== 'false';
        const code = localStorage.getItem(this.KEYS.PAIRING_CODE);
        const client = this.getClient();

        if (!autoEnabled || !code || !client) return;

        clearTimeout(this.syncDebounceTimer);
        this.syncDebounceTimer = setTimeout(async () => {
            try {
                await this.pushToCloud(code);
                console.log('[Sync] Background auto-sync completed for code:', code);
                this.updateSyncBadge();
            } catch (err) {
                console.warn('[Sync] Background auto-sync skipped/failed:', err.message);
            }
        }, 3000);
    },

    // Check if cloud has newer data and auto-pull in background
    async checkAndPullIfNewer() {
        const client = this.getClient();
        const code = localStorage.getItem(this.KEYS.PAIRING_CODE);
        const autoEnabled = localStorage.getItem(this.KEYS.AUTO_SYNC) !== 'false';
        if (!client || !code || !autoEnabled) return;

        try {
            const { data, error } = await client
                .from('sync_vault')
                .select('updated_at')
                .eq('sync_code', code.trim().toUpperCase())
                .single();

            if (error || !data) return;

            const remoteTime = new Date(data.updated_at).getTime();
            const localLastSync = parseInt(localStorage.getItem(this.KEYS.LAST_SYNC) || '0');

            // If remote is more than 3s newer than local last sync, auto-pull!
            if (remoteTime > (localLastSync + 3000)) {
                console.log('[Sync] Newer data detected in Cloud. Auto-pulling...');
                const res = await this.pullFromCloud(code);
                this.updateSyncBadge();
                if (typeof showToast === 'function') {
                    showToast(`☁️ Data terbaru dari HP/Cloud disinkronkan! (${res.summary})`, 'info');
                }
            }
        } catch(e) {
            console.warn('[Sync] Auto-pull check failed:', e.message);
        }
    },

    // 7. Render QR Code for pairing
    renderQRCode(containerId, text) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        if (typeof window.QRCode !== 'undefined') {
            try {
                new window.QRCode(container, {
                    text: text,
                    width: 140,
                    height: 140,
                    colorDark: "#0f172a",
                    colorLight: "#ffffff",
                    correctLevel: window.QRCode.CorrectLevel.M
                });
            } catch (err) {
                container.innerHTML = `<div class="p-3 text-xs font-mono text-slate-400">QR Code: ${text}</div>`;
            }
        } else {
            container.innerHTML = `<div class="p-3 text-xs font-mono text-slate-400">Kode: <strong>${text}</strong></div>`;
        }
    },

    // 8. Offline Fallback: Download JSON File
    downloadBackupFile() {
        const bundle = this.createLocalBundle();
        const jsonStr = JSON.stringify(bundle, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ieltsgo_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 9. Offline Fallback: Restore from JSON File
    restoreFromBackupFile(file, onSuccess, onError) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const bundle = JSON.parse(e.target.result);
                const summary = this.mergeRemoteBundle(bundle);
                if (onSuccess) onSuccess(summary);
            } catch (err) {
                if (onError) onError(err.message || 'File JSON rusak atau format tidak cocok.');
            }
        };
        reader.readAsText(file);
    },

    // Update HUD indicator badge
    updateSyncBadge() {
        const badge = document.getElementById('hud-sync-status');
        const code = localStorage.getItem(this.KEYS.PAIRING_CODE);
        const lastSync = localStorage.getItem(this.KEYS.LAST_SYNC);

        if (badge) {
            if (code) {
                badge.innerText = code;
                badge.title = `Terkoneksi: ${code} (Terakhir: ${lastSync ? new Date(parseInt(lastSync)).toLocaleTimeString() : 'baru saja'})`;
            } else {
                badge.innerText = 'Cloud Sync';
            }
        }
    }
};

// =========================================================================
// UI CONTROLLER FOR CLOUD SYNC MODAL
// =========================================================================

function openCloudSyncModal() {
    if (typeof SoundFX !== 'undefined') SoundFX.play('click');
    const modal = document.getElementById('modal-cloud-sync');
    if (!modal) return;

    // Load saved configurations
    const savedUrl = localStorage.getItem(IeltsSyncService.KEYS.SUPABASE_URL) || '';
    const savedKey = localStorage.getItem(IeltsSyncService.KEYS.SUPABASE_KEY) || '';
    const savedCode = localStorage.getItem(IeltsSyncService.KEYS.PAIRING_CODE) || '';
    const autoSync = localStorage.getItem(IeltsSyncService.KEYS.AUTO_SYNC) !== 'false';

    const inputUrl = document.getElementById('sync-supabase-url');
    const inputKey = document.getElementById('sync-supabase-key');
    const inputPairingCode = document.getElementById('sync-input-code');
    const checkAuto = document.getElementById('sync-toggle-auto');

    if (inputUrl) inputUrl.value = savedUrl;
    if (inputKey) inputKey.value = savedKey;
    if (inputPairingCode) inputPairingCode.value = savedCode;
    if (checkAuto) checkAuto.checked = autoSync;

    updateSyncModalView();
    modal.classList.remove('hidden');
}

function closeCloudSyncModal() {
    if (typeof SoundFX !== 'undefined') SoundFX.play('click');
    const modal = document.getElementById('modal-cloud-sync');
    if (modal) modal.classList.add('hidden');
}

function switchSyncTab(tab) {
    if (typeof SoundFX !== 'undefined') SoundFX.play('click');
    const panelPair = document.getElementById('sync-panel-pair');
    const panelConfig = document.getElementById('sync-panel-config');
    const panelOffline = document.getElementById('sync-panel-offline');

    const tabPair = document.getElementById('sync-tab-btn-pair');
    const tabConfig = document.getElementById('sync-tab-btn-config');
    const tabOffline = document.getElementById('sync-tab-btn-offline');

    [panelPair, panelConfig, panelOffline].forEach(p => p && p.classList.add('hidden'));
    [tabPair, tabConfig, tabOffline].forEach(t => t && t.classList.remove('bg-indigo-600', 'text-white'));

    if (tab === 'pair') {
        if (panelPair) panelPair.classList.remove('hidden');
        if (tabPair) tabPair.classList.add('bg-indigo-600', 'text-white');
    } else if (tab === 'config') {
        if (panelConfig) panelConfig.classList.remove('hidden');
        if (tabConfig) tabConfig.classList.add('bg-indigo-600', 'text-white');
    } else if (tab === 'offline') {
        if (panelOffline) panelOffline.classList.remove('hidden');
        if (tabOffline) tabOffline.classList.add('bg-indigo-600', 'text-white');
    }
}

async function updateSyncModalView() {
    const code = localStorage.getItem(IeltsSyncService.KEYS.PAIRING_CODE);
    const lastSync = localStorage.getItem(IeltsSyncService.KEYS.LAST_SYNC);
    const hasConfig = !!(localStorage.getItem(IeltsSyncService.KEYS.SUPABASE_URL) && localStorage.getItem(IeltsSyncService.KEYS.SUPABASE_KEY));

    const codeDisplay = document.getElementById('sync-display-active-code');
    const lastSyncDisplay = document.getElementById('sync-display-last-time');
    const statusPill = document.getElementById('sync-status-pill');

    if (codeDisplay) {
        codeDisplay.innerText = code || 'Belum Ada Kode (Klik Buat)';
    }

    if (lastSyncDisplay) {
        lastSyncDisplay.innerText = lastSync 
            ? new Date(parseInt(lastSync)).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
            : 'Belum pernah';
    }

    if (statusPill) {
        if (!hasConfig) {
            statusPill.className = "text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold";
            statusPill.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1"></i> Perlu Setup Supabase';
        } else if (code) {
            statusPill.className = "text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold";
            statusPill.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i> Terhubung ke Cloud';
        } else {
            statusPill.className = "text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold";
            statusPill.innerHTML = '<i class="fa-solid fa-cloud mr-1"></i> Siap Pairing';
        }
    }

    if (code) {
        IeltsSyncService.renderQRCode('sync-qrcode-wrapper', code);
    }

    // Live Cloud Inspector Card Update
    const cloudBox = document.getElementById('sync-cloud-inspector-card');
    if (cloudBox && code && hasConfig) {
        cloudBox.classList.remove('hidden');
        const timeEl = document.getElementById('sync-cloud-live-time');
        const deviceEl = document.getElementById('sync-cloud-live-device');
        const statsEl = document.getElementById('sync-cloud-live-stats');

        if (timeEl) timeEl.innerText = 'Memeriksa Supabase...';

        const info = await IeltsSyncService.fetchCloudSnapshotInfo(code);
        if (info) {
            if (timeEl) timeEl.innerText = new Date(info.updatedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
            if (deviceEl) deviceEl.innerText = info.deviceInfo;
            if (statsEl) statsEl.innerHTML = `<span class="text-emerald-400 font-bold">${info.vocabCount} Kata Vocab</span> • <span class="text-amber-400 font-bold">${info.xp} XP (Lv.${info.level})</span> • <span class="text-cyan-400 font-bold">${info.stagesCount} Stages</span>`;
        } else {
            if (timeEl) timeEl.innerText = 'Data belum pernah diunggah untuk kode ini';
            if (deviceEl) deviceEl.innerText = '-';
            if (statsEl) statsEl.innerHTML = '<span class="text-slate-500">Klik tombol \'Upload Snapshot\' untuk membuat data awal di Cloud</span>';
        }
    }
}

async function handleGenerateAndPushCode() {
    try {
        const btn = document.getElementById('btn-sync-generate-push');
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Menyinkronkan...';
            btn.disabled = true;
        }

        const newCode = IeltsSyncService.generatePairingCode();
        const res = await IeltsSyncService.pushToCloud(newCode);

        localStorage.setItem(IeltsSyncService.KEYS.PAIRING_CODE, newCode);
        updateSyncModalView();
        IeltsSyncService.updateSyncBadge();

        if (typeof SoundFX !== 'undefined') SoundFX.play('levelup');
        if (typeof triggerConfetti === 'function') triggerConfetti();
        if (typeof showToast === 'function') showToast(`Snapshot berhasil diunggah! Kode Anda: ${newCode}`, 'success');

    } catch (err) {
        if (typeof SoundFX !== 'undefined') SoundFX.play('error');
        if (typeof showToast === 'function') showToast(err.message, 'error');
    } finally {
        const btn = document.getElementById('btn-sync-generate-push');
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up mr-1.5"></i> Buat Kode Baru & Upload';
            btn.disabled = false;
        }
    }
}

async function handlePullCurrentData() {
    const code = localStorage.getItem(IeltsSyncService.KEYS.PAIRING_CODE);
    if (!code) {
        if (typeof showToast === 'function') showToast('Belum ada kode pairing aktif. Masukkan kode atau buat baru.', 'error');
        return;
    }

    const btn = document.getElementById('btn-sync-pull-now');
    try {
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Menarik...';
            btn.disabled = true;
        }

        const res = await IeltsSyncService.pullFromCloud(code);
        updateSyncModalView();
        IeltsSyncService.updateSyncBadge();

        if (typeof SoundFX !== 'undefined') SoundFX.play('levelup');
        if (typeof triggerConfetti === 'function') triggerConfetti();
        if (typeof showToast === 'function') showToast(`Data Cloud berhasil ditarik! (${res.summary})`, 'success');

    } catch (err) {
        if (typeof SoundFX !== 'undefined') SoundFX.play('error');
        if (typeof showToast === 'function') showToast(err.message, 'error');
    } finally {
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down mr-1.5"></i> Tarik Data Terbaru';
            btn.disabled = false;
        }
    }
}

async function handleSyncNow() {
    const code = localStorage.getItem(IeltsSyncService.KEYS.PAIRING_CODE);
    if (!code) {
        return handleGenerateAndPushCode();
    }

    const btn = document.getElementById('btn-sync-two-way');
    try {
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Sinkronisasi...';
            btn.disabled = true;
        }

        // 1. Pull latest from cloud and smart-merge
        const pullRes = await IeltsSyncService.pullFromCloud(code);

        // 2. Push merged bundle back to cloud
        await IeltsSyncService.pushToCloud(code);

        updateSyncModalView();
        IeltsSyncService.updateSyncBadge();

        if (typeof SoundFX !== 'undefined') SoundFX.play('levelup');
        if (typeof triggerConfetti === 'function') triggerConfetti();
        if (typeof showToast === 'function') showToast(`Sinkronisasi Selesai! (${pullRes.summary})`, 'success');

    } catch (err) {
        if (typeof SoundFX !== 'undefined') SoundFX.play('error');
        if (typeof showToast === 'function') showToast(err.message, 'error');
    } finally {
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-arrows-rotate mr-1.5"></i> Sinkronkan Sekarang (Dua Arah)';
            btn.disabled = false;
        }
    }
}

async function handlePushCurrentData() {
    try {
        const code = localStorage.getItem(IeltsSyncService.KEYS.PAIRING_CODE);
        if (!code) {
            return handleGenerateAndPushCode();
        }

        const btn = document.getElementById('btn-sync-push-now');
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Mengupload...';
            btn.disabled = true;
        }

        await IeltsSyncService.pushToCloud(code);
        updateSyncModalView();
        IeltsSyncService.updateSyncBadge();

        if (typeof SoundFX !== 'undefined') SoundFX.play('correct');
        if (typeof showToast === 'function') showToast('Data lokal berhasil disinkronkan ke Cloud!', 'success');

    } catch (err) {
        if (typeof SoundFX !== 'undefined') SoundFX.play('error');
        if (typeof showToast === 'function') showToast(err.message, 'error');
    } finally {
        const btn = document.getElementById('btn-sync-push-now');
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-rotate mr-1.5"></i> Update Snapshot Cloud';
            btn.disabled = false;
        }
    }
}

async function handlePullByCode() {
    const input = document.getElementById('sync-input-code');
    const code = input ? input.value.trim() : '';
    if (!code) {
        if (typeof showToast === 'function') showToast('Ketik kode sinkronisasi terlebih dahulu!', 'error');
        return;
    }

    const btn = document.getElementById('btn-sync-pull-code');
    try {
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Menghubungkan...';
            btn.disabled = true;
        }

        const res = await IeltsSyncService.pullFromCloud(code);
        updateSyncModalView();
        IeltsSyncService.updateSyncBadge();

        if (typeof SoundFX !== 'undefined') SoundFX.play('levelup');
        if (typeof triggerConfetti === 'function') triggerConfetti();
        if (typeof showToast === 'function') showToast(`Perangkat Terhubung! (${res.summary})`, 'success');

    } catch (err) {
        if (typeof SoundFX !== 'undefined') SoundFX.play('error');
        if (typeof showToast === 'function') showToast(err.message, 'error');
    } finally {
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down mr-1.5"></i> Hubungkan Perangkat & Tarik Data';
            btn.disabled = false;
        }
    }
}

function handleSaveSupabaseConfig() {
    const url = document.getElementById('sync-supabase-url').value.trim();
    const key = document.getElementById('sync-supabase-key').value.trim();

    if (!url || !key) {
        if (typeof showToast === 'function') showToast('URL dan Public Key Supabase wajib diisi!', 'error');
        return;
    }

    localStorage.setItem(IeltsSyncService.KEYS.SUPABASE_URL, url);
    localStorage.setItem(IeltsSyncService.KEYS.SUPABASE_KEY, key);
    IeltsSyncService.resetClient();

    const client = IeltsSyncService.getClient();
    if (client) {
        if (typeof SoundFX !== 'undefined') SoundFX.play('correct');
        if (typeof showToast === 'function') showToast('Konfigurasi Supabase berhasil disimpan!', 'success');
        updateSyncModalView();
        switchSyncTab('pair');
    } else {
        if (typeof showToast === 'function') showToast('Gagal menginisialisasi klien Supabase. Periksa URL.', 'error');
    }
}

function copyActivePairingCode() {
    const code = localStorage.getItem(IeltsSyncService.KEYS.PAIRING_CODE);
    if (!code) {
        if (typeof showToast === 'function') showToast('Belum ada kode untuk disalin.', 'info');
        return;
    }
    navigator.clipboard.writeText(code).then(() => {
        if (typeof SoundFX !== 'undefined') SoundFX.play('correct');
        if (typeof showToast === 'function') showToast(`Kode '${code}' disalin ke clipboard!`, 'success');
    });
}

function toggleAutoSync(enabled) {
    localStorage.setItem(IeltsSyncService.KEYS.AUTO_SYNC, enabled ? 'true' : 'false');
    if (typeof showToast === 'function') {
        showToast(enabled ? 'Auto-sync otomatis aktif.' : 'Auto-sync dimatikan.', 'info');
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof IeltsSyncService !== 'undefined') {
            IeltsSyncService.updateSyncBadge();
            IeltsSyncService.checkAndPullIfNewer();
        }
    }, 1200);
});

// Auto-check when switching back to tab
window.addEventListener('focus', () => {
    if (typeof IeltsSyncService !== 'undefined') {
        IeltsSyncService.checkAndPullIfNewer();
    }
});

window.IeltsSyncService = IeltsSyncService;
window.openCloudSyncModal = openCloudSyncModal;
window.closeCloudSyncModal = closeCloudSyncModal;
window.switchSyncTab = switchSyncTab;
window.handleGenerateAndPushCode = handleGenerateAndPushCode;
window.handlePushCurrentData = handlePushCurrentData;
window.handlePullByCode = handlePullByCode;
window.handleSaveSupabaseConfig = handleSaveSupabaseConfig;
window.copyActivePairingCode = copyActivePairingCode;
window.toggleAutoSync = toggleAutoSync;

window.handlePullCurrentData = handlePullCurrentData;
window.handleSyncNow = handleSyncNow;