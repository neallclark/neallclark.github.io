class Vector2D {
    constructor(public x: number,
        public y: number) {
    }
    static times(k: number, v: Vector2D) { return new Vector2D(k * v.x, k * v.y); }
    static minus(v1: Vector2D, v2: Vector2D) { return new Vector2D(v1.x - v2.x, v1.y - v2.y); }
    static plus(v1: Vector2D, v2: Vector2D) { return new Vector2D(v1.x + v2.x, v1.y + v2.y); }
    static dot(v1: Vector2D, v2: Vector2D) { return v1.x * v2.x + v1.y * v2.y; }
    static mag(v: Vector2D) { return Math.sqrt(v.x * v.x + v.y * v.y); }
    static norm(v: Vector2D) {
        var mag = Vector2D.mag(v);
        var div = (mag === 0) ? Infinity : 1.0 / mag;
        return Vector2D.times(div, v);
    }
    
    static cross(v1: Vector2D, v2: Vector2D) {
        return (v1.x * v2.y -
            v1.y * v2.x);
    }

    static dist(v1: Vector2D, v2: Vector2D) {
        return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x)) + ((v1.y - v2.y) * (v1.y - v2.y));
    }
}

class Colour {
    cache: string;
    static counter: number = 0;

    constructor(public r: number,
        public g: number,
        public b: number) {
    }
    static scale(k: number, v: Colour) { return new Colour(k * v.r, k * v.g, k * v.b); }
    static plus(v1: Colour, v2: Colour) { return new Colour(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b); }
    static times(v1: Colour, v2: Colour) { return new Colour(v1.r * v2.r, v1.g * v2.g, v1.b * v2.b); }
    static white = new Colour(1.0, 1.0, 1.0);
    static grey = new Colour(0.5, 0.5, 0.5);
    static black = new Colour(0.0, 0.0, 0.0);

    static background = Colour.black;
    static defaultColor = Colour.black;
    static toDrawingColor(c: Colour) {
        var legalize = d => d > 1 ? 1 : d;
        return {
            r: Math.floor(legalize(c.r) * 255),
            g: Math.floor(legalize(c.g) * 255),
            b: Math.floor(legalize(c.b) * 255)
        }
    }
    static toRgbString(colour: Colour) {
        var c = Colour.toDrawingColor(colour);
        return "rgb(" + String(c.r) + ", " + String(c.g) + ", " + String(c.b) + ")";
    }
    static toRgbaString(colour: Colour, alpha: number) {
        if(!colour.cache) {
            var c = Colour.toDrawingColor(colour);
            colour.cache = "rgba(" + String(c.r) + ", " + String(c.g) + ", " + String(c.b) + ",";
        }

        return colour.cache + String(alpha) + ")";
    }

    static random() {
        if (++Colour.counter > 3000) {
            if (Colour.counter > 4000) {
                Colour.counter = 0;
            }
            return new Colour(0.84, 0.167, 0.68 * Math.random());
        }
        else if (Colour.counter > 2000) {
            return new Colour(0.68 * Math.random(), 0.167, 0.84);
        }
        else if (Colour.counter > 1000) {
            return new Colour(0.84, 0.68 * Math.random(), 0.167);
        }
        else {
            return new Colour(0.167, 0.68 * Math.random(), 0.84);
        }
    }
}

class Repeller implements Drawable {
    colour: Colour;
    initialLifeSpan: number;

    constructor(public pos: Vector2D,
        public range: number,
        public lifeSpan: number) {
            this.pos = pos;
            this.range = range;
            this.initialLifeSpan = lifeSpan;
            this.lifeSpan = lifeSpan;
            this.colour = Colour.random();
    }

    update(scene: Scene) {
        return --this.lifeSpan <= 0;
    }

    render(ctx) {
        //ctx.beginPath();
        //ctx.arc(this.pos.x, this.pos.y, this.lifeSpan, 0, 2 * Math.PI, false);
        //ctx.fillStyle = Colour.toRgbaString(this.colour, 0.3*(this.lifeSpan / this.initialLifeSpan));
        //ctx.fill();
    }

    applyForce(p: Particle) {
        if (this.lifeSpan > 0) {
            //calculate distance
            var dist = Vector2D.dist(this.pos, p.pos);
            if (dist > 0) {
                p.pos = Vector2D.plus(p.pos, Vector2D.times(this.range * (this.lifeSpan / (dist / this.lifeSpan)), Vector2D.norm(Vector2D.minus(p.pos, this.pos))));
            }
        }
        return false;
    }
}

class Particle implements Drawable{
    initialLifeSpan: number;
    lifeSpan: number;

    constructor(public pos: Vector2D,
        public size: number,
        public velocity: Vector2D,
        public colour: Colour
        ) {
            this.pos = pos;
            this.size = size;
            this.velocity = velocity;
            this.colour = colour;
            this.initialLifeSpan = 150;
            this.lifeSpan = this.initialLifeSpan;
    }

    update(scene: Scene) {
        if (--this.lifeSpan > 0) {
            this.pos = Vector2D.plus(this.pos, this.velocity);
            scene.checkScene(this);
            this.render(scene.ctx);
            return false;
        }

        return true;
    }

    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.lifeSpan, 0, PI_2, false);
        ctx.fillStyle = Colour.toRgbaString(this.colour, 0.3 * (this.lifeSpan / this.initialLifeSpan));
        ctx.fill();
    }
}

var PI_2 = 2 * Math.PI;

class ParticleGenerator {
    pos: Vector2D;
    scene: Scene;
    interval: number;
    defaultSize: number;
    private intervalId: number;

    constructor(pos, scene, interval, defaultSize) {
        this.pos = pos;
        this.scene = scene;
        this.interval = interval;
        this.defaultSize = defaultSize;
    }

    start() {
        this.intervalId = setInterval(() => this.generate(), this.interval);
    }

    stop() {
        clearInterval(this.intervalId);
    }

    private randomVelocity() {
        var speed = (Math.random() * 7) + 4;
        var v = new Vector2D((Math.random()*2) - 1, (Math.random() * 2)-1); 
        return Vector2D.times(speed, v);
    }

    generate() {
        this.scene.addParticle(new Particle(this.pos, this.defaultSize, this.randomVelocity(), Colour.random()));
        this.scene.addParticle(new Particle(this.pos, this.defaultSize, this.randomVelocity(), Colour.random()));
        this.scene.addParticle(new Particle(this.pos, this.defaultSize, this.randomVelocity(), Colour.random()));
        this.scene.addParticle(new Particle(this.pos, this.defaultSize, this.randomVelocity(), Colour.random()));
    }
}

interface Drawable {
    render(ctx);
    update(scene: Scene);
}

class Scene {
    particles: Particle[];
    repellers: Repeller[];
    ctx;
    left: number;
    top: number;
    width: number;
    height: number;
    background: string;

    constructor(ctx, left, top, width, height) {
        this.particles = [];
        this.repellers = [];
        this.ctx = ctx;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.background = "rgb(204,204,204)";
    }

    addRepeller(item: Repeller) {
        this.repellers.push(item);
    }

    addParticle(item: Particle) {
        this.particles.push(item);
    }

    start() {
        setInterval(() => this.update(), 1000 / 30);
    }

    update() {
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(this.left, this.top, this.width, this.height);
        for (var k = this.repellers.length - 1; k >= 0; k--) {
            if (this.repellers[k].update(this)) {
                this.repellers.splice(k, 1);
            }
        }
        for (var i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].update(this)) {
                this.particles.splice(i, 1);
            }
        }
    }

    checkScene(item: Particle) {
        this.checkRepellers(item);
    }

    checkRepellers(item: Particle) {
        for (var i = 0; i < this.repellers.length; i++) {
            this.repellers[i].applyForce(item);
        }
    }
}

function exec() {
    var canv = document.createElement("canvas");

    canv.onclick = function (e) {
        scene.addRepeller(new Repeller(new Vector2D(e.x, e.y), 1, 30*2));
    }

    canv.onmousemove = function (e) {
        scene.addRepeller(new Repeller(new Vector2D(e.x, e.y), 0.2, 30));
    }

    canv.width = 1000;
    canv.height = 700;
    document.body.appendChild(canv);
    var ctx = canv.getContext("2d");

    var scene = new Scene(ctx, 0, 0, canv.width, canv.height);

    var generator = new ParticleGenerator(new Vector2D(500, 350), scene, 5, 10);
    generator.start();
    scene.start();
}



window.onload = () => {
    exec();
};