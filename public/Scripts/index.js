import MainScene from 'Classes/Scene.js'
import { UpdateSceneItems } from 'Handlers/SceneSpawnHandler.js'
import SocketHandler from 'Handlers/SocketHandler.js';


// Initialize Server Pipeline
SocketHandler.init();


// Initialize Render Pipeline
let visualizerScene = new MainScene();
visualizerScene.tick();
UpdateSceneItems(visualizerScene);
