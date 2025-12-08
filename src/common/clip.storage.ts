export class ClipStorage{
  constructor(
    private _id:string,
    private _extension:string
  ){}

  public getClipFile():string{
    return `clips/${this._id}.${this._extension}`;
  }
}