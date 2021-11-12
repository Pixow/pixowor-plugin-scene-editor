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
  IMoss,
  IPos,
  SceneEditorCanvas,
  SceneEditorEmitType,
} from "@PixelPai/game-core";
import { Capsule } from "game-capsule";
import { op_def, op_client, op_editor} from "pixelpai_proto";

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

  gridLayerVisible = true;
  alignWithGrid = true;
  walkableLayerVisible = false;
  stackElementToggle = false;

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
            command: () => {
              this.sceneEditorCanvas.changeBrushType(BrushMode.Brush);
            },
          },
          {
            label: "地块笔刷",
            icon: "icon-terrain-brush",
            command: () => {
              this.sceneEditorCanvas.changeBrushType(BrushMode.Brush);
            },
          },
          {
            label: "墙体笔刷",
            icon: "icon-wall-brush",
            command: () => {
              this.sceneEditorCanvas.changeBrushType(BrushMode.Brush);
            },
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
            command: () => {
              this.sceneEditorCanvas.changeBrushType(BrushMode.Eraser);
            },
          },
          {
            label: "擦除墙壁",
            icon: "icon-wall-erase",
            command: () => {
              this.sceneEditorCanvas.changeBrushType(BrushMode.EraserWall);
            },
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
        command: () => {
          this.sceneEditorCanvas.changeBrushType(BrushMode.Select);
        },
      },
      {
        label: "方向翻转",
        icon: "icon-flip",
      },
      {
        label: "网格显示",
        icon: "icon-grid",
        command: () => {
          this.gridLayerVisible = !this.gridLayerVisible;
          this.sceneEditorCanvas.toggleLayerVisible(this.gridLayerVisible);
        },
      },
      {
        label: "吸附网格",
        icon: "icon-align-grid",
        command: () => {
          this.alignWithGrid = !this.alignWithGrid;
          this.sceneEditorCanvas.toggleAlignWithGrid(this.alignWithGrid);
        },
      },
      {
        label: "物件堆叠",
        icon: "icon-stack",
        command: () => {
          this.stackElementToggle = !this.stackElementToggle;
          this.sceneEditorCanvas.toggleStackElement(this.stackElementToggle);
        },
      },
      {
        label: "行走区域",
        icon: "icon-walk-area",
        command: () => {
          this.walkableLayerVisible = !this.walkableLayerVisible;
          this.sceneEditorCanvas.setGroundWalkableLayerVisible(this.walkableLayerVisible);
        },
      },
    ];
  }

  start() {
    const { offsetWidth, offsetHeight } = this.sceneEditor.nativeElement;

    const gameCapsule = new Capsule();
    const gameNode = gameCapsule.add.game();

    const capsule = new Capsule();
    const scene = capsule.add.scene();
    scene.link();
    if (scene.mapSize) {
      scene.mapSize.rows = 10;
      scene.mapSize.cols = 10;
    }
    if (scene.groundWalkableCollection) {
      scene.groundWalkableCollection.data = new Array(10 * 10).fill(false);
    }

    // 获取游戏服务器的配置
    const { WEB_RESOURCE_URI } = this.pixoworCore.settings;

    this.sceneEditorCanvas = EditorCanvasManager.CreateCanvas(
      EditorCanvasType.Scene,
      {
        width: offsetWidth,
        height: offsetHeight,
        parent: "sceneEditor",
        node: {
          game: gameNode,
          scene: scene,
        },
        osdPath: WEB_RESOURCE_URI,
      }
    ) as SceneEditorCanvas;

    // 场景创建完成
    this.sceneEditorCanvas.on(SceneEditorEmitType.SceneCreated, () => {
      this.initSceneEditorTools();
    });
    // 同步模板及装饰物件
    this.sceneEditorCanvas.on(SceneEditorEmitType.SyncPaletteOrMoss, (key: number, type: op_def.NodeType) => {

    });
    // 同步选择物
    this.sceneEditorCanvas.on(SceneEditorEmitType.ElementSelected, (ids: number[], nodeType: op_def.NodeType, isMoss: boolean) => {

    });
    // 更新天空盒
    this.sceneEditorCanvas.on(SceneEditorEmitType.UpdateScenery, (id: number, offset: IPos) => {

    });
    // 创建物件
    this.sceneEditorCanvas.on(SceneEditorEmitType.CreateSprite, (nodeType: op_def.NodeType, sprites: op_client.ISprite[]) => {

    });
    // 同步物件
    this.sceneEditorCanvas.on(SceneEditorEmitType.SyncSprite, (sprites: op_client.ISprite[]) => {

    });
    // 删除物件
    this.sceneEditorCanvas.on(SceneEditorEmitType.DeleteSprite, (ids: number[], nodeType: op_def.NodeType) => {

    });
    // 创建装饰物
    this.sceneEditorCanvas.on(SceneEditorEmitType.CreateMoss, (mosses: IMoss[]) => {

    });
    // 同步装饰物
    this.sceneEditorCanvas.on(SceneEditorEmitType.SyncMoss, (mosses: IMoss[]) => {

    });
    // 删除装饰物
    this.sceneEditorCanvas.on(SceneEditorEmitType.DeleteMoss, (mosses: IMoss[]) => {

    });
    // 创建墙体
    this.sceneEditorCanvas.on(SceneEditorEmitType.CreateWall, (walls: IMoss[]) => {

    });
    // 删除墙体
    this.sceneEditorCanvas.on(SceneEditorEmitType.DeleteWall, (walls: IMoss[]) => {

    });
    // 绘制地块
    this.sceneEditorCanvas.on(SceneEditorEmitType.AddTerrain, (locs: IPos[], key: number) => {

    });
    // 删除地块
    this.sceneEditorCanvas.on(SceneEditorEmitType.DeleteTerrain, (locs: IPos[]) => {

    });
    // 同步可行走笔刷绘制结果
    this.sceneEditorCanvas.on(SceneEditorEmitType.SyncWalkable, (walkable: boolean, indexes: number[]) => {

    });
  }

  public handleUseTool(item: SceneEditorTool) {
    item.command && item.command();

    if (item.hasOwnProperty("active")) item.active = true;
  }


}
