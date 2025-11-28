export class BundleStorage{
  constructor(private _id:string){}
  
  public getFeaturesDir():string{
    return `bundles/${this._id}/features`;
  }

  public getMappedIndex():string{
    return `bundles/${this._id}/features/pydir_index_mapping.json`;
  }

  public getNearestDir(itemId:string):string{
    return `bundles/${this._id}/nearest/${itemId}`;
  }

  public getNearestFile(itemId:string):string{
    return `bundles/${this._id}/nearest/${itemId}/search_results.json`;
  }

  public get3DDatabaseFile():string{
    return `bundles/${this._id}/3d/data.db`;
  }

  public get3DPointsFile():string{
    return `bundles/${this._id}/3d/points3D.bin`;
  }

  public get3DImagesFile():string{
    return `bundles/${this._id}/3d/images.bin`;
  }

  public get3DCamerasFile():string{
    return `bundles/${this._id}/3d/cameras.bin`;
  }

  public getCamerasFile():string{
    return `bundles/${this._id}/3d/cameras.json`;
  }

  public get3DMeshFile():string{
    return `bundles/${this._id}/3d/mesh.ply`;
  }

  public get3DMeshGeometryFile():string{
    return `bundles/${this._id}/3d/textured_mesh.obj`;
  }

  public get3DTexture00File():string{
    return `bundles/${this._id}/3d/textured_mesh_material0000_map_Kd.png`;
  }

  public get3DTexture01File():string{
    return `bundles/${this._id}/3d/textured_mesh_material0001_map_Kd.png`;
  }

  public get3DMeshMaterialFile():string{
    return `bundles/${this._id}/3d/textured_mesh.mtl`;
  }

  public get3DTexturedConfFile():string{
    return `bundles/${this._id}/3d/textured_mesh.conf`;
  }
}

export interface ICamerasDefinition{
  [key: string]: {
    intrinsic:{
      model: string,
      width: number,
      height: number,
      focal_length: number,
      focal_length_x: number,
      focal_length_y: number,
      principal_point_x: number,
      principal_point_y: number,
    },
    extrinsic:{
      rotation_matrix:any,
      translation:any,
      quaternion:any
    }
  };
}

export interface PathByIndices{
  [key: string]: string;
}

export interface NearestResult{
  distance: number[][];
  indices: number[][];
}