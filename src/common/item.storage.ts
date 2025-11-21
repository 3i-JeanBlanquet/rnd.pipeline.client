export class ItemStorage{
  constructor(
    private _id:string,
    private _extension:string,
    private _parentId?:string,
  ){}

  public getImageDir():string{
    if(this._parentId){
      return `items/${this._parentId}/children/${this._id}`;
    }else{
      return `items/${this._id}`;
    }
  }

  public getFeatureScoreFile():string{
    if(this._parentId){
      return `items/${this._parentId}/children/${this._id}/features/scores.npy`;
    }else{
      return `items/${this._id}/features/scores.npy`;
    }
  }

  public getFeatureImgFile():string{
    if(this._parentId){
      return `items/${this._parentId}/children/${this._id}/features/image_tensor.npy`;
    }else{
      return `items/${this._id}/features/image_tensor.npy`;
    }
  }

  public getFeatureKeyFile():string{
    if(this._parentId){
      return `items/${this._parentId}/children/${this._id}/features/keypoints.npy`;
    }else{
      return `items/${this._id}/features/keypoints.npy`;
    }
  }

  public getFeatureDescriptorFile():string{
    if(this._parentId){
      return `items/${this._parentId}/children/${this._id}/features/descriptors.npy`;
    }else{
      return `items/${this._id}/features/descriptors.npy`;
    }
  }

  public getDepthFile():string{
    if(this._parentId){
      return `items/${this._parentId}/children/${this._id}/depth.png`;
    }else{
      return `items/${this._id}/depth.png`;
    }
  }

  public getImageFile():string{
    if(this._parentId){
      return `items/${this._parentId}/children/${this._id}/image.${this._extension}`;
    }else{
      return `items/${this._id}/image.${this._extension}`;
    }
  }

  public getCameraFile():string{
    if(this._parentId){
      return `items/${this._parentId}/children/${this._id}/camera.json`;
    }else{
      return `items/${this._id}/camera.json`;
    }
  }

  public getFeatureDir():string{
    if(this._parentId){
      return `items/${this._parentId}/children/${this._id}/features`;
    }else{
      return `items/${this._id}/features`;
    }
  }
  public getFeatureFile():string{
    if(this._parentId){
      return `items/${this._parentId}/children/${this._id}/features/features.png`;
    }else{
      return `items/${this._id}/features/features.png`;
    }
  }
}