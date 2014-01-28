var Vector2D = (function () {
    function Vector2D(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2D.times = function (k, v) {
        return new Vector2D(k * v.x, k * v.y);
    };
    Vector2D.minus = function (v1, v2) {
        return new Vector2D(v1.x - v2.x, v1.y - v2.y);
    };
    Vector2D.plus = function (v1, v2) {
        return new Vector2D(v1.x + v2.x, v1.y + v2.y);
    };
    Vector2D.dot = function (v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    };
    Vector2D.mag = function (v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    };
    Vector2D.norm = function (v) {
        var mag = Vector2D.mag(v);
        var div = (mag === 0) ? Infinity : 1.0 / mag;
        return Vector2D.times(div, v);
    };

    Vector2D.cross = function (v1, v2) {
        return (v1.x * v2.y - v1.y * v2.x);
    };

    Vector2D.dist = function (v1, v2) {
        return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x)) + ((v1.y - v2.y) * (v1.y - v2.y));
    };
    return Vector2D;
})();

var Colour = (function () {
    function Colour(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    Colour.scale = function (k, v) {
        return new Colour(k * v.r, k * v.g, k * v.b);
    };
    Colour.plus = function (v1, v2) {
        return new Colour(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b);
    };
    Colour.times = function (v1, v2) {
        return new Colour(v1.r * v2.r, v1.g * v2.g, v1.b * v2.b);
    };

    Colour.toDrawingColor = function (c) {
        var legalize = function (d) {
            return d > 1 ? 1 : d;
        };
        return {
            r: Math.floor(legalize(c.r) * 255),
            g: Math.floor(legalize(c.g) * 255),
            b: Math.floor(legalize(c.b) * 255)
        };
    };
    Colour.toRgbString = function (colour) {
        var c = Colour.toDrawingColor(colour);
        return "rgb(" + String(c.r) + ", " + String(c.g) + ", " + String(c.b) + ")";
    };
    Colour.toRgbaString = function (colour, alpha) {
        if (!colour.cache) {
            var c = Colour.toDrawingColor(colour);
            colour.cache = "rgba(" + String(c.r) + ", " + String(c.g) + ", " + String(c.b) + ",";
        }

        return colour.cache + String(alpha) + ")";
    };

    Colour.random = function () {
        if (++Colour.counter > 3000) {
            if (Colour.counter > 4000) {
                Colour.counter = 0;
            }
            return new Colour(0.84, 0.167, 0.68 * Math.random());
        } else if (Colour.counter > 2000) {
            return new Colour(0.68 * Math.random(), 0.167, 0.84);
        } else if (Colour.counter > 1000) {
            return new Colour(0.84, 0.68 * Math.random(), 0.167);
        } else {
            return new Colour(0.167, 0.68 * Math.random(), 0.84);
        }
    };
    Colour.counter = 0;

    Colour.white = new Colour(1.0, 1.0, 1.0);
    Colour.grey = new Colour(0.5, 0.5, 0.5);
    Colour.black = new Colour(0.0, 0.0, 0.0);

    Colour.background = Colour.black;
    Colour.defaultColor = Colour.black;
    return Colour;
})();

var Repeller = (function () {
    function Repeller(pos, range, lifeSpan) {
        this.pos = pos;
        this.range = range;
        this.lifeSpan = lifeSpan;
        this.pos = pos;
        this.range = range;
        this.initialLifeSpan = lifeSpan;
        this.lifeSpan = lifeSpan;
        this.colour = Colour.random();
    }
    Repeller.prototype.update = function (scene) {
        return --this.lifeSpan <= 0;
    };

    Repeller.prototype.render = function (ctx) {
        //ctx.beginPath();
        //ctx.arc(this.pos.x, this.pos.y, this.lifeSpan, 0, 2 * Math.PI, false);
        //ctx.fillStyle = Colour.toRgbaString(this.colour, 0.3*(this.lifeSpan / this.initialLifeSpan));
        //ctx.fill();
    };

    Repeller.prototype.applyForce = function (p) {
        if (this.lifeSpan > 0) {
            //calculate distance
            var dist = Vector2D.dist(this.pos, p.pos);
            if (dist > 0) {
                p.pos = Vector2D.plus(p.pos, Vector2D.times(this.range * (this.lifeSpan / (dist / this.lifeSpan)), Vector2D.norm(Vector2D.minus(p.pos, this.pos))));
            }
        }
        return false;
    };
    return Repeller;
})();

var Particle = (function () {
    function Particle(pos, size, velocity, colour) {
        this.pos = pos;
        this.size = size;
        this.velocity = velocity;
        this.colour = colour;
        this.pos = pos;
        this.size = size;
        this.velocity = velocity;
        this.colour = colour;
        this.initialLifeSpan = 150;
        this.lifeSpan = this.initialLifeSpan;
    }
    Particle.prototype.update = function (scene) {
        if (--this.lifeSpan > 0) {
            this.pos = Vector2D.plus(this.pos, this.velocity);
            scene.checkScene(this);
            this.render(scene.ctx);
            return false;
        }

        return true;
    };

    Particle.prototype.render = function (ctx) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.lifeSpan, 0, PI_2, false);
        ctx.fillStyle = Colour.toRgbaString(this.colour, 0.3 * (this.lifeSpan / this.initialLifeSpan));
        ctx.fill();
    };
    return Particle;
})();

var PI_2 = 2 * Math.PI;

var ParticleGenerator = (function () {
    function ParticleGenerator(pos, scene, interval, defaultSize) {
        this.pos = pos;
        this.scene = scene;
        this.interval = interval;
        this.defaultSize = defaultSize;
    }
    ParticleGenerator.prototype.start = function () {
        var _this = this;
        this.intervalId = setInterval(function () {
            return _this.generate();
        }, this.interval);
    };

    ParticleGenerator.prototype.stop = function () {
        clearInterval(this.intervalId);
    };

    ParticleGenerator.prototype.randomVelocity = function () {
        var speed = (Math.random() * 7) + 4;
        var v = new Vector2D((Math.random() * 2) - 1, (Math.random() * 2) - 1);
        return Vector2D.times(speed, v);
    };

    ParticleGenerator.prototype.generate = function () {
        this.scene.addParticle(new Particle(this.pos, this.defaultSize, this.randomVelocity(), Colour.random()));
        this.scene.addParticle(new Particle(this.pos, this.defaultSize, this.randomVelocity(), Colour.random()));
        this.scene.addParticle(new Particle(this.pos, this.defaultSize, this.randomVelocity(), Colour.random()));
        this.scene.addParticle(new Particle(this.pos, this.defaultSize, this.randomVelocity(), Colour.random()));
    };
    return ParticleGenerator;
})();

var Scene = (function () {
    function Scene(ctx, left, top, width, height) {
        this.particles = [];
        this.repellers = [];
        this.ctx = ctx;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.background = "rgb(204,204,204)";
    }
    Scene.prototype.addRepeller = function (item) {
        this.repellers.push(item);
    };

    Scene.prototype.addParticle = function (item) {
        this.particles.push(item);
    };

    Scene.prototype.start = function () {
        var _this = this;
        setInterval(function () {
            return _this.update();
        }, 1000 / 30);
    };

    Scene.prototype.update = function () {
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
    };

    Scene.prototype.checkScene = function (item) {
        this.checkRepellers(item);
    };

    Scene.prototype.checkRepellers = function (item) {
        for (var i = 0; i < this.repellers.length; i++) {
            this.repellers[i].applyForce(item);
        }
    };
    return Scene;
})();

function exec() {
    var canv = document.createElement("canvas");

    canv.onclick = function (e) {
        scene.addRepeller(new Repeller(new Vector2D(e.x, e.y), 1, 30 * 2));
    };

    canv.onmousemove = function (e) {
        scene.addRepeller(new Repeller(new Vector2D(e.x, e.y), 0.2, 30));
    };

    canv.width = 1000;
    canv.height = 700;
    document.body.appendChild(canv);
    var ctx = canv.getContext("2d");

    var scene = new Scene(ctx, 0, 0, canv.width, canv.height);

    var generator = new ParticleGenerator(new Vector2D(500, 350), scene, 5, 10);
    generator.start();
    scene.start();
}

window.onload = function () {
    exec();
};
//# sourceMappingURL=app.js.map
