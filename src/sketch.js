let config = {
    main : {
        line_density : 15,       // Number of line field around each particle (35)
        minFieldMag  : 2*10e-10  // Minimum magnitude to stop drawing
    },
    colorRepresentation : {
        values : {
            max  :  1.5e-5,  // Gradiant max value
            min  : 9.06e-12, // Gradiant min value
            auto : true      // Auto-compute theses values
        },
        colors : {
            positive : { r : 255, g: 0, b: 0   },   // Positive particles color
            negative : { r :   0, g: 0, b: 255 }    // Negative particles color
        }
    },
    advanced : {
        stepSize : 0,   // Step drawing size (>0, 0 for no loss)
        model    : Models.m.CONDENSATEUR,
        model_options : [1, -1, 1]
    }
};


function runSimulator(simulator) {
    // p5 bug correction
    p5.RendererGL.prototype.endShape = function(
        mode,
        isCurve,
        isBezier,
        isQuadratic,
        isContour,
        shapeKind
    ) {
        this._processVertices(...arguments);
        if (this._doFill) {
            if (this.immediateMode.geometry.vertices.length > 1) {
                this._drawImmediateFill();
            }
        }
        if (this._doStroke) {
            if (this.immediateMode.geometry.lineVertices.length > 1) {
                this._drawImmediateStroke();
            }
        }

        this.isBezier = false;
        this.isQuadratic = false;
        this.isCurve = false;
        this.immediateMode._bezierVertex.length = 0;
        this.immediateMode._quadraticVertex.length = 0;
        this.immediateMode._curveVertex.length = 0;
        return this;
    };





    simulator
        .setEngineConfig((eC) => {
            eC.plotter.scale = { x : 1.3*2*10e-3, y : 1.3*2*10e-3, z : 1.3*2*10e-3 };
            eC.plotter.displayGrid = false;
            eC.plotter.scale.squareByX = true;
        })
        .addObjects(
            Field, 1, Models.getModel(config.advanced.model, config.advanced.model_options),
            config.main.line_density, config.advanced.stepSize, config.main.minFieldMag,
            config.colorRepresentation
        );

    document.getElementById('simuType').value = 'condensateur';


    window.windowResized = function() {
        let p = _pSimulationInstance.getCanvasProportions(_pSimulationInstance.config.engine.window.proportions);
        resizeCanvas(p.w, p.h);
        window.submitSimuType();
    };
}



// function computeForXYPixels(xP, yP) {
//     let c = _pSimulationInstance.config.engine.plotter;
//     let v = new Vector((xP * 2 / width - 1) * c.scale.x - c.offset.x);
//
//     if(!c.scale.squareByX)
//         v.y = -((yP * 2 / height - 1) * c.scale.y - c.offset.y);
//     else
//         v.y = -(((yP - height / 2) * 2 / width) * c.scale.x - c.offset.y);
//
//     return v;
// }


function updatedSimuType() {
    window.mouseClicked = () => {};
    _pSimulationInstance.plotter.objectsL = [];


    config.advanced.model = Models.getByName(document.getElementById('simuType').value);
    if(config.advanced.model == Models.m.CONDENSATEUR)
        document.getElementById('options').innerHTML = '';
    else if(config.advanced.model == Models.m.LINEAIRE)
        document.getElementById('options').innerHTML = ''
            + '<label>Signe de la particule 1 :<select name="txt_1" id="txt_1">'
                + '<option value="+1">Positive</option>'
                + '<option value="-1">Négative</option>'
            + '</select></label>'
            + '<div /><label>Signe de la particule 2 :<select name="txt_2" id="txt_2">'
                + '<option value="+1">Positive</option>'
                + '<option value="-1">Négative</option>'
            + '</select></label>'
        + '';
    else if(config.advanced.model == Models.m.TRIANGLE)
        document.getElementById('options').innerHTML = ''
            + '<label>Signe de la particule 1 :<select name="txt_1" id="txt_1">'
                + '<option value="+1">Positive</option>'
                + '<option value="-1">Négative</option>'
            + '</select></label>'
            + '<div /><label>Signe de la particule 2 :<select name="txt_2" id="txt_2">'
                + '<option value="+1">Positive</option>'
                + '<option value="-1">Négative</option>'
            + '</select></label>'
            + '<div /><label>Signe de la particule 3 :<select name="txt_3" id="txt_3">'
                + '<option value="+1">Positive</option>'
                + '<option value="-1">Négative</option>'
            + '</select></label>'
        + '';
    else if(config.advanced.model == Models.m.RANDOM)
        document.getElementById('options').innerHTML = '<label>Nombre de particules :'
            + '<input type="number" name="txt_1" value="Nombre de particules" id="txt_1" />'
        + '</label>';
    else if(config.advanced.model == Models.m.CUSTOM) {
        background(0);
        document.getElementById('options').innerHTML = '';
        _pSimulationInstance.plotter.objectsL = [];
        Models.tmpParticles = [];

        window.mouseClicked = function() {
            Models.newParticule(mouseX, mouseY, keyIsDown(SHIFT) ? -1 : +1);
        };
    }
}

function submitSimuType() {
    background(0);

    switch (config.advanced.model) {
        case Models.m.CONDENSATEUR:
            config.advanced.model_options = [];
            break;
        case Models.m.LINEAIRE:
            config.advanced.model_options = [
                parseInt(document.getElementById('txt_1').value),
                parseInt(document.getElementById('txt_2').value)
            ];
            break;
        case Models.m.TRIANGLE:
            config.advanced.model_options = [
                parseInt(document.getElementById('txt_1').value),
                parseInt(document.getElementById('txt_2').value),
                parseInt(document.getElementById('txt_3').value)
            ];
            break;
        case Models.m.RANDOM:
            config.advanced.model_options = [parseInt(document.getElementById('txt_1').value)];
            break;
    }

    if(config.colorRepresentation.values.auto) {
        if(config.advanced.model == Models.m.CONDENSATEUR)
            config.colorRepresentation.values = {
                max  :  1.5e-5,  // Gradiant max value
                min  : 9.06e-12, // Gradiant min value
                auto : true      // Auto-compute theses values
            };
        else if(config.advanced.model == Models.m.LINEAIRE)
            config.colorRepresentation.values = {
                max  :  1.5e-6,  // Gradiant max value
                min  : 9.06e-12, // Gradiant min value
                auto : true      // Auto-compute theses values
            };
        else
            config.colorRepresentation.values = {
                max  :  1.5e-5,  // Gradiant max value
                min  : 9.06e-12, // Gradiant min value
                auto : true      // Auto-compute theses values
            };
    }


    _pSimulationInstance.plotter.objectsL = [];
    _pSimulationInstance.plotter.objectsL.push(
        new Field(Models.getModel(config.advanced.model, config.advanced.model_options), config.main.line_density,
        config.advanced.stepSize, config.main.minFieldMag, config.colorRepresentation)
    );
}
