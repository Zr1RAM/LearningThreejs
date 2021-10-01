import MainScene from 'Classes/Scene.js'
import { UpdateSceneItems } from 'Handlers/SceneSpawnHandler.js'

let visualizerScene = new MainScene();
visualizerScene.tick();
UpdateSceneItems(visualizerScene);
