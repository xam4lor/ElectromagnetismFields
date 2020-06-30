let config = {
    main : {
        minFieldMag  : 2*10e-10  // Minimum magnitude to stop drawing
    },
    colorRepresentation : {
        values : {
            max  :  1.5e-5,  // Gradiant max value
            min  : 9.06e-12, // Gradiant min value
            auto : true      // Auto-compute theses values
        },
        colors : {
            positive : { r : 255, g: 0, b: 0 },
            negative : { r : 0, g: 0, b: 255 }
        }
    },
    advanced : {
        stepSize : 0,   // Step drawing size (>0, 0 for no loss)
        model    : Models.m.CONDENSATEUR,
        model_options : []
    }
};


class pSimulationText {
    // Paramètres
    'Modèle' = 'condensateur';
    Simuler = () => {
        config.advanced.model = Models.getByName(this['Modèle']);
        submitSimuType();
    };

    'Particule 1' = 'Positive';
    'Particule 2' = 'Positive';
    'Particule 3' = 'Positive';

    'n = ' = 5;

    'Particule +' = 'Faites clic droit';
    'Particule -' = 'Maintenez shift';


    // Fonctions
    updatedSimulationType(model) {
        window.mouseClicked = () => {};
        _pSimulationInstance.plotter.objectsL = [];

        pointersF3.forEach((item, i) => {
            pSParam.f3.remove(item);
        });
        pointersF3 = [];

        pSParam.f3.name = 'Signe des particules';
        pSParam.f3.hide();

        if(model == Models.m.CONDENSATEUR) {}
        else if(model == Models.m.LINEAIRE) {
            pointersF3.push(pSParam.f3.add(this.object, 'Particule 1', { '+1' : 'Positive', '-1' : 'Négative' }));
            pointersF3.push(pSParam.f3.add(this.object, 'Particule 2', { '+1' : 'Positive', '-1' : 'Négative' }));
            pSParam.f3.open();
            pSParam.f3.show();
        }
        else if(model == Models.m.TRIANGLE) {
            pointersF3.push(pSParam.f3.add(this.object, 'Particule 1', { '+1' : 'Positive', '-1' : 'Négative' }));
            pointersF3.push(pSParam.f3.add(this.object, 'Particule 2', { '+1' : 'Positive', '-1' : 'Négative' }));
            pointersF3.push(pSParam.f3.add(this.object, 'Particule 3', { '+1' : 'Positive', '-1' : 'Négative' }));
            pSParam.f3.open();
            pSParam.f3.show();
        }
        else if(model == Models.m.RANDOM) {
            pointersF3.push(pSParam.f3.add(this.object, 'n = ', 1, 300));
            pSParam.f3.name = 'Nombre de particules';
            pSParam.f3.open();
            pSParam.f3.show();
        }
        else if(model == Models.m.CUSTOM) {
            pointersF3.push(pSParam.f3.add(this.object, 'Particule +'));
            pointersF3.push(pSParam.f3.add(this.object, 'Particule -'));
            pSParam.f3.open();
            pSParam.f3.show();

            background(0);
            _pSimulationInstance.plotter.objectsL = [];
            Models.tmpParticles = [];

            window.mouseClicked = function() {
                Models.newParticule(mouseX, mouseY, keyIsDown(SHIFT) ? -1 : +1);
            };
        }
    }


    // Config
    'Densité du tracé' = 35;
    'Particules +' = [255, 0, 0];
    'Particules -' = [0, 0, 255];
}

let gui;
let pSParam = {};
let pointersF2 = [];
let pointersF3 = [];
function createInterfaceDatGui() {
    let pStext = new pSimulationText();
    gui = new dat.GUI();

    pSParam.f1 = gui.addFolder('Type de simulation');
    pSParam.f1.add(pStext, 'Modèle', {
        Condensateur : "condensateur",
        Lineaire : "lineaire",
        Triangle : "triangle",
        Aléatoire : "random",
        Custom : "custom"
    }).onChange(pStext.updatedSimulationType);
    pSParam.f1.add(pStext, 'Simuler');
    pSParam.f1.open();

    pSParam.f2 = gui.addFolder('Paramètres du moteur');
    pointersF2.push(pSParam.f2.add(pStext, 'Densité du tracé', 1, 100));
    pointersF2.push(pSParam.f2.addColor(pStext, 'Particules +'));
    pointersF2.push(pSParam.f2.addColor(pStext, 'Particules -'));


    pSParam.f3 = pSParam.f1.addFolder('Signe des particules');
    pSParam.f3.hide();
}

function runSimulator(simulator) {
    createInterfaceDatGui();

    simulator
        .setEngineConfig((eC) => {
            eC.plotter.scale = { x : 1.3*2*10e-3, y: 2*10e-3 };
            eC.plotter.displayGrid = false;
            eC.plotter.backgroundColor.draw = false;
            eC.plotter.squareByX = true;
        })
        .addObjects(
            Field, 1, Models.getModel(config.advanced.model, config.advanced.model_options),
            Math.round(pointersF2[0].getValue()), config.advanced.stepSize, config.main.minFieldMag,
            config.colorRepresentation
        );

    window.windowResized = function() {
        let p = _pSimulationInstance.getCanvasProportions(_pSimulationInstance.config.engine.window.proportions);
        resizeCanvas(p.w, p.h);
        submitSimuType();
    };
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



function submitSimuType() {
    background(0);

    switch (config.advanced.model) {
        case Models.m.CONDENSATEUR:
            config.advanced.model_options = [];
            break;
        case Models.m.LINEAIRE:
            config.advanced.model_options = [
                pointersF3[0].getValue() == 'Positive' ? 1 : -1,
                pointersF3[1].getValue() == 'Positive' ? 1 : -1
            ];
            break;
        case Models.m.TRIANGLE:
            config.advanced.model_options = [
                pointersF3[0].getValue() == 'Positive' ? 1 : -1,
                pointersF3[2].getValue() == 'Positive' ? 1 : -1,
                pointersF3[1].getValue() == 'Positive' ? 1 : -1
            ];
            break;
        case Models.m.RANDOM:
            config.advanced.model_options = [
                parseInt(pointersF3[0].getValue())
            ];
            break;

        case Models.m.CUSTOM:
            pointersF3.forEach((item, i) => {
                pSParam.f3.remove(item);
            });
            pointersF3 = [];
            pSParam.f3.hide();
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

    config.colorRepresentation.colors = {
        positive : { r : Math.round(pointersF2[1].getValue()[0]), g: Math.round(pointersF2[1].getValue()[1]), b: Math.round(pointersF2[1].getValue()[2]) },
        negative : { r : Math.round(pointersF2[2].getValue()[0]), g: Math.round(pointersF2[2].getValue()[1]), b: Math.round(pointersF2[2].getValue()[2]) }
    };


    _pSimulationInstance.plotter.objectsL = [];
    _pSimulationInstance.plotter.objectsL.push(
        new Field(Models.getModel(config.advanced.model, config.advanced.model_options), Math.round(pointersF2[0].getValue()),
        config.advanced.stepSize, config.main.minFieldMag, config.colorRepresentation)
    );
}
