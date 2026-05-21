import { useState, useEffect, useRef, useCallback } from 'react';

export interface CraftPulseState {
    duration: number;
    remaining: number;
    running: boolean;
    paused: boolean;
    cycles: number;
    flashIntensity: number;
    warnAt: number;
    alertMode: 'flash' | 'sound' | 'both' | 'silent';
    soundType: 'beep' | 'chime' | 'pulse' | 'subtle' | 'siren' | 'laser' | 'horn' | 'spring';
    soundVolume: number;
    autoRepeat: boolean;
    showMs: boolean;
    showBadge: boolean;
}

export function useCraftPulse() {
    const [state, setState] = useState<CraftPulseState>(() => {
        const defaultState: CraftPulseState = {
            duration: 20,
            remaining: 20,
            running: false,
            paused: false,
            cycles: 0,
            flashIntensity: 3,
            warnAt: 5,
            alertMode: 'flash',
            soundType: 'beep',
            soundVolume: 5,
            autoRepeat: true,
            showMs: true,
            showBadge: true
        };

        try {
            const saved = localStorage.getItem('craftpulse_prefs');
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...defaultState, ...parsed, remaining: parsed.duration || 20, running: false, paused: false, cycles: 0 };
            }
        } catch (e) {
            console.error('Failed to load prefs', e);
        }
        return defaultState;
    });

    const [triggerFlashAnim, setTriggerFlashAnim] = useState(false);
    const [triggerBadgeAnim, setTriggerBadgeAnim] = useState(false);

    const requestRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);
    const runningRef = useRef(false);

    useEffect(() => {
        runningRef.current = state.running;
    }, [state.running]);

    const savePrefs = useCallback((newState: Partial<CraftPulseState>) => {
        setState(prev => {
            const updated = { ...prev, ...newState };
            try {
                localStorage.setItem('craftpulse_prefs', JSON.stringify({
                    duration: updated.duration,
                    flashIntensity: updated.flashIntensity,
                    warnAt: updated.warnAt,
                    alertMode: updated.alertMode,
                    soundType: updated.soundType,
                    soundVolume: updated.soundVolume,
                    autoRepeat: updated.autoRepeat,
                    showMs: updated.showMs,
                    showBadge: updated.showBadge
                }));
            } catch (e) {}
            return updated;
        });
    }, []);

    const playSound = useCallback((type: string, volumeLevel: number) => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const g = ctx.createGain();
            g.connect(ctx.destination);
            
            // Map 1-10 to 0.05 - 0.5
            const baseVol = (volumeLevel / 10) * 0.4;
            
            if (type === 'beep') {
                const o1 = ctx.createOscillator();
                const o2 = ctx.createOscillator();
                o1.connect(g); o2.connect(g);
                o1.type = 'sine'; o1.frequency.value = 880;
                o2.type = 'sine'; o2.frequency.value = 1100;
                g.gain.setValueAtTime(baseVol, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                o1.start(ctx.currentTime); o1.stop(ctx.currentTime + 0.15);
                o2.start(ctx.currentTime + 0.05); o2.stop(ctx.currentTime + 0.35);
            } else if (type === 'chime') {
                const o = ctx.createOscillator();
                o.connect(g);
                o.type = 'triangle'; o.frequency.value = 1200;
                g.gain.setValueAtTime(0, ctx.currentTime);
                g.gain.linearRampToValueAtTime(baseVol, ctx.currentTime + 0.05);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
                o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.6);
            } else if (type === 'pulse') {
                const o = ctx.createOscillator();
                o.connect(g);
                o.type = 'square'; o.frequency.value = 200;
                g.gain.setValueAtTime(baseVol * 0.5, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.1);
                
                const o2 = ctx.createOscillator();
                o2.connect(g);
                o2.type = 'square'; o2.frequency.value = 200;
                g.gain.setValueAtTime(baseVol * 0.5, ctx.currentTime + 0.15);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                o2.start(ctx.currentTime + 0.15); o2.stop(ctx.currentTime + 0.25);
            } else if (type === 'subtle') {
                const o = ctx.createOscillator();
                o.connect(g);
                o.type = 'sine'; o.frequency.value = 600;
                g.gain.setValueAtTime(baseVol, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
            } else if (type === 'siren') {
                const o = ctx.createOscillator();
                o.connect(g);
                o.type = 'square';
                o.frequency.setValueAtTime(800, ctx.currentTime);
                o.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
                o.frequency.setValueAtTime(800, ctx.currentTime + 0.4);
                o.frequency.setValueAtTime(1200, ctx.currentTime + 0.6);
                g.gain.setValueAtTime(baseVol * 0.8, ctx.currentTime);
                g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
                o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.8);
            } else if (type === 'laser') {
                const o = ctx.createOscillator();
                o.connect(g);
                o.type = 'sawtooth';
                o.frequency.setValueAtTime(1500, ctx.currentTime);
                o.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
                g.gain.setValueAtTime(baseVol, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
            } else if (type === 'horn') {
                const o1 = ctx.createOscillator();
                const o2 = ctx.createOscillator();
                const o3 = ctx.createOscillator();
                o1.connect(g); o2.connect(g); o3.connect(g);
                o1.type = 'sawtooth'; o1.frequency.value = 300;
                o2.type = 'sawtooth'; o2.frequency.value = 305;
                o3.type = 'sawtooth'; o3.frequency.value = 295;
                g.gain.setValueAtTime(baseVol * 1.5, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                o1.start(ctx.currentTime); o1.stop(ctx.currentTime + 0.5);
                o2.start(ctx.currentTime); o2.stop(ctx.currentTime + 0.5);
                o3.start(ctx.currentTime); o3.stop(ctx.currentTime + 0.5);
            } else if (type === 'spring') {
                const o = ctx.createOscillator();
                o.connect(g);
                o.type = 'sine';
                o.frequency.setValueAtTime(300, ctx.currentTime);
                o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
                o.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
                o.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.3);
                g.gain.setValueAtTime(baseVol, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4);
            }
        } catch (e) {}
    }, []);

    const triggerAlert = useCallback((mode: string, showBadge: boolean, soundType: string, soundVolume: number) => {
        if (mode === 'silent') return;

        if (mode === 'flash' || mode === 'both') {
            setTriggerFlashAnim(true);
            setTimeout(() => setTriggerFlashAnim(false), 700);

            if (showBadge) {
                setTriggerBadgeAnim(true);
                setTimeout(() => setTriggerBadgeAnim(false), 1300);
            }
        }

        if (mode === 'sound' || mode === 'both') {
            playSound(soundType, soundVolume);
        }
    }, [playSound]);

    const tick = useCallback((time: number) => {
        if (!runningRef.current) return;

        if (lastTimeRef.current !== null) {
            const delta = (time - lastTimeRef.current) / 1000;
            
            setState(prev => {
                if (!prev.running) return prev;

                let newRemaining = prev.remaining - delta;

                if (newRemaining <= 0) {
                    newRemaining = 0;
                    triggerAlert(prev.alertMode, prev.showBadge, prev.soundType, prev.soundVolume);
                    
                    if (prev.autoRepeat) {
                        lastTimeRef.current = time; 
                        return { ...prev, remaining: prev.duration, cycles: prev.cycles + 1 };
                    } else {
                        runningRef.current = false; 
                        return { ...prev, remaining: 0, running: false, paused: false, cycles: prev.cycles + 1 };
                    }
                }

                return { ...prev, remaining: newRemaining };
            });
        }
        
        lastTimeRef.current = time;
        if (runningRef.current) {
            requestRef.current = requestAnimationFrame(tick);
        }
    }, [triggerAlert]);

    useEffect(() => {
        if (state.running) {
            lastTimeRef.current = performance.now();
            requestRef.current = requestAnimationFrame(tick);
        } else {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
        }
        
        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [state.running, tick]);

    const handleStart = () => {
        if (state.paused) {
            setState(prev => ({ ...prev, paused: false, running: true }));
        } else if (!state.running) {
            setState(prev => ({ ...prev, running: true, remaining: prev.duration }));
        }
    };

    const handlePause = () => {
        if (state.running) {
            setState(prev => ({ ...prev, running: false, paused: true }));
        }
    };

    const handleReset = () => {
        setState(prev => ({ ...prev, running: false, paused: false, remaining: prev.duration }));
    };

    const nudgeDuration = (d: number) => {
        setState(prev => {
            const newD = Math.max(3, Math.min(300, prev.duration + d));
            const newR = (!prev.running && !prev.paused) ? newD : prev.remaining;
            const updated = { ...prev, duration: newD, remaining: newR };
            savePrefs({ duration: newD });
            return updated;
        });
    };

    return {
        state,
        savePrefs,
        handleStart,
        handlePause,
        handleReset,
        nudgeDuration,
        triggerFlashAnim,
        triggerBadgeAnim,
        playSound // exposed for testing in UI
    };
}
