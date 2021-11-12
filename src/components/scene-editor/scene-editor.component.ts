import { PixoworCore } from "pixowor-core";
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import {
  BrushMode,
  EditorCanvasManager,
  EditorCanvasType,
  SceneEditorCanvas,
  SceneEditorEmitType,
} from "@PixelPai/game-core";
import { Capsule } from "game-capsule";

export interface SceneEditorTool {
  label: string;
  icon: string;
  active?: boolean;
  command?: Function;
  children?: SceneEditorTool[];
}
@Component({
  selector: "scene-editor",
  templateUrl: "./scene-editor.component.html",
  styleUrls: ["./scene-editor.component.scss"],
})
export class SceneEditorComponent implements OnInit, AfterViewInit {
  @ViewChild("sceneEditor") sceneEditor: ElementRef;
  sceneEditorCanvas: SceneEditorCanvas;

  tools: SceneEditorTool[];

  constructor(private pixoworCore: PixoworCore) {}

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.start();
    }, 0);
  }

  initSceneEditorTools() {
    this.tools = [
      {
        label: "笔刷设置",
        icon: "icon-brush",
        children: [
          {
            label: "物件笔刷",
            icon: "icon-element-brush",
          },
          {
            label: "地块笔刷",
            icon: "icon-terrain-brush",
          },
          {
            label: "墙体笔刷",
            icon: "icon-wall-brush",
          },
        ],
      },
      {
        label: "橡皮擦",
        icon: "icon-erase",
        children: [
          {
            label: "擦除地块",
            icon: "icon-terrain-erase",
          },
          {
            label: "擦除墙壁",
            icon: "icon-wall-erase",
          },
        ],
      },
      {
        label: "镜头移动",
        icon: "icon-camera-move",
        active: false,
        command: () => {
          this.sceneEditorCanvas.changeBrushType(BrushMode.Move);
        },
      },
      {
        label: "对象选择",
        icon: "icon-select",
      },
      {
        label: "方向翻转",
        icon: "icon-flip",
      },
      {
        label: "网格显示",
        icon: "icon-grid",
      },
      {
        label: "吸附网格",
        icon: "icon-align-grid",
      },
      {
        label: "物件堆叠",
        icon: "icon-stack",
      },
      {
        label: "行走区域",
        icon: "icon-walk-area",
      },
    ];
  }

  start() {
    const { offsetWidth, offsetHeight } = this.sceneEditor.nativeElement;

    const capsule = new Capsule();
    const scene = capsule.add.scene();
    if (scene.mapSize) {
      scene.mapSize.rows = 10;
      scene.mapSize.cols = 10;
    }
    scene.link();

    // 获取游戏服务器的配置
    const { WEB_RESOURCE_URI } = this.pixoworCore.settings;


    this.sceneEditorCanvas = EditorCanvasManager.CreateCanvas(
      EditorCanvasType.Scene,
      {
        width: offsetWidth,
        height: offsetHeight,
        parent: "sceneEditor",
        node: {
          game: capsule,
          scene: scene,
        },
        osdPath: WEB_RESOURCE_URI,
      }
    ) as SceneEditorCanvas;

    this.pixoworCore.stateManager.registerVariable(
      "SceneEditorCanvas",
      this.sceneEditorCanvas
    );


    this.sceneEditorCanvas.on(SceneEditorEmitType.SceneCreated, () => {
      // this.sceneEditorCanvas.init();
      this.initSceneEditorTools();
    });

    this.sceneEditorCanvas.on(SceneEditorEmitType.SyncSprite, () => {})
  }

  public handleUseTool(item: SceneEditorTool) {
    item.command && item.command();

    if (item.hasOwnProperty("active")) item.active = true;
  }


}
