const participants = [
    { ranking: 1, name: "LINA", points: "CAMPEONA", image: "lina marulanda fifa.png", title: "🏆 CAMPEONA" },
    { ranking: 2, name: "JENNIFER", points: "SUBCAMPEONA", image: "jennifer_rincon_fifa.png", title: "🥈 SUBCAMPEONA" },
    { ranking: 3, name: "JHOAN", points: "3ER LUGAR", image: "jhoan_fifa.png", title: "🥉 3ER LUGAR" }
];

document.addEventListener('DOMContentLoaded', () => {
    renderPodium();
    initConfetti();
    initTVPresentation();
});

function renderPodium() {
    const container = document.getElementById('podium-container');
    if(container) container.innerHTML = '';

    participants.sort((a, b) => a.ranking - b.ranking).forEach(p => {
        if(container) container.appendChild(createPodiumCard(p.ranking, p));

        let tvContainer;
        if(p.ranking === 1) tvContainer = document.getElementById('tv-card-lina');
        if(p.ranking === 2) tvContainer = document.getElementById('tv-card-jennifer');
        if(p.ranking === 3) tvContainer = document.getElementById('tv-card-jhoan');

        if (tvContainer) {
            tvContainer.innerHTML = '';
            tvContainer.appendChild(createPodiumCard(p.ranking, p));
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
    if(slides.length === 0) return;
    
    let currentSlide = 0;
    
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 15000); // Change slide every 15 seconds
}


