/* ============================================================
   IELTS GO — Vocab Logger Pro · SRS Review Session · Feynman Drill
   ============================================================ */

// IeltsGo v6.0 — VOCABULARY LOGGER & CEFR CLASSIFIER ENGINE
        // =========================================================================
        let vocabBank = [];
        let currentVocabFilter = 'all';
        let currentActiveVocabId = null;
        let vocabPronRec = null;
        let vocabAudioChunks = [];
        let vocabAudioBlob = null;
        let vocabRecMediaRecorder = null;
        let vocabLiveTeachingHistory = [];

function loadVocabBank() {
            try {
                const saved = localStorage.getItem('ielts_vocab_bank_v1');
                if (saved) {
                    vocabBank = JSON.parse(saved);
                } else {
                    vocabBank = [];
                }
            } catch (e) {
                console.error("Vocab bank load error:", e);
                vocabBank = [];
            }
            updateVocabBadges();
        }

        function saveVocabBank() {
            try {
                localStorage.setItem('ielts_vocab_bank_v1', JSON.stringify(vocabBank));
            } catch (e) {
                console.error("Vocab bank save error:", e);
            }
            updateVocabBadges();
            renderVocabBank();
        }

        function updateVocabBadges() {
            const dueCount = getVocabsDueToday().length;
            const reviewBadge = document.getElementById('vocab-review-badge');
            if (reviewBadge) {
                reviewBadge.innerText = dueCount;
                if (dueCount > 0) {
                    reviewBadge.className = "text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md font-mono border border-amber-500/30 font-bold animate-pulse";
                } else {
                    reviewBadge.className = "text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md font-mono border border-slate-700";
                }
            }
            const headerDue = document.getElementById('vocab-header-due-count');
            if (headerDue) headerDue.innerText = dueCount;
        }

        function initVocabLogger() {
            updateVocabBadges();
            renderVocabBank();
        }

        let vocabFilterState = {
            status: 'all',    // 'all' | 'due' | 'writing_ready' | 'speaking_only' | 'c1_c2' | 'mastered' | 'unlearned'
            cefr: 'all',      // 'all' | 'C2' | 'C1' | 'B2' | 'B1' | 'A2' | 'A1'
            register: 'all'   // 'all' | 'formal' | 'semi_formal' | 'casual' | 'written_academic'
        };

        function onVocabSearchInput(val) {
            const clearBtn = document.getElementById('btn-clear-vocab-search');
            if (clearBtn) {
                if (val && val.trim().length > 0) {
                    clearBtn.classList.remove('hidden');
                } else {
                    clearBtn.classList.add('hidden');
                }
            }
            renderVocabBank();
        }

        function clearVocabSearch() {
            SoundFX.play('click');
            const input = document.getElementById('input-vocab-search');
            if (input) input.value = '';
            const clearBtn = document.getElementById('btn-clear-vocab-search');
            if (clearBtn) clearBtn.classList.add('hidden');
            renderVocabBank();
        }

        function toggleVocabFilterPanel() {
            SoundFX.play('click');
            const panel = document.getElementById('vocab-filter-detail-panel');
            const btn = document.getElementById('btn-toggle-filter-panel');
            if (!panel) return;
            const isHidden = panel.classList.contains('hidden');
            if (isHidden) {
                panel.classList.remove('hidden');
                if (btn) {
                    btn.classList.add('bg-indigo-600', 'text-white', 'border-indigo-500');
                    btn.classList.remove('bg-slate-950', 'text-slate-300');
                }
            } else {
                panel.classList.add('hidden');
                if (btn) {
                    btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-500');
                    btn.classList.add('bg-slate-950', 'text-slate-300');
                }
            }
        }

        function updateActiveFilterBadge() {
            let activeCount = 0;
            if (vocabFilterState.cefr !== 'all') activeCount++;
            if (vocabFilterState.register !== 'all') activeCount++;

            const badge = document.getElementById('badge-active-filter-count');
            if (badge) {
                if (activeCount > 0) {
                    badge.innerText = activeCount;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }

            const cefrLabel = document.getElementById('active-cefr-label');
            if (cefrLabel) {
                cefrLabel.innerText = vocabFilterState.cefr === 'all' ? 'Semua Level' : `Level ${vocabFilterState.cefr}`;
            }

            const regLabels = {
                all: 'Semua Register',
                formal: '🟢 Formal Akademik',
                semi_formal: '🟡 Agak Formal',
                casual: '🔴 Casual',
                written_academic: '🟣 Written Only'
            };
            const regLabel = document.getElementById('active-register-label');
            if (regLabel) {
                regLabel.innerText = regLabels[vocabFilterState.register] || 'Semua Register';
            }
        }

        function setVocabFilterStatus(status) {
            SoundFX.play('click');
            vocabFilterState.status = status;
            
            // Update status pill styling with sleek modern active states
            ['all', 'due', 'writing_ready', 'speaking_only', 'c1_c2', 'mastered', 'unlearned'].forEach(s => {
                const btn = document.getElementById(`filter-btn-status-${s}`);
                if (btn) {
                    if (s === status) {
                        btn.className = "px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold whitespace-nowrap transition-all text-[11px] flex items-center gap-1.5 shadow-md active:scale-95 shrink-0";
                    } else {
                        btn.className = "px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold whitespace-nowrap transition-all text-[11px] flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0";
                    }
                }
            });
            renderVocabBank();
        }

        function setVocabFilterCefr(cefr) {
            SoundFX.play('click');
            vocabFilterState.cefr = cefr;
            
            // Update CEFR chips
            ['all', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1'].forEach(c => {
                const chip = document.getElementById(`chip-cefr-${c}`);
                if (chip) {
                    if (c === cefr) {
                        chip.className = "px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] transition-all shadow-sm";
                    } else {
                        chip.className = "px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-[11px] transition-all";
                    }
                }
            });
            updateActiveFilterBadge();
            renderVocabBank();
        }

        function setVocabFilterRegister(reg) {
            SoundFX.play('click');
            vocabFilterState.register = reg;

            // Update Register chips
            ['all', 'formal', 'semi_formal', 'casual', 'written_academic'].forEach(r => {
                const chip = document.getElementById(`chip-reg-${r}`);
                if (chip) {
                    if (r === reg) {
                        chip.className = "px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] transition-all shadow-sm";
                    } else {
                        chip.className = "px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-[11px] transition-all";
                    }
                }
            });
            updateActiveFilterBadge();
            renderVocabBank();
        }

        function resetVocabFilters() {
            SoundFX.play('click');
            vocabFilterState = { status: 'all', cefr: 'all', register: 'all' };
            
            const searchInput = document.getElementById('input-vocab-search');
            if (searchInput) searchInput.value = '';
            const clearBtn = document.getElementById('btn-clear-vocab-search');
            if (clearBtn) clearBtn.classList.add('hidden');
            const selectSort = document.getElementById('select-vocab-sort');
            if (selectSort) selectSort.value = 'recent';
            
            setVocabFilterStatus('all');
            setVocabFilterCefr('all');
            setVocabFilterRegister('all');
            showToast("Filter kosakata telah di-reset.", "info");
        }

        // Backward compatibility
        function setVocabFilter(filter) {
            if (['all', 'due', 'mastered', 'unlearned'].includes(filter)) {
                setVocabFilterStatus(filter);
            } else if (filter === 'reg_writing') {
                setVocabFilterStatus('writing_ready');
            } else if (filter === 'reg_speaking') {
                setVocabFilterStatus('speaking_only');
            } else if (filter === 'c1_c2') {
                setVocabFilterStatus('c1_c2');
            } else if (filter === 'reg_formal') {
                setVocabFilterRegister('formal');
            } else if (filter === 'reg_casual') {
                setVocabFilterRegister('casual');
            } else if (['C2', 'C1', 'B2', 'B1', 'A2', 'A1'].includes(filter)) {
                setVocabFilterCefr(filter);
            }
        }

        function renderVocabBank() {
            const listContainer = document.getElementById('vocab-bank-list');
            const emptyContainer = document.getElementById('vocab-bank-empty');
            const searchInput = document.getElementById('input-vocab-search');
            const sortSelect = document.getElementById('select-vocab-sort');

            if (!listContainer) return;

            const searchQuery = (searchInput ? searchInput.value : '').toLowerCase().trim();
            const sortBy = sortSelect ? sortSelect.value : 'recent';
            const now = Date.now();

            // 1. Calculate Realtime Counts for All Status Pills
            const dueCount = getVocabsDueToday().length;
            const masteredCount = vocabBank.filter(v => v.status === 'mastered' || (v.feynmanLevel && v.feynmanLevel >= 5)).length;
            const writingReadyCount = vocabBank.filter(v => (v.ieltsSuitability?.status === 'both' || v.ieltsSuitability?.status === 'writing_only' || v.registerLevel === 'formal' || v.registerLevel === 'written_academic')).length;
            const speakingOnlyCount = vocabBank.filter(v => v.ieltsSuitability?.status === 'speaking_only').length;
            const c1c2Count = vocabBank.filter(v => v.cefr === 'C1' || v.cefr === 'C2').length;
            const unlearnedCount = vocabBank.filter(v => (!v.feynmanLevel || v.feynmanLevel === 0) && v.status !== 'mastered').length;

            const filterCountAll = document.getElementById('filter-count-all');
            if (filterCountAll) filterCountAll.innerText = vocabBank.length;
            const filterCountDue = document.getElementById('filter-count-due');
            if (filterCountDue) filterCountDue.innerText = dueCount;
            const filterCountMastered = document.getElementById('filter-count-mastered');
            if (filterCountMastered) filterCountMastered.innerText = masteredCount;
            const filterCountWriting = document.getElementById('filter-count-writing_ready');
            if (filterCountWriting) filterCountWriting.innerText = writingReadyCount;
            const filterCountSpeaking = document.getElementById('filter-count-speaking_only');
            if (filterCountSpeaking) filterCountSpeaking.innerText = speakingOnlyCount;
            const filterCountC1C2 = document.getElementById('filter-count-c1_c2');
            if (filterCountC1C2) filterCountC1C2.innerText = c1c2Count;
            const filterCountUnlearned = document.getElementById('filter-count-unlearned');
            if (filterCountUnlearned) filterCountUnlearned.innerText = unlearnedCount;

            // 2. Multi-Filter Logic (Combinatorial AND)
            let filtered = vocabBank.filter(v => {
                const isMastered = v.status === 'mastered' || (v.feynmanLevel && v.feynmanLevel >= 5);
                const isDue = !isMastered && (v.srNextReview || 0) <= now + 3600000;
                const isWritingReady = (v.ieltsSuitability?.status === 'both' || v.ieltsSuitability?.status === 'writing_only' || v.registerLevel === 'formal' || v.registerLevel === 'written_academic');
                const isSpeakingOnly = v.ieltsSuitability?.status === 'speaking_only';
                const isC1C2 = (v.cefr === 'C1' || v.cefr === 'C2');
                const isUnlearned = !isMastered && (!v.feynmanLevel || v.feynmanLevel === 0);

                // A. Status Filter
                if (vocabFilterState.status === 'due' && !isDue) return false;
                if (vocabFilterState.status === 'mastered' && !isMastered) return false;
                if (vocabFilterState.status === 'writing_ready' && !isWritingReady) return false;
                if (vocabFilterState.status === 'speaking_only' && !isSpeakingOnly) return false;
                if (vocabFilterState.status === 'c1_c2' && !isC1C2) return false;
                if (vocabFilterState.status === 'unlearned' && !isUnlearned) return false;

                // B. CEFR Filter
                if (vocabFilterState.cefr !== 'all' && v.cefr !== vocabFilterState.cefr) return false;

                // C. Register Filter
                if (vocabFilterState.register === 'formal') {
                    if (v.registerLevel !== 'formal' && v.registerLevel !== 'written_academic' && v.registerLevel) return false;
                } else if (vocabFilterState.register === 'semi_formal') {
                    if (v.registerLevel !== 'semi_formal') return false;
                } else if (vocabFilterState.register === 'casual') {
                    if (v.registerLevel !== 'casual') return false;
                } else if (vocabFilterState.register === 'written_academic') {
                    if (v.registerLevel !== 'written_academic') return false;
                }

                // D. Search Query
                if (searchQuery) {
                    const match = v.word.toLowerCase().includes(searchQuery) ||
                        (v.meaningId && v.meaningId.toLowerCase().includes(searchQuery)) ||
                        (v.meaningEn && v.meaningEn.toLowerCase().includes(searchQuery)) ||
                        (v.registerLabel && v.registerLabel.toLowerCase().includes(searchQuery)) ||
                        (v.highYieldContext && v.highYieldContext.toLowerCase().includes(searchQuery)) ||
                        (v.synonyms && v.synonyms.some(s => s.toLowerCase().includes(searchQuery)));
                    if (!match) return false;
                }

                return true;
            });

            // 3. Sorting (Including Comprehension Level & Review Due First)
            filtered.sort((a, b) => {
                if (sortBy === 'recent') return (b.dateAdded || 0) - (a.dateAdded || 0);
                if (sortBy === 'due_first') {
                    const isDueA = (a.status !== 'mastered' && (a.srNextReview || 0) <= now + 3600000) ? 1 : 0;
                    const isDueB = (b.status !== 'mastered' && (b.srNextReview || 0) <= now + 3600000) ? 1 : 0;
                    if (isDueA !== isDueB) return isDueB - isDueA;
                    return (a.srNextReview || 0) - (b.srNextReview || 0);
                }
                if (sortBy === 'feynman_asc') {
                    // Level Pemahaman: Terendah ke Tertinggi (0 -> 1 -> 2 -> 3 -> 4 -> 5)
                    const lvlA = (a.status === 'mastered' || (a.feynmanLevel && a.feynmanLevel >= 5)) ? 5 : (a.feynmanLevel || 0);
                    const lvlB = (b.status === 'mastered' || (b.feynmanLevel && b.feynmanLevel >= 5)) ? 5 : (b.feynmanLevel || 0);
                    return lvlA - lvlB;
                }
                if (sortBy === 'feynman_desc') {
                    // Level Pemahaman: Tertinggi ke Terendah (5 -> 4 -> 3 -> 2 -> 1 -> 0)
                    const lvlA = (a.status === 'mastered' || (a.feynmanLevel && a.feynmanLevel >= 5)) ? 5 : (a.feynmanLevel || 0);
                    const lvlB = (b.status === 'mastered' || (b.feynmanLevel && b.feynmanLevel >= 5)) ? 5 : (b.feynmanLevel || 0);
                    return lvlB - lvlA;
                }
                if (sortBy === 'cefr_desc') {
                    const order = { C2: 6, C1: 5, B2: 4, B1: 3, A2: 2, A1: 1 };
                    return (order[b.cefr] || 0) - (order[a.cefr] || 0);
                }
                if (sortBy === 'cefr_asc') {
                    const order = { C2: 6, C1: 5, B2: 4, B1: 3, A2: 2, A1: 1 };
                    return (order[a.cefr] || 0) - (order[b.cefr] || 0);
                }
                if (sortBy === 'alpha') return a.word.localeCompare(b.word);
                return 0;
            });

            if (filtered.length === 0) {
                listContainer.innerHTML = '';
                if (emptyContainer) emptyContainer.classList.remove('hidden');
                return;
            }

            if (emptyContainer) emptyContainer.classList.add('hidden');

            // 4. Render 2-Column Responsive High-Density Card Grid
            listContainer.innerHTML = filtered.map(v => {
                const isDue = v.status !== 'mastered' && (v.srNextReview || 0) <= now + 3600000;
                const isMastered = v.status === 'mastered' || (v.feynmanLevel && v.feynmanLevel >= 5);
                const isUnlearnedFeynman = !isMastered && (!v.feynmanLevel || v.feynmanLevel === 0);
                
                let scheduleTag = '';
                let borderClass = 'border-slate-800';
                let bgClass = 'bg-slate-900/90';
                let itemStatusClass = '';

                if (isMastered) {
                    scheduleTag = `<span class="badge-feynman-mastered text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/50 font-bold font-mono"><i class="fa-solid fa-crown mr-1 text-amber-400"></i> 🏆 Bebas Review</span>`;
                    borderClass = 'border-amber-500/40';
                    bgClass = 'bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20';
                    itemStatusClass = 'vocab-item-mastered';
                } else if (isUnlearnedFeynman) {
                    scheduleTag = `<span class="badge-feynman-unlearned text-[10px] bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/40 font-bold font-mono animate-pulse"><i class="fa-solid fa-triangle-exclamation mr-1"></i> 🔴 Belum Feynman</span>`;
                    borderClass = 'border-rose-500/30';
                    itemStatusClass = 'vocab-item-unlearned';
                } else if (isDue) {
                    scheduleTag = `<span class="badge-feynman-due text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold review-due-pulse"><i class="fa-solid fa-clock-rotate-left mr-1"></i> Review Hari Ini</span>`;
                    borderClass = 'border-amber-500/40';
                    itemStatusClass = 'vocab-item-due';
                } else {
                    const daysLeft = Math.max(1, Math.ceil(((v.srNextReview || now) - now) / (1000 * 60 * 60 * 24)));
                    scheduleTag = `<span class="badge-feynman-learning text-[10px] bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono font-bold"><i class="fa-solid fa-calendar mr-1"></i> Lvl ${v.feynmanLevel || 1} • ${daysLeft} hr lagi</span>`;
                    borderClass = 'border-emerald-500/20';
                }

                // Register Mini Badge
                const regMini = v.registerLevel === 'casual'
                    ? `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 font-bold">🔴 Casual</span>`
                    : (v.registerLevel === 'semi_formal'
                        ? `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 font-bold">🟡 Agak Formal</span>`
                        : (v.registerLevel === 'written_academic'
                            ? `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30 font-bold">📝 Writing Only</span>`
                            : `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold">🟢 Formal</span>`));

                const highYieldBadge = v.highYieldContext
                    ? `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1" title="${v.highYieldContext}"><i class="fa-solid fa-fire text-amber-400"></i> High-Yield</span>`
                    : '';

                return `
                    <div class="${bgClass} border ${borderClass} rounded-2xl p-4 flex flex-col justify-between gap-3 vocab-item ${itemStatusClass} shadow-md transition-all hover:border-slate-700 hover:shadow-xl">
                        <div class="space-y-1.5 cursor-pointer" onclick="openVocabCard('${v.id}')">
                            <div class="flex items-center justify-between flex-wrap gap-1">
                                <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                                    <span class="vocab-word-title text-base font-black text-white hover:text-emerald-300 transition-colors">${v.word}</span>
                                    <span class="text-[11px] font-mono text-slate-400 italic">${v.pos || ''}</span>
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border cefr-${(v.cefr || 'b2').toLowerCase()}">${v.cefr}</span>
                                </div>
                                <div class="flex items-center gap-1">
                                    ${regMini}
                                    ${highYieldBadge}
                                </div>
                            </div>
                            
                            <div class="text-xs font-mono text-emerald-400 flex items-center gap-2">
                                <span>${v.ipa || ''}</span>
                            </div>

                            <p class="text-xs text-slate-300 line-clamp-2 font-medium leading-relaxed">${v.meaningId || v.meaningEn || ''}</p>
                            
                            <div class="text-[10px] font-mono text-amber-300/90 flex items-center gap-1 pt-1 border-t border-slate-800/60">
                                <i class="fa-solid fa-bullhorn text-[9px] text-amber-400 shrink-0"></i>
                                <span class="truncate">${v.indonesianGuide || ''}</span>
                            </div>
                        </div>

                        <!-- Card Bottom Bar -->
                        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            ${scheduleTag}
                            <div class="flex items-center space-x-1.5">
                                <button onclick="speakWord('${v.word}', 'en-GB')" class="p-1.5 bg-slate-950 hover:bg-slate-800 text-rose-300 rounded-lg text-xs border border-slate-800 transition-all shadow-sm" title="Dengarkan Audio UK">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                                <button onclick="openVocabCard('${v.id}')" class="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-mono font-bold text-[11px] rounded-lg transition-all border border-emerald-500/30 flex items-center gap-1">
                                    <span>Buka Kartu</span>
                                    <i class="fa-solid fa-chevron-right text-[9px]"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        async function addVocabWord() {
            const input = document.getElementById('input-vocab-word');
            const word = input ? input.value.trim().toLowerCase() : '';
            if (!word) {
                showToast("Silakan masukkan kata bahasa Inggris terlebih dahulu!", "error");
                return;
            }

            // Check if already in bank (exact match before calling AI)
            const existing = vocabBank.find(v => v.word.toLowerCase() === word);
            if (existing && existing.meaningEn && existing.meaningEn !== 'An English term relevant to IELTS study.') {
                showToast(`Kata "${word}" sudah ada di Vocab Bank Anda!`, "info");
                openVocabCard(existing.id);
                return;
            }

            const btn = document.getElementById('btn-add-vocab');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Mendiagnosa CEFR, Arti & ELI5...</span>`;
            }

            try {
                const analysis = await analyzeVocabWithAI(word);

                // === SMART VOCAB GUARD ===
                // 1. Reject non-English words
                if (analysis.isNonEnglish) {
                    showToast(analysis.rejectionReason || `"${word}" bukan kata bahasa Inggris. Coba: establish, innovative, dll.`, "error");
                    SoundFX.play('error');
                    return;
                }

                // 2. Auto-correct typos
                const finalWord = (analysis.correctedWord || word).toLowerCase().trim();
                if (finalWord !== word) {
                    showToast(`Kata diperbaiki otomatis: "${word}" → "${finalWord}" ✅`, "info");
                }

                // If entry already existed in bank, upgrade it with full AI diagnosis
                const targetEntry = vocabBank.find(v => v.word.toLowerCase() === finalWord);
                if (targetEntry) {
                    targetEntry.word = finalWord;
                    targetEntry.pos = analysis.pos || targetEntry.pos || 'noun';
                    targetEntry.cefr = analysis.cefr || targetEntry.cefr || 'B2';
                    targetEntry.registerLevel = analysis.registerLevel || targetEntry.registerLevel || 'formal';
                    targetEntry.registerLabel = analysis.registerLabel || targetEntry.registerLabel || 'Formal Akademik';
                    targetEntry.ieltsSuitability = analysis.ieltsSuitability || targetEntry.ieltsSuitability || {
                        status: 'both',
                        badgeText: '🌐 Writing & Speaking OK',
                        badgeColor: 'emerald',
                        description: 'Aman dan direkomendasikan untuk IELTS Writing Task 2 dan Speaking.'
                    };
                    targetEntry.highYieldContext = analysis.highYieldContext !== undefined ? analysis.highYieldContext : (targetEntry.highYieldContext || null);
                    targetEntry.registerTrapAlert = analysis.registerTrapAlert !== undefined ? analysis.registerTrapAlert : (targetEntry.registerTrapAlert || null);
                    targetEntry.meaningId = analysis.meaningId || targetEntry.meaningId;
                    targetEntry.meaningEn = analysis.meaningEn || targetEntry.meaningEn;
                    targetEntry.indonesianGuide = analysis.indonesianGuide || `${finalWord.toUpperCase()}`;
                    targetEntry.example = analysis.example || targetEntry.example;
                    targetEntry.childExplanation = analysis.childExplanation || targetEntry.childExplanation || '';
                    targetEntry.dailyExamples = analysis.dailyExamples || targetEntry.dailyExamples || [];
                    targetEntry.synonyms = analysis.synonyms || targetEntry.synonyms || [];
                    targetEntry.ipa = analysis.ipa || targetEntry.ipa || '';
                    saveVocabBank();
                    if (input) input.value = '';
                    addXP(15);
                    SoundFX.play('levelup');
                    showToast(`Kata "${finalWord}" berhasil diperbarui dengan analisis AI (+15 XP)!`, "success");
                    openVocabCard(targetEntry.id);
                    renderVocabBank();
                    return;
                }

                const newVocab = {
                    id: 'vocab_' + Date.now(),
                    word: finalWord,
                    pos: analysis.pos || 'noun',
                    cefr: analysis.cefr || 'B2',
                    registerLevel: analysis.registerLevel || 'formal',
                    registerLabel: analysis.registerLabel || 'Formal Akademik',
                    ieltsSuitability: analysis.ieltsSuitability || {
                        status: 'both',
                        badgeText: '🌐 Writing & Speaking OK',
                        badgeColor: 'emerald',
                        description: 'Aman dan direkomendasikan untuk IELTS Writing Task 2 dan Speaking.'
                    },
                    highYieldContext: analysis.highYieldContext || null,
                    registerTrapAlert: analysis.registerTrapAlert || null,
                    meaningId: analysis.meaningId || 'Arti kata bahasa Inggris',
                    meaningEn: analysis.meaningEn || 'English definition',
                    indonesianGuide: analysis.indonesianGuide || `${finalWord.toUpperCase()}`,
                    example: analysis.example || `Academic context sentence using ${finalWord}.`,
                    childExplanation: analysis.childExplanation || `Konsep sederhana untuk ${finalWord}.`,
                    dailyExamples: analysis.dailyExamples || [],
                    synonyms: analysis.synonyms || [],
                    ipa: analysis.ipa || '',
                    dateAdded: Date.now(),
                    srInterval: 1,
                    srNextReview: Date.now() + (1 * 86400000),
                    srReviewCount: 0,
                    feynmanLevel: 0,
                    feynmanStatus: 'unlearned',
                    feynmanLastExplanation: '',
                    feynmanLastSentence: '',
                    feynmanFeedback: null,
                    consecutiveMasteryCount: 0,
                    status: 'learning'
                };

                vocabBank.unshift(newVocab);
                saveVocabBank();
                if (input) input.value = '';

                addXP(15);
                SoundFX.play('levelup');
                triggerConfetti();
                showToast(`Kata "${finalWord}" berhasil ditambahkan ke Bank (+15 XP)!`, "success");

                openVocabCard(newVocab.id);
                renderVocabBank();

            } catch (err) {
                showToast("Gagal menganalisis kata: " + err.message, "error");
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Tambah & Analisis AI (+15 XP)</span>`;
                }
            }
        }

        async function analyzeVocabWithAI(word) {
            const targetAccent = localStorage.getItem('ielts_target_accent') || 'british_rp';
            const accentName = targetAccent === 'british_rp' ? 'British RP (Received Pronunciation — Non-rhotic, crisp T, pure vowels)' : (targetAccent === 'general_american' ? 'General American (Rhotic r, flap T, open vowels)' : (targetAccent === 'australian' ? 'Australian English' : 'Neutral Academic'));

            const systemPrompt = `You are an expert Cambridge Lexicographer, Cognitive Tutor, and English Phonetics Specialist for Indonesian IELTS learners.
Target Accent: ${accentName}

CRITICAL PRE-ANALYSIS:
1. Is the submitted word a valid English word, OR a close misspelling/typo of an English word?
   - If misspelling (e.g. "eliminare" -> "eliminate"): set "correctedWord" to correct spelling, "isNonEnglish": false, and analyze the corrected word.
   - If valid: set "correctedWord" to input, "isNonEnglish": false.
2. Is the submitted word NOT English at all?
   - Set "isNonEnglish": true, "rejectionReason": "Kata '${word}' bukan kata bahasa Inggris.", and empty others.

REGISTER & IELTS SUITABILITY CLASSIFICATION (CRITICAL FOR IELTS LEARNERS):
- "registerLevel": One of ["casual", "semi_formal", "formal", "written_academic"]
  * "casual": Slang, informal, everyday idioms (e.g. "hang out", "kids", "awesome", "a bunch of", "wanna").
  * "semi_formal": Neutral everyday professional/conversational (e.g. "significant", "convenient", "reliable", "perspective", "essential").
  * "formal": High-level academic & formal language (e.g. "substantiate", "mitigate", "ubiquitous", "deterioration", "prevalent").
  * "written_academic": Highly formal/written-only academic words (e.g. "aforementioned", "notwithstanding", "subsequent", "thus").
- "registerLabel": Indonesian human-readable label: "Casual / Santai" | "Agak Formal / Netral" | "Formal Akademik" | "Tulisan Resmi (Written Only)".
- "ieltsSuitability": An object containing:
  * "status": "both" | "speaking_only" | "writing_only" | "non_ielts"
  * "badgeText": "🌐 Writing & Speaking OK" | "🎙️ Speaking Only (Haram di Writing)" | "📝 Writing Only (Jarang Lisan)" | "☕ Sehari-hari Saja (Bukan IELTS)"
  * "badgeColor": "emerald" (for both) | "sky" (for speaking_only) | "purple" (for writing_only) | "amber" (for non_ielts)
  * "description": A sharp 1-2 sentence explanation in Bahasa Indonesia about exactly where this word is suitable and where it is forbidden.
- "highYieldContext": If this word frequently appears in specific IELTS modules or themes (e.g. "🔥 High-Yield: Sering dipakai di IELTS Writing Task 2 (Topik Lingkungan & Sains)" or "🔥 High-Yield: Khas untuk Speaking Part 1 (Topik Daily Routine & Hobbies)"), return that string. If it is a generic/regular word with no special high-frequency theme, return null.
- "registerTrapAlert": If there is a common dangerous trap for Indonesian students (e.g. for 'kids': "⚠️ JEBAKAN REGISTER: Jangan gunakan 'kids' di Writing Task 2! Gunakan 'children' atau 'adolescents' agar Lexical Resource tidak dipotong ke Band 5.5." or for 'indubitably': "⚠️ JEBAKAN REGISTER: Terlalu kaku untuk percakapan lisan santai!"), return that warning. If safe, return null.

PHONETIC & EXPLANATION GUIDELINES (TARGET ACCENT: ${accentName}):
- "indonesianGuide": 100% HURUF ALFABET INDONESIA (A-Z) TANPA SIMBOL IPA! Wajib menyertakan bedah suku kata demi suku kata yang ditekan dengan HURUF BESAR (KAPITAL) dan tanda intonasi ↗ ↘ serta asosiasi bunyi kata Indonesia di dalam kurung.
  * Format: "EJAAN-GLOBAL ↘ (suku1: seperti '...', SUKU_KAPITAL: ditekan kuat / stress, suku3: ...)"
  * Contoh establish: "es-TAB-lisy ↘ (es: seperti 'es batu', TAB: ditekan kuat, lisy: akhiri desis lembut /sh/)"
  * Contoh ubiquitous: "yu-BI-kwi-tes ↘ (yu: seperti 'you', BI: ditekan kuat, kwi: seperti 'quick', tes: akhiri vokal santai)"
  * Contoh ridiculous: "ri-DI-kyu-les ↘ (ri: 'ri' cepat, DI: ditekan kuat seperti 'titik', kyu: seperti 'kios/Q', les: berima 'poles')"
  * Sesuai Target Aksen: ${accentName}.
- "ipa": Official Cambridge IPA phonetics symbol (e.g. "/luːz/", "/ˈɒb.vi.əs/").
- "childExplanation": A vivid, intuitive mental model / analogy written in CLEAR SIMPLE ENGLISH (Explain Like I'm 5 / ELI5) so that anyone can immediately understand the essence of this word without confusing jargon.
- "dailyExamples": Array of 2 realistic daily/casual conversation sentences using this word.

Return ONLY a valid JSON object (no markdown, no backticks, no code blocks):
{
  "correctedWord": "the correct English spelling",
  "isNonEnglish": false,
  "rejectionReason": null,
  "pos": "verb | noun | adjective | adverb",
  "cefr": "A1 | A2 | B1 | B2 | C1 | C2",
  "registerLevel": "casual | semi_formal | formal | written_academic",
  "registerLabel": "Formal Akademik",
  "ieltsSuitability": {
    "status": "both | speaking_only | writing_only | non_ielts",
    "badgeText": "🌐 Writing & Speaking OK",
    "badgeColor": "emerald | sky | purple | amber",
    "description": "Sangat direkomendasikan untuk esai Writing Task 2 dan diskusi Speaking Part 3."
  },
  "highYieldContext": "🔥 High-Yield: Sering dipakai di IELTS Writing Task 2 (Topik: Lingkungan & Sains)",
  "registerTrapAlert": null,
  "meaningId": "Arti bahasa Indonesia yang akurat dan ringkas",
  "meaningEn": "Clear concise English academic definition",
  "indonesianGuide": "Ejaan global dengan KAPITAL STRESS + bedah suku kata asosiasi kata Indonesia",
  "ipa": "/.../",
  "example": "Contoh kalimat bernuansa akademik IELTS",
  "childExplanation": "Simple English analogy (ELI5)",
  "dailyExamples": [
    "Contoh kalimat percakapan sehari-hari 1",
    "Contoh kalimat percakapan sehari-hari 2"
  ],
  "synonyms": ["synonym1", "synonym2", "synonym3"]
}`;
            const userPrompt = `Analyze the word: "${word}"`;

            const response = await callGeminiAPI(userPrompt, systemPrompt);
            if (!response) {
                throw new Error("Tidak menerima respon dari Gemini AI. Pastikan Gemini API Key sudah terhubung.");
            }

            const parsed = extractJsonFromLLM(response);
            if (parsed && (parsed.meaningId || parsed.isNonEnglish || parsed.correctedWord)) {
                return parsed;
            }

            throw new Error("Respon AI tidak dapat diuraikan. Silakan coba lagi.");
        }

        function seedSampleVocabBank() {
            SoundFX.play('click');
            const starterPack = [
                {
                    id: 'vocab_seed_1',
                    word: 'establish',
                    pos: 'verb',
                    cefr: 'B2',
                    registerLevel: 'formal',
                    registerLabel: 'Formal Akademik',
                    ieltsSuitability: {
                        status: 'both',
                        badgeText: '🌐 Writing & Speaking OK',
                        badgeColor: 'emerald',
                        description: 'Sangat direkomendasikan di Writing Task 2 dan Speaking Part 3 untuk menyatakan pembentukan aturan, institusi, atau pembuktian fakta.'
                    },
                    highYieldContext: '🔥 High-Yield: Sering dipakai di Writing Task 2 (Topik: Kebijakan Pemerintah & Regulasi)',
                    registerTrapAlert: null,
                    meaningId: 'Mendirikan, membentuk, atau membuktikan kebenaran suatu hal secara permanen.',
                    meaningEn: 'To set up on a firm or permanent basis; to prove or demonstrate.',
                    indonesianGuide: "es-TAB-lisy ↘ (es: seperti 'es batu', TAB: ditekan kuat / stress, lisy: akhiri desis lembut /sh/)",
                    ipa: '/ɪˈstæb.lɪʃ/',
                    example: 'The government sought to establish new environmental standards.',
                    childExplanation: 'Imagine you build a toy castle with super strong, heavy blocks so the wind can never knock it down. That is "establish" — to build or prove something so firmly that it stays for a long time.',
                    dailyExamples: [
                        'They established a nice friendship during their vacation.',
                        'The doctor established a daily workout routine for him.'
                    ],
                    synonyms: ['found', 'institute', 'demonstrate', 'set up'],
                    dateAdded: Date.now(),
                    srInterval: 1,
                    srNextReview: Date.now(),
                    srReviewCount: 0,
                    feynmanLevel: 0,
                    feynmanStatus: 'unlearned',
                    feynmanLastExplanation: '',
                    feynmanFeedback: null,
                    consecutiveMasteryCount: 0,
                    status: 'learning'
                },
                {
                    id: 'vocab_seed_2',
                    word: 'ubiquitous',
                    pos: 'adjective',
                    cefr: 'C1',
                    registerLevel: 'formal',
                    registerLabel: 'Formal Akademik',
                    ieltsSuitability: {
                        status: 'both',
                        badgeText: '🌐 Writing & Speaking OK',
                        badgeColor: 'emerald',
                        description: 'Wajib dikuasai untuk menggantikan kata klise "everywhere". Cocok di Writing Task 2 dan Speaking Part 3.'
                    },
                    highYieldContext: '🔥 High-Yield: Sering dipakai di IELTS Writing Task 2 (Topik: Teknologi, AI, & Media Sosial)',
                    registerTrapAlert: '⚠️ JEBAKAN REGISTER: Jangan gunakan di percakapan super santai warung kopi (terdengar terlalu puitis/akademik). Gunakan "everywhere".',
                    meaningId: 'Ada di mana-mana pada waktu yang sama; sangat lazim ditemui.',
                    meaningEn: 'Present, appearing, or found everywhere.',
                    indonesianGuide: "yu-BI-kwi-tes ↘ (yu: seperti 'you', BI: ditekan kuat / stress, kwi: seperti 'quick', tes: akhiri vokal santai)",
                    ipa: '/juːˈbɪk.wɪ.təs/',
                    example: 'Smartphones have become ubiquitous in modern society.',
                    childExplanation: 'Imagine fresh air or bright sunshine — no matter where you walk or travel, it is right there around you. That is "ubiquitous" — appearing or found everywhere at the same time.',
                    dailyExamples: [
                        'Coffee shops are ubiquitous in downtown Jakarta.',
                        'Plastic bags are ubiquitous, but we must reduce them.'
                    ],
                    synonyms: ['omnipresent', 'pervasive', 'everywhere', 'universal'],
                    dateAdded: Date.now(),
                    srInterval: 1,
                    srNextReview: Date.now(),
                    srReviewCount: 0,
                    feynmanLevel: 0,
                    feynmanStatus: 'unlearned',
                    feynmanLastExplanation: '',
                    feynmanFeedback: null,
                    consecutiveMasteryCount: 0,
                    status: 'learning'
                },
                {
                    id: 'vocab_seed_3',
                    word: 'mitigate',
                    pos: 'verb',
                    cefr: 'C1',
                    registerLevel: 'formal',
                    registerLabel: 'Formal Akademik',
                    ieltsSuitability: {
                        status: 'both',
                        badgeText: '🌐 Writing & Speaking OK',
                        badgeColor: 'emerald',
                        description: 'Kosa kata emas C1 untuk esai pemecahan masalah (Problem-Solution Essay).'
                    },
                    highYieldContext: '🔥 High-Yield: Esai Task 2 Topik Lingkungan, Perubahan Iklim & Krisis Finansial',
                    registerTrapAlert: null,
                    meaningId: 'Meringankan, meredakan, atau mengurangi keparahan/dampak buruk.',
                    meaningEn: 'Make less severe, serious, or painful.',
                    indonesianGuide: "MI-ti-geit ↘ (MI: ditekan kuat / stress, ti: vokal 'i' pendek tajam, geit: berima 'gate/kaget')",
                    ipa: '/ˈmɪt.ɪ.ɡeɪt/',
                    example: 'Renewable energy projects help mitigate the severe impacts of climate change.',
                    childExplanation: 'Imagine you fall down and scrape your knee, and your mom puts a cool soothing bandage on it so the sting hurts much less. That is "mitigate" — to make a harmful situation less severe.',
                    dailyExamples: [
                        'Drinking plenty of water helped mitigate his headache.',
                        'Wearing a helmet mitigates the risk of head injury.'
                    ],
                    synonyms: ['alleviate', 'reduce', 'diminish', 'lessen'],
                    dateAdded: Date.now(),
                    srInterval: 1,
                    srNextReview: Date.now(),
                    srReviewCount: 0,
                    feynmanLevel: 0,
                    feynmanStatus: 'unlearned',
                    feynmanLastExplanation: '',
                    feynmanFeedback: null,
                    consecutiveMasteryCount: 0,
                    status: 'learning'
                },
                {
                    id: 'vocab_seed_4',
                    word: 'coherent',
                    pos: 'adjective',
                    cefr: 'B2',
                    registerLevel: 'formal',
                    registerLabel: 'Formal Akademik',
                    ieltsSuitability: {
                        status: 'both',
                        badgeText: '🌐 Writing & Speaking OK',
                        badgeColor: 'emerald',
                        description: 'Sangat bagus untuk menjelaskan struktur argumen, ide ilmiah, dan alur penalaran.'
                    },
                    highYieldContext: '🔥 High-Yield: Pembahasan Academic Writing & Critical Thinking',
                    registerTrapAlert: null,
                    meaningId: 'Tersusun secara logis, runtut, dan mudah dipahami dalam esai.',
                    meaningEn: 'Logical, consistent, and clearly articulated.',
                    indonesianGuide: "ko-HI-rent ↘ (ko: 'ko' bulat, HI: ditekan kuat / stress, rent: akhiri 'r' lembut /rent/)",
                    ipa: '/kəʊˈhɪə.rənt/',
                    example: 'Candidates must construct a coherent argument to achieve Band 7+ in Task 2.',
                    childExplanation: 'Imagine a bedtime story told in neat order from start to finish so it makes complete sense, rather than scrambled sentences that confuse everyone. That is "coherent" — clear, logical, and easy to follow.',
                    dailyExamples: [
                        'He was so tired that he could not form a coherent sentence.',
                        'The team presented a coherent strategy for the new project.'
                    ],
                    synonyms: ['logical', 'lucid', 'well-structured', 'rational'],
                    dateAdded: Date.now(),
                    srInterval: 1,
                    srNextReview: Date.now(),
                    srReviewCount: 0,
                    feynmanLevel: 0,
                    feynmanStatus: 'unlearned',
                    feynmanLastExplanation: '',
                    feynmanFeedback: null,
                    consecutiveMasteryCount: 0,
                    status: 'learning'
                },
                {
                    id: 'vocab_seed_5',
                    word: 'substantiate',
                    pos: 'verb',
                    cefr: 'C2',
                    registerLevel: 'written_academic',
                    registerLabel: 'Tulisan Resmi (Written High-Academic)',
                    ieltsSuitability: {
                        status: 'writing_only',
                        badgeText: '📝 Writing Ready (Jarang Lisan)',
                        badgeColor: 'purple',
                        description: 'Sangat disukai penguji di Writing Task 2 untuk menyatakan pembuktian tesis ilmiah. Jarang diucapkan lisan kecuali di seminar/sidang formal.'
                    },
                    highYieldContext: '🔥 High-Yield: Menulis Body Paragraph Task 2 untuk mengaitkan bukti empiris dengan klaim',
                    registerTrapAlert: '⚠️ JEBAKAN REGISTER: Terlalu berat dan kaku untuk Speaking Part 1 / percakapan santai. Gunakan "back up with proof" atau "prove" saat berbicara lisan santai.',
                    meaningId: 'Memperkuat atau membuktikan suatu klaim/pendapat dengan bukti nyata.',
                    meaningEn: 'To provide evidence to support or prove the truth of something.',
                    indonesianGuide: "seb-STAN-syi-yeit ↘ (seb: seperti 'sebab', STAN: ditekan kuat / stress, syi: desis 'sy', yeit: berima 'eight')",
                    ipa: '/səbˈstæn.ʃi.eɪt/',
                    example: 'Writers must substantiate their central thesis with empirical data.',
                    childExplanation: 'Imagine you tell your friends that you have a giant pet robot dinosaur at home; you must bring real photos to school to prove it is true. Providing solid proof to back up your words is "substantiate".',
                    dailyExamples: [
                        'You need receipts to substantiate your travel expenses.',
                        'Can you substantiate your claim with actual numbers?'
                    ],
                    synonyms: ['validate', 'corroborate', 'verify', 'authenticate'],
                    dateAdded: Date.now(),
                    srInterval: 1,
                    srNextReview: Date.now(),
                    srReviewCount: 0,
                    feynmanLevel: 0,
                    feynmanStatus: 'unlearned',
                    feynmanLastExplanation: '',
                    feynmanFeedback: null,
                    consecutiveMasteryCount: 0,
                    status: 'learning'
                }
            ];

            vocabBank = starterPack;
            saveVocabBank();
            showToast("5 Kosakata IELTS Band 8.0 berhasil ditambahkan!", "success");
            SoundFX.play('levelup');
        }

        // =========================================================================
        // IeltsGo v6.0 — VOCAB CARD MASTER MODAL ENGINE
        // =========================================================================
        function openVocabCard(vocabId) {
            SoundFX.play('click');
            const vocab = vocabBank.find(v => v.id === vocabId);
            if (!vocab) return;

            currentActiveVocabId = vocabId;

            // Auto-trigger background enrichment if card still has placeholder text
            if (vocab.meaningId && (vocab.meaningId.includes('Menganalisis') || vocab.meaningId.includes('Fokus perbaikan pelafalan') || (vocab.meaningEn && vocab.meaningEn.includes('Key spoken vocabulary')))) {
                enrichVocabCardInBackground(vocab.id, vocab.word);
            }

            // Populate Card Elements
            document.getElementById('vocab-card-word').innerText = vocab.word;
            document.getElementById('vocab-card-pos').innerText = vocab.pos || '';
            
            const cefrBadge = document.getElementById('vocab-card-cefr');
            if (cefrBadge) {
                cefrBadge.innerText = vocab.cefr;
                cefrBadge.className = `text-[10px] font-mono font-bold px-2 py-0.5 rounded border cefr-${(vocab.cefr || 'b2').toLowerCase()}`;
            }

            // Target Accent Badge in Card
            const targetAccentKey = localStorage.getItem('ielts_target_accent') || 'british_rp';
            const accentBadgeNames = {
                'british_rp': '🇬🇧 Target: British RP',
                'general_american': '🇺🇸 Target: General American',
                'australian': '🇦🇺 Target: Australian',
                'neutral_academic': '🌐 Target: Neutral Academic'
            };
            const accentBadgeEl = document.getElementById('vocab-card-accent-badge');
            if (accentBadgeEl) {
                accentBadgeEl.innerText = accentBadgeNames[targetAccentKey] || '🇬🇧 Target: British RP';
            }

            document.getElementById('vocab-card-ipa').innerText = vocab.ipa || '';
            document.getElementById('vocab-card-meaning-id').innerText = vocab.meaningId || '';
            document.getElementById('vocab-card-meaning-en').innerText = vocab.meaningEn || '';
            document.getElementById('vocab-card-indonesian-guide').innerText = vocab.indonesianGuide || `${vocab.word.toUpperCase()}`;
            document.getElementById('vocab-card-example').innerText = vocab.example || '';

            // ELI5 Child Explanation
            const childEl = document.getElementById('vocab-card-child-explanation');
            if (childEl) {
                childEl.innerText = vocab.childExplanation || `Bayangkan sebuah analogi sederhana untuk ${vocab.word} yang mudah dipahami anak kecil.`;
            }

            // Daily Conversation Examples
            const dailyContainer = document.getElementById('vocab-card-daily-examples');
            if (dailyContainer) {
                if (vocab.dailyExamples && vocab.dailyExamples.length > 0) {
                    dailyContainer.innerHTML = vocab.dailyExamples.map((dex, i) => `
                        <div class="flex items-start gap-2 bg-teal-950/20 p-2 rounded-lg border border-teal-500/20">
                            <span class="text-[10px] font-mono text-teal-400 font-bold mt-0.5">${i+1}.</span>
                            <span class="text-xs text-teal-100">${dex}</span>
                        </div>
                    `).join('');
                } else {
                    dailyContainer.innerHTML = `<div class="text-xs text-slate-400 italic">Contoh percakapan santai sedang disiapkan AI...</div>`;
                }
            }

            // Synonyms
            const synContainer = document.getElementById('vocab-card-synonyms');
            if (synContainer) {
                if (vocab.synonyms && vocab.synonyms.length > 0) {
                    synContainer.innerHTML = vocab.synonyms.map(s => 
                        `<span class="text-xs font-mono bg-slate-950 text-indigo-300 px-2.5 py-1 rounded-lg border border-slate-800">${s}</span>`
                    ).join('');
                } else {
                    synContainer.innerHTML = `<span class="text-xs text-slate-500 font-mono">-</span>`;
                }
            }

            // Feynman Status Badge
            const feynmanBadge = document.getElementById('vocab-feynman-status-badge');
            if (feynmanBadge) {
                const now = Date.now();
                const isMastered = vocab.status === 'mastered' || (vocab.feynmanLevel && vocab.feynmanLevel >= 5);
                const isUnlearned = !isMastered && (!vocab.feynmanLevel || vocab.feynmanLevel === 0);
                const isDue = !isMastered && (vocab.srNextReview || 0) <= now + 3600000;
                const daysLeft = Math.max(1, Math.ceil(((vocab.srNextReview || now) - now) / (1000 * 60 * 60 * 24)));

                if (isMastered) {
                    feynmanBadge.innerHTML = `<span class="text-[10px] bg-amber-950/80 text-amber-300 px-3 py-1 rounded-full border border-amber-500/50 font-mono font-bold"><i class="fa-solid fa-crown mr-1 text-amber-400"></i> 🏆 Bebas Review Selamanya</span>`;
                } else if (isUnlearned) {
                    feynmanBadge.innerHTML = `<span class="text-[10px] bg-rose-950/80 text-rose-300 px-3 py-1 rounded-full border border-rose-500/40 font-mono font-bold animate-pulse"><i class="fa-solid fa-triangle-exclamation mr-1"></i> 🔴 Belum Dipelajari (Feynman Drill Wajib)</span>`;
                } else if (isDue) {
                    feynmanBadge.innerHTML = `<span class="text-[10px] bg-amber-950 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40 font-mono font-bold review-due-pulse"><i class="fa-solid fa-clock-rotate-left mr-1"></i> 🟡 Jatuh Tempo Review Hari Ini</span>`;
                } else {
                    feynmanBadge.innerHTML = `<span class="text-[10px] bg-emerald-950/70 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 font-mono font-bold"><i class="fa-solid fa-circle-check mr-1"></i> 🟢 Dikuasai (Level ${vocab.feynmanLevel || 1}/4) • Review: ${daysLeft} hr lagi</span>`;
                }
            }

            // Populate Feynman inputs & feedback (v8.0)
            const feynmanInput = document.getElementById('input-feynman-explanation');
            if (feynmanInput) {
                feynmanInput.value = vocab.feynmanLastExplanation || '';
            }

            const feynmanSentenceInput = document.getElementById('input-feynman-sentence');
            if (feynmanSentenceInput) {
                feynmanSentenceInput.value = vocab.feynmanLastSentence || '';
            }

            const feedbackBox = document.getElementById('vocab-feynman-feedback-box');
            if (feedbackBox) {
                if (vocab.feynmanFeedback) {
                    feedbackBox.classList.remove('hidden');
                    feedbackBox.innerHTML = renderFeynmanFeedbackCard(vocab.feynmanFeedback, vocab);
                } else {
                    feedbackBox.classList.add('hidden');
                    feedbackBox.innerHTML = '';
                }
            }

            // Reset Fast-Track Box
            const fastTrackBox = document.getElementById('vocab-fasttrack-box');
            if (fastTrackBox) fastTrackBox.classList.add('hidden');
            const fastTrackResult = document.getElementById('vocab-fasttrack-result-box');
            if (fastTrackResult) fastTrackResult.classList.add('hidden');

            // Reset Pronunciation & Deep Eval states
            const deepEvalResult = document.getElementById('vocab-deep-eval-result');
            if (deepEvalResult) {
                deepEvalResult.classList.add('hidden');
                deepEvalResult.innerHTML = '';
            }
            const recTimer = document.getElementById('vocab-rec-timer');
            if (recTimer) recTimer.innerText = '';
            const recStatus = document.getElementById('vocab-rec-status');
            if (recStatus) recStatus.innerText = 'Siap Merekam';
            const btnRecStart = document.getElementById('btn-vocab-rec-start');
            if (btnRecStart) btnRecStart.classList.remove('hidden');
            const btnRecStop = document.getElementById('btn-vocab-rec-stop');
            if (btnRecStop) btnRecStop.classList.add('hidden');
            const audioPreview = document.getElementById('vocab-audio-preview');
            if (audioPreview) {
                audioPreview.classList.add('hidden');
                audioPreview.src = '';
            }

            // Register & IELTS Context Suitability (v7.1)
            const regBadge = document.getElementById('vocab-badge-register');
            const ieltsBadge = document.getElementById('vocab-badge-ielts');
            const regDesc = document.getElementById('vocab-card-register-desc');
            const highYieldBox = document.getElementById('vocab-card-high-yield-box');
            const highYieldText = document.getElementById('vocab-card-high-yield-text');
            const trapBox = document.getElementById('vocab-card-trap-box');
            const trapText = document.getElementById('vocab-card-trap-text');

            const regLabel = vocab.registerLabel || (vocab.registerLevel === 'casual' ? '🔴 Casual / Santai' : (vocab.registerLevel === 'semi_formal' ? '🟡 Agak Formal / Netral' : (vocab.registerLevel === 'written_academic' ? '🟣 Tulisan Resmi (Written)' : '🟢 Formal Akademik')));
            if (regBadge) {
                regBadge.innerText = regLabel;
                if (vocab.registerLevel === 'casual') {
                    regBadge.className = "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40";
                } else if (vocab.registerLevel === 'semi_formal') {
                    regBadge.className = "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/40";
                } else if (vocab.registerLevel === 'written_academic') {
                    regBadge.className = "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40";
                } else {
                    regBadge.className = "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40";
                }
            }

            const ieltsInfo = vocab.ieltsSuitability || {
                status: 'both',
                badgeText: '🌐 Writing & Speaking OK',
                badgeColor: 'emerald',
                description: 'Aman dan direkomendasikan untuk IELTS Writing Task 2 dan Speaking.'
            };

            if (ieltsBadge) {
                ieltsBadge.innerText = ieltsInfo.badgeText || '🌐 Writing & Speaking OK';
                if (ieltsInfo.badgeColor === 'purple' || ieltsInfo.status === 'writing_only') {
                    ieltsBadge.className = "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40";
                } else if (ieltsInfo.badgeColor === 'sky' || ieltsInfo.status === 'speaking_only') {
                    ieltsBadge.className = "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/40";
                } else if (ieltsInfo.badgeColor === 'amber' || ieltsInfo.status === 'non_ielts') {
                    ieltsBadge.className = "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40";
                } else {
                    ieltsBadge.className = "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40";
                }
            }

            if (regDesc) {
                regDesc.innerText = ieltsInfo.description || (vocab.registerLevel === 'casual' ? 'Kata santai/informal — cocok untuk Speaking Part 1 atau obrolan sehari-hari, namun hindari di Writing Task 2.' : 'Kosa kata register formal/akademis yang siap meningkatkan nilai Lexical Resource di IELTS.');
            }

            if (highYieldBox && highYieldText) {
                if (vocab.highYieldContext) {
                    highYieldBox.classList.remove('hidden');
                    highYieldText.innerText = vocab.highYieldContext;
                } else {
                    highYieldBox.classList.add('hidden');
                    highYieldText.innerText = '';
                }
            }

            if (trapBox && trapText) {
                if (vocab.registerTrapAlert) {
                    trapBox.classList.remove('hidden');
                    trapText.innerText = vocab.registerTrapAlert;
                } else {
                    trapBox.classList.add('hidden');
                    trapText.innerText = '';
                }
            }

            // Mastered Button state
            const masteredBtn = document.getElementById('btn-card-mastered');
            if (masteredBtn) {
                if (vocab.status === 'mastered') {
                    masteredBtn.className = "px-4 py-2 bg-amber-950 text-amber-300 font-bold rounded-xl transition-all border border-amber-500/40 flex items-center gap-1.5";
                    masteredBtn.innerHTML = `<i class="fa-solid fa-crown text-amber-400"></i> <span>🏆 Bebas Review</span>`;
                } else {
                    masteredBtn.className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl transition-all border border-cyan-500/30 flex items-center gap-1.5";
                    masteredBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Tandai Sudah Hafal</span>`;
                }
            }

            document.getElementById('modal-vocab-card').classList.remove('hidden');
        }

        function closeVocabCard() {
            document.getElementById('modal-vocab-card').classList.add('hidden');
            stopVocabPronTest(false);
            currentActiveVocabId = null;
        }

        function speakWord(word, lang = 'en-GB') {
            if (!('speechSynthesis' in window)) {
                showToast("Browser Anda tidak mendukung Web Speech TTS.", "error");
                return;
            }
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(word);
            utter.lang = lang;
            utter.rate = 0.9;
            
            // Try to find native voice
            const voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.lang.includes(lang.replace('-', '_')) || v.lang.includes(lang));
            if (voice) utter.voice = voice;

            window.speechSynthesis.speak(utter);
        }

        function speakCurrentVocabWord(lang) {
            const vocab = vocabBank.find(v => v.id === currentActiveVocabId);
            if (vocab) speakWord(vocab.word, lang);
        }

        function markCurrentVocabMastered() {
            const vocab = vocabBank.find(v => v.id === currentActiveVocabId);
            if (!vocab) return;

            if (vocab.status === 'mastered' || (vocab.feynmanLevel && vocab.feynmanLevel >= 5)) {
                vocab.status = 'learning';
                vocab.feynmanStatus = 'learning';
                if (vocab.feynmanLevel && vocab.feynmanLevel >= 5) vocab.feynmanLevel = 3;
                vocab.consecutiveMasteryCount = 0;
                vocab.srInterval = 1;
                vocab.srNextReview = Date.now();
                showToast(`Kata "${vocab.word}" dikembalikan ke daftar belajar.`, "info");
            } else {
                vocab.status = 'mastered';
                vocab.feynmanStatus = 'mastered';
                vocab.feynmanLevel = 5;
                vocab.srInterval = 999;
                vocab.srNextReview = Date.now() + (999 * 86400000);
                addXP(25);
                SoundFX.play('levelup');
                triggerConfetti();
                showToast(`Hebat! Kata "${vocab.word}" ditandai Bebas Review Selamanya (+25 XP)!`, "success");
            }
            saveVocabBank();
            openVocabCard(vocab.id);
            renderVocabBank();
        }

        function deleteCurrentVocabWord() {
            if (!currentActiveVocabId) return;
            const idx = vocabBank.findIndex(v => v.id === currentActiveVocabId);
            if (idx !== -1) {
                const word = vocabBank[idx].word;
                vocabBank.splice(idx, 1);
                saveVocabBank();
                closeVocabCard();
                renderVocabBank();
                SoundFX.play('error');
                showToast(`Kata "${word}" telah dihapus.`, "info");
            }
        }

        async function reanalyzeCurrentVocabWord() {
            const vocab = vocabBank.find(v => v.id === currentActiveVocabId);
            if (!vocab) return;
            const btn = document.getElementById('btn-reanalyze-vocab');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Mendiagnosa...`;
            }
            try {
                const analysis = await analyzeVocabWithAI(vocab.word);
                if (analysis.isNonEnglish) {
                    showToast(analysis.rejectionReason || `"${vocab.word}" bukan kata bahasa Inggris.`, "error");
                    return;
                }
                vocab.pos = analysis.pos || vocab.pos;
                vocab.cefr = analysis.cefr || vocab.cefr;
                vocab.registerLevel = analysis.registerLevel || vocab.registerLevel || 'formal';
                vocab.registerLabel = analysis.registerLabel || vocab.registerLabel || 'Formal Akademik';
                vocab.ieltsSuitability = analysis.ieltsSuitability || vocab.ieltsSuitability;
                vocab.highYieldContext = analysis.highYieldContext !== undefined ? analysis.highYieldContext : vocab.highYieldContext;
                vocab.registerTrapAlert = analysis.registerTrapAlert !== undefined ? analysis.registerTrapAlert : vocab.registerTrapAlert;
                vocab.meaningId = analysis.meaningId || vocab.meaningId;
                vocab.meaningEn = analysis.meaningEn || vocab.meaningEn;
                vocab.indonesianGuide = analysis.indonesianGuide || vocab.indonesianGuide;
                vocab.example = analysis.example || vocab.example;
                vocab.synonyms = analysis.synonyms || vocab.synonyms;
                vocab.ipa = analysis.ipa || vocab.ipa;
                saveVocabBank();
                openVocabCard(vocab.id);
                showToast(`Kata "${vocab.word}" berhasil diperbarui dengan analisis AI baru!`, "success");
                SoundFX.play('correct');
            } catch(err) {
                showToast("Gagal menganalisis ulang: " + err.message, "error");
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Re-analisis AI`;
                }
            }
        }

        // =========================================================================
        // IeltsGo v6.3.3 — DIRECT GEMINI AI AUDIO PHONETIC & PRONUNCIATION COACH (100% BAHASA INDONESIA)
        // =========================================================================
        let vocabPronRecTimerInterval = null;
        let vocabPronRecDuration = 0;

        async function startVocabPronTest() {
            const vocab = vocabBank.find(v => v.id === currentActiveVocabId);
            if (!vocab) return;

            SoundFX.play('click');
            vocabAudioChunks = [];
            vocabAudioBlob = null;
            vocabPronRecDuration = 0;

            const btnStart = document.getElementById('btn-vocab-rec-start');
            const btnStop = document.getElementById('btn-vocab-rec-stop');
            const recStatus = document.getElementById('vocab-rec-status');
            const recTimer = document.getElementById('vocab-rec-timer');
            const audioPreview = document.getElementById('vocab-audio-preview');
            const deepEvalResult = document.getElementById('vocab-deep-eval-result');

            if (btnStart) btnStart.classList.add('hidden');
            if (btnStop) btnStop.classList.remove('hidden');
            if (recStatus) recStatus.innerHTML = '<span class="text-rose-400 font-bold animate-pulse"><i class="fa-solid fa-circle-dot mr-1"></i> Merekam suara... Ucapkan kata sekarang</span>';
            if (audioPreview) audioPreview.classList.add('hidden');
            if (deepEvalResult) {
                deepEvalResult.classList.add('hidden');
                deepEvalResult.innerHTML = '';
            }

            // Start timer
            if (recTimer) recTimer.innerText = '00:00';
            if (vocabPronRecTimerInterval) clearInterval(vocabPronRecTimerInterval);
            vocabPronRecTimerInterval = setInterval(() => {
                vocabPronRecDuration++;
                const mins = String(Math.floor(vocabPronRecDuration / 60)).padStart(2, '0');
                const secs = String(vocabPronRecDuration % 60).padStart(2, '0');
                if (recTimer) recTimer.innerText = `${mins}:${secs}`;
            }, 1000);

            // Audio Capture via MediaStream
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                vocabRecMediaRecorder = new MediaRecorder(stream);
                vocabRecMediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) vocabAudioChunks.push(e.data);
                };
                vocabRecMediaRecorder.onstop = () => {
                    vocabAudioBlob = new Blob(vocabAudioChunks, { type: 'audio/webm' });
                    stream.getTracks().forEach(t => t.stop());

                    if (audioPreview) {
                        const audioUrl = URL.createObjectURL(vocabAudioBlob);
                        audioPreview.src = audioUrl;
                        audioPreview.classList.remove('hidden');
                    }

                    // Auto-trigger Direct Gemini AI Analysis if allowed
                    if (vocabRecMediaRecorder && vocabRecMediaRecorder._triggerAI !== false) {
                        submitVocabDeepEval();
                    }
                };
                vocabRecMediaRecorder._triggerAI = true;
                vocabRecMediaRecorder.start();
            } catch (err) {
                console.warn("MediaRecorder mic access error:", err);
                showToast("Akses mikrofon ditolak atau tidak tersedia.", "error");
                stopVocabPronTest(false);
            }
        }

        function stopVocabPronTest(triggerAI = true) {
            const btnStart = document.getElementById('btn-vocab-rec-start');
            const btnStop = document.getElementById('btn-vocab-rec-stop');
            const recStatus = document.getElementById('vocab-rec-status');

            if (vocabPronRecTimerInterval) {
                clearInterval(vocabPronRecTimerInterval);
                vocabPronRecTimerInterval = null;
            }

            if (btnStart) btnStart.classList.remove('hidden');
            if (btnStop) btnStop.classList.add('hidden');
            if (recStatus) recStatus.innerText = 'Selesai merekam';

            if (vocabRecMediaRecorder) {
                vocabRecMediaRecorder._triggerAI = triggerAI;
                if (vocabRecMediaRecorder.state === 'recording') {
                    vocabRecMediaRecorder.stop();
                }
            }
        }

        async function submitVocabDeepEval() {
            const vocab = vocabBank.find(v => v.id === currentActiveVocabId);
            if (!vocab) return;

            const resultBox = document.getElementById('vocab-deep-eval-result');
            const recStatus = document.getElementById('vocab-rec-status');

            if (!vocabAudioBlob) {
                showToast("Silakan rekam suara Anda terlebih dahulu.", "error");
                return;
            }

            if (recStatus) recStatus.innerHTML = '<span class="text-indigo-400 font-bold"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Menganalisis Pelafalan dengan AI...</span>';
            if (resultBox) {
                resultBox.classList.remove('hidden');
                resultBox.innerHTML = `
                    <div class="py-4 text-center text-indigo-400 font-mono text-xs space-y-2">
                        <i class="fa-solid fa-headphones-simple text-2xl animate-bounce text-indigo-400"></i>
                        <div class="font-bold text-slate-200">Gemini AI sedang mendengarkan artikulasi dan frekuensi fonem Anda...</div>
                        <div class="text-[11px] text-slate-400">Mendiagnosis presisi fonem, penekanan suku kata (*syllable stress*), dan posisi lidah...</div>
                    </div>
                `;
            }

            const targetAccent = localStorage.getItem('ielts_target_accent') || 'british_rp';

            const systemPrompt = `Anda adalah Pelatih Fonetik yang AKURAT dan JUJUR terhadap keterbatasan diri sendiri.
Prioritas utama Anda: KEJUJURAN & AKURASI, bukan kesan "tegas" atau "expert".
Lebih baik terdengar sederhana tapi benar, daripada detail tapi mengarang.

Tugas: menilai pelafalan SATU KATA TARGET: "${vocab.word}"

Data Kata Target:
- Kata: "${vocab.word}"
- Transkripsi IPA Resmi: ${vocab.ipa || '-'}
- Panduan Pelafalan Indonesia: ${vocab.indonesianGuide || '-'}
- Target Aksen: ${targetAccent}

============================================
🚨 ATURAN #1 — CEK KUALITAS AUDIO DULU
============================================
Jika audio hening, noise dominan, atau terlalu lemah untuk didengar jelas:
- Skor: 0%
- Tulis: "[Audio tidak terdeteksi jelas. Coba rekam lebih dekat ke mikrofon.]"
- STOP, jangan lanjut ke section lain.

============================================
🚨 ATURAN #2 — BATASAN KEMAMPUAN ANDA (WAJIB DIPATUHI)
============================================
Anda TIDAK memiliki kemampuan mengukur sinyal akustik secara literal
(formant, spektrogram, frekuensi getar pita suara). Anda menilai berdasarkan
pola bunyi yang terdengar secara umum, bukan pengukuran presisi.

Karena itu:
- Skor Anda adalah ESTIMASI KASAR, bukan pengukuran ilmiah presisi.
- BULATKAN skor ke kelipatan 5 (contoh: 55%, 70%, 85% — BUKAN 73% atau 84%).
  Ini penting supaya skor tidak terkesan presisi palsu.
- GUNAKAN SKALA INI SECARA KONSISTEN setiap kali menilai (supaya skor bisa
  dibandingkan antar rekaman dari waktu ke waktu):
  * 90-100%: Tidak ada kesalahan yang terdengar. Setara penutur mahir.
  * 75-89%: Bisa dipahami dengan sangat jelas. Ada 1-2 detail kecil
    (stress/vokal minor) yang bisa dihaluskan, tapi TIDAK mengganggu
    pemahaman sama sekali.
  * 55-74%: Kata masih bisa dikenali/dipahami, tapi ada kesalahan yang
    cukup jelas terdengar (stress salah, konsonan hilang, vokal meleset)
    yang membuatnya terdengar "asing"/tidak natural.
  * 30-54%: Kata sulit dikenali tanpa konteks. Ada kesalahan signifikan
    (misal suku kata hilang, urutan bunyi berantakan).
  * 0-29%: Kata nyaris tidak bisa dikenali sebagai kata target, atau
    audio tidak jelas.
  Gunakan deskripsi ini sebagai JANGKAR, bukan aturan matematis kaku —
  tetap nilai berdasarkan apa yang benar-benar terdengar.
- JANGAN memberi "Prediksi Band IELTS" dari satu kata. Band speaking IELTS
  dinilai dari performa bicara panjang, bukan dari 1 kata terisolasi.
  Jika diminta, katakan ini tidak valid dinilai dari 1 kata saja.
- Jika Anda tidak yakin terhadap detail tertentu (misal transisi antar-fonem
  yang halus), katakan "kurang terdengar jelas di rekaman ini" — JANGAN
  mengarang deskripsi teknis presisi yang sebenarnya tidak bisa Anda pastikan.

============================================
🚨 ATURAN #3 — PANJANG OUTPUT MENGIKUTI SKOR (3 TINGKAT)
============================================
Sesuaikan panjang output dengan tingkat masalah yang BENAR-BENAR ada:
- Jika skor 90-100% (lihat skala di Aturan #2): pujian singkat + skor.
  Tidak perlu section "Yang Perlu Diperbaiki" — memang sudah tidak ada
  kesalahan nyata yang terdengar.
- Jika skor 75-89%: pelafalan sudah SANGAT BAIK dan mudah dipahami, TAPI
  tetap tampilkan 1 catatan HALUS di bagian "Yang Perlu Disempurnakan"
  (bukan "Yang Perlu Diperbaiki" — beda nada, karena ini bukan kesalahan
  besar, cuma polesan terakhir menuju sempurna). Jelaskan detail spesifik
  apa yang membedakan ini dari skor 90-100%, supaya pelajar tahu target
  konkret untuk naik level, bukan cuma "sudah bagus, lanjut".
- Jika skor <75%: TAMPILKAN SEMUA masalah yang
  benar-benar terdengar, tapi URUTKAN berdasarkan PRIORITAS —
  dari yang PALING mempengaruhi kejelasan/pemahaman pendengar,
  ke yang paling minor.
  - JANGAN daftar masalah kosmetik/sepele yang hampir tidak berpengaruh
    hanya supaya listnya panjang.
  - Beri label tingkat kepentingan tiap poin (Prioritas 1, 2, 3, dst)
    supaya pelajar tahu mana yang harus dibenahi DULUAN, tapi tetap
    tahu apa saja yang menyusul.
  - Maksimal 3 poin. Jika ada lebih dari 3 masalah kecil, gabungkan
    yang paling mirip atau buang yang paling tidak signifikan.

============================================
FORMAT OUTPUT (Markdown, Bahasa Indonesia)
============================================

### Skor
**[Skor dibulatkan ke kelipatan 5]%** — [1 kalimat pendek: apa artinya skor ini]

### Yang Perlu Disempurnakan (hanya jika skor 75-89%)
[1 catatan halus dan spesifik: detail apa yang menahan skor ini dari 90-100%.
Nada ringan/apresiatif, bukan seperti mengoreksi kesalahan besar.]

### Yang Perlu Diperbaiki (hanya jika skor <75%)
Urutkan dari paling penting. Maksimal 3 poin.

1. **[Prioritas 1 — masalah paling mempengaruhi kejelasan]**
   [1-2 kalimat: apa masalahnya + kenapa ini terjadi, bahasa sederhana]

2. **[Prioritas 2 — jika ada]**
   [1-2 kalimat]

3. **[Prioritas 3 — jika ada, dan hanya jika benar-benar signifikan]**
   [1-2 kalimat]

### Cara Membaca
**IPA Resmi**: \`${vocab.ipa || '-'}\` — [sebutkan bunyi kunci yang perlu diperhatikan, misal konsonan/vokal yang sering salah]

**Padanan Kata Inggris Simpel** (kata umum yang pasti sudah familiar):
Untuk tiap bunyi kunci yang penting/sering salah, sebutkan 1 kata Inggris
SANGAT UMUM yang punya bunyi sama persis di bagian itu.
Contoh: "Bunyi 'i' pendek di suku kata pertama sama seperti di kata 'it' atau
'sit' — bukan seperti 'ee' di 'eat'."
- HANYA pakai kata yang benar-benar umum dan pasti dikenal (get, see, it, so,
  cat, book, run, dll) — jangan pakai kata jarang/sulit sebagai pembanding.
- Ini prioritaskan untuk bunyi yang TIDAK punya padanan bagus di Bahasa
  Indonesia (misal vokal pendek/panjang Inggris yang tidak dibedakan
  dalam Bahasa Indonesia).

**Versi Lidah Indonesia** (huruf A-Z, tanpa simbol IPA):
**[Transliterasi dengan CAPS untuk suku kata bertekanan]**
Contoh: es-TAB-lish (bukan ES-tab-lish)
[Jika ada bunyi yang tidak ada padanan persis di Bahasa Indonesia, JANGAN
memaksakan kesamaan yang sebenarnya tidak identik — cukup rujuk ke bagian
"Padanan Kata Inggris Simpel" di atas untuk bunyi itu]

### Latihan
\`[Ucapkan 3x]: [kata]-[kata]-[kata]\`

============================================
CATATAN INTERNAL (jangan tampilkan ke user)
============================================
Ingat: tujuan sistem ini membantu belajar, bukan mengesankan pengguna dengan
detail teknis. Skor yang jujur + masalah yang di-rank jelas > skor presisi
palsu + daftar panjang cacat yang mengarang detail dan flat tanpa prioritas.`;

            try {
                const userQuery = `Dengarkan rekaman audio saya saat mengucapkan kata "${vocab.word}". Berikan evaluasi fonetik yang akurat dan jujur, skor kelipatan 5, hal yang perlu disempurnakan/diperbaiki berdasarkan prioritas, dan padanan kata Inggris simpel sesuai instruksi.`;
                const response = await callGeminiAPI(userQuery, systemPrompt, vocabAudioBlob);

                if (resultBox) {
                    resultBox.innerHTML = renderVocabPronEvalCard(response || "Evaluasi selesai.", vocab, targetAccent);
                }
                if (recStatus) recStatus.innerHTML = '<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check mr-1"></i> Analisis Fonetik Selesai</span>';
                SoundFX.play('correct');
                addXP(15);
            } catch (err) {
                if (resultBox) {
                    resultBox.innerHTML = `<div class="text-red-400 text-xs font-mono p-3 bg-red-950/40 rounded-xl border border-red-500/30">Gagal melakukan evaluasi AI: ${err.message}. Pastikan Gemini API Key sudah terpasang.</div>`;
                }
                if (recStatus) recStatus.innerText = 'Selesai merekam';
            }
        }

        // =========================================================================
        // IeltsGo v7.2 — DEDICATED HIGH-END VOCAB PRONUNCIATION EVAL CARD RENDERER
        // =========================================================================
        let vocabDrillState = { 1: false, 2: false, 3: false };

        function renderVocabPronEvalCard(response, vocab, targetAccent) {
            if (!response) return '<div class="text-xs text-slate-400 font-mono">Tidak ada respon dari AI.</div>';

            const raw = response.trim();
            const accentLang = (targetAccent === 'general_american') ? 'en-US' : ((targetAccent === 'australian') ? 'en-AU' : 'en-GB');
            vocabDrillState = { 1: false, 2: false, 3: false };

            // 1. Check for audio failure / inaudible
            if (raw.includes('[Audio tidak terdeteksi') || raw.includes('Audio tidak terdeteksi') || raw.includes('volume mikrofon terlalu rendah') || raw.includes('terlalu lemah untuk didengar')) {
                return `
                    <div class="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 space-y-3 shadow-lg">
                        <div class="flex items-center gap-2 text-rose-400 font-bold font-mono text-xs">
                            <i class="fa-solid fa-triangle-exclamation text-base animate-bounce"></i>
                            <span>AUDIO TIDAK TERDETEKSI / TERLALU LEMAH</span>
                        </div>
                        <p class="text-xs text-rose-200 leading-relaxed font-sans">
                            Suara rekaman Anda hening, terlalu pelan, atau tertutup derau bising mikrofon. Sistem tidak dapat mendiagnosis artikulasi tanpa sinyal suara yang jelas.
                        </p>
                        <div class="pt-1">
                            <button onclick="startVocabPronTest()" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2">
                                <i class="fa-solid fa-microphone"></i>
                                <span>Coba Rekam Ulang Lebih Dekat</span>
                            </button>
                        </div>
                    </div>
                `;
            }

            // 2. Extract Score & Summary
            let score = 70;
            const scoreMatch = raw.match(/\*\*(\d+)%\*\*/i) || raw.match(/(\d+)%/);
            if (scoreMatch) {
                score = parseInt(scoreMatch[1], 10);
            }

            // Extract Score Summary Sentence
            let scoreSummary = "Pelafalan telah didiagnosis oleh AI.";
            const scoreLineMatch = raw.match(/###\s*Skor[\s\S]*?\n\*\*.*?\*\*[\s—\-]*(.*?)(?=\n###|\n\n|$)/i);
            if (scoreLineMatch && scoreLineMatch[1] && scoreLineMatch[1].trim()) {
                scoreSummary = scoreLineMatch[1].replace(/^[—\-\:\s]+/, '').trim();
            }

            // Score Color Theme & Tier Badge
            let tierBadge = '';
            let themeBorder = 'border-indigo-500/30';
            let themeBg = 'from-slate-900 to-slate-950';
            let scoreTextCol = 'text-indigo-400';
            let progressCol = 'bg-indigo-500';

            if (score >= 90) {
                tierBadge = `<span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"><i class="fa-solid fa-crown text-emerald-400"></i> 🏆 Mahir (Native-like)</span>`;
                themeBorder = 'border-emerald-500/50';
                themeBg = 'from-emerald-950/30 via-slate-900 to-slate-950';
                scoreTextCol = 'text-emerald-400';
                progressCol = 'bg-emerald-500';
            } else if (score >= 75) {
                tierBadge = `<span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/40 flex items-center gap-1"><i class="fa-solid fa-sparkles text-sky-400"></i> ✨ Sangat Baik (Perlu Polesan)</span>`;
                themeBorder = 'border-sky-500/50';
                themeBg = 'from-sky-950/30 via-slate-900 to-slate-950';
                scoreTextCol = 'text-sky-400';
                progressCol = 'bg-sky-500';
            } else if (score >= 55) {
                tierBadge = `<span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center gap-1"><i class="fa-solid fa-triangle-exclamation text-amber-400"></i> ⚠️ Cukup Jelas (Ada Cacat Fonem)</span>`;
                themeBorder = 'border-amber-500/50';
                themeBg = 'from-amber-950/30 via-slate-900 to-slate-950';
                scoreTextCol = 'text-amber-400';
                progressCol = 'bg-amber-500';
            } else {
                tierBadge = `<span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center gap-1"><i class="fa-solid fa-circle-xmark text-rose-400"></i> 🚨 Sulit Dikenali (Drill Ulang)</span>`;
                themeBorder = 'border-rose-500/50';
                themeBg = 'from-rose-950/30 via-slate-900 to-slate-950';
                scoreTextCol = 'text-rose-400';
                progressCol = 'bg-rose-500';
            }

            // 3. Extract "Yang Perlu Disempurnakan" (75-89%) or "Yang Perlu Diperbaiki" (<75%)
            let polishHtml = '';
            const polishMatch = raw.match(/###\s*Yang Perlu Disempurnakan([\s\S]*?)(?=###|$)/i);
            if (polishMatch && polishMatch[1] && polishMatch[1].trim() && !polishMatch[1].includes('skip') && !polishMatch[1].includes('hanya jika')) {
                const polishText = polishMatch[1].trim().replace(/^\s*[\-\*]\s*/gim, '');
                if (polishText) {
                    polishHtml = `
                        <div class="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-1.5 shadow-sm">
                            <div class="text-[11px] font-mono font-bold text-sky-400 uppercase flex items-center gap-1.5">
                                <i class="fa-solid fa-wand-magic-sparkles"></i> Polesan Akhir Menuju Skor 90%+:
                            </div>
                            <div class="text-xs text-sky-100 font-sans leading-relaxed pl-1">
                                ${renderMiniChatMarkdown(polishText)}
                            </div>
                        </div>
                    `;
                }
            }

            let issuesHtml = '';
            const fixMatch = raw.match(/###\s*Yang Perlu Diperbaiki([\s\S]*?)(?=###|$)/i);
            if (fixMatch && fixMatch[1] && fixMatch[1].trim() && !fixMatch[1].includes('skip') && !fixMatch[1].includes('hanya jika')) {
                const fixText = fixMatch[1].trim();
                // Split by numbered items: 1., 2., 3.
                const items = fixText.split(/\n(?=\d+\.\s+)/);
                if (items && items.length > 0) {
                    const parsedItems = items.map(item => {
                        const cleanItem = item.trim();
                        if (!cleanItem || cleanItem.includes('hanya jika')) return '';
                        
                        // Extract Title and Content
                        const titleMatch = cleanItem.match(/^\d+\.\s*\**\[?(Prioritas\s*\d+[^\]\n\*]*)\]?\**\s*([\s\S]*)/i);
                        let pLabel = 'Prioritas Perbaikan';
                        let pContent = cleanItem;
                        let pBadgeColor = 'bg-amber-950 text-amber-300 border-amber-500/40';

                        if (titleMatch) {
                            pLabel = titleMatch[1].replace(/[\*\[\]]/g, '').trim();
                            pContent = titleMatch[2].trim();
                        }

                        if (pLabel.includes('Prioritas 1') || pLabel.includes('1')) {
                            pBadgeColor = 'bg-rose-950/90 text-rose-300 border-rose-500/50';
                        } else if (pLabel.includes('Prioritas 2') || pLabel.includes('2')) {
                            pBadgeColor = 'bg-amber-950/90 text-amber-300 border-amber-500/50';
                        } else {
                            pBadgeColor = 'bg-blue-950/90 text-blue-300 border-blue-500/50';
                        }

                        return `
                            <div class="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 shadow-sm">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${pBadgeColor}">
                                        <i class="fa-solid fa-bullseye mr-1"></i> ${pLabel}
                                    </span>
                                </div>
                                <div class="text-xs text-slate-200 font-sans leading-relaxed pt-0.5">
                                    ${renderMiniChatMarkdown(pContent)}
                                </div>
                            </div>
                        `;
                    }).filter(Boolean).join('');

                    if (parsedItems) {
                        issuesHtml = `
                            <div class="space-y-2">
                                <div class="text-[11px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                                    <i class="fa-solid fa-list-check"></i> Daftar Prioritas Perbaikan:
                                </div>
                                <div class="space-y-2">
                                    ${parsedItems}
                                </div>
                            </div>
                        `;
                    }
                }
            }

            // 4. Extract "Cara Membaca" Section Details
            let ipaText = vocab.ipa || '';
            let anchorWordsHtml = '';
            let indonesianGuideText = vocab.indonesianGuide || '';

            const caraMembacaMatch = raw.match(/###\s*Cara Membaca([\s\S]*?)(?=###|$)/i);
            if (caraMembacaMatch && caraMembacaMatch[1]) {
                const cmSection = caraMembacaMatch[1];
                
                // Extract IPA line
                const ipaLineMatch = cmSection.match(/\*\*IPA\s*Resmi\*\*\s*:\s*`?([^`\n]+)`?/i);
                if (ipaLineMatch && ipaLineMatch[1]) {
                    ipaText = ipaLineMatch[1].trim();
                }

                // Extract Indonesian Transliteration
                const indoMatch = cmSection.match(/\*\*Versi Lidah Indonesia\*\*[\s\S]*?:\s*\n*([\s\S]*?)(?=\n\n|\n###|$)/i);
                if (indoMatch && indoMatch[1]) {
                    indonesianGuideText = indoMatch[1].trim();
                }

                // Extract Anchor Words list
                const anchorMatch = cmSection.match(/\*\*Padanan Kata Inggris Simpel\*\*[\s\S]*?:\s*\n*([\s\S]*?)(?=\*\*Versi|\n###|$)/i);
                if (anchorMatch && anchorMatch[1]) {
                    const rawAnchorLines = anchorMatch[1].trim().split('\n').map(l => l.trim()).filter(Boolean);
                    const parsedAnchorPills = rawAnchorLines.map(line => {
                        let cleanLine = line.replace(/^[\-\*\o\•\d\.]+\s*/, '').trim();
                        if (!cleanLine || cleanLine.includes('HANYA pakai') || cleanLine.includes('Ini prioritaskan')) return '';

                        // Step 1: Replace anchor words in **word** with temporary chip tokens
                        cleanLine = cleanLine.replace(/\*\*([a-zA-Z]{2,})\*\*/g, (m, word) => `###CHIP_${word}###`);
                        
                        // Step 2: Also identify english words after 'kata' in quotes e.g. kata 'it' or kata "fast"
                        cleanLine = cleanLine.replace(/(kata\s+['"])([a-zA-Z]{2,})(['"])/gi, (m, p1, word, p3) => `kata ###CHIP_${word}###`);

                        // Step 3: Render remaining markdown bold & italics cleanly
                        cleanLine = cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100 font-bold">$1</strong>');
                        cleanLine = cleanLine.replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>');

                        // Step 4: Replace tokens with styled inline button chips
                        cleanLine = cleanLine.replace(/###CHIP_([a-zA-Z]{2,})###/g, (m, word) => {
                            return `<button onclick="speakWord('${word}', '${accentLang}')" class="px-2 py-0.5 mx-0.5 rounded-md bg-indigo-900 hover:bg-indigo-700 text-indigo-100 border border-indigo-400/50 text-[11px] font-mono font-bold inline-flex items-center gap-1 align-middle transition-transform active:scale-95 shadow-sm" title="Dengarkan kata '${word}'"><i class="fa-solid fa-volume-high text-[9px] text-indigo-300"></i><span>${word}</span></button>`;
                        });

                        return `
                            <div class="flex items-start gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                                <i class="fa-solid fa-circle-check text-cyan-400 mt-1 text-[10px]"></i>
                                <div class="flex-1">${cleanLine}</div>
                            </div>
                        `;
                    }).filter(Boolean).join('');

                    if (parsedAnchorPills) {
                        anchorWordsHtml = `
                            <div class="space-y-1.5 pt-1">
                                <div class="text-[11px] font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                                    <i class="fa-solid fa-anchor"></i> Padanan Kata Inggris Simpel (Klik Chip untuk Dengar):
                                </div>
                                <div class="space-y-1.5">
                                    ${parsedAnchorPills}
                                </div>
                            </div>
                        `;
                    }
                }
            }

            // Parse Indonesian Guide main word vs notes
            let mainIndoSpelling = indonesianGuideText;
            let mainIndoNote = '';
            const noteMatch = indonesianGuideText.match(/[\*\s]*\((?:Catatan:\s*)?(.*?)\)[\*\s]*/i);
            if (noteMatch) {
                mainIndoNote = noteMatch[1].replace(/[\*\[\]]/g, '').trim();
                mainIndoSpelling = indonesianGuideText.replace(noteMatch[0], '').replace(/[\*\[\]]/g, '').trim();
            } else {
                mainIndoSpelling = indonesianGuideText.replace(/[\*\[\]]/g, '').trim();
            }

            // 5. Interactive 3x Drill Tracker & Action Bar
            const targetWordClean = vocab.word.toLowerCase().trim();

            return `
                <div class="space-y-3.5 pt-1">
                    <!-- 1. Hero Score & Progress Card -->
                    <div class="p-4 rounded-2xl bg-gradient-to-r ${themeBg} border ${themeBorder} space-y-3 shadow-lg">
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <div class="flex items-center gap-3">
                                <div class="text-3xl font-mono font-black ${scoreTextCol} tracking-tight">
                                    ${score}%
                                </div>
                                <div class="space-y-0.5">
                                    ${tierBadge}
                                    <div class="text-[10px] font-mono text-slate-400">Target Aksen: <span class="text-slate-300 font-bold">${targetAccent.toUpperCase()}</span></div>
                                </div>
                            </div>
                            <button onclick="speakWord('${targetWordClean}', '${accentLang}')" class="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm" title="Dengarkan Pelafalan Standar">
                                <i class="fa-solid fa-volume-high text-indigo-400"></i>
                                <span>Dengarkan Native</span>
                            </button>
                        </div>

                        <!-- Progress Bar Meter -->
                        <div class="space-y-1">
                            <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                                <div class="${progressCol} h-2 rounded-full transition-all duration-700" style="width: ${Math.max(5, score)}%"></div>
                            </div>
                        </div>

                        <!-- Summary Feedback Text -->
                        <p class="text-xs text-slate-200 font-sans leading-relaxed border-t border-slate-800/80 pt-2.5">
                            ${scoreSummary}
                        </p>
                    </div>

                    <!-- 2. Polish or Error Prioritization Section -->
                    ${polishHtml}
                    ${issuesHtml}

                    <!-- 3. Phonetic Blueprint & Indonesian Tongue Guide -->
                    <div class="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3 shadow-md">
                        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2">
                            <div class="text-[11px] font-mono font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                                <i class="fa-solid fa-book-open"></i> Panduan Cara Membaca Akurat:
                            </div>
                            <span class="text-[11px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-bold">IPA: ${ipaText || '-'}</span>
                        </div>

                        <!-- Hero Indonesian Tongue Transliteration Box -->
                        <div class="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/50 space-y-1.5 shadow-sm">
                            <div class="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                                <i class="fa-solid fa-bullhorn text-[9px]"></i> Ejaan Lidah Indonesia (Huruf KAPITAL = Ditekan Kuat / Stress):
                            </div>
                            <div class="text-sm text-amber-200 font-mono font-black tracking-wide pl-0.5">
                                ${mainIndoSpelling || targetWordClean.toUpperCase()}
                            </div>
                            ${mainIndoNote ? `
                                <div class="text-[11px] text-amber-300/90 font-sans flex items-start gap-1.5 pt-1.5 border-t border-amber-500/20 leading-relaxed">
                                    <i class="fa-solid fa-lightbulb text-amber-400 mt-0.5 text-[10px]"></i>
                                    <span>${mainIndoNote}</span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Clickable Anchor Words -->
                        ${anchorWordsHtml}
                    </div>

                    <!-- 4. Interactive 3x Repetition Drill Tracker & Quick Action Bar -->
                    <div class="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-3 shadow-md" id="vocab-interactive-drill-card">
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <div class="text-[11px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                                <i class="fa-solid fa-repeat"></i> Drill Otot Lidah (Target Ucapkan 3x):
                            </div>
                            <span id="drill-progress-label" class="text-[10px] font-mono text-slate-400 font-bold">0 / 3 Selesai</span>
                        </div>
                        <p class="text-[11px] text-slate-300 font-sans">
                            Klik tiap tombol setelah melafalkan kata ini dengan benar:
                        </p>

                        <!-- 3 Interactive Repetition Buttons -->
                        <div class="grid grid-cols-3 gap-2 font-mono text-[11px] sm:text-xs" id="drill-buttons-container">
                            <button onclick="toggleVocabDrillStep(1, '${targetWordClean}')" id="btn-drill-step-1" class="py-2.5 px-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 overflow-hidden">
                                <i class="fa-regular fa-circle text-slate-500 text-[10px] shrink-0"></i>
                                <span class="truncate">1. ${targetWordClean}</span>
                            </button>
                            <button onclick="toggleVocabDrillStep(2, '${targetWordClean}')" id="btn-drill-step-2" class="py-2.5 px-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 overflow-hidden">
                                <i class="fa-regular fa-circle text-slate-500 text-[10px] shrink-0"></i>
                                <span class="truncate">2. ${targetWordClean}</span>
                            </button>
                            <button onclick="toggleVocabDrillStep(3, '${targetWordClean}')" id="btn-drill-step-3" class="py-2.5 px-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 overflow-hidden">
                                <i class="fa-regular fa-circle text-slate-500 text-[10px] shrink-0"></i>
                                <span class="truncate">3. ${targetWordClean}</span>
                            </button>
                        </div>

                        <!-- Fast Retry & Native Audio Action Bar -->
                        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                            <button onclick="speakWord('${targetWordClean}', '${accentLang}')" class="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
                                <i class="fa-solid fa-volume-high"></i>
                                <span>Dengarkan Lagi</span>
                            </button>
                            <button onclick="startVocabPronTest()" class="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-90 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5">
                                <i class="fa-solid fa-microphone"></i>
                                <span>🎙️ Rekam Uji Ulang (+15 XP)</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function toggleVocabDrillStep(stepNum, word) {
            vocabDrillState[stepNum] = !vocabDrillState[stepNum];
            const btn = document.getElementById(`btn-drill-step-${stepNum}`);
            if (btn) {
                if (vocabDrillState[stepNum]) {
                    btn.className = "py-2.5 px-2 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 overflow-hidden";
                    btn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400 text-xs shrink-0"></i> <span class="truncate">✓ ${word}</span>`;
                    SoundFX.play('correct');
                } else {
                    btn.className = "py-2.5 px-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 overflow-hidden";
                    btn.innerHTML = `<i class="fa-regular fa-circle text-slate-500 text-[10px] shrink-0"></i> <span class="truncate">${stepNum}. ${word}</span>`;
                    SoundFX.play('click');
                }
            }

            const completedCount = Object.values(vocabDrillState).filter(Boolean).length;
            const label = document.getElementById('drill-progress-label');
            if (label) {
                label.innerText = `${completedCount} / 3 Selesai`;
                if (completedCount === 3) {
                    label.className = "text-[10px] font-mono text-emerald-400 font-bold animate-bounce";
                } else {
                    label.className = "text-[10px] font-mono text-slate-400 font-bold";
                }
            }

            if (completedCount === 3) {
                SoundFX.play('levelup');
                triggerConfetti();
                addXP(5);
                showToast(`🎉 Luar biasa! Target repetisi 3x selesai untuk "${word}" (+5 XP)!`, "success");
            }
        }

        // Helper: Render mini-chat / quick markdown (bold, italic, code, newlines)
        function renderMiniChatMarkdown(text) {
            if (!text) return '';
            let h = text;
            h = h.replace(/```([\s\S]*?)```/g, '<code class="block bg-slate-900 px-2 py-1 rounded font-mono text-emerald-400 text-[10px] border border-slate-800 my-1">$1</code>');
            h = h.replace(/`([^`]+)`/g, '<code class="bg-slate-900 px-1 rounded font-mono text-cyan-400 text-[10px] border border-slate-800">$1</code>');
            h = h.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-200 font-semibold">$1</strong>');
            h = h.replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>');
            h = h.replace(/\n/g, '<br>');
            return h;
        }

        // Copy Vocab Study Prompt to Clipboard
        function copyVocabStudyPrompt() {
            const vocab = vocabBank.find(v => v.id === currentActiveVocabId);
            if (!vocab) { showToast("Tidak ada kata yang terbuka.", "error"); return; }

            const prompt = `Halo! Tolong ajari saya tentang kata bahasa Inggris berikut untuk persiapan IELTS:

Kata: "${vocab.word}"
Kelas kata: ${vocab.pos || 'kata'}
Level CEFR: ${vocab.cefr || 'B2'}
Register / Keformalan: ${vocab.registerLabel || vocab.registerLevel || 'Formal Akademik'}
Kesesuaian IELTS: ${vocab.ieltsSuitability ? vocab.ieltsSuitability.badgeText : 'Writing & Speaking OK'}
Arti (Indonesia): ${vocab.meaningId || '-'}
Arti (Inggris): ${vocab.meaningEn || '-'}
Pengucapan IPA: ${vocab.ipa || vocab.word}
Cara baca ala Indonesia: ${vocab.indonesianGuide || vocab.word.toUpperCase()}
Contoh kalimat: ${vocab.example || '-'}
Sinonim: ${(vocab.synonyms || []).join(', ') || '-'}

Tolong berikan saya:
1. 3 kolokasi akademik yang paling natural (${vocab.word} + apa?)
2. Cara penggunaan di IELTS Writing Task 2 dengan 2 contoh kalimat lengkap (Band 8.0+)
3. Perbedaan nuansa dengan sinonim-sinonimnya
4. 1 contoh kalimat Speaking Part 3 yang menggunakan kata ini secara natural
5. Kesalahan umum pelajar Indonesia yang harus dihindari

Jawab dalam bahasa Indonesia, tapi contoh kalimatnya dalam bahasa Inggris.`;

            navigator.clipboard.writeText(prompt).then(() => {
                const btn = document.getElementById('btn-copy-vocab-prompt');
                if (btn) {
                    const orig = btn.innerHTML;
                    btn.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> <span>Berhasil Disalin!</span>`;
                    btn.className = btn.className.replace('bg-indigo-600/20', 'bg-emerald-600/20').replace('text-indigo-300', 'text-emerald-300');
                    setTimeout(() => {
                        btn.innerHTML = orig;
                        btn.className = btn.className.replace('bg-emerald-600/20', 'bg-indigo-600/20').replace('text-emerald-300', 'text-indigo-300');
                    }, 2000);
                }
                showToast(`Prompt belajar "${vocab.word}" disalin! Buka ChatGPT / Claude / Gemini dan paste.`, "success");
            }).catch(() => {
                showToast("Gagal menyalin. Coba lagi.", "error");
            });
        }

        // =========================================================================
        // IeltsGo v8.0 — DUAL FEYNMAN RECALL & SENTENCE USAGE PRODUCTION ENGINE
        // =========================================================================

        async function submitFeynmanExplanation() {
            const vocab = vocabBank.find(v => v.id === currentActiveVocabId);
            if (!vocab) { showToast("Tidak ada kata aktif yang dipilih.", "error"); return; }

            const inputEl = document.getElementById('input-feynman-explanation');
            const inputSentenceEl = document.getElementById('input-feynman-sentence');
            const explanation = inputEl ? inputEl.value.trim() : '';
            const sentence = inputSentenceEl ? inputSentenceEl.value.trim() : '';

            if (!explanation && !sentence) {
                showToast("Silakan isi arti konsep (Langkah 1) atau contoh kalimat praktik (Langkah 2) Anda!", "error");
                return;
            }

            const btn = document.getElementById('btn-submit-feynman');
            const btnText = document.getElementById('btn-submit-feynman-text');
            if (btn) {
                btn.disabled = true;
                if (btnText) btnText.innerText = "AI Sedang Membedah Pemahaman & Kalimat...";
            }

            const systemPrompt = `You are an elite Cambridge IELTS Examiner and Cognitive Tutor evaluating a student's Active Productive Mastery of a target English word using the Dual Feynman Recall & Sentence Usage Framework.

TARGET WORD: "${vocab.word}" (${vocab.pos || 'word'}, CEFR ${vocab.cefr || 'B2'})
OFFICIAL MEANING: ${vocab.meaningEn} | ${vocab.meaningId}
OFFICIAL EXAMPLE: ${vocab.example || '-'}

STUDENT SUBMISSION:
- Langkah 1 (Arti / Analogi Konsep): "${explanation || '(Tidak diisi)'}"
- Langkah 2 (Contoh Kalimat Praktik): "${sentence || '(Tidak diisi)'}"

EVALUATION RUBRIC & ACTIVE TEACHING MANDATE:
1. Semantic Precision & Analogy (Concept):
   - Did they understand the core meaning and nuanced emotion/vibe of the word?
   - Pure verbatim textbook copies without intuitive mental models are penalized.
2. Syntactic & Collocational Correctness (Sentence Usage):
   - Is the Part of Speech used accurately (e.g. not using an adjective as a noun/verb)?
   - Are the prepositions and natural word pairings (collocations) authentic and native-like?
   - Catch any spelling typos (e.g. 'disrepectfull' -> 'disrespectful').
   - If sentence is omitted, cap overall score at max 65%.
3. Rating Tiers:
   - "mastery": Score >= 80%. Accurate meaning + gramatically sound, natural IELTS sentence with correct collocations.
   - "partial": Score 50-79%. Meaning is generally understood, but sentence has grammar/collocation flaws or was omitted.
   - "unlearned": Score < 50%. Severe misconception of meaning OR broken sentence that distorts the word.

Return ONLY a valid JSON object (no markdown, no backticks, no code blocks):
{
  "score": 0 - 100,
  "level": "mastery" | "partial" | "unlearned",
  "statusLabel": "Paham & Tepat (Mastery)" | "Cukup Paham (Perlu Polesan)" | "Miskonsepsi / Salah Struktur",
  "meaningCritique": "1-2 kalimat feedback ketepatan arti/analogi dalam Bahasa Indonesia.",
  "sentenceCritique": "1-2 kalimat feedback gramatika, part of speech, dan kolokasi kalimat siswa dalam Bahasa Indonesia.",
  "grammarErrors": ["Daftar kesalahan ejaan/struktur spesifik jika ada (misal: 'disrepectfull' -> 'disrespectful', 'salah preposisi: gunakan to bukan with')"],
  "syntaxFormulas": [
    "[Subject] + make an impertinent remark / comment",
    "It is impertinent of [Someone] to + [Verb]"
  ],
  "upgradedSentence": "Contoh kalimat versi upgrade tingkat tinggi (Band 8.0+) yang menyempurnakan ide kalimat siswa.",
  "srsDays": 4
}`;

            try {
                const userPrompt = `Evaluasi penguasaan konsep dan penggunaan kalimat saya untuk kata "${vocab.word}".
Arti/Analogi: "${explanation}"
Contoh Kalimat: "${sentence}"`;

                const response = await callGeminiAPI(userPrompt, systemPrompt);
                if (!response) throw new Error("Tidak ada respon dari AI. Periksa koneksi atau API Key.");

                const parsed = extractJsonFromLLM(response);
                if (!parsed || parsed.score === undefined) {
                    throw new Error("Gagal menguraikan penilaian AI.");
                }

                // Update vocab state
                vocab.feynmanLastExplanation = explanation;
                vocab.feynmanLastSentence = sentence;
                vocab.feynmanFeedback = parsed;

                const now = Date.now();
                if (parsed.level === 'mastery') {
                    vocab.consecutiveMasteryCount = (vocab.consecutiveMasteryCount || 0) + 1;
                    vocab.feynmanLevel = Math.min(4, (vocab.feynmanLevel || 0) + 1);
                    vocab.feynmanStatus = 'mastered';

                    // Exponential SRS Intervals: 1x -> 4 days, 2x -> 10 days, 3x -> 25 days, 4x -> Permanent
                    let srsDays = 4;
                    if (vocab.consecutiveMasteryCount === 2) srsDays = 10;
                    else if (vocab.consecutiveMasteryCount === 3) srsDays = 25;
                    else if (vocab.consecutiveMasteryCount >= 4) {
                        vocab.status = 'mastered';
                        vocab.feynmanLevel = 5;
                        srsDays = 999;
                    }

                    vocab.srInterval = srsDays;
                    vocab.srNextReview = now + (srsDays * 86400000);

                    addXP(25);
                    SoundFX.play('levelup');
                    triggerConfetti();
                    showToast(`Luar biasa! Pemahaman & Kalimat Anda Paham Sempurna (+25 XP)! Review berikutnya: ${srsDays >= 999 ? 'Tuntas Permanen' : srsDays + ' hari lagi'}.`, "success");
                } else if (parsed.level === 'partial') {
                    vocab.consecutiveMasteryCount = 0;
                    vocab.feynmanLevel = Math.max(1, vocab.feynmanLevel || 1);
                    vocab.feynmanStatus = 'learning';
                    vocab.srInterval = 1;
                    vocab.srNextReview = now + (1 * 86400000);

                    addXP(10);
                    SoundFX.play('correct');
                    showToast(`Cukup Paham (+10 XP). Simak formula & model kalimat perbaikan dari AI!`, "info");
                } else {
                    vocab.consecutiveMasteryCount = 0;
                    vocab.feynmanLevel = 0;
                    vocab.feynmanStatus = 'unlearned';
                    vocab.srInterval = 1;
                    vocab.srNextReview = now + (1 * 86400000);

                    SoundFX.play('error');
                    showToast(`Miskonsepsi atau salah struktur. Simak panduan AI dan perbaiki kalimatmu!`, "error");
                }

                saveVocabBank();
                openVocabCard(vocab.id);
                renderVocabBank();

            } catch (err) {
                showToast("Gagal mengevaluasi: " + err.message, "error");
            } finally {
                if (btn) {
                    btn.disabled = false;
                    if (btnText) btnText.innerText = "Uji Pemahaman & Tata Bahasa (+25 XP)";
                }
            }
        }

        function renderFeynmanFeedbackCard(feedback, vocab) {
            if (!feedback) return '';

            const isMastery = feedback.level === 'mastery' || feedback.score >= 80;
            const isPartial = feedback.level === 'partial' || (feedback.score >= 50 && feedback.score < 80);
            const borderC = isMastery ? 'border-emerald-500/50' : (isPartial ? 'border-amber-500/50' : 'border-rose-500/50');
            const bgC = isMastery ? 'from-emerald-950/30 via-slate-900 to-slate-950' : (isPartial ? 'from-amber-950/30 via-slate-900 to-slate-950' : 'from-rose-950/30 via-slate-900 to-slate-950');
            const textC = isMastery ? 'text-emerald-400' : (isPartial ? 'text-amber-400' : 'text-rose-400');
            const badgeBg = isMastery ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : (isPartial ? 'bg-amber-950 text-amber-300 border-amber-500/40' : 'bg-rose-950 text-rose-300 border-rose-500/40');
            const icon = isMastery ? 'fa-circle-check' : (isPartial ? 'fa-triangle-exclamation' : 'fa-circle-xmark');

            // Grammar errors chips
            let errorsHtml = '';
            if (feedback.grammarErrors && feedback.grammarErrors.length > 0) {
                errorsHtml = `
                    <div class="space-y-1.5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40">
                        <div class="text-[11px] font-mono font-bold text-rose-400 uppercase flex items-center gap-1.5">
                            <i class="fa-solid fa-spell-check"></i> Koreksi Ejaan & Struktur Gramatika:
                        </div>
                        <div class="space-y-1 pl-1">
                            ${feedback.grammarErrors.map(err => `
                                <div class="text-xs text-rose-200 flex items-start gap-2">
                                    <i class="fa-solid fa-xmark text-rose-400 mt-0.5 text-[10px]"></i>
                                    <span>${err}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            // Syntax formulas
            let formulasHtml = '';
            if (feedback.syntaxFormulas && feedback.syntaxFormulas.length > 0) {
                formulasHtml = `
                    <div class="space-y-1.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40">
                        <div class="text-[11px] font-mono font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                            <i class="fa-solid fa-graduation-cap"></i> Formula Sintaks Standar IELTS (Band 8.0+):
                        </div>
                        <div class="space-y-1.5 pt-0.5">
                            ${feedback.syntaxFormulas.map((f, i) => `
                                <div class="flex items-start gap-2 bg-slate-950/90 p-2 rounded-lg border border-indigo-500/20 font-mono text-xs text-indigo-200">
                                    <span class="text-indigo-400 font-bold">${i+1}.</span>
                                    <span class="flex-1 select-all font-semibold">${f}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            // Upgraded sentence
            let upgradedHtml = '';
            if (feedback.upgradedSentence) {
                upgradedHtml = `
                    <div class="space-y-1.5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                        <div class="text-[11px] font-mono font-bold text-emerald-400 uppercase flex items-center justify-between flex-wrap gap-2">
                            <span class="flex items-center gap-1.5"><i class="fa-solid fa-sparkles"></i> Model Kalimat Sempurna (Band 8.5+ Upgrade):</span>
                            <button onclick="speakWord('${feedback.upgradedSentence.replace(/'/g, "\\'")}', 'en-GB')" class="px-2 py-0.5 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm" title="Dengarkan pelafalan kalimat ini">
                                <i class="fa-solid fa-volume-high text-[9px]"></i> Dengar
                            </button>
                        </div>
                        <div class="text-xs text-emerald-100 font-sans leading-relaxed italic pl-1 border-l-2 border-emerald-500">
                            "${feedback.upgradedSentence}"
                        </div>
                    </div>
                `;
            }

            // Retry Action Button
            let retryButtonHtml = '';
            if (!isMastery) {
                retryButtonHtml = `
                    <div class="pt-2 border-t border-slate-800 flex justify-end">
                        <button onclick="retryFeynmanSentenceDrill()" class="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5">
                            <i class="fa-solid fa-rotate-right"></i>
                            <span>🔁 Perbaiki Kalimat & Uji Ulang (+25 XP)</span>
                        </button>
                    </div>
                `;
            }

            return `
                <div class="p-4 rounded-2xl bg-gradient-to-r ${bgC} border ${borderC} space-y-3.5 shadow-lg">
                    <!-- Header Score -->
                    <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-2.5">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${badgeBg} flex items-center gap-1">
                                <i class="fa-solid ${icon}"></i> ${feedback.statusLabel || 'Evaluasi AI'}
                            </span>
                        </div>
                        <div class="text-lg font-mono font-black ${textC}">
                            Skor: ${feedback.score || 0}%
                        </div>
                    </div>

                    <!-- Meaning & Sentence Diagnosis -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <!-- Meaning Feedback -->
                        <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                            <div class="text-[10px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
                                <i class="fa-solid fa-lightbulb text-[9px]"></i> Evaluasi Makna / Analogi:
                            </div>
                            <p class="text-xs text-slate-200 font-sans leading-relaxed">${feedback.meaningCritique || feedback.critique || '-'}</p>
                        </div>

                        <!-- Sentence Feedback -->
                        <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                            <div class="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
                                <i class="fa-solid fa-pen-fancy text-[9px]"></i> Evaluasi Penggunaan & Kolokasi:
                            </div>
                            <p class="text-xs text-slate-200 font-sans leading-relaxed">${feedback.sentenceCritique || 'Belum ada kalimat yang dimasukkan.'}</p>
                        </div>
                    </div>

                    <!-- Grammar Errors List -->
                    ${errorsHtml}

                    <!-- Formulas & Teaching Box -->
                    ${formulasHtml}

                    <!-- Upgraded Sentence Model -->
                    ${upgradedHtml}

                    <!-- Action Retry -->
                    ${retryButtonHtml}
                </div>
            `;
        }

        function retryFeynmanSentenceDrill() {
            const inputSentence = document.getElementById('input-feynman-sentence');
            const inputSection = document.getElementById('vocab-feynman-input-section');
            if (inputSentence) {
                inputSentence.focus();
                inputSentence.select();
            }
            if (inputSection) {
                inputSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            showToast("Silakan perbaiki kalimat Anda berdasarkan formula di atas dan klik 'Uji' lagi! ✍️", "info");
        }

        async function startFastTrackMasteryChallenge() {
            const vocab = vocabBank.find(v => v.id === currentActiveVocabId);
            if (!vocab) return;

            SoundFX.play('click');
            const challengeBox = document.getElementById('vocab-fasttrack-box');
            const promptTextEl = document.getElementById('vocab-fasttrack-prompt-text');
            const answerInput = document.getElementById('input-fasttrack-answer');
            const resultBox = document.getElementById('vocab-fasttrack-result-box');

            if (!challengeBox || !promptTextEl) return;

            challengeBox.classList.remove('hidden');
            if (resultBox) {
                resultBox.classList.add('hidden');
                resultBox.innerHTML = '';
            }
            if (answerInput) {
                answerInput.value = '';
                answerInput.disabled = true;
            }
            promptTextEl.innerHTML = `<span class="text-amber-300 font-mono"><i class="fa-solid fa-spinner animate-spin mr-1"></i> AI Examiner sedang merancang 1 soal pembuktian spontan untuk kata "${vocab.word}"...</span>`;

            const systemPrompt = `You are an elite IELTS Senior Examiner creating a high-stakes, spontaneous Mastery Challenge to test if a student has truly mastered the English word "${vocab.word}" (${vocab.pos}, CEFR ${vocab.cefr}).

Design 1 sharp, creative challenge in Indonesian with an English requirement.
Examples of great challenge formats:
- "Buat 1 kalimat argumen IELTS Speaking Part 3 / Writing Task 2 yang membandingkan dua kondisi kontras menggunakan kata '${vocab.word}' secara tepat!"
- "Perbaiki kalimat rancu berikut agar bernuansa akademik Band 8.0 dengan menyisipkan kata '${vocab.word}': [berikan 1 kalimat rancu relevan]."

Keep the prompt instruction concise (1-2 sentences) in Indonesian. Do NOT provide the answer.`;

            try {
                const response = await callGeminiAPI(`Buat 1 soal ujian spontan untuk menguji penguasaan kata "${vocab.word}"`, systemPrompt);
                promptTextEl.innerHTML = renderMarkdown(response || `Buat 1 kalimat argumen IELTS yang menggunakan kata "${vocab.word}" secara natural dan tepat konteks.`);
                if (answerInput) {
                    answerInput.disabled = false;
                    answerInput.focus();
                }
            } catch (err) {
                promptTextEl.innerHTML = `<span class="text-rose-400">Gagal membuat soal spontan: ${err.message}. Pastikan Gemini API Key aktif.</span>`;
                if (answerInput) answerInput.disabled = false;
            }
        }

        function cancelFastTrackChallenge() {
            const challengeBox = document.getElementById('vocab-fasttrack-box');
            if (challengeBox) challengeBox.classList.add('hidden');
        }

        async function submitFastTrackChallengeAnswer() {
            const vocab = vocabBank.find(v => v.id === currentActiveVocabId);
            if (!vocab) return;

            const inputEl = document.getElementById('input-fasttrack-answer');
            const answer = inputEl ? inputEl.value.trim() : '';
            if (!answer) {
                showToast("Silakan tulis jawaban ujian spontan Anda terlebih dahulu!", "error");
                return;
            }

            const promptEl = document.getElementById('vocab-fasttrack-prompt-text');
            const challengePrompt = promptEl ? promptEl.innerText : '';
            const resultBox = document.getElementById('vocab-fasttrack-result-box');
            const btn = document.getElementById('btn-submit-fasttrack-answer');
            const btnText = document.getElementById('btn-submit-fasttrack-text');

            if (btn) {
                btn.disabled = true;
                if (btnText) btnText.innerText = "Menilai Pembuktian...";
            }

            const systemPrompt = `You are a strict Cambridge IELTS Examiner evaluating a student's answer for an Instant Mastery Challenge.
Target Word: "${vocab.word}" (${vocab.pos}, CEFR ${vocab.cefr})
Definition: ${vocab.meaningEn}
Challenge Prompt: "${challengePrompt}"
Student's Answer: "${answer}"

GRADING STANDARDS:
- To PASS (isPassed: true), the student MUST demonstrate clear, correct, natural usage of "${vocab.word}" in line with the challenge requirements without major collocation or grammar blunders (Band 7.5+ quality).
- If unnatural, wrong meaning, or grammatically distorted -> isPassed: false.

Return ONLY a valid JSON object:
{
  "isPassed": true | false,
  "score": 0 - 100,
  "critique": "2 kalimat penjelasan evaluasi tegas dalam Bahasa Indonesia."
}`;

            try {
                const response = await callGeminiAPI(`Evaluasi jawaban ujian spontan untuk kata "${vocab.word}": "${answer}"`, systemPrompt);
                const parsed = extractJsonFromLLM(response);
                if (!parsed) throw new Error("Gagal menguraikan penilaian ujian AI.");

                if (resultBox) {
                    resultBox.classList.remove('hidden');
                    if (parsed.isPassed) {
                        resultBox.className = "p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs space-y-1";
                        resultBox.innerHTML = `
                            <div class="text-emerald-300 font-bold font-mono flex items-center gap-1.5">
                                <i class="fa-solid fa-crown text-amber-400"></i> LULUS UJIAN SPONTAN! KATA BEBAS REVIEW (+50 XP)
                            </div>
                            <p class="text-slate-200">${parsed.critique || 'Jawaban Anda membuktikan pemahaman tuntas.'}</p>
                        `;

                        vocab.status = 'mastered';
                        vocab.feynmanLevel = 5;
                        vocab.feynmanStatus = 'mastered';
                        vocab.srInterval = 999;
                        vocab.srNextReview = Date.now() + (999 * 86400000);

                        saveVocabBank();
                        addXP(50);
                        SoundFX.play('levelup');
                        triggerConfetti();
                        showToast(`SELAMAT! Kata "${vocab.word}" resmi BEBAS REVIEW SELAMANYA (+50 XP)! 🏆`, "success");
                        openVocabCard(vocab.id);
                        renderVocabBank();
                    } else {
                        resultBox.className = "p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs space-y-1";
                        resultBox.innerHTML = `
                            <div class="text-rose-300 font-bold font-mono flex items-center gap-1.5">
                                <i class="fa-solid fa-triangle-exclamation"></i> BELUM LULUS UJIAN SPONTAN (Skor: ${parsed.score || 0}%)
                            </div>
                            <p class="text-slate-200">${parsed.critique || 'Kalimat belum memenuhi standar Band 7.5.'}</p>
                            <p class="text-slate-400 text-[11px] pt-1">Kartu tetap berada pada jadwal belajar normal (SRS) agar Anda dapat memperkuatnya secara berkala.</p>
                        `;
                        SoundFX.play('error');
                    }
                }
            } catch (err) {
                showToast("Gagal menilai ujian: " + err.message, "error");
            } finally {
                if (btn) {
                    btn.disabled = false;
                    if (btnText) btnText.innerText = "Serahkan Jawaban Ujian Spontan (+50 XP)";
                }
            }
        }

        // =========================================================================
        // IeltsGo v9.0 — ENHANCED SPACED REPETITION & AI EXAMINER REVIEW ENGINE
        // =========================================================================
        let reviewQueue = [];
        let reviewCurrentIndex = 0;
        let currentReviewMode = 'ai'; // 'ai' | 'flashcard'

        function getVocabsDueToday() {
            const now = Date.now();
            return vocabBank.filter(v => {
                if (v.status === 'mastered' || (v.feynmanLevel && v.feynmanLevel >= 5)) return false;
                return (v.srNextReview || 0) <= now + 3600000;
            });
        }

        function setReviewMode(mode) {
            SoundFX.play('click');
            currentReviewMode = mode;
            const btnAi = document.getElementById('btn-review-mode-ai');
            const btnFc = document.getElementById('btn-review-mode-flashcard');
            const aiBox = document.getElementById('review-mode-ai-box');
            const fcBox = document.getElementById('review-mode-flashcard-box');

            if (mode === 'ai') {
                if (btnAi) btnAi.className = "px-2.5 py-1 rounded-md bg-indigo-600 text-white font-bold transition-all flex items-center gap-1";
                if (btnFc) btnFc.className = "px-2.5 py-1 rounded-md text-slate-400 hover:text-white transition-all flex items-center gap-1";
                if (aiBox) aiBox.classList.remove('hidden');
                if (fcBox) fcBox.classList.add('hidden');
            } else {
                if (btnAi) btnAi.className = "px-2.5 py-1 rounded-md text-slate-400 hover:text-white transition-all flex items-center gap-1";
                if (btnFc) btnFc.className = "px-2.5 py-1 rounded-md bg-indigo-600 text-white font-bold transition-all flex items-center gap-1";
                if (aiBox) aiBox.classList.add('hidden');
                if (fcBox) fcBox.classList.remove('hidden');
            }
        }

        function startReviewSession() {
            SoundFX.play('click');
            reviewQueue = getVocabsDueToday();

            if (reviewQueue.length === 0) {
                showToast("Hebat! Tidak ada kartu yang perlu direview saat ini.", "info");
                return;
            }

            reviewCurrentIndex = 0;
            document.getElementById('modal-vocab-review').classList.remove('hidden');
            setReviewMode(currentReviewMode || 'ai');
            renderReviewCard();
        }

        function closeReviewModal() {
            document.getElementById('modal-vocab-review').classList.add('hidden');
            renderDashboard();
            renderVocabBank();
        }

        function renderReviewCard() {
            const activeCardContainer = document.getElementById('review-active-card-container');
            const completionBox = document.getElementById('review-completion-box');

            if (reviewCurrentIndex >= reviewQueue.length) {
                // Session Completed
                if (activeCardContainer) activeCardContainer.classList.add('hidden');
                if (completionBox) completionBox.classList.remove('hidden');
                
                addXP(50);
                SoundFX.play('levelup');
                triggerConfetti();
                return;
            }

            if (activeCardContainer) activeCardContainer.classList.remove('hidden');
            if (completionBox) completionBox.classList.add('hidden');

            const vocab = reviewQueue[reviewCurrentIndex];

            // Update Header & Progress Bar
            const curIdxEl = document.getElementById('review-cur-idx');
            const totalIdxEl = document.getElementById('review-total-idx');
            const progressBar = document.getElementById('review-progress-bar');
            
            if (curIdxEl) curIdxEl.innerText = reviewCurrentIndex + 1;
            if (totalIdxEl) totalIdxEl.innerText = reviewQueue.length;
            const pct = Math.round((reviewCurrentIndex / reviewQueue.length) * 100);
            if (progressBar) progressBar.style.width = `${pct}%`;

            // Populate Target Word Header
            const wordEl = document.getElementById('review-card-word');
            const posEl = document.getElementById('review-card-pos');
            const cefrEl = document.getElementById('review-card-cefr');
            const regEl = document.getElementById('review-card-register');
            const ipaEl = document.getElementById('review-card-ipa');

            if (wordEl) wordEl.innerText = vocab.word;
            if (posEl) posEl.innerText = vocab.pos || 'kata';
            if (cefrEl) {
                cefrEl.innerText = vocab.cefr || 'B2';
                cefrEl.className = `text-xs font-mono font-bold px-2 py-0.5 rounded border cefr-${(vocab.cefr || 'b2').toLowerCase()}`;
            }
            if (regEl) {
                const isWritingReady = (vocab.ieltsSuitability?.status === 'both' || vocab.ieltsSuitability?.status === 'writing_only' || vocab.registerLevel === 'formal' || vocab.registerLevel === 'written_academic');
                regEl.innerText = isWritingReady ? '📝 Writing Ready' : (vocab.registerLabel || '🟢 Formal');
                regEl.className = isWritingReady ? 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-bold';
            }
            if (ipaEl) ipaEl.innerText = vocab.ipa || '';

            // Reset AI Inputs & Feedback Box
            const inputExpl = document.getElementById('input-review-feynman-expl');
            const inputSentence = document.getElementById('input-review-feynman-sentence');
            const feedbackBox = document.getElementById('review-ai-feedback-box');
            if (inputExpl) inputExpl.value = vocab.feynmanLastExplanation || '';
            if (inputSentence) inputSentence.value = vocab.feynmanLastSentence || '';
            if (feedbackBox) {
                feedbackBox.classList.add('hidden');
                feedbackBox.innerHTML = '';
            }

            // Reset Flashcard Views
            const fcFront = document.getElementById('review-flashcard-front');
            const fcBack = document.getElementById('review-flashcard-back');
            if (fcFront) fcFront.classList.remove('hidden');
            if (fcBack) fcBack.classList.add('hidden');

            const backMeaning = document.getElementById('review-back-meaning-id');
            const backGuide = document.getElementById('review-back-guide');
            const backExample = document.getElementById('review-back-example');
            if (backMeaning) backMeaning.innerText = vocab.meaningId || vocab.meaningEn || '';
            if (backGuide) backGuide.innerText = vocab.indonesianGuide || vocab.word.toUpperCase();
            if (backExample) backExample.innerText = vocab.example || '';
        }

        function flipReviewCard() {
            SoundFX.play('click');
            const fcFront = document.getElementById('review-flashcard-front');
            const fcBack = document.getElementById('review-flashcard-back');
            if (fcFront) fcFront.classList.add('hidden');
            if (fcBack) fcBack.classList.remove('hidden');
        }

        function speakCurrentReviewWord() {
            const vocab = reviewQueue[reviewCurrentIndex];
            if (vocab) speakWord(vocab.word, 'en-GB');
        }

        function rateReviewCard(rating) {
            const vocab = reviewQueue[reviewCurrentIndex];
            if (!vocab) return;

            SoundFX.play('correct');
            addXP(10);

            // SM-2 Schedule Update
            if (rating === 'forgot') {
                vocab.consecutiveMasteryCount = 0;
                vocab.feynmanLevel = 0;
                vocab.feynmanStatus = 'unlearned';
                vocab.srInterval = 1;
                vocab.srNextReview = Date.now() + (1 * 86400000);
            } else if (rating === 'hard') {
                vocab.consecutiveMasteryCount = 0;
                vocab.feynmanLevel = Math.max(1, vocab.feynmanLevel || 1);
                vocab.feynmanStatus = 'learning';
                vocab.srInterval = Math.max(1, (vocab.srInterval || 1) * 1.2);
                vocab.srNextReview = Date.now() + Math.round(vocab.srInterval * 86400000);
            } else if (rating === 'got_it') {
                vocab.consecutiveMasteryCount = (vocab.consecutiveMasteryCount || 0) + 1;
                vocab.feynmanLevel = Math.min(4, (vocab.feynmanLevel || 0) + 1);
                vocab.feynmanStatus = 'mastered';
                vocab.srInterval = Math.max(1.5, (vocab.srInterval || 1) * 2.5);
                vocab.srNextReview = Date.now() + Math.round(vocab.srInterval * 86400000);
                vocab.srReviewCount = (vocab.srReviewCount || 0) + 1;
            }

            // Save to vocabBank
            const bankIdx = vocabBank.findIndex(v => v.id === vocab.id);
            if (bankIdx !== -1) {
                vocabBank[bankIdx] = vocab;
                saveVocabBank();
            }

            reviewCurrentIndex++;
            renderReviewCard();
        }

        async function submitReviewAiEvaluation() {
            const vocab = reviewQueue[reviewCurrentIndex];
            if (!vocab) return;

            const inputExpl = document.getElementById('input-review-feynman-expl');
            const inputSentence = document.getElementById('input-review-feynman-sentence');
            const explanation = inputExpl ? inputExpl.value.trim() : '';
            const sentence = inputSentence ? inputSentence.value.trim() : '';

            if (!explanation && !sentence) {
                showToast("Silakan tuliskan penjelasan konsep ATAU contoh kalimat Anda!", "error");
                return;
            }

            const btn = document.getElementById('btn-submit-review-ai');
            const btnText = document.getElementById('btn-submit-review-ai-text');
            const feedbackBox = document.getElementById('review-ai-feedback-box');

            if (btn) {
                btn.disabled = true;
                if (btnText) btnText.innerText = "Examiner Menilai...";
            }
            if (feedbackBox) {
                feedbackBox.classList.remove('hidden');
                feedbackBox.innerHTML = `
                    <div class="py-4 text-center text-indigo-400 font-mono text-xs space-y-2">
                        <i class="fa-solid fa-spinner animate-spin text-2xl"></i>
                        <div>AI Examiner sedang mengevaluasi ketepatan makna & struktur kalimat...</div>
                    </div>
                `;
            }

            const systemPrompt = `You are a strict, pedagogical Cambridge IELTS Senior Examiner evaluating a student's review drill for the word "${vocab.word}" (${vocab.pos}, CEFR ${vocab.cefr}).
Target Definition: ${vocab.meaningEn} (${vocab.meaningId})
Target Register: ${vocab.registerLabel || vocab.registerLevel || 'formal'}

Student Explanation: "${explanation || '(None)'}"
Student Sentence: "${sentence || '(None)'}"

Provide a concise evaluation in Indonesian with high-scoring IELTS tips.
1. Meaning Critique: If provided, is it semantically accurate?
2. Sentence Critique: Is grammar, collocation, and IELTS context accurate?
3. Grammar Errors: Array of specific correction notes (empty if flawless).
4. Syntax Formulas: 1-2 Band 8.0+ syntax formula patterns using "${vocab.word}".
5. Upgraded Sentence: 1 perfect Band 8.5+ IELTS sentence.
6. Score: 0-100.

Return JSON ONLY:
{
  "score": 85,
  "level": "mastery | partial | unlearned",
  "statusLabel": "Paham Sempurna | Cukup Paham | Perlu Perbaikan",
  "meaningCritique": "...",
  "sentenceCritique": "...",
  "grammarErrors": ["..."],
  "syntaxFormulas": ["..."],
  "upgradedSentence": "..."
}`;

            try {
                const response = await callGeminiAPI(`Evaluate review drill for "${vocab.word}"`, systemPrompt);
                const parsed = extractJsonFromLLM(response);
                if (!parsed) throw new Error("Respon AI tidak dapat diuraikan.");

                vocab.feynmanFeedback = parsed;
                vocab.feynmanLastExplanation = explanation;
                vocab.feynmanLastSentence = sentence;

                const now = Date.now();
                if (parsed.level === 'mastery' || parsed.score >= 80) {
                    vocab.consecutiveMasteryCount = (vocab.consecutiveMasteryCount || 0) + 1;
                    vocab.feynmanLevel = Math.min(4, (vocab.feynmanLevel || 0) + 1);
                    vocab.feynmanStatus = 'mastered';

                    let srsDays = 4;
                    if (vocab.consecutiveMasteryCount === 2) srsDays = 10;
                    else if (vocab.consecutiveMasteryCount === 3) srsDays = 25;
                    else if (vocab.consecutiveMasteryCount >= 4) {
                        vocab.status = 'mastered';
                        vocab.feynmanLevel = 5;
                        srsDays = 999;
                    }

                    vocab.srInterval = srsDays;
                    vocab.srNextReview = now + (srsDays * 86400000);
                    vocab.srReviewCount = (vocab.srReviewCount || 0) + 1;

                    addXP(25);
                    SoundFX.play('levelup');
                    triggerConfetti();
                    showToast(`🎉 Uji Selesai! Skor: ${parsed.score}%. Review berikutnya: ${srsDays >= 999 ? 'Bebas Review' : srsDays + ' hari lagi'}.`, "success");
                } else if (parsed.level === 'partial' || parsed.score >= 50) {
                    vocab.consecutiveMasteryCount = 0;
                    vocab.feynmanLevel = Math.max(1, vocab.feynmanLevel || 1);
                    vocab.feynmanStatus = 'learning';
                    vocab.srInterval = 1;
                    vocab.srNextReview = now + (1 * 86400000);

                    addXP(10);
                    SoundFX.play('correct');
                    showToast(`Cukup Paham (${parsed.score}%). Simak evaluasi & formula perbaikan!`, "info");
                } else {
                    vocab.consecutiveMasteryCount = 0;
                    vocab.feynmanLevel = 0;
                    vocab.feynmanStatus = 'unlearned';
                    vocab.srInterval = 1;
                    vocab.srNextReview = now + (1 * 86400000);

                    SoundFX.play('error');
                    showToast(`Perlu Perbaikan (${parsed.score}%). Simak panduan AI!`, "error");
                }

                saveVocabBank();

                // Render Feedback Box in Modal
                if (feedbackBox) {
                    feedbackBox.innerHTML = `
                        <div class="space-y-3">
                            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                                <span class="text-[11px] font-mono font-bold ${parsed.score >= 80 ? 'text-emerald-400' : (parsed.score >= 50 ? 'text-amber-400' : 'text-rose-400')}">
                                    ${parsed.statusLabel || 'Evaluasi AI Examiner'} (Skor: ${parsed.score}%)
                                </span>
                                <span class="text-[10px] font-mono text-slate-400">Bonus: +${parsed.score >= 80 ? 25 : 10} XP</span>
                            </div>

                            ${parsed.grammarErrors && parsed.grammarErrors.length > 0 ? `
                                <div class="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-1">
                                    <div class="text-[10px] font-mono font-bold text-rose-400 uppercase">Koreksi Gramatika:</div>
                                    ${parsed.grammarErrors.map(e => `<div class="text-xs text-rose-200">• ${e}</div>`).join('')}
                                </div>
                            ` : ''}

                            ${parsed.syntaxFormulas && parsed.syntaxFormulas.length > 0 ? `
                                <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-1">
                                    <div class="text-[10px] font-mono font-bold text-indigo-400 uppercase">Formula Sintaks Band 8.0+:</div>
                                    ${parsed.syntaxFormulas.map(f => `<div class="text-xs text-indigo-200 font-mono">• ${f}</div>`).join('')}
                                </div>
                            ` : ''}

                            ${parsed.upgradedSentence ? `
                                <div class="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                                    <div class="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center justify-between">
                                        <span>Model Kalimat Upgrade (Band 8.5+):</span>
                                        <button onclick="speakWord('${parsed.upgradedSentence.replace(/'/g, "\\'")}', 'en-GB')" class="text-[10px] text-emerald-300 hover:text-white">
                                            <i class="fa-solid fa-volume-high"></i> Dengar
                                        </button>
                                    </div>
                                    <div class="text-xs text-emerald-100 italic">"${parsed.upgradedSentence}"</div>
                                </div>
                            ` : ''}

                            <div class="pt-2 flex justify-end">
                                <button onclick="nextReviewCard()" class="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-mono font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95">
                                    <span>Lanjut ke Kata Berikutnya</span>
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }

            } catch (err) {
                showToast("Gagal menilai review: " + err.message, "error");
                if (feedbackBox) feedbackBox.classList.add('hidden');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    if (btnText) btnText.innerText = "Uji & Nilai AI Examiner (+25 XP)";
                }
            }
        }

        function nextReviewCard() {
            reviewCurrentIndex++;
            renderReviewCard();
        }

        function skipReviewWord() {
            SoundFX.play('click');
            reviewCurrentIndex++;
            renderReviewCard();
        }
