const participants = [
    { ranking: 1, name: "LINA", points: 84, image: "lina marulanda fifa.png" },
    { ranking: 2, name: "JENNIFER", points: 83, image: "jennifer_rincon_fifa.png" },
    { ranking: 3, name: "JHOAN", points: 79, image: "jhoan_fifa.png" },
    { ranking: 4, name: "PAUL", points: 77, image: "paul_jaramillo_fifa.png" }
];

document.addEventListener('DOMContentLoaded', () => {
    renderPodium();
    initScenariosSlider();
    initConfetti();
});

function renderPodium() {
    const container = document.getElementById('podium-container');
    container.innerHTML = '';

    participants.sort((a, b) => a.ranking - b.ranking).forEach(p => {
        container.appendChild(createPodiumCard(p.ranking, p));
    });
}

function createPodiumCard(rank, data) {
    const el = document.createElement('div');
    el.className = `podium-item rank-${rank}`;
    
    let icon = '';
    if(rank === 1) icon = '🏆';
    else if(rank === 2) icon = '🥈';
    else if(rank === 3) icon = '🥉';
    else if(rank === 4) icon = '⭐';

    const leaderBadge = rank === 1 ? '<div class="leader-badge">LÍDER ACTUAL</div>' : '';

    el.innerHTML = `
        <div class="award-icon">${icon}</div>
        ${leaderBadge}
        <div class="user-info">
            <div class="avatar-container">
                <img src="${data.image}" alt="${data.name}" class="avatar" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><rect width=\\'100\\' height=\\'100\\' fill=\\'%23333\\'/></svg>'">
            </div>
            <h3 class="user-name">${data.name}</h3>
            <div class="points-display">${data.points} PTS</div>
        </div>
        <div class="rank-number">${rank}</div>
    `;
    return el;
}

// Simple Confetti & Particle System
function initConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#FCD116', '#003893', '#CE1126', '#FFD700', '#ffffff'];

    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 4 + 1,
            dx: Math.random() * 2 - 1,
            dy: Math.random() * 2 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngle: 0,
            tiltAngleInc: (Math.random() * 0.07) + 0.05
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.tiltAngle += p.tiltAngleInc;
            p.y += p.dy;
            p.x += Math.sin(p.tiltAngle) * 2;

            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();
        });

        requestAnimationFrame(draw);
    }

    draw();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function initScenariosSlider() {
    const track = document.getElementById('slider-track');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const dots = document.querySelectorAll('.s-dot');
    
    if (!track) return;

    let currentIndex = 0;
    const totalSlides = 4;
    let autoSlideInterval;

    function updateSlider() {
        track.style.transform = `translateX(-${currentIndex * 25}%)`;
        
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    }

    // Event listeners
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
            resetAutoSlide();
        });
    });

    // Auto rotate
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 8000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // Pause on hover
    const sliderContainer = document.getElementById('scenarios-slider');
    sliderContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    sliderContainer.addEventListener('mouseleave', startAutoSlide);

    startAutoSlide();
}
