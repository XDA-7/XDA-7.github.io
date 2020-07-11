// @ts-check

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const ParticleRadius = 3;

function drawCircle(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, ParticleRadius, 0, 2 * Math.PI, false);
    ctx.fill();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

class Vector {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @param {Vector} v
     */
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    /**
     * @param {number} m
     */
    mult(m) {
        return new Vector(this.x * m, this.y * m);
    }

    neg() {
        return new Vector(-this.x, -this.y);
    }

    /**
     * @param {Vector} v
     */
    sqrDist(v) {
        const diffX = v.x - this.x;
        const diffY = v.y - this.y;
        return (diffX * diffX) + (diffY * diffY);
    }
}

class Particle {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        /** @type {Vector} */
        this.position = new Vector(x, y);
        this.velocity = new Vector(0, 0);
        this.mass = 1;
    }

    /**
     * @param {number} delta
     */
    update(delta) {
        const p = this.position.add(this.velocity.mult(delta));
        //this.position = new Vector(this.wrapPosition(p.x), this.wrapPosition(p.y));
        this.position = p;
    }

    /**
     * @param {Particle} p
     */
    applyRepulsion(p) {
        this.velocity = this.velocity.add(this.getAttraction(p).neg());
    }

    /**
     * @param {Particle} p
     */
    applyAttraction(p) {
        this.velocity = this.velocity.add(this.getAttraction(p));
    }

    /**
     * @param {Particle} p
     */
    getAttraction(p) {
        const sqrDist = this.position.sqrDist(p.position);
        const mag = (p.mass) / sqrDist;
        const dir = p.position.add(this.position.neg());
        return dir.mult(mag);
    }

    /**
     * @param {number} p
     */
    wrapPosition(p) {
        if (p < 0) {
            return p + 1000;
        }
        else if (p > 1000) {
            return p - 1000;
        }
        else {
            return p;
        }
    }
}

class ParticleRenderer {
    /**
     * @param {Particle} centreParticle
     * @param {Particle[]} particles
     */
    constructor(centreParticle, particles) {
        this.screenCentre = 3000
        this.centreParticle = centreParticle;
        this.particles = particles;
    }

    draw() {
        clearCanvas();
        drawCircle(this.screenCentre, this.screenCentre);
        const relShift = this.centreParticle.position.neg().add(new Vector(this.screenCentre, this.screenCentre));
        for (const particle of this.particles) {
            const relPos = particle.position.add(relShift);
            drawCircle(relPos.x, relPos.y);
        }
    }
}

class Simulation {
    constructor() {
        /** @type {Particle[]} */
        this.particles = []
        for(let i = 0; i < 60; i++) {
            const particle = new Particle(Math.random() * 1000, Math.random() * 1000);
            particle.velocity = new Vector((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
            particle.update(0);
            this.particles.push(particle);
        }
        this.particles[0].mass = 150;
        this.particleRenderer = new ParticleRenderer(this.particles[0], this.particles);
    }

    /**
     * @param {number} delta
     */
    update(delta) {
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                p1.applyAttraction(p2);
                p2.applyAttraction(p1);
            }
        }
        for (const p of this.particles) {
            p.update(delta);
        }
        this.particleRenderer.draw();
    }
}

const sim = new Simulation();

let time = -1;
/**
 * @param {number} timestamp
 */
function loop(timestamp) {
    if (time == 0) {
        time = timestamp;
    }
    else {
        const delta = (timestamp - time) / 1000;
        time = timestamp;
        sim.update(delta);
    }
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
