'use client';

import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { brands, colors } from '@/lib/data';

// ─── Shuffle helpers ─────────────────────────────────────────────────────────
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function shuffleNoAdjacentSrc(array) {
    const arr = shuffleArray([...array]);
    for (let i = 1; i < arr.length; i++) {
        if (arr[i].src === arr[i - 1].src) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[j].src !== arr[i - 1].src) { [arr[i], arr[j]] = [arr[j], arr[i]]; break; }
            }
        }
    }
    if (arr[arr.length - 1].src === arr[0].src) {
        for (let j = 1; j < arr.length - 1; j++) {
            if (arr[j].src !== arr[0].src && arr[j].src !== arr[arr.length - 2].src) {
                [arr[arr.length - 1], arr[j]] = [arr[j], arr[arr.length - 1]]; break;
            }
        }
    }
    return arr;
}

function assignColorsNoAdjacent(count, colorPool) {
    const result = [];
    for (let i = 0; i < count; i++) {
        const prev = i > 0 ? result[i - 1] : null;
        const seamColor = i === count - 1 ? result[0] : null;
        const available = colorPool.filter(c => c !== prev && c !== seamColor);
        const pool = available.length > 0 ? available : colorPool.filter(c => c !== prev);
        result.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return result;
}

function buildMarqueeItems(isMobile) {
    const tracks = [[], []];
    for (let t = 0; t < 2; t++) {
        const shuffledBrands = shuffleNoAdjacentSrc(brands);
        const assignedColors = assignColorsNoAdjacent(shuffledBrands.length, colors);
        const items = shuffledBrands.map((brand, i) => ({ brand, color: assignedColors[i] }));
        tracks[t] = isMobile ? items : [...items, ...items]; // duplicate for seamless loop
    }
    return tracks;
}

export default function DoubleMarquee() {
    const [tracks, setTracks] = useState([[], []]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // The (max-width: 768px) check used to only run once on mount, so
        // resizing the viewport afterwards (e.g. a DevTools device-toolbar
        // resize with no full reload) left `isMobile` stale — the CSS grid
        // layout would switch correctly, but the JS-built track data
        // (duplicated-for-loop vs. not) would silently mismatch it,
        // rendering double the logo tiles in the mobile grid. Listening
        // for the media query to change keeps them in sync.
        const mq = window.matchMedia('(max-width: 768px)');
        const applyMode = (mobile) => {
            setIsMobile(mobile);
            setTracks(buildMarqueeItems(mobile));
        };
        const handleChange = (e) => applyMode(e.matches);
        applyMode(mq.matches);
        mq.addEventListener('change', handleChange);

        // Arrow path animation
        gsap.set('.marquee-left .marquee-svg-item:nth-child(2) path', { strokeDashoffset: 1000 });

        const marqueeTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.Double-marquee',
                start: 'top 70%',
                toggleActions: 'play none none reverse' // Allow replaying on scroll out/in
            }
        });

        marqueeTl
            .to('.marquee-underline', { scaleX: 1, opacity: 1, duration: 1, ease: 'power2.out' })
            .to('.marquee-left .marquee-svg-item:nth-child(1)', { scale: 1, opacity: 1, rotation: -10, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.5')
            .to('.marquee-left .marquee-svg-item:nth-child(2) path', { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' }, '-=0.3');

        return () => {
            mq.removeEventListener('change', handleChange);
            ScrollTrigger.getAll().forEach(t => { if (t.vars.trigger === '.Double-marquee') t.kill(); });
        };
    }, []);

    return (
        <>
            {/* Left: Text + Blob */}
            <div className="marquee-left">
                <div className="marquee-text-container">
                    <h2>proud to have<br />worked <span className="text-with">with:</span></h2>
                    <svg xmlns="http://www.w3.org/2000/svg" className="marquee-underline" viewBox="0 0 132 5" fill="none">
                        <path d="M1 2.08377C44.3458 3.90451 87.9791 5.71442 131 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="marquee-blob-container">
                    <img src="/assets/Marquee-blob SVG/marquee-blob.svg" className="marquee-blob" alt="" aria-hidden="true" />
                    <div className="marquee-svg-container">
                        <div className="marquee-svg-item">
                            <img src="/assets/Marquee-blob SVG/marquee-hand.svg" width="100%" alt="" aria-hidden="true" />
                        </div>
                        <div className="marquee-svg-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 386 127" fill="none">
                                <path d="M2 123C9 35.9999 84.5 17 124 25.9999C217.764 47.3635 207 115 177.5 123C105.777 142.45 110.737 1.99991 232.5 2C310.5 2.00006 366.5 79 376 118L356.5 105.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 123C9 35.9999 84.5 17 124 25.9999C217.764 47.3635 207 115 177.5 123C105.777 142.45 110.737 1.99991 232.5 2C310.5 2.00006 366.5 79 376 118L384 97" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Two scrolling columns */}
            <div className="marquee-right">
                {tracks.map((trackItems, colIndex) => (
                    <div key={colIndex} className="marquee-column">
                        <div className="marquee-track">
                            {trackItems.map((item, i) => (
                                <div key={i} className="marquee-item" data-brand={item.brand.name} style={{ backgroundColor: item.color }}>
                                    <div className="marquee-logo">
                                        <div className="marquee-logo__before"></div>
                                        <img src={item.brand.src} loading="lazy" alt={item.brand.name} className="cover-image" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
