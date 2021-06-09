import { Injectable } from "@angular/core";
import { PluginStore, usePluginStore } from "angular-pluggable";

@Injectable({
  providedIn: "root"
})
export class SceneEditorService {
  private pluginStore: PluginStore = usePluginStore();
  private context: any = this.pluginStore.getContext();

  constructor() {
  }

}