import { Injector } from "@angular/core";
import {  Event, FunctionNames, IPlugin, PluginStore } from "angular-pluggable";
import { Capsule } from "game-capsule";
import { SceneEditorComponent } from "./components/scene-editor/scene-editor.component";
import { Game } from "./game";

export interface ActivitybarItem {
  title: string;
  id: string;
  icon: string;
  command: () => void;
}

export class SceneEditorPlugin implements IPlugin {
  public pluginStore: PluginStore;
  title = "场景编辑";
  id = "scene-editor";

  getPluginName() {
    return "scene-editor-plugin@1.0.1";
  }

  getDependencies() {
    return [];
  }

  init(pluginStore: PluginStore) {
    this.pluginStore = pluginStore;
  }

  activate() {

    this.pluginStore.addEventListener("RenderSceneEditor", (event) => {
      const {game, sceneId} = (event as any).data;

      (this.pluginStore.getContext() as any).readGameScenePiFile(game.owner.username, game._id, game.lastVersion, sceneId)
        .then(data => {
          console.log(">> data: ", data)

          const config = new Capsule()
          config.deserialize(data)

          console.log(">> config: ", config)

          this.pluginStore.dispatchEvent(new Event("ShowInStage", {
            id: scene.id,
            header: `${game.name}-${scene.name}`,
            content: game.description,
            component: SceneEditorComponent,
            getInjector: (inj: Injector) => {
              return Injector.create([{provide: Game, useValue: game}], inj)
            }
          }))
        })

    })
  }

  deactivate() {}
}
