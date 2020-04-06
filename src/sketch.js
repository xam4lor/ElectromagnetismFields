// ================= CONFIGURATION =================
/**----- MODELS (options) -----
 CONDENSATEUR : []
 LINEAIRE     : [charge particule 1, charge particule 2]
 TRIANGLE     : [charge particule 1, charge particule 2, charge particule 3]
 RANDOM       : [number of random particles]
 CUSTOM       : plaçage aléatoire des particules
-----------------------------*/

let LINE_DENSITY  = 30;                       // Number of line field around each particle
let MODEL         = Models.m.CONDENSATEUR;    // Choosen model
let MODEL_OPTIONS = [1, -1, 1];                  // Choosen model options

// =================================================

let stepSize    = 1;       // Iteration size (0 for no loss)
let minFieldMag = 2*10e-6; // Minimum magnitude to stop drawing


function runSimulator(simulator) {
    simulator
        .setEngineConfig((eC) => {
            eC.plotter.scale = { x: 2*10e-3, y: 2*10e-3 };
            eC.plotter.displayGrid = false;
            eC.plotter.backgroundColor.draw = false;
        })
        .addObjects(Field, 1, Models.getModel(MODEL, MODEL_OPTIONS), LINE_DENSITY, stepSize);

    document.getElementById('simuType').value = 'condensateur';
}



function computeForXYPixels(xP, yP) {
    let c = _pSimulationInstance.config.engine.plotter;
    let v = new Vector((xP * 2 / width - 1) * c.scale.x - c.offset.x);

    if(!c.scale.squareByX)
        v.y = -((yP * 2 / height - 1) * c.scale.y - c.offset.y);
    else
        v.y = -(((yP - height / 2) * 2 / width) * c.scale.x - c.offset.y);

    return v;
}


function updatedSimuType() {
    window.mouseClicked = () => {};
    _pSimulationInstance.plotter.objectsL = [];


    MODEL = Models.getByName(document.getElementById('simuType').value);
    if(MODEL == Models.m.CONDENSATEUR)
        document.getElementById('options').innerHTML = '';
    else if(MODEL == Models.m.LINEAIRE)
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
    else if(MODEL == Models.m.TRIANGLE)
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
    else if(MODEL == Models.m.RANDOM)
        document.getElementById('options').innerHTML = '<label>Nombre de particules :'
            + '<input type="number" name="txt_1" value="Nombre de particules" id="txt_1" />'
        + '</label>';
    else if(MODEL == Models.m.CUSTOM) {
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

    switch (MODEL) {
        case Models.m.CONDENSATEUR:
            MODEL_OPTIONS = [];
            break;
        case Models.m.LINEAIRE:
            MODEL_OPTIONS = [
                parseInt(document.getElementById('txt_1').value),
                parseInt(document.getElementById('txt_2').value)
            ];
            break;
        case Models.m.TRIANGLE:
            MODEL_OPTIONS = [
                parseInt(document.getElementById('txt_1').value),
                parseInt(document.getElementById('txt_2').value),
                parseInt(document.getElementById('txt_3').value)
            ];
            break;
        case Models.m.RANDOM:
            MODEL_OPTIONS = [parseInt(document.getElementById('txt_1').value)];
            break;
    }


    _pSimulationInstance.plotter.objectsL = [];
    _pSimulationInstance.plotter.objectsL.push(new Field(Models.getModel(MODEL, MODEL_OPTIONS), LINE_DENSITY, stepSize));
}
