const participants = [
    { ranking: 1, name: "LINA", points: 84, image: "lina marulanda fifa.png", title: "🏆 CAMPEONA" },
    { ranking: 2, name: "JENNIFER", points: 83, image: "jennifer_rincon_fifa.png", title: "🥈 SUBCAMPEONA" },
    { ranking: 3, name: "JHOAN", points: 79, image: "jhoan_fifa.png", title: "🥉 3ER LUGAR" }
];

document.addEventListener('DOMContentLoaded', () => {
    renderPodium();
    initConfetti();
    initTVPresentation();
});

function renderPodium() {
    const container = document.getElementById('podium-container');
    if(container) container.innerHTML = '';

    // Render order: Rank 2 (Jennifer), Rank 1 (Lina), Rank 3 (Jhoan)
    const renderOrder = [
        participants.find(p => p.ranking === 2),
        participants.find(p => p.ranking === 1),
        participants.find(p => p.ranking === 3)
    ];

    renderOrder.forEach(p => {
        if(p && container) container.appendChild(createPodiumCard(p.ranking, p));
    });

    // Inject into individual TV containers
    participants.forEach(p => {
        let tvContainer;
        if(p.ranking === 1) tvContainer = document.getElementById('tv-card-lina');
        if(p.ranking === 2) tvContainer = document.getElementById('tv-card-jennifer');
        if(p.ranking === 3) tvContainer = document.getElementById('tv-card-jhoan');

        if (tvContainer) {
            tvContainer.innerHTML = '';
            
            const colorClass = p.ranking === 1 ? 'border-yellow' : (p.ranking === 2 ? 'border-blue' : 'border-red');
            const textClass = p.ranking === 1 ? 'text-yellow' : (p.ranking === 2 ? 'text-blue' : 'text-red');
            const prefix = p.name.toLowerCase(); // 'lina', 'jennifer', 'jhoan'
            const fullName = p.name + (p.ranking === 1 ? ' MARULANDA' : (p.ranking === 2 ? ' RINCON' : ''));
            
            tvContainer.innerHTML = `
                <div class="hologram-container">
                    <div class="hologram-glow glow-${prefix}"></div>
                    <div class="character-360 character-${prefix}">
                        <img src="${prefix}_360_1.png" class="frame-1" />
                        <img src="${prefix}_360_2.png" class="frame-2" />
                        <img src="${prefix}_360_4.png" class="frame-3" />
                        <img src="${prefix}_360_3.png" class="frame-4" />
                    </div>
                    <div class="hologram-pedestal ${colorClass}">
                        <div class="pedestal-label ${textClass}">${fullName}</div>
                    </div>
                </div>
            `;
        }
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

    const badgeHtml = data.title ? `<div class="leader-badge">${data.title}</div>` : '';

    el.innerHTML = `
        <div class="award-icon">${icon}</div>
        ${badgeHtml}
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

function initTVPresentation() {
    const slides = document.querySelectorAll('.tv-slide');
    const header = document.querySelector('.tv-header');
    if(slides.length === 0) return;
    
    let currentSlide = 0;
    
    // Initial check
    if (header) {
        if (currentSlide === 5) {
            header.style.display = 'none';
        } else {
            header.style.display = 'flex';
        }
    }
    
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
        
        // Hide header on thanks slide (slide 5)
        if (header) {
            if (currentSlide === 5) {
                header.style.display = 'none';
            } else {
                header.style.display = 'flex';
            }
        }
    }, 25000); // Change slide every 25 seconds
}


