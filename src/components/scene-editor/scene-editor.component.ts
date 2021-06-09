
import { PluginStore, usePluginStore } from "angular-pluggable";
import { Component, Injector, OnInit, ElementRef, ViewChild, AfterViewInit } from "@angular/core";
import {
  GameMain,
  EditorLauncher,
  EditorCanvasType,
} from "@PixelPai/game-core";
import { Game } from "../../game";

@Component({
  selector: "scene-editor",
  templateUrl: "./scene-editor.component.html",
  styleUrls: ["./scene-editor.component.scss"],
})
export class SceneEditorComponent implements OnInit, AfterViewInit {
  private pluginStore: PluginStore = usePluginStore();
  private context: any = this.pluginStore.getContext();
  @ViewChild("sceneEditor") sceneEditor: ElementRef;
  _app: GameMain;

  constructor(public game: Game) {}

  ngOnInit() {
  }


  ngAfterViewInit() {
    this.start()
  }

  start() {

    const { offsetWidth, offsetHeight } = this.sceneEditor.nativeElement;

    const {
      TEST_GAME_CONFIG_IP_MOBILE,
      TEST_GAME_CONFIG_PORT_MOBILE,
      API_URL,
      WEB_RESOURCE_URI,
    } = this.context.getGameServerConfig();

    this._app = EditorLauncher.CreateCanvas(EditorCanvasType.Scene, {
      width: offsetWidth,
      height: offsetHeight,
      connection: this.context.socket,
      game_id: this.game._id,
      isEditor: true,
      runtime: "editor",
      api_root: API_URL,
      osd: WEB_RESOURCE_URI,
      parent: "scene",
      server_addr: {
        host: TEST_GAME_CONFIG_IP_MOBILE,
        port: TEST_GAME_CONFIG_PORT_MOBILE,
        secure: true,
      },
      game_created: () => {
      
      },
    });
  }
}
