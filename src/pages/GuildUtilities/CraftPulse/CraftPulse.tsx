import { useState, useEffect } from 'react';
import styles from './CraftPulse.module.css';
import { useCraftPulse } from './useCraftPulse';

interface CraftPulseProps {
    focusMode?: boolean;
}

export function CraftPulse({ focusMode = false }: CraftPulseProps) {
    const {
        state,
        savePrefs,
        handleStart,
        handlePause,
        handleReset,
        nudgeDuration,
        triggerFlashAnim,
        triggerBadgeAnim,
        playSound
    } = useCraftPulse();

    const [configOpen, setConfigOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'timer' | 'alert' | 'display'>('timer');

    // Ensure fonts are loaded
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => { document.head.removeChild(link); };
    }, []);

    const r = Math.max(0, state.remaining);
    const secs = Math.ceil(r);
    const ms = (r % 1).toFixed(1).substring(1);
    const pct = (r / state.duration) * 100;
    const isUrgent = r <= state.warnAt && r > 0;
    const isDanger = r <= 3 && r > 0;

    const openFocusTimer = () => {
        const url = window.location.origin + '/guildutilities/craft-pulse/focus';
        window.open(url, 'CraftPulseFocus', 'width=340,height=220,menubar=no,toolbar=no,location=no,status=no,resizable=yes');
    };

    const handleTestSound = () => {
        playSound(state.soundType, state.soundVolume);
    };

    return (
        <div className={`${styles.root} ${focusMode ? styles.focusMode : ''}`}>
            
            <div 
                className={`${styles.flashOverlay} ${triggerFlashAnim ? styles.flashOverlayVisible : ''}`} 
                style={{ opacity: triggerFlashAnim ? (state.flashIntensity * 0.08).toString() : '0' }}
            ></div>
            
            <div className={`${styles.craftBadge} ${triggerBadgeAnim ? styles.craftBadgeVisible : ''}`}>
                CRAFT NOW
            </div>

            <div className={styles.shell}>
                {!focusMode && <div className={styles.label}>Guild Utilities · Craft Pulse</div>}

                <div className={styles.unit}>
                    <div className={styles.topbar}>
                        <div className={styles.name}>CRAFT PULSE · v0.1</div>
                        <div className={`${styles.statusDot} ${state.running ? styles.statusDotActive : ''} ${triggerFlashAnim ? styles.statusDotFlash : ''}`}></div>
                    </div>

                    <div className={`${styles.display} ${triggerFlashAnim ? styles.flashing : ''}`}>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div className={styles.progressWrap}>
                                <div 
                                    className={`${styles.progressBar} ${isUrgent ? styles.progressBarLow : ''}`} 
                                    style={{ width: `${Math.max(0, pct)}%` }}
                                ></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0' }}>
                                <div className={`${styles.digits} ${isDanger ? styles.danger : isUrgent ? styles.urgent : ''}`}>
                                    {secs}
                                </div>
                                {state.showMs && <div className={styles.ms}>{ms}</div>}
                            </div>
                            <div className={styles.subrow}>
                                <span>SET <span className={styles.accent}>{state.duration}s</span></span>
                                <span>·</span>
                                <span>{state.running ? 'RUNNING' : (state.paused ? 'PAUSED' : 'STOPPED')}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.controls}>
                        {!state.running && (
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleStart}>
                                {state.paused ? 'RESUME' : 'START'}
                            </button>
                        )}
                        {state.running && (
                            <button className={styles.btn} onClick={handlePause}>PAUSE</button>
                        )}
                        <button className={styles.btn} onClick={handleReset}>RESET</button>
                        <button className={styles.btn} onClick={() => setConfigOpen(!configOpen)}>CFG</button>
                    </div>

                    <div className={styles.footer}>
                        <div className={styles.footerTxt}>RARE WINDOW</div>
                        <div className={styles.cycleCount}>CYCLES: <span>{state.cycles}</span></div>
                    </div>

                    {configOpen && (
                        <div className={styles.config}>
                            <div className={styles.configToggle}>
                                <button className={`${styles.cfgTab} ${activeTab === 'timer' ? styles.cfgTabActive : ''}`} onClick={() => setActiveTab('timer')}>TIMER</button>
                                <button className={`${styles.cfgTab} ${activeTab === 'alert' ? styles.cfgTabActive : ''}`} onClick={() => setActiveTab('alert')}>ALERT</button>
                                <button className={`${styles.cfgTab} ${activeTab === 'display' ? styles.cfgTabActive : ''}`} onClick={() => setActiveTab('display')}>VIEW</button>
                            </div>

                            {activeTab === 'timer' && (
                                <div>
                                    <div className={styles.configRow}>
                                        <div className={styles.cfgLabel}>Duration</div>
                                        <div className={styles.cfgVal}>
                                            <button className={styles.nudge} onClick={() => nudgeDuration(-5)}>−</button>
                                            <button className={styles.nudge} onClick={() => nudgeDuration(-1)}>−</button>
                                            <div className={styles.numDisplay}><span>{state.duration}</span>s</div>
                                            <button className={styles.nudge} onClick={() => nudgeDuration(1)}>+</button>
                                            <button className={styles.nudge} onClick={() => nudgeDuration(5)}>+5</button>
                                        </div>
                                    </div>
                                    <div className={styles.configRow}>
                                        <div className={styles.cfgLabel}>Warn at</div>
                                        <div className={styles.cfgVal}>
                                            <button className={styles.nudge} onClick={() => savePrefs({ warnAt: Math.max(0, state.warnAt - 1) })}>−</button>
                                            <div className={styles.numDisplay}><span>{state.warnAt}</span>s</div>
                                            <button className={styles.nudge} onClick={() => savePrefs({ warnAt: Math.min(20, state.warnAt + 1) })}>+</button>
                                        </div>
                                    </div>
                                    <div className={styles.configRow}>
                                        <div className={styles.cfgLabel}>Auto-repeat</div>
                                        <div className={styles.cfgVal}>
                                            <label className={styles.toggle}>
                                                <input type="checkbox" checked={state.autoRepeat} onChange={(e) => savePrefs({ autoRepeat: e.target.checked })} />
                                                <div className={styles.toggleTrack}></div>
                                                <div className={styles.toggleThumb}></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'alert' && (
                                <div>
                                    <div className={styles.configRow}>
                                        <div className={styles.cfgLabel}>Alert mode</div>
                                        <div className={styles.cfgVal}>
                                            <select 
                                                className={styles.select} 
                                                value={state.alertMode} 
                                                onChange={(e) => savePrefs({ alertMode: e.target.value as any })}
                                            >
                                                <option value="flash">Flash</option>
                                                <option value="sound">Sound</option>
                                                <option value="both">Both</option>
                                                <option value="silent">Silent</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.configRow}>
                                        <div className={styles.cfgLabel}>Flash intensity</div>
                                        <div className={styles.cfgVal}>
                                            <button className={styles.nudge} onClick={() => savePrefs({ flashIntensity: Math.max(1, state.flashIntensity - 1) })}>−</button>
                                            <div className={styles.numDisplay}><span>{state.flashIntensity}</span>/5</div>
                                            <button className={styles.nudge} onClick={() => savePrefs({ flashIntensity: Math.min(5, state.flashIntensity + 1) })}>+</button>
                                        </div>
                                    </div>
                                    <div className={styles.configRow}>
                                        <div className={styles.cfgLabel}>Sound type</div>
                                        <div className={styles.cfgVal}>
                                            <select 
                                                className={styles.select} 
                                                value={state.soundType} 
                                                onChange={(e) => {
                                                    savePrefs({ soundType: e.target.value as any });
                                                    playSound(e.target.value, state.soundVolume);
                                                }}
                                            >
                                                <option value="beep">Beep</option>
                                                <option value="chime">Chime</option>
                                                <option value="pulse">Pulse</option>
                                                <option value="subtle">Subtle</option>
                                                <option value="siren">Siren (Alert)</option>
                                                <option value="laser">Laser (Pew Pew)</option>
                                                <option value="horn">Airhorn (Susto)</option>
                                                <option value="spring">Spring (Boing)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.configRow}>
                                        <div className={styles.cfgLabel}>Sound vol</div>
                                        <div className={styles.cfgVal}>
                                            <button className={styles.nudge} onClick={() => savePrefs({ soundVolume: Math.max(1, state.soundVolume - 1) })}>−</button>
                                            <div className={styles.numDisplay}><span>{state.soundVolume}</span>/10</div>
                                            <button className={styles.nudge} onClick={() => savePrefs({ soundVolume: Math.min(10, state.soundVolume + 1) })}>+</button>
                                            <button className={styles.nudge} style={{marginLeft: '4px'}} onClick={handleTestSound}>▶</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'display' && (
                                <div>
                                    <div className={styles.configRow}>
                                        <div className={styles.cfgLabel}>Show ms</div>
                                        <div className={styles.cfgVal}>
                                            <label className={styles.toggle}>
                                                <input type="checkbox" checked={state.showMs} onChange={(e) => savePrefs({ showMs: e.target.checked })} />
                                                <div className={styles.toggleTrack}></div>
                                                <div className={styles.toggleThumb}></div>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.configRow}>
                                        <div className={styles.cfgLabel}>"Craft Now" badge</div>
                                        <div className={styles.cfgVal}>
                                            <label className={styles.toggle}>
                                                <input type="checkbox" checked={state.showBadge} onChange={(e) => savePrefs({ showBadge: e.target.checked })} />
                                                <div className={styles.toggleTrack}></div>
                                                <div className={styles.toggleThumb}></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!focusMode && (
                    <button className={styles.openFocusBtn} onClick={openFocusTimer}>
                        [ OPEN FOCUS TIMER POPUP ]
                    </button>
                )}
            </div>
        </div>
    );
}
