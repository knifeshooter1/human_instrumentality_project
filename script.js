document.addEventListener('DOMContentLoaded', () => {
    const enterBtn = document.getElementById('enterBtn');
    const enterBtnWrapper = document.getElementById('enterBtnWrapper');
    const nervLogoWrapper = document.getElementById('nervLogoWrapper');
    const nervLogo = document.getElementById('nervLogo');
    const bgm = document.getElementById('bgm');
    const shinji = document.querySelector('.shinji-half');
    const eva = document.querySelector('.eva-half');
    const lyricText = document.getElementById('lyric-text');

    let isEntered = false;

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

        // 4. Start Lyrics System
        startLyrics();

        // 5. Enable Scroll
        setTimeout(() => {
            document.body.classList.add('scrollable');
            // Trigger an initial scroll calculation just in case
            window.dispatchEvent(new Event('scroll'));
        }, 800); // Immediately after button erase (0.7s)
    });

    // Scroll Cinematic Logic
    window.addEventListener('scroll', () => {
        if (!isEntered) return;

        // Use requestAnimationFrame for smooth 60fps binding if performance becomes an issue,
        // but modern browsers handle this well if we only update transforms.
        window.requestAnimationFrame(() => {
            // maxScroll defines the maximum distance we can scroll
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            // Guard against division by zero if not scrollable yet
            if (maxScroll <= 0) return;

            const scrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

            // Easing function (ease-out cubic) to make motion feel heavier and cinematic
            const easeOut = 1 - Math.pow(1 - scrollProgress, 3);

            // Start offscreen at -120vw and 120vw respectively, move towards 0
            const shinjiX = -120 * (1 - easeOut); 
            const evaX = 120 * (1 - easeOut);

            shinji.style.transform = `translate(${shinjiX}vw, -50%)`;
            // Opacity hits 1 halfway through scroll
            shinji.style.opacity = Math.min(scrollProgress * 2, 1);

            eva.style.transform = `translate(${evaX}vw, -50%)`;
            eva.style.opacity = Math.min(scrollProgress * 2, 1);
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
                        lyricText.style.opacity = '0.22'; // Opacity 0.18-0.28 per rules
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
