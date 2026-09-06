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
        let currentVocabModalTab = 'quick';

        function switchVocabModalTab(tab) {
            currentVocabModalTab = tab || 'quick';
            const btnQuick = document.getElementById('btn-vocab-tab-quick');
            const btnDeep = document.getElementById('btn-vocab-tab-deep');
            const btnPractice = document.getElementById('btn-vocab-tab-practice');

            const tabQuick = document.getElementById('vocab-tab-quick');
            const tabDeep = document.getElementById('vocab-tab-deep');
            const tabPractice = document.getElementById('vocab-tab-practice');

            const inactiveClass = "flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 text-slate-400 hover:text-white cursor-pointer lowercase";

            if (btnQuick) btnQuick.className = inactiveClass;
            if (btnDeep) btnDeep.className = inactiveClass;
            if (btnPractice) btnPractice.className = inactiveClass;

            if (tabQuick) tabQuick.classList.add('hidden');
            if (tabDeep) tabDeep.classList.add('hidden');
            if (tabPractice) tabPractice.classList.add('hidden');

            if (currentVocabModalTab === 'quick') {
                if (btnQuick) btnQuick.className = "flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 bg-emerald-600 text-white shadow-sm cursor-pointer lowercase";
                if (tabQuick) tabQuick.classList.remove('hidden');
            } else if (currentVocabModalTab === 'deep') {
                if (btnDeep) btnDeep.className = "flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 bg-indigo-600 text-white shadow-sm cursor-pointer lowercase";
                if (tabDeep) tabDeep.classList.remove('hidden');
            } else if (currentVocabModalTab === 'practice') {
                if (btnPractice) btnPractice.className = "flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 bg-teal-600 text-white shadow-sm cursor-pointer lowercase";
                if (tabPractice) tabPractice.classList.remove('hidden');
            }
        }

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
                if (typeof IeltsSyncService !== 'undefined') IeltsSyncService.triggerAutoSync();
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
                    targetEntry.coreMeaningB1 = analysis.coreMeaningB1 || targetEntry.coreMeaningB1 || analysis.meaningEn;
                    targetEntry.visualFlow = analysis.visualFlow || targetEntry.visualFlow || '💡 → 🧠 → 🗣️';
                    targetEntry.mentalImageExplanation = analysis.mentalImageExplanation || analysis.childExplanation || targetEntry.mentalImageExplanation || '';
                    targetEntry.collocationMatrix = analysis.collocationMatrix || targetEntry.collocationMatrix || null;
                    targetEntry.nuanceCompare = analysis.nuanceCompare !== undefined ? analysis.nuanceCompare : targetEntry.nuanceCompare;
                    targetEntry.ieltsUpgrade = analysis.ieltsUpgrade !== undefined ? analysis.ieltsUpgrade : targetEntry.ieltsUpgrade;
                    targetEntry.usageWarning = analysis.usageWarning !== undefined ? analysis.usageWarning : targetEntry.usageWarning;
                    targetEntry.quickRecap = analysis.quickRecap || targetEntry.quickRecap || null;
                    targetEntry.naturalExamples = analysis.naturalExamples || targetEntry.naturalExamples || [];
                    targetEntry.indonesianGuide = analysis.indonesianGuide || `${finalWord.toUpperCase()}`;
                    targetEntry.example = analysis.example || targetEntry.example;
                    targetEntry.childExplanation = analysis.mentalImageExplanation || analysis.childExplanation || targetEntry.childExplanation || '';
                    targetEntry.dailyExamples = analysis.dailyExamples || targetEntry.dailyExamples || [];
                    targetEntry.synonyms = analysis.synonyms || targetEntry.synonyms || [];
                    targetEntry.antonyms = analysis.antonyms || targetEntry.antonyms || [];
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
                    coreMeaningB1: analysis.coreMeaningB1 || analysis.meaningEn || 'Simple, direct English meaning.',
                    meaningId: analysis.meaningId || 'Arti kata bahasa Inggris',
                    meaningEn: analysis.meaningEn || 'English definition',
                    visualFlow: analysis.visualFlow || '💡 → 🧠 → 🗣️',
                    mentalImageExplanation: analysis.mentalImageExplanation || analysis.childExplanation || `Konsep sederhana untuk ${finalWord}.`,
                    collocationMatrix: analysis.collocationMatrix || null,
                    nuanceCompare: analysis.nuanceCompare || null,
                    ieltsUpgrade: analysis.ieltsUpgrade || null,
                    usageWarning: analysis.usageWarning || analysis.registerTrapAlert || null,
                    quickRecap: analysis.quickRecap || null,
                    naturalExamples: analysis.naturalExamples || [],
                    indonesianGuide: analysis.indonesianGuide || `${finalWord.toUpperCase()}`,
                    example: analysis.example || `Academic context sentence using ${finalWord}.`,
                    childExplanation: analysis.mentalImageExplanation || analysis.childExplanation || `Konsep sederhana untuk ${finalWord}.`,
                    dailyExamples: analysis.dailyExamples || [],
                    synonyms: analysis.synonyms || [],
                    antonyms: analysis.antonyms || [],
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

            const systemPrompt = `You are an expert Cambridge Lexicographer, Cognitive Tutor, and English Phonetics Specialist teaching vocabulary to B1-level learners preparing for everyday life, academic study, and IELTS.
Target Accent: ${accentName}

CRITICAL TEACHING RULES:
1. "coreMeaningB1": Give the simplest, clearest meaning in B1-level English. Do NOT begin with complicated dictionary jargon. The learner must understand it in 3 seconds.
2. "meaningId": Clear, concise definition in simple B1 English.
3. "visualFlow": A punchy progressive emoji transformation showing state change or mental model (e.g. "💨 → 🌫️ → ☁️ → nothing" for dissipate, "🧱 → 🏗️ → 🏛️" for establish, "🌧️ → 🛡️ → ☀️" for mitigate).
4. "mentalImageExplanation": A simple visual analogy or memory trick grounded in TANGIBLE EVERYDAY PHYSICAL OBJECTS (max 2 short sentences). Never define with abstract synonyms.
5. "collocationMatrix": High-frequency natural chunks split into:
   - "starChunk": The #1 most natural chunk to memorize (e.g. "gradually dissipate", "establish a relationship").
   - "verbPlusNoun": Array of 2-3 collocations (e.g. ["dissipate heat", "dissipate tension"]).
   - "nounPlusVerb": Array of 2-3 collocations (e.g. ["fog dissipates", "anger dissipates"]).
6. CONDITIONAL SKIPPING RULE - "nuanceCompare":
   - If the word is commonly confused with another word (e.g. dissipate vs disappear, affect vs impair, increase vs influx):
     Provide: { 
       "compareWith": "otherWord", 
       "compareNuance": "Clear definition and nuance of the otherWord", 
       "targetNuance": "Clear definition and nuance of the targetWord", 
       "compareFormula": "otherWord → result", 
       "targetFormula": "targetWord → gradual process",
       "compareExample": "Short natural example using otherWord",
       "targetExample": "Short natural example using targetWord",
       "wordA_nuance": "OtherWord definition (for backward compatibility)", 
       "wordB_nuance": "TargetWord definition (for backward compatibility)" 
     }
   - CRITICAL: If the word does NOT have a common confusing counterpart, return null! (DILARANG mengarang perbandingan palsu).
7. CONDITIONAL SKIPPING RULE - "ieltsUpgrade":
   - Provide a natural Band 7.5+ upgrade: { "basicSentence": "Common basic sentence", "upgradedSentence": "Band 7.5+ sentence using this word", "targetModule": "Writing Task 2 & Speaking Part 3" }
   - CRITICAL: If this word is not suitable or natural for IELTS, return null (do not force it).
8. CONDITIONAL SKIPPING RULE - "usageWarning":
   - Tell about important situations where learners should NOT use this word or common learner mistakes.
   - Can be an object: { "rule": "Don't use it like ...", "wrongSentence": "...", "explanation": "...", "betterAlternative": "...", "correctSentence": "..." } or simple string warning. If no trap, return null.
9. "quickRecap": Punchy 1-line recap formula: "WORD = simple meaning • Golden Chunk: ..."
10. "naturalExamples": Array of 3 natural examples (from simple everyday to 1 academic/IELTS sentence), each with an inline B1 meaning explanation:
   [{ "en": "Example sentence 1", "meaningB1": "Simple explanation of sentence meaning" }, ...]
11. "indonesianGuide": 100% HURUF ALFABET INDONESIA (A-Z) TANPA SIMBOL IPA! Suku kata ditekan KAPITAL + asosiasi kata Indonesia.
12. "ipa": Official Cambridge IPA symbol.

CRITICAL PRE-ANALYSIS:
- If misspelling: set "correctedWord" to correct spelling, "isNonEnglish": false.
- If not English: set "isNonEnglish": true, "rejectionReason": "The word entered is not a valid English word.", and empty others.

REGISTER CLASSIFICATION:
- "registerLevel": One of ["casual", "semi_formal", "formal", "written_academic"]
- "registerLabel": "Casual / Informal" | "Neutral / Semi-Formal" | "Formal Academic" | "Official Written Only"
- "ieltsSuitability": { "status": "both | speaking_only | writing_only | non_ielts", "badgeText": "...", "badgeColor": "emerald | sky | purple | amber", "description": "..." }
- "highYieldContext": High-frequency IELTS theme or null.
- "registerTrapAlert": Warning string or null.

Return ONLY a valid JSON object (no markdown, no backticks, no code blocks):
{
  "correctedWord": "the correct English spelling",
  "isNonEnglish": false,
  "rejectionReason": null,
  "pos": "verb | noun | adjective | adverb",
  "cefr": "A1 | A2 | B1 | B2 | C1 | C2",
  "registerLevel": "formal",
  "registerLabel": "Formal Akademik",
  "ieltsSuitability": {
    "status": "both",
    "badgeText": "🌐 Writing & Speaking OK",
    "badgeColor": "emerald",
    "description": "Highly recommended for Writing Task 2 essays and Speaking Part 3 discussions."
  },
  "highYieldContext": "Environment, Science, & Society",
  "ieltsTopics": ["health", "technology", "environment", "conflict resolution"],
  "academicStructure": "The tension between both countries gradually dissipated following bilateral discussions.",
  "registerTrapAlert": null,
  "coreMeaningB1": "Simple, direct B1 English definition",
  "meaningId": "Simple, concise English definition (B1)",
  "meaningEn": "Concise academic English definition",
  "visualFlow": "💨 → 🌫️ → ☁️ → nothing",
  "mentalImageExplanation": "Everyday physical analogy explanation",
  "childExplanation": "Everyday physical analogy explanation",
  "indonesianGuide": "EJAAN-GLOBAL ↘ (SUKU_KAPITAL ditekan kuat)",
  "ipa": "/.../",
  "collocationMatrix": {
    "starChunk": "gradually dissipate",
    "verbPlusNoun": ["dissipate heat", "dissipate tension"],
    "nounPlusVerb": ["fog dissipates", "anger dissipates"]
  },
  "nuanceCompare": {
    "compareWith": "disappear",
    "compareNuance": "Simply no longer visible or present at all (Result / Instan)",
    "targetNuance": "Disappear gradually by spreading out or becoming weaker (Process / Bertahap)",
    "compareFormula": "disappear → result",
    "targetFormula": "dissipate → gradual process",
    "compareExample": "The fog disappeared.",
    "targetExample": "The fog gradually dissipated as the sun rose.",
    "wordA_nuance": "Disappear = simply no longer visible (Result)",
    "wordB_nuance": "Dissipate = fade away slowly by spreading out (Process)"
  },
  "ieltsUpgrade": {
    "basicSentence": "The tension slowly went away.",
    "upgradedSentence": "The tension gradually dissipated.",
    "targetModule": "Writing Task 2 & Speaking Part 3"
  },
  "usageWarning": {
    "rule": "Don't use for solid physical objects like keys or wallets.",
    "wrongSentence": "I dissipated my car keys yesterday.",
    "explanation": "Dissipate is for gases, emotions, heat, or crowds, not solid items.",
    "betterAlternative": "I lost or misplaced my car keys yesterday.",
    "correctSentence": "The thick smoke slowly dissipated through the open window."
  },
  "quickRecap": "DISSIPATE = gradually fade away / become weaker",
  "naturalExamples": [
    { "en": "The thick fog gradually dissipated as the sun rose.", "meaningB1": "The fog slowly disappeared." },
    { "en": "Her anger eventually dissipated after they talked.", "meaningB1": "Her anger slowly became weaker." },
    { "en": "The crowd began to dissipate after the concert.", "meaningB1": "People gradually left the venue." }
  ],
  "example": "The tension between both countries gradually dissipated after bilateral discussions.",
  "synonyms": ["disperse", "fade away", "vanish"],
  "antonyms": ["accumulate", "concentrate", "gather"]
}`;
            const userPrompt = `Analyze the word: "${word}"`;

            const response = await callGeminiAPI(userPrompt, systemPrompt, null, { feature: 'vocab_dict' });
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
                    id: 'vocab_seed_dissipate',
                    word: 'dissipate',
                    pos: 'verb',
                    cefr: 'C1',
                    registerLevel: 'formal',
                    registerLabel: 'Formal Akademik',
                    ieltsSuitability: {
                        status: 'both',
                        badgeText: '🌐 Writing & Speaking OK',
                        badgeColor: 'emerald',
                        description: 'Kosakata C1 presisi tinggi untuk menggambarkan memudarnya gas, emosi, energi, atau ketegangan.'
                    },
                    highYieldContext: '🔥 High-Yield: Sering dipakai di IELTS Writing Task 2 (Topik Lingkungan, Sains, & Konflik)',
                    ieltsTopics: ['health', 'technology', 'social problems', 'environment', 'conflict resolution'],
                    academicStructure: 'The diplomatic tension gradually dissipated following bilateral discussions between both administrations.',
                    registerTrapAlert: null,
                    coreMeaningB1: 'To gradually disappear, spread out, or become weaker until very little is left.',
                    meaningId: 'Menghilang secara bertahap / memudar perlahan hingga habis.',
                    meaningEn: 'To disappear gradually, become weaker, or cause to do so.',
                    visualFlow: '💨 → 🌫️ → ☁️ → nothing',
                    mentalImageExplanation: 'Imagine smoke in the air: it doesn\'t vanish in one second; it spreads out, fades, and dissipates until nothing is left.',
                    collocationMatrix: {
                        starChunk: 'gradually dissipate',
                        verbPlusNoun: ['dissipate heat', 'dissipate tension', 'dissipate energy'],
                        nounPlusVerb: ['fog dissipates', 'anger dissipates', 'tension dissipates']
                    },
                    nuanceCompare: {
                        compareWith: 'disappear',
                        compareNuance: 'Simply no longer be visible or present at all (Result / Instan).',
                        targetNuance: 'Disappear gradually by spreading out or becoming weaker (Process / Bertahap).',
                        compareExample: 'The fog disappeared.',
                        targetExample: 'The fog gradually dissipated as the sun rose.',
                        compareFormula: 'disappear → result',
                        targetFormula: 'dissipate → gradual process',
                        wordA_nuance: 'Disappear = simply no longer visible (The Result / Instan)',
                        wordB_nuance: 'Dissipate = fade away slowly by spreading out (The Process / Bertahap)'
                    },
                    ieltsUpgrade: {
                        basicSentence: 'The tension slowly went away after the meeting.',
                        upgradedSentence: 'The tension gradually dissipated following constructive dialogue.',
                        targetModule: 'Writing Task 2 & Speaking Part 3'
                    },
                    usageWarning: {
                        rule: 'Don\'t use \'dissipate\' for solid physical objects like keys, wallets, or phones.',
                        wrongSentence: 'I dissipated my car keys yesterday.',
                        explanation: 'Dissipate means spreading out or fading away into thin air, not misplacing a solid physical object.',
                        betterAlternative: 'I misplaced my car keys yesterday.',
                        correctSentence: 'The thick cloud of smoke slowly dissipated through the open window.'
                    },
                    quickRecap: 'DISSIPATE = gradually fade away / become weaker',
                    naturalExamples: [
                        { en: 'The thick morning fog gradually dissipated as the sun rose.', meaningB1: 'The fog slowly disappeared.' },
                        { en: 'Her anger eventually dissipated after they apologized.', meaningB1: 'Her anger slowly became weaker.' },
                        { en: 'The crowd began to dissipate once the concert concluded.', meaningB1: 'People gradually walked away.' }
                    ],
                    indonesianGuide: "DIS-i-peit ↘ (DIS: ditekan kuat / stress, i: pendek santai, peit: berima 'pahit')",
                    ipa: '/ˈdɪs.ɪ.peɪt/',
                    example: 'Diplomatic negotiations helped dissipate political tension in the region.',
                    childExplanation: 'Imagine smoke from a candle. It spreads out thin, floats away, and disappears. That is dissipate.',
                    dailyExamples: [
                        'The smell of cooking quickly dissipated through the window.',
                        'Any doubts in the room dissipated after his clear explanation.'
                    ],
                    synonyms: ['disperse', 'fade away', 'evaporate', 'scatter'],
                    antonyms: ['accumulate', 'concentrate', 'gather'],
                    dateAdded: Date.now(),
                    srInterval: 1,
                    srNextReview: Date.now(),
                    srReviewCount: 0,
                    feynmanLevel: 0,
                    feynmanStatus: 'unlearned',
                    feynmanLastExplanation: '',
                    feynmanLastSentence: '',
                    feynmanFeedback: null,
                    consecutiveMasteryCount: 0,
                    status: 'learning'
                },
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
                    ieltsTopics: ['government policy', 'education', 'economics', 'international relations'],
                    academicStructure: 'The government established comprehensive environmental regulations to mitigate industrial pollution.',
                    registerTrapAlert: null,
                    coreMeaningB1: 'To start or build something that is meant to last for a long time; or to prove something is true.',
                    meaningId: 'Mendirikan, membentuk, atau membuktikan kebenaran suatu hal secara permanen.',
                    meaningEn: 'To set up on a firm or permanent basis; to prove or demonstrate.',
                    visualFlow: '🧱 → 🏗️ → 🏛️',
                    mentalImageExplanation: 'Imagine building a brick house with concrete foundations so strong the wind cannot move it.',
                    collocationMatrix: {
                        starChunk: 'establish a system',
                        verbPlusNoun: ['establish rules', 'establish a relationship', 'establish the truth'],
                        nounPlusVerb: ['authorities establish', 'researchers establish']
                    },
                    nuanceCompare: {
                        compareWith: 'build',
                        compareNuance: 'Physical construction of structures using bricks, wood, or stones (Material / Fisik).',
                        targetNuance: 'Setting up formal institutions, lasting rules, relations, or proving truths (Formal / Konseptual).',
                        compareExample: 'They built a new wooden bridge.',
                        targetExample: 'They established a diplomatic relationship.',
                        compareFormula: 'build → physical structure',
                        targetFormula: 'establish → lasting institutional setup',
                        wordA_nuance: 'Build = physical construction (bricks, wood)',
                        wordB_nuance: 'Establish = institutional, formal, or lasting setup (laws, systems, reputation)'
                    },
                    ieltsUpgrade: {
                        basicSentence: 'The government made new rules to stop pollution.',
                        upgradedSentence: 'The government established comprehensive environmental regulations.',
                        targetModule: 'Writing Task 2'
                    },
                    usageWarning: {
                        rule: 'Don\'t use \'establish\' for small, temporary, or informal items.',
                        wrongSentence: 'We established a tent in the backyard for the afternoon.',
                        explanation: 'Establish implies permanent or formal foundations, not temporary pitching of a tent.',
                        betterAlternative: 'We pitched a tent in the backyard for the afternoon.',
                        correctSentence: 'The foundation established a new scholarship program for underprivileged students.'
                    },
                    quickRecap: 'ESTABLISH = start something permanent & lasting',
                    naturalExamples: [
                        { en: 'The university was established in 1950.', meaningB1: 'The school was founded a long time ago.' },
                        { en: 'They quickly established a positive working relationship.', meaningB1: 'They formed a strong connection.' },
                        { en: 'Medical studies established a clear link between diet and health.', meaningB1: 'Scientists proved the relationship.' }
                    ],
                    indonesianGuide: "es-TAB-lisy ↘ (es: seperti 'es batu', TAB: ditekan kuat / stress, lisy: akhiri desis lembut /sh/)",
                    ipa: '/ɪˈstæb.lɪʃ/',
                    example: 'The government sought to establish new environmental standards.',
                    childExplanation: 'Imagine you build a toy castle with super strong blocks so the wind never knocks it down.',
                    dailyExamples: [
                        'They established a nice friendship during their vacation.',
                        'The committee established strict guidelines for the competition.'
                    ],
                    synonyms: ['found', 'institute', 'create', 'set up'],
                    antonyms: ['destroy', 'abolish', 'dismantle'],
                    dateAdded: Date.now() - 86400000 * 2,
                    srInterval: 2,
                    srNextReview: Date.now() + 86400000,
                    srReviewCount: 1,
                    feynmanLevel: 1,
                    feynmanStatus: 'practiced',
                    feynmanLastExplanation: 'Establish artinya membuat sesuatu yang resmi dan tahan lama, seperti aturan atau gedung kampus.',
                    feynmanLastSentence: 'The city established a new recycling policy.',
                    feynmanFeedback: 'Penjelasan analogi sangat baik dan akurat!',
                    consecutiveMasteryCount: 1,
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
                    registerTrapAlert: '⚠️ JEBAKAN REGISTER: Jangan gunakan di percakapan super santai warung kopi. Gunakan "everywhere".',
                    coreMeaningB1: 'Appearing or present everywhere at the same time.',
                    meaningId: 'Ada di mana-mana pada waktu yang sama; sangat lazim ditemui.',
                    meaningEn: 'Present, appearing, or found everywhere.',
                    visualFlow: '📱 📱 📱 → everywhere!',
                    mentalImageExplanation: 'Imagine sunshine or air: no matter which corner you turn, it is right there surrounding you.',
                    collocationMatrix: {
                        starChunk: 'become ubiquitous',
                        verbPlusNoun: ['ubiquitous presence', 'ubiquitous technology', 'ubiquitous access'],
                        nounPlusVerb: ['smartphones are ubiquitous', 'devices become ubiquitous']
                    },
                    nuanceCompare: {
                        compareWith: 'common',
                        wordA_nuance: 'Common = happens often or many people have it (B1 neutral)',
                        wordB_nuance: 'Ubiquitous = literally everywhere you look (C1 dramatic academic)'
                    },
                    ieltsUpgrade: {
                        basicSentence: 'Mobile phones are everywhere in modern life.',
                        upgradedSentence: 'Smartphones have become ubiquitous across all demographics.',
                        targetModule: 'Writing Task 2 & Speaking Part 3'
                    },
                    usageWarning: 'Too formal for casual street banter with friends.',
                    quickRecap: 'UBIQUITOUS = found everywhere • Golden Chunk: become ubiquitous',
                    naturalExamples: [
                        { en: 'Smartphones have become ubiquitous in modern society.', meaningB1: 'Almost everybody carries a phone now.' },
                        { en: 'Plastic waste is ubiquitous in urban environments.', meaningB1: 'Plastic trash can be seen everywhere.' },
                        { en: 'Fast-food chains are now ubiquitous in major cities.', meaningB1: 'Fast food outlets are on almost every street.' }
                    ],
                    indonesianGuide: "yu-BI-kwi-tes ↘ (yu: seperti 'you', BI: ditekan kuat / stress, kwi: seperti 'quick', tes: akhiri vokal santai)",
                    ipa: '/juːˈbɪk.wɪ.təs/',
                    example: 'Smartphones have become ubiquitous in modern society.',
                    childExplanation: 'Imagine fresh air — everywhere you walk or run, it is right there with you.',
                    dailyExamples: [
                        'Coffee shops are ubiquitous in downtown Jakarta.',
                        'Plastic bags are ubiquitous, but we must reduce them.'
                    ],
                    synonyms: ['omnipresent', 'pervasive', 'everywhere', 'universal'],
                    antonyms: ['rare', 'scarce', 'uncommon'],
                    dateAdded: Date.now(),
                    srInterval: 1,
                    srNextReview: Date.now(),
                    srReviewCount: 0,
                    feynmanLevel: 0,
                    feynmanStatus: 'unlearned',
                    feynmanLastExplanation: '',
                    feynmanLastSentence: '',
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
                    coreMeaningB1: 'To make something harmful, painful, or bad less severe or serious.',
                    meaningId: 'Meringankan, meredakan, atau mengurangi keparahan/dampak buruk.',
                    meaningEn: 'Make less severe, serious, or painful.',
                    visualFlow: '🌧️ → 🛡️ → ☀️',
                    mentalImageExplanation: 'Imagine holding up a sturdy umbrella during heavy rain: the rain is still falling, but you mitigate getting soaked.',
                    collocationMatrix: {
                        starChunk: 'mitigate the impact',
                        verbPlusNoun: ['mitigate risks', 'mitigate climate change', 'mitigate the effects'],
                        nounPlusVerb: ['measures mitigate', 'policies mitigate']
                    },
                    nuanceCompare: {
                        compareWith: 'stop',
                        wordA_nuance: 'Stop = end something completely (100% eliminated)',
                        wordB_nuance: 'Mitigate = reduce the severity/damage of something that is already happening'
                    },
                    ieltsUpgrade: {
                        basicSentence: 'We need to make climate change effects smaller.',
                        upgradedSentence: 'Urgent policies are required to mitigate the severe consequences of global warming.',
                        targetModule: 'Writing Task 2'
                    },
                    usageWarning: 'Do not use for positive things (e.g., do not say \'mitigate happiness\'). Only use for negative impacts or risks.',
                    quickRecap: 'MITIGATE = make less severe • Golden Chunk: mitigate the impact',
                    naturalExamples: [
                        { en: 'Planting trees helps mitigate air pollution in the city.', meaningB1: 'Trees reduce the bad effects of dirty air.' },
                        { en: 'Wearing a seatbelt mitigates the risk of serious injury.', meaningB1: 'Seatbelts make dangerous crashes less harmful.' },
                        { en: 'The government introduced subsidies to mitigate poverty.', meaningB1: 'Financial aid helped lessen hardship.' }
                    ],
                    indonesianGuide: "MI-ti-geit ↘ (MI: ditekan kuat / stress, ti: vokal 'i' pendek tajam, geit: berima 'gate/kaget')",
                    ipa: '/ˈmɪt.ɪ.ɡeɪt/',
                    example: 'Renewable energy projects help mitigate the severe impacts of climate change.',
                    childExplanation: 'Imagine you fall and scrape your knee, and your mom puts cool ointment on it so it hurts much less.',
                    dailyExamples: [
                        'Drinking plenty of water helped mitigate his headache.',
                        'Wearing a helmet mitigates the risk of head injury.'
                    ],
                    synonyms: ['alleviate', 'reduce', 'diminish', 'lessen'],
                    antonyms: ['aggravate', 'worsen', 'exacerbate'],
                    dateAdded: Date.now(),
                    srInterval: 1,
                    srNextReview: Date.now(),
                    srReviewCount: 0,
                    feynmanLevel: 0,
                    feynmanStatus: 'unlearned',
                    feynmanLastExplanation: '',
                    feynmanLastSentence: '',
                    feynmanFeedback: null,
                    consecutiveMasteryCount: 0,
                    status: 'learning'
                }            ];

            vocabBank = starterPack;
            saveVocabBank();
            showToast("5 Kosakata IELTS Band 7.5+ berhasil ditambahkan!", "success");
            SoundFX.play('levelup');
        }

        // =========================================================================
        // IeltsGo v6.0 — VOCAB CARD MASTER MODAL ENGINE
        // =========================================================================
        function openVocabCard(vocabId) {
            const vocab = vocabBank.find(v => v.id === vocabId);
            if (!vocab) return;

            currentActiveVocabId = vocabId;

            // Auto-trigger background enrichment if card still has placeholder text
            if (vocab.meaningId && (vocab.meaningId.includes('Menganalisis') || vocab.meaningId.includes('Fokus perbaikan pelafalan') || (vocab.meaningEn && vocab.meaningEn.includes('Key spoken vocabulary')))) {
                enrichVocabCardInBackground(vocab.id, vocab.word);
            }

            // Always switch to Tab 1 (Quick Essence) by default
            switchVocabModalTab('quick');

            // Header Elements
            const wordEl = document.getElementById('vocab-card-word');
            const posEl = document.getElementById('vocab-card-pos');
            const cefrBadge = document.getElementById('vocab-card-cefr');
            const ipaEl = document.getElementById('vocab-card-ipa');

            if (wordEl) wordEl.innerText = vocab.word;
            if (posEl) posEl.innerText = vocab.pos || '';
            if (cefrBadge) {
                cefrBadge.innerText = vocab.cefr || 'B2';
                cefrBadge.className = `text-[10px] font-mono font-bold px-2 py-0.5 rounded border cefr-${(vocab.cefr || 'b2').toLowerCase()}`;
            }
            if (ipaEl) ipaEl.innerText = vocab.ipa || '';

            // Target Accent Badge
            const targetAccentKey = localStorage.getItem('ielts_target_accent') || 'british_rp';
            const accentBadgeNames = {
                'british_rp': '🇬🇧 British RP',
                'general_american': '🇺🇸 General American',
                'australian': '🇦🇺 Australian',
                'neutral_academic': '🌐 Neutral Academic'
            };
            const accentBadgeEl = document.getElementById('vocab-card-accent-badge');
            if (accentBadgeEl) {
                accentBadgeEl.innerText = accentBadgeNames[targetAccentKey] || '🇬🇧 British RP';
            }

            // ================= TAB 1: QUICK ESSENCE =================
            // A. B1 Core Meaning & Indonesian Translation
            const meaningB1El = document.getElementById('vocab-card-meaning-b1');
            const meaningIdEl = document.getElementById('vocab-card-meaning-id');
            if (meaningB1El) {
                meaningB1El.innerText = vocab.coreMeaningB1 || vocab.meaningEn || 'Simple English definition is being prepared...';
            }
            if (meaningIdEl) {
                // User preference: 100% English immersion, no Indonesian translation so learner thinks in English
                meaningIdEl.classList.add('hidden');
                meaningIdEl.innerText = '';
            }

            // B. Mental Image & Visual Flow Emoji
            const visualFlowEl = document.getElementById('vocab-card-visual-flow');
            const childEl = document.getElementById('vocab-card-child-explanation');
            if (visualFlowEl) {
                visualFlowEl.innerText = vocab.visualFlow || '💡 → 🧠 → 🗣️';
            }
            if (childEl) {
                childEl.innerText = vocab.mentalImageExplanation || vocab.childExplanation || `Bayangkan sebuah analogi sederhana untuk ${vocab.word} yang mudah dipahami.`;
            }

            // C. Golden Chunk & Cara Baca Lidah Indonesia
            const goldenChunkEl = document.getElementById('vocab-card-golden-chunk');
            const guideEl = document.getElementById('vocab-card-indonesian-guide');
            const goldenChunkText = vocab.collocationMatrix?.starChunk || vocab.goldenChunk || (vocab.synonyms && vocab.synonyms[0] ? `Chunk: ${vocab.synonyms[0]}` : vocab.word);
            if (goldenChunkEl) {
                goldenChunkEl.innerText = `⭐ ${goldenChunkText}`;
            }
            if (guideEl) {
                guideEl.innerText = vocab.indonesianGuide || vocab.word.toUpperCase();
            }

            // D. Natural Examples (Graduated with Inline B1 Meaning)
            const quickExContainer = document.getElementById('vocab-card-quick-examples');
            if (quickExContainer) {
                if (vocab.naturalExamples && vocab.naturalExamples.length > 0) {
                    quickExContainer.innerHTML = vocab.naturalExamples.map((ex, i) => `
                        <div class="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                            <div class="flex items-start gap-2">
                                <span class="text-[10px] font-mono font-bold text-teal-400 mt-0.5">${i+1}.</span>
                                <span class="text-xs text-slate-100 font-medium">${ex.en || ex}</span>
                            </div>
                            ${ex.meaningB1 ? `<div class="text-[11px] font-mono text-slate-400 pl-4 border-l-2 border-teal-500/30 italic">Meaning: ${ex.meaningB1}</div>` : ''}
                        </div>
                    `).join('');
                } else if (vocab.dailyExamples && vocab.dailyExamples.length > 0) {
                    quickExContainer.innerHTML = vocab.dailyExamples.map((dex, i) => `
                        <div class="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                            <span class="text-[10px] font-mono font-bold text-teal-400 mt-0.5">${i+1}.</span>
                            <span class="text-xs text-slate-100 font-medium">${dex}</span>
                        </div>
                    `).join('');
                } else if (vocab.example) {
                    quickExContainer.innerHTML = `
                        <div class="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                            <span class="text-xs text-slate-200 italic font-medium">${vocab.example}</span>
                        </div>
                    `;
                } else {
                    quickExContainer.innerHTML = `<div class="text-xs text-slate-400 italic">Contoh percakapan alami sedang disiapkan AI...</div>`;
                }
            }

            // E. Quick Recap Formula (Tab 1 Memory Lock)
            const recapBox = document.getElementById('vocab-card-quick-recap-box');
            const recapVisual = document.getElementById('vocab-card-recap-visual');
            const recapText = document.getElementById('vocab-card-quick-recap');
            const recapChunks = document.getElementById('vocab-card-recap-chunks');
            if (recapBox) {
                const wordUpper = (vocab.word || '').toUpperCase();
                const visual = vocab.visualFlow || '💨 → 🌫️ → ☁️ → nothing';

                if (recapVisual) {
                    recapVisual.innerHTML = `<i class="fa-solid fa-brain text-pink-400"></i> <span class="text-slate-300">Visual Flow:</span> <span class="font-bold text-amber-200">${visual}</span>`;
                }
                if (recapText) {
                    if (vocab.quickRecap) {
                        recapText.innerText = `⚡ ${vocab.quickRecap.replace(/^[⚡\s]*/, '')}`;
                    } else {
                        const coreDef = vocab.coreMeaningB1 || vocab.meaningId || 'gradually fade away';
                        recapText.innerText = `⚡ ${wordUpper} = ${coreDef}`;
                    }
                }
                if (recapChunks) {
                    const star = vocab.collocationMatrix?.starChunk || vocab.goldenChunk || '';
                    const vns = vocab.collocationMatrix?.verbPlusNoun || [];
                    const nvs = vocab.collocationMatrix?.nounPlusVerb || [];
                    const allChunks = [star, ...vns, ...nvs].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
                    if (allChunks.length > 0) {
                        recapChunks.innerHTML = `<span class="text-[10px] text-slate-500 dark:text-slate-400 font-bold self-center mr-1">Best Chunks:</span>` +
                            allChunks.map(c => `<span class="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-medium">⭐ ${c}</span>`).join(' ');
                    } else {
                        recapChunks.innerHTML = '';
                    }
                }
            }

            // ================= TAB 2: IELTS DEEP MASTERY =================
            // A. Contrast / Jangan Tertukar (CONDITIONAL SKIPPING: Hidden if null)
            const contrastBox = document.getElementById('vocab-card-contrast-box');
            const contrastTarget = document.getElementById('vocab-card-contrast-target');
            const contrastText = document.getElementById('vocab-card-contrast-text');
            const contrastWordALabel = document.getElementById('vocab-card-contrast-word-a-label');
            const contrastWordADesc = document.getElementById('vocab-card-contrast-word-a-desc');
            const contrastWordAEx = document.getElementById('vocab-card-contrast-word-a-example');
            const contrastWordBLabel = document.getElementById('vocab-card-contrast-word-b-label');
            const contrastWordBDesc = document.getElementById('vocab-card-contrast-word-b-desc');
            const contrastWordBEx = document.getElementById('vocab-card-contrast-word-b-example');
            const contrastFormulaTags = document.getElementById('vocab-card-contrast-formula-tags');

            if (vocab.nuanceCompare && vocab.nuanceCompare.compareWith) {
                if (contrastBox) contrastBox.classList.remove('hidden');
                const compareWithWord = vocab.nuanceCompare.compareWith;
                const targetWord = vocab.word;
                if (contrastTarget) contrastTarget.innerText = `${targetWord} vs ${compareWithWord}`;

                let compareDesc = '';
                let targetDesc = '';
                const rawA = vocab.nuanceCompare.compareNuance || vocab.nuanceCompare.wordA_nuance || '';
                const rawB = vocab.nuanceCompare.targetNuance || vocab.nuanceCompare.wordB_nuance || '';

                const cleanPrefix = (str, word) => {
                    if (!str) return '';
                    const reg = new RegExp(`^\\s*${word}\\s*[:=-]\\s*`, 'i');
                    return str.replace(reg, '').trim();
                };

                const targetRegex = new RegExp(`\\b${targetWord}\\b`, 'i');
                const compareRegex = new RegExp(`\\b${compareWithWord}\\b`, 'i');

                if (rawA && targetRegex.test(rawA.split(/[:=-]/)[0] || '')) {
                    targetDesc = cleanPrefix(rawA, targetWord);
                    compareDesc = cleanPrefix(rawB, compareWithWord);
                } else if (rawB && targetRegex.test(rawB.split(/[:=-]/)[0] || '')) {
                    targetDesc = cleanPrefix(rawB, targetWord);
                    compareDesc = cleanPrefix(rawA, compareWithWord);
                } else {
                    compareDesc = cleanPrefix(rawA, compareWithWord);
                    targetDesc = cleanPrefix(rawB, targetWord);
                }

                if (contrastWordALabel) contrastWordALabel.innerText = `${compareWithWord.toUpperCase()} (Biasa / Umum)`;
                if (contrastWordADesc) contrastWordADesc.innerText = compareDesc || `Penggunaan umum atau hasil yang lebih luas.`;
                if (contrastWordAEx) {
                    if (vocab.nuanceCompare.compareExample) {
                        contrastWordAEx.classList.remove('hidden');
                        contrastWordAEx.innerText = `Contoh: "${vocab.nuanceCompare.compareExample}"`;
                    } else {
                        contrastWordAEx.classList.add('hidden');
                    }
                }

                if (contrastWordBLabel) contrastWordBLabel.innerText = `${targetWord.toUpperCase()} (Spesifik / Akurat)`;
                if (contrastWordBDesc) contrastWordBDesc.innerText = targetDesc || `Penggunaan presisi tingkat tinggi untuk topik spesifik.`;
                if (contrastWordBEx) {
                    if (vocab.nuanceCompare.targetExample) {
                        contrastWordBEx.classList.remove('hidden');
                        contrastWordBEx.innerText = `Contoh: "${vocab.nuanceCompare.targetExample}"`;
                    } else {
                        contrastWordBEx.classList.add('hidden');
                    }
                }

                // Formula tags (e.g. disappear -> result vs dissipate -> gradual process)
                if (contrastFormulaTags) {
                    const formulaA = vocab.nuanceCompare.compareFormula || `${compareWithWord} → Result / Umum`;
                    const formulaB = vocab.nuanceCompare.targetFormula || `${targetWord} → Gradual Process / Spesifik`;
                    contrastFormulaTags.innerHTML = `
                        <span class="px-2.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 font-semibold">${formulaA}</span>
                        <span class="text-slate-400 font-bold text-xs">vs</span>
                        <span class="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-semibold">${formulaB}</span>
                    `;
                }

                if (contrastText) {
                    contrastText.innerHTML = `
                        <div class="text-rose-300 font-medium"><strong>• ${compareWithWord}:</strong> ${compareDesc}</div>
                        <div class="text-emerald-300 font-semibold"><strong>• ${targetWord}:</strong> ${targetDesc}</div>
                    `;
                }
            } else {
                if (contrastBox) contrastBox.classList.add('hidden');
            }

            // B. Full Collocations Matrix
            const collocVerbNoun = document.getElementById('vocab-card-colloc-verb-noun');
            const collocNounVerb = document.getElementById('vocab-card-colloc-noun-verb');
            if (vocab.collocationMatrix) {
                if (collocVerbNoun) {
                    const vn = vocab.collocationMatrix.verbPlusNoun || [];
                    collocVerbNoun.innerHTML = vn.length > 0 ? vn.map(c => `<span class="text-xs font-mono bg-indigo-50/70 dark:bg-slate-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30 font-medium">${c}</span>`).join('') : `<span class="text-xs text-slate-500 font-mono">-</span>`;
                }
                if (collocNounVerb) {
                    const nv = vocab.collocationMatrix.nounPlusVerb || [];
                    collocNounVerb.innerHTML = nv.length > 0 ? nv.map(c => `<span class="text-xs font-mono bg-indigo-50/70 dark:bg-slate-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30 font-medium">${c}</span>`).join('') : `<span class="text-xs text-slate-500 font-mono">-</span>`;
                }
            } else {
                if (collocVerbNoun) {
                    collocVerbNoun.innerHTML = (vocab.synonyms || []).slice(0, 2).map(s => `<span class="text-xs font-mono bg-indigo-50/70 dark:bg-slate-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">${s}</span>`).join('') || '<span class="text-xs text-slate-500 font-mono">-</span>';
                }
                if (collocNounVerb) {
                    collocNounVerb.innerHTML = (vocab.synonyms || []).slice(2, 4).map(s => `<span class="text-xs font-mono bg-indigo-50/70 dark:bg-slate-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">${s}</span>`).join('') || '<span class="text-xs text-slate-500 font-mono">-</span>';
                }
            }

            // C. Band 7.5+ IELTS Sentence Upgrade (CONDITIONAL SKIPPING: Hidden if null)
            const upgradeBox = document.getElementById('vocab-card-upgrade-box');
            const upgradeModule = document.getElementById('vocab-card-upgrade-module');
            const upgradeBasic = document.getElementById('vocab-card-upgrade-basic');
            const upgradeAdvanced = document.getElementById('vocab-card-upgrade-advanced');
            if (vocab.ieltsUpgrade && vocab.ieltsUpgrade.upgradedSentence) {
                if (upgradeBox) upgradeBox.classList.remove('hidden');
                if (upgradeModule) upgradeModule.innerText = vocab.ieltsUpgrade.targetModule || 'Writing Task 2';
                if (upgradeBasic) upgradeBasic.innerText = vocab.ieltsUpgrade.basicSentence || '';
                if (upgradeAdvanced) upgradeAdvanced.innerText = vocab.ieltsUpgrade.upgradedSentence || '';
            } else {
                if (upgradeBox) upgradeBox.classList.add('hidden');
            }

            // D. Usage Warning & Register Trap (CONDITIONAL SKIPPING: Hidden if null)
            const usageWarningBox = document.getElementById('vocab-card-usage-warning-box');
            const usageWarningText = document.getElementById('vocab-card-usage-warning-text');
            const warningComparison = document.getElementById('vocab-card-warning-comparison');
            const warnWrongSentence = document.getElementById('vocab-card-warn-wrong-sentence');
            const warnWrongReason = document.getElementById('vocab-card-warn-wrong-reason');
            const warnBetterSentence = document.getElementById('vocab-card-warn-better-sentence');
            const warnCorrectSentence = document.getElementById('vocab-card-warn-correct-sentence');

            const warningMsg = vocab.usageWarning || vocab.registerTrapAlert;
            if (warningMsg) {
                if (usageWarningBox) usageWarningBox.classList.remove('hidden');

                if (typeof warningMsg === 'object' && warningMsg.wrongSentence) {
                    if (usageWarningText) usageWarningText.innerText = warningMsg.rule || warningMsg.warning || 'Perhatikan batasan penggunaan kata ini dalam konteks formal:';
                    if (warningComparison) warningComparison.classList.remove('hidden');
                    if (warnWrongSentence) warnWrongSentence.innerText = warningMsg.wrongSentence;
                    if (warnWrongReason) warnWrongReason.innerText = warningMsg.explanation ? `(Alasan: ${warningMsg.explanation})` : '';
                    if (warnBetterSentence) warnBetterSentence.innerText = warningMsg.betterAlternative || '';
                    if (warnCorrectSentence) warnCorrectSentence.innerText = warningMsg.correctSentence || '';
                } else {
                    if (usageWarningText) usageWarningText.innerText = typeof warningMsg === 'string' ? warningMsg : JSON.stringify(warningMsg);
                    if (warningComparison) warningComparison.classList.add('hidden');
                }
            } else {
                if (usageWarningBox) usageWarningBox.classList.add('hidden');
            }

            // E. Register Badges & High-Yield Themes
            const regBadge = document.getElementById('vocab-badge-register');
            const ieltsBadge = document.getElementById('vocab-badge-ielts');
            const regDesc = document.getElementById('vocab-card-register-desc');
            const highYieldBox = document.getElementById('vocab-card-high-yield-box');
            const highYieldText = document.getElementById('vocab-card-high-yield-text');
            const highYieldTopics = document.getElementById('vocab-card-high-yield-topics');
            const highYieldStructure = document.getElementById('vocab-card-high-yield-structure');
            const academicStructureText = document.getElementById('vocab-card-academic-structure-text');

            const regLabel = vocab.registerLabel || (vocab.registerLevel === 'casual' ? '🔴 Casual / Santai' : (vocab.registerLevel === 'semi_formal' ? '🟡 Agak Formal / Netral' : (vocab.registerLevel === 'written_academic' ? '🟣 Tulisan Resmi' : '🟢 Formal Akademik')));
            if (regBadge) {
                regBadge.innerText = regLabel;
                regBadge.className = "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full " + (vocab.registerLevel === 'casual' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : (vocab.registerLevel === 'semi_formal' ? 'bg-sky-950 text-sky-300 border border-sky-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'));
            }

            const ieltsInfo = vocab.ieltsSuitability || {
                status: 'both',
                badgeText: '🌐 Writing & Speaking OK',
                description: 'Aman dan direkomendasikan untuk IELTS Writing Task 2 dan Speaking.'
            };
            if (ieltsBadge) {
                ieltsBadge.innerText = ieltsInfo.badgeText || '🌐 Writing & Speaking OK';
                ieltsBadge.className = "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40";
            }
            if (regDesc) {
                regDesc.innerText = ieltsInfo.description || 'Kosa kata berkualitas untuk meningkatkan Lexical Resource.';
            }

            if (highYieldBox && highYieldText) {
                if (vocab.highYieldContext || vocab.ieltsTopics || vocab.academicStructure) {
                    highYieldBox.classList.remove('hidden');

                    if (highYieldTopics) {
                        let topics = [];
                        if (Array.isArray(vocab.ieltsTopics) && vocab.ieltsTopics.length > 0) {
                            topics = vocab.ieltsTopics;
                        } else if (typeof vocab.highYieldContext === 'string') {
                            const cleaned = vocab.highYieldContext.replace(/^[🔥\s]*High-Yield:?[^:]*:\s*/i, '').replace(/\([^)]*\)/g, '');
                            if (cleaned.includes(',')) {
                                topics = cleaned.split(',').map(t => t.trim().replace(/^&\s*/, '')).filter(Boolean);
                            }
                        }
                        if (topics.length > 0) {
                            highYieldTopics.classList.remove('hidden');
                            highYieldTopics.innerHTML = topics.map(t => `<span class="bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold">📌 ${t.replace(/^&\s*/, '')}</span>`).join('');
                        } else {
                            highYieldTopics.classList.add('hidden');
                        }
                    }

                    // Avoid duplicate string display when badges are already present
                    if (highYieldTopics && !highYieldTopics.classList.contains('hidden') && highYieldTopics.children.length > 0) {
                        highYieldText.classList.add('hidden');
                    } else {
                        highYieldText.classList.remove('hidden');
                        highYieldText.innerText = typeof vocab.highYieldContext === 'string' ? vocab.highYieldContext : 'Sangat berguna untuk IELTS Writing Task 2 pada topik-topik relevan.';
                    }

                    if (highYieldStructure && academicStructureText) {
                        const structure = vocab.academicStructure || (vocab.ieltsUpgrade && vocab.ieltsUpgrade.upgradedSentence ? `"${vocab.ieltsUpgrade.upgradedSentence}"` : null);
                        if (structure) {
                            highYieldStructure.classList.remove('hidden');
                            academicStructureText.innerText = structure;
                        } else {
                            highYieldStructure.classList.add('hidden');
                        }
                    }
                } else {
                    highYieldBox.classList.add('hidden');
                    highYieldText.innerText = '';
                }
            }

            // F. Synonyms & Antonyms in Essence Tab
            const synContainer = document.getElementById('vocab-card-synonyms');
            if (synContainer) {
                if (vocab.synonyms && vocab.synonyms.length > 0) {
                    synContainer.innerHTML = vocab.synonyms.map(s => 
                        `<span class="text-xs font-mono bg-indigo-50 dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20 font-medium">${s}</span>`
                    ).join('');
                } else {
                    synContainer.innerHTML = `<span class="text-xs text-slate-500 font-mono">-</span>`;
                }
            }

            const antContainer = document.getElementById('vocab-card-antonyms');
            if (antContainer) {
                if (vocab.antonyms && vocab.antonyms.length > 0) {
                    antContainer.innerHTML = vocab.antonyms.map(a => 
                        `<span class="text-xs font-mono bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 rounded-lg border border-rose-200 dark:border-rose-500/30 font-medium">${a}</span>`
                    ).join('');
                } else {
                    antContainer.innerHTML = `<span class="text-xs text-slate-500 font-mono">-</span>`;
                }
            }

            // G. Audio & Pronunciation States Reset
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

            // ================= FIXED BOTTOM: PRACTICE HUB (FEYNMAN LAB) =================
            const feynmanBadge = document.getElementById('vocab-feynman-status-badge');
            if (feynmanBadge) {
                const now = Date.now();
                const isMastered = vocab.status === 'mastered' || (vocab.feynmanLevel && vocab.feynmanLevel >= 5);
                const isUnlearned = !isMastered && (!vocab.feynmanLevel || vocab.feynmanLevel === 0);
                const isDue = !isMastered && (vocab.srNextReview || 0) <= now + 3600000;
                const daysLeft = Math.max(1, Math.ceil(((vocab.srNextReview || now) - now) / (1000 * 60 * 60 * 24)));

                if (isMastered) {
                    feynmanBadge.innerHTML = `<span class="text-[10px] bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-500/50 font-mono font-bold"><i class="fa-solid fa-crown mr-1 text-amber-500"></i> 🏆 Bebas Review Selamanya</span>`;
                } else if (isUnlearned) {
                    feynmanBadge.innerHTML = `<span class="text-[10px] bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-500/40 font-mono font-bold animate-pulse"><i class="fa-solid fa-triangle-exclamation mr-1"></i> 🔴 Belum Dipelajari</span>`;
                } else if (isDue) {
                    feynmanBadge.innerHTML = `<span class="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-500/40 font-mono font-bold review-due-pulse"><i class="fa-solid fa-clock-rotate-left mr-1"></i> 🟡 Jatuh Tempo Review Hari Ini</span>`;
                } else {
                    feynmanBadge.innerHTML = `<span class="text-[10px] bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/40 font-mono font-bold"><i class="fa-solid fa-circle-check mr-1"></i> 🟢 Dikuasai (Lv.${vocab.feynmanLevel || 1}/4) • Review: ${daysLeft} hr lagi</span>`;
                }
            }

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

            // Mastered Button State
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
                vocab.coreMeaningB1 = analysis.coreMeaningB1 || analysis.meaningEn || vocab.coreMeaningB1;
                vocab.visualFlow = analysis.visualFlow || vocab.visualFlow || '💡 → 🧠 → 🗣️';
                vocab.mentalImageExplanation = analysis.mentalImageExplanation || analysis.childExplanation || vocab.mentalImageExplanation;
                vocab.childExplanation = analysis.mentalImageExplanation || analysis.childExplanation || vocab.childExplanation;
                vocab.collocationMatrix = analysis.collocationMatrix || vocab.collocationMatrix;
                vocab.nuanceCompare = analysis.nuanceCompare !== undefined ? analysis.nuanceCompare : vocab.nuanceCompare;
                vocab.ieltsUpgrade = analysis.ieltsUpgrade !== undefined ? analysis.ieltsUpgrade : vocab.ieltsUpgrade;
                vocab.usageWarning = analysis.usageWarning !== undefined ? analysis.usageWarning : vocab.usageWarning;
                vocab.quickRecap = analysis.quickRecap || vocab.quickRecap;
                vocab.naturalExamples = analysis.naturalExamples || vocab.naturalExamples;
                vocab.synonyms = analysis.synonyms || vocab.synonyms;
                vocab.antonyms = analysis.antonyms || vocab.antonyms || [];
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
        // IeltsGo v7.3 — DIRECT GEMINI AI AUDIO PHONETIC & PRONUNCIATION COACH (CLEAR B1 ENGLISH)
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

            const systemPrompt = `You are a direct, honest, and supportive AI Pronunciation & Phonetic Coach for English vocabulary learners. All explanations, coaching advice, and phonetic tips MUST be written strictly in clear, accessible B1-level English (simple, friendly, and easy to understand).

Your top priority: HONESTY & ACCURACY, not sounding overly academic or strict.
It is far better to be simple and accurate than overly technical and fabricated.

Task: Evaluate the pronunciation of ONE TARGET WORD: "${vocab.word}"

Target Word Data:
- Word: "${vocab.word}"
- Official IPA: ${vocab.ipa || '-'}
- Pronunciation Guide: ${vocab.indonesianGuide || '-'}
- Target Accent: ${targetAccent}

============================================
🚨 RULE #1 — CHECK AUDIO QUALITY FIRST
============================================
If audio is silent, background noise dominates, or speech is too faint to hear clearly:
- Score: 0%
- Write: "[Audio not clearly detected. Please record closer to the microphone.]"
- STOP, do not proceed to other sections.

============================================
🚨 RULE #2 — LIMITS OF YOUR ABILITY (STRICTLY OBSERVE)
============================================
You do NOT measure acoustic signals literally (formants, spectrograms, vocal cord frequencies). You evaluate based on general audible sound patterns.

Therefore:
- Your score is a REALISTIC ESTIMATE, not a precision measurement.
- ROUND the score to the nearest multiple of 5 (e.g. 55%, 70%, 85% — NOT 73% or 84%).
  This is important so the score does not suggest false precision.
- USE THIS SCALE CONSISTENTLY every time you evaluate:
  * 90-100%: No audible errors heard. Native-like clarity.
  * 75-89%: Understood very clearly. 1-2 minor details (stress/vowel nuance) can be polished, but do NOT impede comprehension.
  * 55-74%: Word is recognizable, but has noticeable errors (incorrect stress, dropped consonant, distorted vowel) making it sound unnatural.
  * 30-54%: Word is difficult to recognize without context. Significant errors (missing syllables, scrambled sounds).
  * 0-29%: Word is barely recognizable as the target word, or audio is unintelligible.
  Use these descriptions as an ANCHOR.
- DO NOT provide an "IELTS Speaking Band Prediction" from an isolated word.
- If you are unsure about fine details, say "not clearly audible in this recording" — do NOT invent fake technical details.

============================================
🚨 RULE #3 — OUTPUT DEPTH FOLLOWS SCORE (3 TIERS)
============================================
Adapt output length to the actual issues heard:
- If score 90-100%: brief praise + score.
  No "Areas to Improve" section needed — no real audible errors exist.
- If score 75-89%: pronunciation is already VERY GOOD and clear, BUT
  provide 1 subtle note in "Fine-Tuning" (not "Areas to Improve" — keep an encouraging, appreciative tone). Explain the specific detail that separates this from 90-100%, giving the learner a concrete target.
- If score <75%: SHOW ALL issues heard, but RANK by PRIORITY —
  from what MOST affects clarity/comprehension to minor slips.
  - Do NOT list trivial cosmetic issues just to make the list long.
  - Label priority (Priority 1, 2, 3).
  - Maximum 3 points.

============================================
FORMAT OUTPUT (Markdown, Simple B1 English)
Write all explanations, coaching advice, and phonetic tips in simple, clear, friendly B1-level English.
============================================

### Score
**[Score rounded to multiple of 5]%** — [1 short sentence in simple B1 English: what this score means]

### Fine-Tuning (only if score is 75-89%)
[1 gentle, encouraging, and specific tip in simple B1 English: what detail separates this from 90-100%.]

### Areas to Improve (only if score <75%)
Ranked by importance. Maximum 3 points in simple B1 English.

1. **[Priority 1 — main issue affecting clarity]**
   [1-2 sentences: what happened and how to fix it in simple B1 English]

2. **[Priority 2 — if any]**
   [1-2 sentences]

3. **[Priority 3 — if significant]**
   [1-2 sentences]

### How to Pronounce
**Official IPA**: \`${vocab.ipa || '-'}\` — [key vowel or consonant sound to focus on]

**Simple English Word Matches** (common everyday words with identical sound):
For each key sound that is important or commonly mispronounced, provide 1 VERY COMMON everyday English word that shares the exact same sound in that part.
Example: "The short 'i' sound in the first syllable sounds like 'it' or 'sit' — not like 'ee' in 'eat'."
- ONLY use extremely common, widely known words (get, see, it, so, cat, book, run, etc.) as reference words.
- Prioritize sounds that are easily mispronounced.

**Phonetic Guide** (capital letters = stressed syllable):
**[Transliteration with CAPS for stressed syllables]**
Example: es-TAB-lish (not ES-tab-lish)

### Practice Drill
\`[Say 3x]: [word]-[word]-[word]\`

============================================
INTERNAL MANDATE (do not display to user)
============================================
Write all explanations and feedback strictly in simple, clear B1-level English.
============================================
Remember: the goal of this system is to help the learner improve, not impress them with technical jargon. An honest score + clearly ranked issues > fake precision + long lists of fabricated flaws.`;

            try {
                const userQuery = `Listen to my voice recording pronouncing the word "${vocab.word}". Provide an honest, accurate phonetic evaluation, a score rounded to the nearest 5%, fine-tuning tips or prioritized areas to improve, and simple English word matches according to your instructions. Write all feedback in clear, simple B1 English.`;
                const response = await callGeminiAPI(userQuery, systemPrompt, vocabAudioBlob, { feature: 'pron_coach' });

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

            // 1.5 Extract Heard Word Transkripsi
            let heardWord = '';
            let isWordMatch = true;
            const heardMatch = raw.match(/###\s*Kata yang Terdengar[\s\S]*?\n\**["“']?([^"”'\n\*\—]+)["”']?\**([\s\S]*?)(?=\n###|\n\n|$)/i);
            if (heardMatch && heardMatch[1]) {
                heardWord = heardMatch[1].trim();
                const matchTag = (heardMatch[2] || '').toLowerCase();
                if (matchTag.includes('berbeda') || matchTag.includes('tidak sesuai') || matchTag.includes('salah')) {
                    isWordMatch = false;
                }
            }
            if (raw.toLowerCase().includes('kata salah') || raw.toLowerCase().includes('tidak sesuai target') || raw.toLowerCase().includes('bukan kata target')) {
                isWordMatch = false;
            }

            // 2. Extract Score & Summary
            let score = 70;
            const scoreMatch = raw.match(/\*\*(\d+)%\*\*/i) || raw.match(/(\d+)%/);
            if (scoreMatch) {
                score = parseInt(scoreMatch[1], 10);
            }

            // Extract Score Summary Sentence
            let scoreSummary = "Pelafalan telah didiagnosis oleh AI.";
            const scoreLineMatch = raw.match(/###\s*(?:Score|Skor)[\s\S]*?\n\*\*.*?\*\*[\s—\-]*(.*?)(?=\n###|\n\n|$)/i);
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
                if (!isWordMatch || score <= 20) {
                    tierBadge = `<span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/50 flex items-center gap-1 animate-pulse"><i class="fa-solid fa-triangle-exclamation text-rose-400"></i> ❌ Kata Tidak Sesuai Target</span>`;
                } else {
                    tierBadge = `<span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center gap-1"><i class="fa-solid fa-circle-xmark text-rose-400"></i> 🚨 Sulit Dikenali (Drill Ulang)</span>`;
                }
                themeBorder = 'border-rose-500/50';
                themeBg = 'from-rose-950/30 via-slate-900 to-slate-950';
                scoreTextCol = 'text-rose-400';
                progressCol = 'bg-rose-500';
            }

            // 3. Extract "Yang Perlu Disempurnakan" (75-89%) or "Yang Perlu Diperbaiki" (<75%)
            let polishHtml = '';
            const polishMatch = raw.match(/###\s*(?:Fine-Tuning|Yang Perlu Disempurnakan)([\s\S]*?)(?=###|$)/i);
            if (polishMatch && polishMatch[1] && polishMatch[1].trim() && !polishMatch[1].includes('skip') && !polishMatch[1].includes('hanya jika')) {
                const polishText = polishMatch[1].trim().replace(/^\s*[\-\*]\s*/gim, '');
                if (polishText) {
                    polishHtml = `
                        <div class="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-1.5 shadow-sm">
                            <div class="text-[11px] font-mono font-bold text-sky-400 uppercase flex items-center gap-1.5">
                                <i class="fa-solid fa-wand-magic-sparkles"></i> Fine-Tuning Towards 90%+:
                            </div>
                            <div class="text-xs text-sky-100 font-sans leading-relaxed pl-1">
                                ${renderMiniChatMarkdown(polishText)}
                            </div>
                        </div>
                    `;
                }
            }

            let issuesHtml = '';
            const fixMatch = raw.match(/###\s*(?:Areas to Improve|Yang Perlu Diperbaiki)([\s\S]*?)(?=###|$)/i);
            if (fixMatch && fixMatch[1] && fixMatch[1].trim() && !fixMatch[1].includes('skip') && !fixMatch[1].includes('hanya jika')) {
                const fixText = fixMatch[1].trim();
                // Split by numbered items: 1., 2., 3.
                const items = fixText.split(/\n(?=\d+\.\s+)/);
                if (items && items.length > 0) {
                    const parsedItems = items.map(item => {
                        const cleanItem = item.trim();
                        if (!cleanItem || cleanItem.includes('hanya jika')) return '';
                        
                        // Extract Title and Content
                        const titleMatch = cleanItem.match(/^\d+\.\s*\**\[?((?:Prioritas|Priority)\s*\d+[^\]\n\*]*)\]?\**\s*([\s\S]*)/i);
                        let pLabel = 'Priority Improvement';
                        let pContent = cleanItem;
                        let pBadgeColor = 'bg-amber-950 text-amber-300 border-amber-500/40';

                        if (titleMatch) {
                            pLabel = titleMatch[1].replace(/[\*\[\]]/g, '').trim();
                            pContent = titleMatch[2].trim();
                        }

                        if (pLabel.includes('Prioritas 1') || pLabel.includes('Priority 1') || pLabel.includes('1')) {
                            pBadgeColor = 'bg-rose-950/90 text-rose-300 border-rose-500/50';
                        } else if (pLabel.includes('Prioritas 2') || pLabel.includes('Priority 2') || pLabel.includes('2')) {
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
                                    <i class="fa-solid fa-list-check"></i> Priority Improvement Checklist:
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

            const caraMembacaMatch = raw.match(/###\s*(?:How to Pronounce|Cara Membaca)([\s\S]*?)(?=###|$)/i);
            if (caraMembacaMatch && caraMembacaMatch[1]) {
                const cmSection = caraMembacaMatch[1];
                
                // Extract IPA line
                const ipaLineMatch = cmSection.match(/\*\*(?:Official\s*IPA|IPA\s*Resmi)\*\*\s*:\s*`?([^`\n]+)`?/i);
                if (ipaLineMatch && ipaLineMatch[1]) {
                    ipaText = ipaLineMatch[1].trim();
                }

                // Extract Indonesian Transliteration
                const indoMatch = cmSection.match(/\*\*(?:Phonetic\s*Guide|Versi\s*Lidah\s*Indonesia)\*\*[\s\S]*?:\s*\n*([\s\S]*?)(?=\n\n|\n###|$)/i);
                if (indoMatch && indoMatch[1]) {
                    indonesianGuideText = indoMatch[1].trim();
                }

                // Extract Anchor Words list
                const anchorMatch = cmSection.match(/\*\*(?:Simple\s*English\s*Word\s*Matches|Padanan\s*Kata\s*Inggris\s*Simpel)\*\*[\s\S]*?:\s*\n*([\s\S]*?)(?=\*\*|\n###|$)/i);
                if (anchorMatch && anchorMatch[1]) {
                    const rawAnchorLines = anchorMatch[1].trim().split('\n').map(l => l.trim()).filter(Boolean);
                    const parsedAnchorPills = rawAnchorLines.map(line => {
                        let cleanLine = line.replace(/^[\-\*\o\•\d\.]+\s*/, '').trim();
                        if (!cleanLine || cleanLine.includes('HANYA pakai') || cleanLine.includes('Ini prioritaskan')) return '';

                        // Step 1: Replace all English comparison words in **"word"**, **word**, "word", or 'word' with chip tokens
                        cleanLine = cleanLine.replace(/\*\*["']?([a-zA-Z]{2,})["']?\*\*/g, (m, word) => `###CHIP_${word}###`);
                        cleanLine = cleanLine.replace(/["']([a-zA-Z]{2,})["']/g, (m, word) => `###CHIP_${word}###`);

                        // Step 2: Render remaining markdown bold & italics cleanly
                        cleanLine = cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800 dark:text-slate-100 font-bold">$1</strong>');
                        cleanLine = cleanLine.replace(/\*(.*?)\*/g, '<em class="text-slate-600 dark:text-slate-300">$1</em>');

                        // Step 3: Replace tokens with interactive audio button chips
                        cleanLine = cleanLine.replace(/###CHIP_([a-zA-Z]{2,})###/g, (m, word) => {
                            return `<button type="button" onclick="event.stopPropagation(); speakWord('${word}', '${accentLang}')" class="px-2.5 py-0.5 mx-1 rounded-lg bg-sky-100 dark:bg-sky-950/80 hover:bg-sky-200 dark:hover:bg-sky-800 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-500/50 text-xs font-mono font-bold inline-flex items-center gap-1.5 align-middle transition-transform active:scale-95 shadow-sm cursor-pointer" title="Dengarkan pelafalan kata '${word}'"><i class="fa-solid fa-volume-high text-[10px] text-sky-600 dark:text-sky-400"></i><span>"${word}"</span></button>`;
                        });

                        return `
                            <div class="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                                <i class="fa-solid fa-circle-check text-cyan-600 dark:text-cyan-400 mt-1 text-[10px]"></i>
                                <div class="flex-1">${cleanLine}</div>
                            </div>
                        `;
                    }).filter(Boolean).join('');

                    if (parsedAnchorPills) {
                        anchorWordsHtml = `
                            <div class="space-y-1.5 pt-1">
                                <div class="text-[11px] font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                                    <i class="fa-solid fa-anchor"></i> Simple English Word Matches (Click Chip to Listen):
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
                    <!-- 0. Heard Word Ear Transkripsi Verification Banner -->
                    ${heardWord ? `
                    <div class="p-3 rounded-2xl bg-slate-950 border ${isWordMatch ? 'border-emerald-500/30' : 'border-rose-500/50 bg-rose-950/20'} flex items-center justify-between flex-wrap gap-2 text-xs font-mono shadow-sm">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-ear-listen ${isWordMatch ? 'text-emerald-400' : 'text-rose-400'} text-sm"></i>
                            <span class="text-slate-400">Kata Terdengar:</span>
                            <span class="font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700">${heardWord}</span>
                        </div>
                        <span class="text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${isWordMatch ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-rose-950 text-rose-300 border-rose-500/50'}">
                            ${isWordMatch ? '✅ Sesuai Target' : '❌ Kata Berbeda / Salah'}
                        </span>
                    </div>
                    ` : ''}

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
                                <i class="fa-solid fa-book-open"></i> Accurate Pronunciation Blueprint:
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
        
        // Generate High-Yield B1 Pedagogy Study Prompt (Cognitive Methodology)
        function generatePedagogyStudyPrompt(vocab) {
            return `I am an English learner around B1 level preparing for everyday English, academic English, and IELTS.
Teach me the word "${vocab.word}" using this exact cognitive method:

# ${vocab.word.toUpperCase()} (${vocab.pos || 'word'} - CEFR: ${vocab.cefr || 'B2'})

### 🎯 Core meaning
Give me the simplest and clearest meaning in B1-level English. Do NOT begin with complicated dictionary jargon. Keep it direct and accessible.

### 🧠 Mental image
Give me a simple visual idea, tangible everyday analogy (grounded in physical objects), or memory trick that helps me remember the core meaning.

### 💬 Natural examples
Give me 3–5 natural examples: start with simple everyday situations and include 1 academic / Band 7.5+ IELTS-style sentence. For every example, briefly explain what the sentence means in simple English. Highlight new high-yield vocabulary using [VOCAB: word] tags.

### 🔗 Common patterns & collocations
Teach me the 3-5 most useful combinations with this word (e.g. word + noun, verb + word, preposition patterns) that native speakers actually use.

### ⚖️ Compare (if applicable)
If the word is commonly confused with another word (e.g., affect vs impair, dissipate vs disappear, increase vs influx), compare them clearly in simple English with a short example for each. If not, skip this section.

### 🚫 Usage warning
Tell me about important situations where I should NOT use this word or common learner mistakes.

### 📚 IELTS usefulness
Tell me briefly whether the word is useful for IELTS (Writing Task 1/2 or Speaking Part 1/2/3) and provide 1 natural Band 7.5+ IELTS sentence with clear linguistic rationale.

### ⭐ Quick recap
${vocab.word.toUpperCase()} = simple meaning • 2-3 most important chunks to remember.

### 🎯 Active recall
End with a short exercise (fill-in-the-blank or choose between two words) that makes me USE or REMEMBER the word right now.`;
        }

        // Direct Redirect & Copy to ChatGPT, Claude, or Gemini
        function openExternalAI(platform) {
            const vocab = vocabBank.find(v => v.id === currentActiveVocabId);
            if (!vocab) { showToast("Tidak ada kata aktif yang terbuka.", "error"); return; }

            const promptText = generatePedagogyStudyPrompt(vocab);

            navigator.clipboard.writeText(promptText).then(() => {
                let url = '';
                let platformName = '';
                if (platform === 'chatgpt') {
                    platformName = 'ChatGPT';
                    url = 'https://chatgpt.com/';
                } else if (platform === 'claude') {
                    platformName = 'Claude AI';
                    url = 'https://claude.ai/new';
                } else if (platform === 'gemini') {
                    platformName = 'Google Gemini';
                    url = 'https://gemini.google.com/app';
                }

                if (url) {
                    window.open(url, '_blank');
                    showToast(`Prompt "${vocab.word}" disalin! Silakan Paste (Ctrl+V) di ${platformName}.`, "success");
                } else {
                    showToast(`Prompt belajar "${vocab.word}" berhasil disalin ke clipboard!`, "success");
                }
                SoundFX.play('click');
            }).catch(() => {
                showToast("Gagal menyalin prompt ke clipboard.", "error");
            });
        }

        function copyVocabStudyPrompt() {
            const vocab = vocabBank.find(v => v.id === currentActiveVocabId);
            if (!vocab) { showToast("Tidak ada kata yang terbuka.", "error"); return; }

            const prompt = generatePedagogyStudyPrompt(vocab);

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
  "statusLabel": "Mastered (Clear & Accurate)" | "Partially Mastered (Needs Polish)" | "Misconception / Structural Error",
  "meaningCritique": "1-2 clear, helpful feedback sentences in simple B1 English.",
  "sentenceCritique": "1-2 clear grammar, part-of-speech, and collocation feedback sentences in simple B1 English.",
  "grammarErrors": ["Specific spelling or syntax corrections if any, in simple B1 English"],
  "syntaxFormulas": [
    "[Subject] + make an impertinent remark / comment",
    "It is impertinent of [Someone] to + [Verb]"
  ],
  "upgradedSentence": "Band 7.5+ exemplary upgraded sentence naturally elevating the student's thought.",
  "srsDays": 4
}`;

            try {
                const userPrompt = `Evaluate my conceptual understanding and practice sentence for the word "${vocab.word}".
Meaning/Analogy: "${explanation}"
Practice Sentence: "${sentence}"`;

                const response = await callGeminiAPI(userPrompt, systemPrompt, null, { feature: 'feynman_recall' });
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
                    <div class="space-y-1.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40">
                        <div class="text-[11px] font-mono font-bold text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1.5">
                            <i class="fa-solid fa-spell-check"></i> Koreksi Ejaan & Struktur Gramatika:
                        </div>
                        <div class="space-y-1 pl-1">
                            ${feedback.grammarErrors.map(err => `
                                <div class="text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2 font-medium">
                                    <i class="fa-solid fa-xmark text-rose-600 dark:text-rose-400 mt-0.5 text-[10px]"></i>
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
                    <div class="space-y-1.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/40">
                        <div class="text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-400 uppercase flex items-center gap-1.5">
                            <i class="fa-solid fa-graduation-cap"></i> Formula Sintaks Standar IELTS (Band 7.5+):
                        </div>
                        <div class="space-y-1.5 pt-0.5">
                            ${feedback.syntaxFormulas.map((f, i) => `
                                <div class="flex items-start gap-2 bg-white dark:bg-slate-950/90 p-2 rounded-lg border border-indigo-200 dark:border-indigo-500/20 font-mono text-xs text-slate-800 dark:text-indigo-200">
                                    <span class="text-indigo-600 dark:text-indigo-400 font-bold">${i+1}.</span>
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
                    <div class="space-y-1.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/40">
                        <div class="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase flex items-center justify-between flex-wrap gap-2">
                            <span class="flex items-center gap-1.5"><i class="fa-solid fa-sparkles"></i> Model Kalimat IELTS (Band 7.5+ Upgrade):</span>
                            <button onclick="speakWord('${feedback.upgradedSentence.replace(/'/g, "\\'")}', 'en-GB')" class="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/80 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-mono font-bold flex items-center gap-1 shadow-sm border border-emerald-300 dark:border-emerald-500/40 cursor-pointer" title="Dengarkan pelafalan kalimat ini">
                                <i class="fa-solid fa-volume-high text-[10px]"></i> Dengar
                            </button>
                        </div>
                        <div class="text-xs text-slate-900 dark:text-emerald-100 font-sans leading-relaxed italic pl-1 border-l-2 border-emerald-500 font-medium">
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

Design 1 sharp, creative challenge in clear, simple B1 English.
Examples of great challenge formats:
- "Write 1 strong IELTS Speaking Part 3 or Writing Task 2 sentence comparing two contrasting situations using the word '${vocab.word}' accurately!"
- "Perbaiki kalimat rancu berikut agar bernuansa akademik Band 7.5+ dengan menyisipkan kata '${vocab.word}': [berikan 1 kalimat rancu relevan]."

Keep the prompt instruction concise (1-2 sentences) in simple B1 English. Do NOT provide the answer.`;

            try {
                const response = await callGeminiAPI(`Create 1 spontaneous challenge question in simple B1 English to test mastery of the word "${vocab.word}"`, systemPrompt, null, { feature: 'fast_track_gen' });
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
  "critique": "2 sentences of clear, constructive evaluation in simple B1 English."
}`;

            try {
                const response = await callGeminiAPI(`Evaluate spontaneous challenge answer for the word "${vocab.word}": "${answer}"`, systemPrompt, null, { feature: 'fast_track_eval' });
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

            // Populate ⭐ Quick Recap for fast daily review (SRS v7.0)
            const recapEl = document.getElementById('review-back-recap-text');
            const chunkEl = document.getElementById('review-back-golden-chunk');
            const aiRecapEl = document.getElementById('review-ai-recap-text');
            const aiChunkEl = document.getElementById('review-ai-golden-chunk');

            const recapText = vocab.quickRecap || (vocab.coreMeaningB1 ? `${vocab.word.toUpperCase()} = ${vocab.coreMeaningB1}` : `${vocab.word.toUpperCase()} = ${vocab.meaningId || vocab.meaningEn || ''}`);
            const goldenChunkText = vocab.collocationMatrix?.starChunk || vocab.goldenChunk || (vocab.synonyms && vocab.synonyms[0] ? `Chunk: ${vocab.synonyms[0]}` : '');

            if (recapEl) recapEl.innerText = recapText;
            if (chunkEl) chunkEl.innerText = goldenChunkText ? `⭐ ${goldenChunkText}` : '';
            if (aiRecapEl) aiRecapEl.innerText = recapText;
            if (aiChunkEl) aiChunkEl.innerText = goldenChunkText ? `⭐ ${goldenChunkText}` : '';
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

Provide a concise evaluation in clear B1 English with high-scoring IELTS tips.
1. Meaning Critique: If provided, is it semantically accurate?
2. Sentence Critique: Is grammar, collocation, and IELTS context accurate?
3. Grammar Errors: Array of specific correction notes (empty if flawless).
4. Syntax Formulas: 1-2 Band 7.5+ syntax formula patterns using "${vocab.word}".
5. Upgraded Sentence: 1 natural Band 7.5+ IELTS sentence.
6. Score: 0-100.

Return JSON ONLY:
{
  "score": 85,
  "level": "mastery | partial | unlearned",
  "statusLabel": "Mastered | Partially Mastered | Needs Practice",
  "meaningCritique": "...",
  "sentenceCritique": "...",
  "grammarErrors": ["..."],
  "syntaxFormulas": ["..."],
  "upgradedSentence": "..."
}`;

            try {
                const response = await callGeminiAPI(`Evaluate review drill for "${vocab.word}"`, systemPrompt, null, { feature: 'srs_drill' });
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
                                    <div class="text-[10px] font-mono font-bold text-indigo-400 uppercase">Formula Sintaks Band 7.5+:</div>
                                    ${parsed.syntaxFormulas.map(f => `<div class="text-xs text-indigo-200 font-mono">• ${f}</div>`).join('')}
                                </div>
                            ` : ''}

                            ${parsed.upgradedSentence ? `
                                <div class="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                                    <div class="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center justify-between">
                                        <span>Model Kalimat Upgrade (Band 7.5+):</span>
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
