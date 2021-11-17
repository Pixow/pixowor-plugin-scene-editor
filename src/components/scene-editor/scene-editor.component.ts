import { PixoworCore, FileConfig } from "pixowor-core";
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
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
import { Capsule, GameNode, SceneNode } from "game-capsule";
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

  activeTool: SceneEditorTool;

  editingGame: FileConfig;
  gameNode: GameNode;
  sceneNode: SceneNode;

  constructor(
    private pixoworCore: PixoworCore,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.editingGame = this.pixoworCore.getEditingGame()

    this.pixoworCore.stateManager.getVariable("GameCapsule").subscribe((gameCapsule: Capsule) => {
      if (gameCapsule) {
        this.gameNode = gameCapsule.treeNodes[0] as GameNode;
      }
    })
    this.pixoworCore.stateManager.getVariable("SceneCapsule").subscribe((sceneCapsule: Capsule) => {
      if (sceneCapsule) {
        this.sceneNode = sceneCapsule.treeNodes[0] as SceneNode;

        this.createSceneCanvas();
      }
    })


  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initSceneEditorTools();
      // this.createSceneCanvas();

      this.cd.detectChanges();
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
          this.sceneEditorCanvas.setGroundWalkableLayerVisible(
            this.walkableLayerVisible
          );
        },
      },
    ];
  }

  createSceneCanvas() {
    const { offsetWidth, offsetHeight } = this.sceneEditor.nativeElement;

    if (!this.gameNode) {
      throw new Error("GameNode is empty");
    }

    if (!this.sceneNode) {
      throw new Error("SceneNode is empty");
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
          game: this.gameNode,
          scene: this.sceneNode,
        },
        gameDir: "file://" + this.editingGame.filePath,
        osdPath: WEB_RESOURCE_URI,
      }
    ) as SceneEditorCanvas;

    this.pixoworCore.stateManager.registerVariable(
      "SceneEditorCanvas",
      this.sceneEditorCanvas
    );

    // 场景创建完成
    this.sceneEditorCanvas.on(SceneEditorEmitType.SceneCreated, () => {});
    // 同步模板及装饰物件
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.SyncPaletteOrMoss,
      (key: number, type: op_def.NodeType) => {
        console.log("SyncPaletteOrMoss: ", key, type);
      }
    );
    // 同步选择物
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.ElementSelected,
      (ids: number[], nodeType: op_def.NodeType, isMoss: boolean) => {
        console.log("ElementSelected: ", ids, nodeType, isMoss);
      }
    );
    // 更新天空盒
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.UpdateScenery,
      (id: number, offset: IPos) => {
        console.log("UpdateScenery: ", id, offset);
      }
    );
    // 创建物件
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.CreateSprite,
      (nodeType: op_def.NodeType, sprites: op_client.ISprite[]) => {
        console.log("CreateSprite: ", nodeType, sprites);
      }
    );
    // 同步物件
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.SyncSprite,
      (sprites: op_client.ISprite[]) => {
        console.log("SyncSprite: ", sprites);
      }
    );
    // 删除物件
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.DeleteSprite,
      (ids: number[], nodeType: op_def.NodeType) => {
        console.log("DeleteSprite: ", ids, nodeType);
      }
    );
    // 创建装饰物
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.CreateMoss,
      (mosses: IMoss[]) => {
        console.log("CreateMoss: ", mosses);
        for (const moss of mosses) {
          const {x, y, z, key, id} = moss;

          const element = this.sceneNode.cap.add.element(this.sceneNode);
          if (element.location) {
            element.location.x = x;
            element.location.y = y;
          }
        }
      }
    );
    // 同步装饰物
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.SyncMoss,
      (mosses: IMoss[]) => {
        console.log("SyncMoss: ", mosses);
      }
    );
    // 删除装饰物
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.DeleteMoss,
      (mosses: IMoss[]) => {
        console.log("DeleteMoss: ", mosses);
      }
    );
    // 创建墙体
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.CreateWall,
      (walls: IMoss[]) => {
        console.log("CreateWall: ", walls);
      }
    );
    // 删除墙体
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.DeleteWall,
      (walls: IMoss[]) => {
        console.log("DeleteWall: ", walls);
      }
    );
    // 绘制地块
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.AddTerrain,
      (locs: IPos[], key: number) => {
        console.log("AddTerrain: ", locs, key);
      }
    );
    // 删除地块
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.DeleteTerrain,
      (locs: IPos[]) => {
        console.log("DeleteTerrain: ", locs);
      }
    );
    // 同步可行走笔刷绘制结果
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.SyncWalkable,
      (walkable: boolean, indexes: number[]) => {
        console.log("SyncWalkable: ", walkable, indexes);
      }
    );
  }

  public handleUseTool(item: SceneEditorTool) {
    item.command && item.command();

    this.activeTool = item;
  }
}
