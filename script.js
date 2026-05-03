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

    // "A Cruel Angel's Thesis" sample lyrics for syncing
    const loopingLyrics = [
        "残酷な天使のように",
        "少年よ 神話になれ",
        "蒼い風がいま",
        "胸のドアを叩いても",
        "私だけをただ見つめて",
        "微笑んでるあなた",
        "そっとふれるもの",
        "もとめることに夢中で",
        "運命さえまだ知らない",
        "いたいけな瞳",
        "だけどいつか気付くでしょう",
        "その背中には",
        "遥か未来 めざすための",
        "羽根があること"
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
        bgm.play().catch(e => {
            console.log("Audio play failed, user interaction or missing file:", e);
        });
        
        let vol = 0;
        const fadeInterval = setInterval(() => {
            if (vol < 0.6) {
                vol += 0.05;
                bgm.volume = vol;
            } else {
                clearInterval(fadeInterval);
            }
        }, 150);

        // 4. Start Lyrics System
        startLyrics();

        // 5. Enable Scroll
        setTimeout(() => {
            document.body.classList.add('scrollable');
            // Trigger an initial scroll calculation just in case
            window.dispatchEvent(new Event('scroll'));
        }, 1100);
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

            // Start offscreen at -50vw and 50vw respectively, move towards 0
            const shinjiX = -50 * (1 - Math.pow(1 - scrollProgress, 1.5)); 
            const evaX = 50 * (1 - Math.pow(1 - scrollProgress, 1.5));

            shinji.style.transform = `translate(calc(-50vw + ${shinjiX}vw), -50%)`;
            // Wait, previous CSS had: 
            // .shinji-half { right: 50%; transform: translate(-50vw, -50%); }
            // If I just set `translate(${shinjiX}vw, -50%)`, it overwrites the CSS transform.
            // Let's ensure the calculation is relative to their native anchors.
            // Since shinji is anchored `right: 50%`, translateX(0) puts its right edge exactly at center.
            // So we want it to start at -50vw, and go to 0vw.
            shinji.style.transform = `translate(${shinjiX}vw, -50%)`;
            // Opacity hits 1 halfway through scroll
            shinji.style.opacity = Math.min(scrollProgress * 2, 1);

            eva.style.transform = `translate(${evaX}vw, -50%)`;
            eva.style.opacity = Math.min(scrollProgress * 2, 1);
        });
    });

    // Lyrics Loop System
    let lyricIndex = 0;
    function startLyrics() {
        updateLyric();
        setInterval(updateLyric, 4000); // 4 seconds per line
    }

    function updateLyric() {
        // Fade out
        lyricText.style.opacity = 0;
        
        setTimeout(() => {
            lyricText.innerText = loopingLyrics[lyricIndex];
            // Fade in with slight opacity as requested (0.06 - 0.12)
            lyricText.style.opacity = 0.10;
            lyricIndex = (lyricIndex + 1) % loopingLyrics.length;
        }, 800); // Wait for fade out
    }
});
