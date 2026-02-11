// Navbar scroll effect
const navbar = document.querySelector('.navbar');
const header = document.querySelector('.header-content');
const contentSection = document.querySelector('.content-section');
const footer = document.querySelector('.main-footer');

const updateNavbarColor = () => {
    const scrollPos = window.scrollY + navbar.offsetHeight / 2;
    
    // Check which section we are currently in
    const headerRect = header.getBoundingClientRect();
    const contentRect = contentSection.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();

    // Adjust for absolute scroll position
    const headerTop = headerRect.top + window.scrollY;
    const contentTop = contentRect.top + window.scrollY;
    const footerTop = footerRect.top + window.scrollY;

    if (scrollPos >= footerTop) {
        navbar.classList.add('on-dark');
        navbar.classList.remove('on-light');
    } else if (scrollPos >= contentTop) {
        navbar.classList.add('on-light');
        navbar.classList.remove('on-dark');
    } else {
        navbar.classList.add('on-dark');
        navbar.classList.remove('on-light');
    }
};

window.addEventListener('scroll', updateNavbarColor);
updateNavbarColor(); // Initial check

// GSAP Truus-style Card Hover Animation
const cards = gsap.utils.toArray(".card");

// Original rotations from CSS
const originalData = [
    { rotation: 4 },
    { rotation: -10 },
    { rotation: 5 },
    { rotation: -8 },
    { rotation: 5 }
];

cards.forEach((card, index) => {
    card.addEventListener("mouseenter", () => {
        const overlap = 60;
        const hoverGap = 80;

        cards.forEach((otherCard, otherIndex) => {
            const diff = otherIndex - index;
            const stackIndex = Math.abs(diff) - 1;

            if (otherIndex === index) {
                gsap.to(otherCard, {
                    x: 0,
                    y: 0,
                    rotation: 0,
                    scale: 1.08,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.7)",
                    overwrite: true,
                    zIndex: 20
                });
            } else {
                let targetX;
                if (otherIndex < index) {
                    targetX = -hoverGap - (stackIndex * overlap);
                } else {
                    targetX = hoverGap + (stackIndex * overlap);
                }

                gsap.to(otherCard, {
                    x: targetX,
                    y: diff * 15,
                    rotation: originalData[otherIndex].rotation * 0.5,
                    scale: 0.95,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.75)",
                    overwrite: true,
                    zIndex: 10 - stackIndex
                });
            }
        });
    });

    card.addEventListener("mouseleave", () => {
        cards.forEach((c, i) => {
            gsap.to(c, {
                x: 0,
                y: 0,
                scale: 1,
                rotation: originalData[i].rotation,
                duration: 0.6,
                ease: "elastic.out(1, 0.7)",
                overwrite: true,
                zIndex: i + 1
            });
        });
    });
});
