document.addEventListener('DOMContentLoaded', () => {
    const enterBtn = document.getElementById('enterBtn');
    const enterBtnWrapper = document.getElementById('enterBtnWrapper');
    const nervLogoWrapper = document.getElementById('nervLogoWrapper');
    const nervLogo = document.getElementById('nervLogo');
    const bgm = document.getElementById('bgm');
    const shinji = document.querySelector('.shinji-half');
    const eva = document.querySelector('.eva-half');
    const lyricText = document.getElementById('lyric-text');
    const faceSplit = document.querySelector('.face-split-container');
    const shakeWrapper = document.getElementById('shake-wrapper');
    const impactFlash = document.getElementById('impact-flash');
    const centerDivider = document.getElementById('center-divider');

    let isEntered = false;
    let isSettled = false;

    // "A Cruel Angel's Thesis" TV Size Lyrics Sequence
    const timedLyrics = [
        { time: 7, text: "残酷な天使のように\n(Zankoku na tenshi no you ni)" },
        { time: 12, text: "少年よ 神話になれ\n(Shounen yo shinwa ni nare)" },
        { time: 17, text: "蒼い風がいま\n胸のドアを叩いても" },
        { time: 23, text: "私だけをただ見つめて\n微笑んでるあなた" },
        { time: 28, text: "そっとふれるもの\n求めることに夢中で" },
        { time: 34, text: "運命さえまだ知らない\nいたいけな瞳" },
        { time: 39, text: "だけどいつか気づくでしょう\nその背中には" },
        { time: 45, text: "遥か未来めざすための\n羽があること" },
        { time: 50, text: "残酷な天使のテーゼ\n窓辺からやがて飛び立つ" },
        { time: 58, text: "ほとばしる熱いパトスで\n思い出を裏切るなら" },
        { time: 65, text: "この宇宙を抱いて輝く\n少年よ 神話になれ" },
        { time: 72, text: "" }
    ];

    enterBtn.addEventListener('click', () => {
        if (isEntered) return;
        isEntered = true;

        // 1. Button Exit Animation
        enterBtnWrapper.classList.add('exiting');

        // 2. Logo Transformation using FLIP-like precise calculation
        const logoRect = nervLogoWrapper.getBoundingClientRect();
        
        // Target is 13vw
        const targetWidth = window.innerWidth * 0.13;
        const scale = targetWidth / logoRect.width;
        
        // Find current center
        const currentCenterX = logoRect.left + logoRect.width / 2;
        const currentCenterY = logoRect.top + logoRect.height / 2;

        // Target center
        const targetCenterX = window.innerWidth / 2;
        // Padding from bottom is ~40px. Center of scaled logo is 40 + (scaled height / 2) from bottom
        const scaledHeight = logoRect.height * scale;
        const targetCenterY = window.innerHeight - 40 - (scaledHeight / 2);

        const translateX = targetCenterX - currentCenterX;
        const translateY = targetCenterY - currentCenterY;

        // Apply exact transform
        nervLogoWrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        
        // Stop breathing animation right after scaling starts to avoid conflict
        setTimeout(() => {
            nervLogo.style.animation = 'none';
        }, 1100);

        // 3. Audio Trigger and Fade In
        bgm.volume = 0;
        bgm.loop = true; // Ensure it loops continuously
        bgm.play().catch(e => {
            console.log("Audio play failed, user interaction or missing file:", e);
        });
        
        let vol = 0;
        const fadeInterval = setInterval(() => {
            if (vol < 0.6) {
                vol = Math.min(0.6, vol + 0.04);
                bgm.volume = vol;
            } else {
                clearInterval(fadeInterval);
            }
        }, 100); // 15 steps of 100ms = 1.5s fade-in

        // 5. Trigger the cinematic impact sequence
        //    Timing: button wipe=0.7s + logo settle=1.1s → wait 1.1s then +0.2s delay
        setTimeout(() => runImpactSequence(), 1300);

        // 6. Enable Scroll (slightly after impact sequence begins so scroll bar
        //    doesn't appear until the dust has settled)
        setTimeout(() => {
            document.body.classList.add('scrollable');
        }, 800);
    });

    // ---- CINEMATIC IMPACT SEQUENCE ----
    function runImpactSequence() {

        // PHASE 1 — Approach (0ms)
        // Both characters slide from ±120vw → ±10%, opacity 0→1, scale 0.98→1
        shinji.classList.add('phase1');
        eva.classList.add('phase1');

        // PHASE 2 — Snap to center (750ms after phase 1 starts)
        // Sharp fast snap from ±10% → 0%, then trigger all impact FX
        setTimeout(() => {
            // Remove phase1 so phase2 transition takes over
            shinji.classList.remove('phase1');
            eva.classList.remove('phase1');
            shinji.classList.add('phase2-snap');
            eva.classList.add('phase2-snap');

            // --- IMPACT FX (all fire simultaneously) ---

            // Flash
            impactFlash.classList.add('active');
            setTimeout(() => impactFlash.classList.remove('active'), 200);

            // Screen shake
            shakeWrapper.classList.add('shaking');
            setTimeout(() => shakeWrapper.classList.remove('shaking'), 250);

            // Scale pulse on face container
            faceSplit.classList.add('scale-pulse');
            setTimeout(() => faceSplit.classList.remove('scale-pulse'), 300);

            // Center divider energy line
            centerDivider.classList.add('active');

        }, 750); // Phase 1 duration

        // PHASE 3 — Settle (750 + 250ms)
        setTimeout(() => {
            // Swap to settled class for final crisp locked state
            shinji.classList.remove('phase2-snap');
            eva.classList.remove('phase2-snap');
            shinji.classList.add('settled');
            eva.classList.add('settled');

            // Divider settles from bright flash to subtle line
            centerDivider.classList.remove('active');
            centerDivider.classList.add('settled');

            // Start lyrics only after the composition has settled
            startLyrics();

            isSettled = true;
        }, 1050); // Phase 1 (750) + Phase 2 (300)
    }

    // Scroll: subtle parallax depth ONLY after characters are settled
    window.addEventListener('scroll', () => {
        if (!isEntered || !isSettled) return;

        window.requestAnimationFrame(() => {
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) return;

            const scrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

            // Very subtle parallax drift — characters stay at 0% center,
            // just a slight push to give depth while scrolling
            const parallaxOffset = scrollProgress * 2; // max 2vw drift each way
            shinji.style.transform = `translate(${-parallaxOffset}vw, -50%) scale(1)`;
            eva.style.transform = `translate(${parallaxOffset}vw, -50%) scale(1)`;
        });
    });

    // Lyrics Loop System - TV Size Sync
    let activeLyricIndex = -1;
    function startLyrics() {
        function checkLyricsTime() {
            if (!bgm.paused) {
                const currentTime = bgm.currentTime;
                
                // Manual perfect loop at ~1:30 (90 seconds)
                if (currentTime >= 90) {
                    bgm.currentTime = 0;
                    activeLyricIndex = -1;
                    lyricText.style.opacity = '0';
                    requestAnimationFrame(checkLyricsTime);
                    return;
                }
                
                // Find current lyric block
                let newIndex = -1;
                for (let i = timedLyrics.length - 1; i >= 0; i--) {
                    if (currentTime >= timedLyrics[i].time) {
                        newIndex = i;
                        break;
                    }
                }
                
                if (newIndex !== activeLyricIndex) {
                    activeLyricIndex = newIndex;
                    if (activeLyricIndex !== -1 && timedLyrics[activeLyricIndex].text !== "") {
                        lyricText.innerText = timedLyrics[activeLyricIndex].text;
                        lyricText.style.opacity = '0.07'; // Very subtle ambient background effect
                    } else {
                        lyricText.style.opacity = '0';
                    }
                } else if (newIndex !== -1) {
                    // Check if we need to fade out before next line
                    const nextLyricTime = (newIndex + 1 < timedLyrics.length) ? timedLyrics[newIndex + 1].time : 90;
                    // Fade out 0.6s before the next line starts
                    if (nextLyricTime - currentTime <= 0.6 && lyricText.style.opacity !== '0') {
                        lyricText.style.opacity = '0';
                    }
                }
            }
            requestAnimationFrame(checkLyricsTime);
        }
        
        requestAnimationFrame(checkLyricsTime);
    }
});
