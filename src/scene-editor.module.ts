import { NgModule,  } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SceneEditorComponent } from "./components/scene-editor/scene-editor.component";
import { SceneEditorService } from "./scene-editor.service";

@NgModule({
  imports: [CommonModule],
  declarations: [SceneEditorComponent],
  providers: [SceneEditorService],
})
export class SceneEditorModule {}