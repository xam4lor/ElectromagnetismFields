// ================= CONFIGURATION =================
/**----- MODELS (options) -----
 CONDENSATEUR : []
 LINEAIRE     : [charge particule 1, charge particule 2]
 TRIANGLE     : [charge particule 1, charge particule 2, charge particule 3]
 RANDOM       : [number of random particles]
-----------------------------*/

const LINE_DENSITY  = 30;                       // Number of line field around each particle
const MODEL         = Models.m.CONDENSATEUR;    // Choosen model
const MODEL_OPTIONS = [1, -1];                  // Choosen model options

// =================================================



function runSimulator(simulator) {
    let stepSize    = 1;       // Iteration size (0 for no loss)
    let minFieldMag = 4*10e-5; // Minimum magnitude to stop drawing

    simulator
        .setEngineConfig((eC) => {
            eC.plotter.scale = { x: 2*10e-3, y: 2*10e-3 };
            eC.plotter.displayGrid = false;
            eC.plotter.backgroundColor.draw = false;
        })
        .addObjects(Field, 1, Models.getModel(MODEL, MODEL_OPTIONS), LINE_DENSITY, stepSize);
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
