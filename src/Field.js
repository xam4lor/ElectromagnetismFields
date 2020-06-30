class Field {
    static particuleDRadius = 10;
    static k = 1 / (4 * Math.PI * 8.854*10e-12);

    constructor(particles, fieldNbLinePerParticle, step, minFieldMag, drawingVals) {
        this.particles   = particles;
        this.step        = step + 1;
        this.toAdd       = [];
        this.pathStop    = []; // list of every lines that are finished
        this.canStop     = false;
        this.drawingVals = drawingVals;


        // GENERATE EACH STARTING PARTICLE POINTS (in round area around each particle)
        let pathBegin = []; // List of all particules starting positions
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = 0; j < fieldNbLinePerParticle; j++) {
                pathBegin.push({
                    x    : this.particles[i].x + Math.cos(2*Math.PI / fieldNbLinePerParticle * j) * 10e-5,
                    y    : this.particles[i].y + Math.sin(2*Math.PI / fieldNbLinePerParticle * j) * 10e-5,
                    sign : this.particles[i].q
                });
            }
        }

        // GENERATE EACH SMALL LINE PARTICULES
        this.path = [];
        for (let el = 0; el < pathBegin.length; el++) {
            this.path[el] = {
                path  : [new Vector(pathBegin[el].x, pathBegin[el].y)],
                sign  : pathBegin[el].sign,
                color : { r : 0, g : 0, b : 0 },
                madeByUser : false,
                newFieldMag : 0
            };
        }

        window.mouseClicked = this.onClick;

        window.setTimeout(function() {
            let path = window._pSimulationInstance.plotter.objectsL[0];
            if (!path)
                return;
            for (let i = 0; i < path.length; i++)
                if(path[i].madeByUser)
                    window._pSimulationInstance.plotter.objectsL[0].path[i].path = [new Vector(Infinity, Infinity)];
        }, 3000);
    }


    /**
    * Add the next point of each line field
    * @param lineID The array UUID of the line
    */
    addPointToPathNb(lineID) {
        let currentPath = this.path[lineID].path;
        let lastElement = currentPath[currentPath.length - 1];
        let fieldAtPosC = this.getElectricFieldAt(lastElement, this.path[lineID].sign);

        let fieldMag = fieldAtPosC.vec.mag();

        if(!this.canStop) {
            let c = _pSimulationInstance.getEngineConfig().plotter.scale;
            if(
                lastElement.x < -c.x || lastElement.x > c.x ||
                lastElement.y < -c.y || lastElement.y > c.y
            ) this.canStop = true;
        }

        this.path[lineID].newFieldMag = fieldAtPosC.val;

        // Test if stop drawing line
        for (let p = 0; p < this.particles.length; p++) {
            if(this.canStop && !this.path[lineID].madeByUser && fieldMag < this.minFieldMag) {
                this.path.splice(lineID, 1);
                return;
            }

            if(fieldMag > 10e-5)
                fieldAtPosC.vec.normalize().mult(10e-5);
            else if(this.canStop && !this.path[lineID].madeByUser && Math.sqrt((fieldAtPosC.vec.x - this.particles[p].x)**2 + (fieldAtPosC.vec.y - this.particles[p].y)**2) < this.particles[p].r) {
                this.path.splice(lineID, 1);
                return;
            }
        }

        // Add next point to current line
        this.path[lineID].path.push(fieldAtPosC.vec.mult(this.step).add(lastElement));
    }


    /**
    * Update every particles
    * @param dt Delta-t time
    */
    update(dt) {
        for (let lineID = 0; lineID < this.path.length; lineID++)
            this.addPointToPathNb(lineID);

        for (let i = 0; i < this.toAdd.length; i++)
            this.path.push(this.toAdd[i]);
        this.toAdd = [];
    }


    /**
    * Draw on the screen
    * @param drawer The drawer class parameter
    */
    draw(drawer) {
        // Draw every line field
        for (let el = 0; el < this.path.length; el++) {
            let pathLength = this.path[el].path.length - 1;
            let c = this.getColor(this.path[el]);

            if(!this.path[el].madeByUser)
                drawer.noFill().strokeWeight(1);
            else
                drawer.noFill().strokeWeight(3);

            if(!this.path[el].path[pathLength - 1])
                continue;

            drawer
                .stroke(`rgb(${c.r}, ${c.g}, ${c.b})`)
                .line(
                    this.path[el].path[pathLength - 1].x,
                    this.path[el].path[pathLength - 1].y,
                    this.path[el].path[pathLength].x,
                    this.path[el].path[pathLength].y
                );
        }

        // Draw particle sources
        for (let i = 0; i < this.particles.length; i++) {
            let c = this.drawingVals.colors.positive;
            if(this.particles[i].q < 0)
                c = this.drawingVals.colors.negative;

            drawer.noStroke().fill(c.r, c.g, c.b).ellipse(
                this.particles[i].x,
                this.particles[i].y,
                Field.particuleDRadius,
                Field.particuleDRadius,
                true
            );
        }
    }



    /**
    * @param pos The given position Vector<x, y>
    * @param sign The sign of the particle
    * @return The vectors and value of the Electrical field at a certain point
    */
    getElectricFieldAt(pos, sign) {
        let eTotal = new Vector();
        let valTot = 0;
        for (let i = 0; i < this.particles.length; i++) {
            let v = new Vector(pos.x - this.particles[i].x, pos.y - this.particles[i].y);
            let newVal = 1/(v.mag()**3) * Field.k * sign * this.particles[i].q * 1.602*10e-19;
            eTotal.add(v.mult(newVal));
            valTot += newVal * 10e-5;
        }
        return { vec: eTotal, val : valTot * sign };
    }


    /**
    * Draw vector lines onClick
    */
    onClick() {
        let c = _pSimulationInstance.plotter.objectsL[0];
        let v = computeForXYPixels(mouseX, mouseY);

        c.toAdd.push({
            path  : [new Vector(v.x, v.y)],
            sign  : +1,
            color : { r : 0, g : 255, b : 0 },
            madeByUser : true
        });
        c.toAdd.push({
            path  : [new Vector(v.x, v.y)],
            sign  : -1,
            color : { r : 0, g : 255, b : 0 },
            madeByUser : true
        });
    }


    /**
    * @param val Current field value to be colored
    * @return a color {x, y, z}
    */
    getColor(el) {
        let p = ((el.newFieldMag - this.drawingVals.values.min) / this.drawingVals.values.max + 1) / 2;

        if(el.newFieldMag > this.drawingVals.values.max)
            p = 1;
        if(p < 0)
            p = 0;

        el.color.r = Math.round(this.drawingVals.colors.positive.r * p + this.drawingVals.colors.negative.r * (1 - p));
        el.color.g = Math.round(this.drawingVals.colors.positive.g * p + this.drawingVals.colors.negative.g * (1 - p));
        el.color.b = Math.round(this.drawingVals.colors.positive.b * p + this.drawingVals.colors.negative.b * (1 - p));

        return el.color;
    }
}
