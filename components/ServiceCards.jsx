'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CARDS_DATA } from '@/lib/data';

export default function ServiceCards() {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Animate underline SVG paths on scroll (from HeroSection)
        gsap.to('.title-underline-svg path', {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power3.out',
            stagger: 0.3,
            scrollTrigger: {
                trigger: '.service-cards-wrapper',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        });

        const mm = initCardAnimations();
        return () => mm && mm.revert();
    }, []);

    return (
        <>
            {/* ─── "Call us if you need:" Heading ─── */}
            <div className="title-container">
                <h2 className="main-title">call us if you <span className="italic-text">need:</span></h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="160" viewBox="0 0 159 17" fill="none" className="title-underline-svg">
                    <path d="M1 12.1515C53.0771 5.7187 105.529 2.30552 158 1.93652" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M30.2672 15.9461C64.1899 12.8158 98.2663 11.3583 132.33 11.5735" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
            </div>

            {/* ─── Service Cards ─── */}
            <div className="cards-wrapper" id="cards-wrapper">
                {CARDS_DATA.map((card) => (
                    <div key={card.color} className={`card card-${card.color}`}>
                        <div className={`card-sticker sticker-${card.sticker}`}>
                            <img
                                src={`/assets/Card-Sticker SVG/sticker-${card.sticker}.svg`}
                                alt=""
                                width="100%"
                                loading="lazy"
                                aria-hidden="true"
                            />
                        </div>
                        <h3 className="card-title">{card.title}</h3>
                        <svg width="100%" height="10" className="card-divider-svg" aria-hidden="true">
                            <use href="#card-divider" />
                        </svg>
                        <ul className="card-list">
                            {card.services.map((service) => (
                                <li key={service}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" className="services-card__bullet-svg" aria-hidden="true">
                                        <use href="#bullet-icon" />
                                    </svg>
                                    {service}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </>
    );
}

// This used to decide mobile-vs-desktop card behaviour with a single
// `window.matchMedia(...).matches` check that only ran once, when the
// component first mounted. That's stale the moment the viewport crosses
// the breakpoint afterwards — e.g. resizing a DevTools device-toolbar
// viewport without a full page reload — leaving the desktop hover-cluster
// branch active (or vice versa). The desktop branch never sets an
// explicit position, so cards fall back to their raw CSS offsets
// (`left: calc(50% - 700px)` etc., authored for a ~1400px-wide desktop
// layout), which is exactly what produced cards scattered hundreds of
// pixels off-canvas on a 400px mobile screen.
//
// `gsap.matchMedia()` fixes this properly: each `.add()` block is
// automatically re-run (after its own returned cleanup function tears
// down whatever it set up) whenever the matched breakpoint changes, so
// the correct behaviour is always in effect for the *current* viewport.
function initCardAnimations() {
    const cards = gsap.utils.toArray('.card');
    if (!cards.length) return null;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 769px)', () => {
        // ─── Desktop: hover cluster ───
        const originalData = [
            { rotation: 4 },
            { rotation: -5 },
            { rotation: 5 },
            { rotation: -8 },
            { rotation: 5 }
        ];
        let leaveTimeout = null;
        const enterHandlers = [];
        const leaveHandlers = [];

        cards.forEach((card, index) => {
            const onEnter = () => {
                if (leaveTimeout) { clearTimeout(leaveTimeout); leaveTimeout = null; }
                const hoverGap = 120;
                const clusterGap = 150;
                const cardWidth = 320;
                const hoveredLeft = cards[index].offsetLeft;
                const leftCards = [];
                const rightCards = [];

                cards.forEach((otherCard, otherIndex) => {
                    if (otherIndex < index) leftCards.push({ card: otherCard, index: otherIndex });
                    else if (otherIndex > index) rightCards.push({ card: otherCard, index: otherIndex });
                });

                const currentTop = cards[index].offsetTop;
                const targetCommonTop = 50;
                const moveY = targetCommonTop - currentTop;

                gsap.to(cards[index], { x: 0, y: moveY, rotation: 0, scale: 1.08, duration: 0.9, ease: 'elastic.out(1, 0.5)', overwrite: true });

                if (rightCards.length) {
                    const clusterStart = hoveredLeft + cardWidth + hoverGap;
                    rightCards.forEach((item, i) => {
                        const targetAbsLeft = clusterStart + (i * clusterGap);
                        const targetX = Math.max(targetAbsLeft - item.card.offsetLeft, 10);
                        const angleRad = originalData[item.index].rotation * (Math.PI / 180);
                        const targetY = targetX * Math.tan(angleRad);
                        gsap.to(item.card, { x: targetX, y: targetY, rotation: originalData[item.index].rotation, scale: 1, duration: 1.0, ease: 'elastic.out(1, 0.5)', overwrite: true });
                    });
                }

                if (leftCards.length) {
                    leftCards.reverse();
                    const clusterStart = hoveredLeft - hoverGap - cardWidth;
                    leftCards.forEach((item, i) => {
                        const targetAbsLeft = clusterStart - (i * clusterGap);
                        const targetX = Math.min(targetAbsLeft - item.card.offsetLeft, -10);
                        const angleRad = originalData[item.index].rotation * (Math.PI / 180);
                        const targetY = targetX * Math.tan(angleRad);
                        gsap.to(item.card, { x: targetX, y: targetY, rotation: originalData[item.index].rotation, scale: 1, duration: 1.0, ease: 'elastic.out(1, 0.5)', overwrite: true });
                    });
                }
            };

            const onLeave = () => {
                leaveTimeout = setTimeout(() => {
                    cards.forEach((c, i) => {
                        gsap.to(c, { x: 0, y: 0, scale: 1, rotation: originalData[i].rotation, duration: 1.0, ease: 'elastic.out(1, 0.5)', overwrite: true, zIndex: i + 1 });
                    });
                }, 80);
            };

            card.addEventListener('mouseenter', onEnter);
            card.addEventListener('mouseleave', onLeave);
            enterHandlers.push(onEnter);
            leaveHandlers.push(onLeave);
        });

        // Cleanup: runs automatically the instant the viewport no longer
        // matches "(min-width: 769px)" — removes listeners and resets any
        // inline transform GSAP left behind, so the mobile branch below
        // starts from a clean slate.
        return () => {
            cards.forEach((card, index) => {
                card.removeEventListener('mouseenter', enterHandlers[index]);
                card.removeEventListener('mouseleave', leaveHandlers[index]);
            });
            if (leaveTimeout) clearTimeout(leaveTimeout);
            gsap.killTweensOf(cards);
            gsap.set(cards, { clearProps: 'all' });
        };
    });

    mm.add('(max-width: 768px)', () => {
        // ─── Mobile: scroll-linked transition, no pinning ───
        // Each card's entrance is tied to scroll position via `scrub`
        // (not a one-shot toggleActions), so it visibly animates in sync
        // as you scroll — that's the "transition" that was lost when the
        // pinned version was removed. The difference from the old, buggy
        // version: this trigger is just the card's own natural position
        // in normal document flow. There's no pin, no custom wrapper
        // height, no shared pixel-distance math between multiple cards —
        // each card's animation is fully self-contained, so there's
        // nothing for a scroll-distance mismatch to get out of sync
        // with, and nothing that can stay "stuck" on screen.
        // Rotation is safe to bring back here (unlike the earlier
        // always-rotated version) because it animates OUT to 0 by the
        // time the card is at rest — any transient corner overhang only
        // exists mid-scroll, while .cards-wrapper still clips via
        // overflow:hidden, and the final resting state is never rotated.
        const mobileRotations = [-3, 2, -4, 3, -2];
        const triggers = [];

        cards.forEach((card, i) => {
            const st = gsap.fromTo(card,
                { y: 90, rotation: mobileRotations[i % mobileRotations.length], autoAlpha: 0 },
                {
                    y: 0,
                    rotation: 0,
                    autoAlpha: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 95%',
                        end: 'top 55%',
                        scrub: 0.4
                    }
                }
            ).scrollTrigger;
            triggers.push(st);
        });

        // Cleanup: runs automatically when the viewport grows past 768px.
        return () => {
            triggers.forEach(st => st && st.kill());
            gsap.killTweensOf(cards);
            gsap.set(cards, { clearProps: 'all' });
        };
    });

    return mm;
}
