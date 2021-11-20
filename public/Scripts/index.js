import MainScene from 'Classes/Scene.js'
import { UpdateSceneItems } from 'Handlers/SceneSpawnHandler.js'
import SocketHandler from 'Handlers/SocketHandler.js';





// Initialize Scene / Threejs Pipeline
let visualizerScene = new MainScene();
visualizerScene.tick();
UpdateSceneItems(visualizerScene);

// Initialize Server Pipeline
SocketHandler.init();
