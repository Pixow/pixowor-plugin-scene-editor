import { PixoworCore, FileConfig, EDITING_GAME } from "pixowor-core";
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
  EditorCanvasType, ElementInstance,
  IMoss,
  IPos,
  SceneEditorCanvas,
  SceneEditorEmitType,
} from "@PixelPai/game-core";
import { Capsule, GameNode, NodeType, SceneNode } from "game-capsule";
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
  editingSceneId: number;
  gameNode: GameNode;
  sceneNode: SceneNode;

  constructor(
    private pixoworCore: PixoworCore,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.editingGame = this.pixoworCore.getEditingObject(EDITING_GAME);

    this.pixoworCore.state.getVariable<Capsule>("GameCapsule").subscribe((gameCapsule: Capsule) => {
      if (gameCapsule) {
        this.gameNode = gameCapsule.treeNodes[0] as GameNode;
      }
    })
    this.pixoworCore.state
      .getVariable<Capsule>("SceneCapsule")
      .subscribe((sceneCapsule: Capsule) => {
        if (sceneCapsule) {
          this.sceneNode = sceneCapsule.treeNodes[0] as SceneNode;

          if (this.editingSceneId && this.editingSceneId === this.sceneNode.id) {
            return;
          }
          this.editingSceneId = this.sceneNode.id;
          this.createSceneCanvas();
        }
      });


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
        command: () => {
          // this.sceneEditorCanvas.
        }
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
        gameDir: "file://" + this.editingGame.filePath + "/",
        osdPath: WEB_RESOURCE_URI,
      }
    ) as SceneEditorCanvas;

    this.pixoworCore.state.registerVariable(
      "SceneEditorCanvas",
      this.sceneEditorCanvas
    );

    // 场景创建完成
    this.sceneEditorCanvas.on(SceneEditorEmitType.SceneCreated, () => {});
    // 同步模板及装饰物件
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.SyncPaletteOrPrefab,
      (key: number, type: op_def.NodeType) => {
        console.log("SyncPaletteOrMoss: ", key, type);
      }
    );
    // 同步选择物
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.ElementSelected,
      (ids: number[], nodeType: op_def.NodeType, isMoss: boolean) => {
        console.log("ElementSelected: ", ids, nodeType, isMoss);

        this.pixoworCore.state.getVariable("SelectedElements").next(ids);
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
      SceneEditorEmitType.CreateElements,
      (datas: ElementInstance[]) => {
        console.log("CreateElements: ", datas);
        for (const moss of datas) {
          const {location, ref, id} = moss;

          // Use ElementPrefab to create this element instance
          const cap = new Capsule();
          const element = cap.add.element();
          element.id = id;
          if (ref) element.ref = ref;
          element.parentId = this.sceneNode.id;
          if (location && element.location) {
            element.location.x = location.x;
            element.location.y = location.y;
          }

          const elementInstance = element.createElementInstance();
          this.sceneNode.addElement(elementInstance);
        }

        this.pixoworCore.state.getVariable<Capsule>("SceneCapsule").next(this.sceneNode.cap);
      }
    );
    // 同步物件
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.SyncElements,
      (datas: ElementInstance[]) => {
        console.log("SyncElements: ", datas);
      }
    );
    // 删除物件
    this.sceneEditorCanvas.on(
      SceneEditorEmitType.DeleteElements,
      (ids: number[]) => {
        console.log("DeleteElements: ", ids);
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
