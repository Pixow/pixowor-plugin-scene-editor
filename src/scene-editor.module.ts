import { NgModule,  } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SceneEditorComponent } from "./components/scene-editor/scene-editor.component";
import { SceneEditorService } from "./scene-editor.service";
import { NgxTippyModule } from "ngx-tippy-wrapper";

@NgModule({
  imports: [CommonModule, NgxTippyModule],
  declarations: [SceneEditorComponent],
  providers: [SceneEditorService],
})
export class SceneEditorModule {}