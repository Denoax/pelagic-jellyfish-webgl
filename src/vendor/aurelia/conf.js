class Conf {
    gui = null;

    roughness = 0.42;
    metalness = 0.0;
    transmission = 0.91;
    color = 0xffffff; //0xf4aaff;
    iridescence = 0.28;
    iridescenceIOR = 1.34;
    clearcoat = 0.12;
    clearcoatRoughness = 0.46;

    runSimulation = true;
    showVerletSprings = false;

    constructor() { }

    init() { }

    update() {
    }

    begin() { }
    end() { }

}
export const conf = new Conf();
