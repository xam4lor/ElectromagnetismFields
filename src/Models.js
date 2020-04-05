class Models {
    static m = {
        CONDENSATEUR : 'condensateur',
        LINEAIRE     : 'lineaire',
        TRIANGLE     : 'triangle',
        RANDOM       : 'random',
        CUSTOM       : 'custom'
    };

    static getByName(name) {
        switch (name) {
            case 'condensateur':
                return Models.m.CONDENSATEUR;
                break;
            case 'lineaire':
                return Models.m.LINEAIRE;
                break;
            case 'triangle':
                return Models.m.TRIANGLE;
                break;
            case 'random':
                return Models.m.RANDOM;
                break;
            case 'custom':
                return Models.m.CUSTOM;
                break;
        }
    }

    static getModel(model, options = [1, 1, 1]) {
        let particles = [];
        let particleRadius = 4*10e-4;

        switch (model) {
            case Models.m.CONDENSATEUR:
                let nbSize = 9;
                for (let i = 0; i < nbSize; i++) {
                    particles.push({
                        x : -10e-3 + 10e-3 / (nbSize / 2) * i,
                        y : -10e-3 / 2,
                        q : -1,
                        r : particleRadius
                    });

                    particles.push({
                        x : -10e-3 + 10e-3 / (nbSize / 2) * i,
                        y : +10e-3 / 2,
                        q : +1,
                        r : particleRadius
                    });
                }
                break;


            case Models.m.LINEAIRE:
                particles = [
                    {x : -10e-3 / 2, y : 0, q : options[0], r : particleRadius},
                    {x :  10e-3 / 2, y : 0, q : options[1], r : particleRadius}
                ];
                break;


            case Models.m.TRIANGLE:
                particles = [
                    {x : -10e-3 / 2, y : 0, q : options[0], r : particleRadius},
                    {x :  10e-3 / 2, y : 0, q : options[1], r : particleRadius},
                    {x :  0        , y : 1/Math.sqrt(2) * 10e-3 / 2, q : options[2], r : particleRadius}
                ];
                break;


            case Models.m.RANDOM:
                for (let i = 0; i < options[0]; i++) {
                    let c = _pSimulationInstance.getEngineConfig().plotter.scale;
                    particles.push({
                        x : -c.x + Math.random() * c.x * 2,
                        y : -c.y + Math.random() * c.y * 2,
                        q : Math.sign(Math.random() - 0.5),
                        r : particleRadius
                    });
                }
                break;
        }

        return particles;
    }
}
