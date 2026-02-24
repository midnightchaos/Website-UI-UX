class CyberParticles {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.connectionDistance = 150;
        this.mouse = { x: null, y: null };

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        let numberOfParticles = (this.canvas.width * this.canvas.height) / 15000;
        for (let i = 0; i < numberOfParticles; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });

        this.connectParticles();
    }

    connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < this.particles.length; a++) {
            for (let b = a; b < this.particles.length; b++) {
                let distance = ((this.particles[a].x - this.particles[b].x) * (this.particles[a].x - this.particles[b].x)) +
                    ((this.particles[a].y - this.particles[b].y) * (this.particles[a].y - this.particles[b].y));

                if (distance < (this.connectionDistance * this.connectionDistance)) {
                    opacityValue = 1 - (distance / (this.connectionDistance * this.connectionDistance));
                    this.ctx.strokeStyle = `rgba(0, 242, 255, ${opacityValue * 0.15})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[a].x, this.particles[a].y);
                    this.ctx.lineTo(this.particles[b].x, this.particles[b].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() * 1.5 - 0.75) * 0.5;
        this.speedY = (Math.random() * 1.5 - 0.75) * 0.5;
        this.color = '#00f2ff';
    }

    update(mouse) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce from edges
        if (this.x > this.canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > this.canvas.height || this.y < 0) this.speedY = -this.speedY;

        // Mouse interaction
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (100 - distance) / 100;
                const directionX = forceDirectionX * force * 3;
                const directionY = forceDirectionY * force * 3;
                this.x -= directionX;
                this.y -= directionY;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize
window.addEventListener('load', () => {
    // Create new canvas element dynamically if not present, but better to target an ID.
    // For now, we assume user will add <canvas id="particles-bg"></canvas>
    if (document.getElementById('particles-bg')) {
        new CyberParticles('particles-bg');
    }
});
