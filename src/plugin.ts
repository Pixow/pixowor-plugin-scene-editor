import { Component, Injector } from "@angular/core";
import { Plugin, PixoworCore, UIEvents } from "pixowor-core";
import { SceneEditorComponent } from "./components/scene-editor/scene-editor.component";
import manifest from "../manifest.json";
export class SceneEditorPlugin extends Plugin {
  constructor(pixoworCore: PixoworCore) {
    super(pixoworCore, manifest);
  }

  activate() {
    this.pixoworCore.state.registerComponent("SceneEditor", <Component>SceneEditorComponent);
    // this.pixoworCore.workspace.on(UIEvents.)
    this.pixoworCore.workspace.emit(UIEvents.INJECT_EDITOR_AREA, {
      componentName: "SceneEditor",
      header: "场景编辑器"
    })

    // Insert MenuItem
    
  }

  // activate1() {
  //   this.pluginStore.addEventListener("RenderSceneEditor", (event) => {
  //     const { game, scene } = (event as any).data;

  //     const gamePiFile = game.getGamePiFile();

  //     (this.pluginStore.getContext() as any)
  //       .readFileInUserData(gamePiFile)
  //       .then((data) => {
  //         console.log(">> data: ", data);

  //         const config = new Capsule();
  //         config.deserialize(data);

  //         console.log(">> config: ", config);

  //         this.pluginStore.dispatchEvent(
  //           new Event("ShowInStage", {
  //             id: scene.id,
  //             header: `${game.name}-${scene.name}`,
  //             content: game.description,
  //             component: SceneEditorComponent,
  //             getInjector: (inj: Injector) => {
  //               return Injector.create(
  //                 [{ provide: Game, useValue: game }],
  //                 inj
  //               );
  //             },
  //           })
  //         );
  //       });
  //   });
  // }

  deactivate() {}
}
