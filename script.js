const participants = [
    { ranking: 1, name: "VALERIA G", points: 30, image: "valeria_giraldo_fifa.png" },
    { ranking: 2, name: "LINA", points: 29, image: "lina marulanda fifa.png" },
    { ranking: 3, name: "JENNIFER", points: 28, image: "jennifer_rincon_fifa.png" },
    { ranking: 3, name: "LUZ DARY", points: 28, image: "luz_dary_fifa.png" },
    { ranking: 3, name: "MARTIN MISSE", points: 28, image: "martin_fifa.png" },
    { ranking: 3, name: "NORMIS", points: 28, image: "norma_perez_fifa.png" },
    { ranking: 3, name: "PAUL", points: 28, image: "paul_jaramillo_fifa.png" }
];

document.addEventListener('DOMContentLoaded', () => {
    renderPodium();
    initConfetti();
});

function renderPodium() {
    const container = document.getElementById('podium-container');
    container.innerHTML = '';

    // Group participants by rank
    const rankedData = {
        1: participants.filter(p => p.ranking === 1),
        2: participants.filter(p => p.ranking === 2),
        3: participants.filter(p => p.ranking === 3)
    };

    // Construct Podium HTML
    // Order in DOM (for desktop flex layout: 2nd, 1st, 3rd)
    if(rankedData[2].length > 0) container.appendChild(createPodiumCard(2, rankedData[2][0]));
    if(rankedData[1].length > 0) container.appendChild(createPodiumCard(1, rankedData[1][0]));
    if(rankedData[3].length > 0) container.appendChild(createSharedPodiumCard(3, rankedData[3]));
    
    // Initialize carousel if 3rd place is shared
    if(rankedData[3].length > 1) {
        initCarousel();
    }
}

function createPodiumCard(rank, data) {
    const el = document.createElement('div');
    el.className = `podium-item rank-${rank}`;
    
    const icon = rank === 1 ? '🏆' : '🥈';
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

function createSharedPodiumCard(rank, dataArray) {
    const el = document.createElement('div');
    el.className = `podium-item rank-${rank}`;
    
    if (dataArray.length === 1) {
        // Not actually shared, just one person
        return createPodiumCard(rank, dataArray[0]);
    }

    let slidesHTML = '';
    let dotsHTML = '';
    
    dataArray.forEach((data, index) => {
        slidesHTML += `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                <div class="avatar-container">
                    <img src="${data.image}" alt="${data.name}" class="avatar" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><rect width=\\'100\\' height=\\'100\\' fill=\\'%23333\\'/></svg>'">
                </div>
                <h3 class="user-name">${data.name}</h3>
                <div class="points-display">${data.points} PTS</div>
            </div>
        `;
        dotsHTML += `<div class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`;
    });

    el.innerHTML = `
        <div class="award-icon">🥉</div>
        <div class="shared-status">Puesto 3 Compartido</div>
        
        <div class="carousel-container">
            <div class="carousel-track" id="carousel-track">
                ${slidesHTML}
            </div>
        </div>
        
        <div class="carousel-indicators">
            ${dotsHTML}
        </div>
        <div class="rank-number">${rank}</div>
    `;
    return el;
}

function initCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    
    const slides = track.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 0;
    
    // Set width of track to accommodate all slides based on container width
    const updateCarousel = () => {
        const slideWidth = track.parentElement.offsetWidth;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        
        slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
        dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    };

    // Auto rotate
    setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel();
    }, 3000);

    // Click dots manually
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            currentIndex = parseInt(e.target.getAttribute('data-index'));
            updateCarousel();
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', updateCarousel);
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
