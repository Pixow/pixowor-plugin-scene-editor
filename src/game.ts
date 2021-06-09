export enum Visibility {
  Private = "Private",
  Internal = "Internal",
  Public = "Public",
}

export interface User {
  _id: string;
  username: string;
  nickname: string;
  password: string;
  expire: string;
  fingerprint: string;
  token: string;
  refreshToken: string;
  uid: string;
}

export class GameVersion {
  gameConfig: string[];
  createdAt: string; 
  version: string;
  commit: string;

  constructor(init?: Partial<GameVersion>) {
    Object.assign(this, init);
  }
}

export class Game {
  shortid: string;
  _id: string;
  serverStatus: number;
  _cover: string; // 封面图
  tags: string[];
  visibility: Visibility;
  template: boolean;
  thumbnails: string[];
  version: string; // 当前运行的发布版本
  lastVersion: string; // 最后修改版本
  liked_count: number;
  unliked_count: number;
  recommendedLevel: number;
  owner: Partial<User>;
  name: string;
  _description: string;
  createdAt?: string;
  updatedAt?: string;
  releaseVersions: GameVersion[];
  pastVersions: GameVersion[];
  visitsUpdateAt: string;
  positiveRateUpdateAt: string;
  incomeTuDingUpdateAt: string;


  constructor(data?: Partial<Game>) {
    Object.assign(this, data);
  }

  public set cover(value: string) {
    this._cover = value
  }

  public get cover() {
    return this._cover
  }

  public set description(value: string) {
    this._description = value
  }

  public get description() {
    return this._description
  }

  public getUri(version: string) {
    // mjxmjx\game\5f1a49e2b5ad7b67aae31170\0.0.4\5f1a49e2b5ad7b67aae31170.zip
    return `${this.owner.username}/game/${this._id}/${version}/${this._id}.zip`
  }
}