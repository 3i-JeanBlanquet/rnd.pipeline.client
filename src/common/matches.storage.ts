export class MatchStorage{
  constructor(
    private _matchId:string
  ){}

  public getMatches0File():string{
    return `matches/${this._matchId}/matches0.npy`;
  }

  public getMatches1File():string{
    return `matches/${this._matchId}/matches1.npy`;
  }

  public getImageFile():string{
    return `matches/${this._matchId}/matches.png`;
  }  

  public getValidMatchesFile():string{
    return `matches/${this._matchId}/valid_matches.json`;
  }  

  public getPoseEstimation():string{
    return `matches/${this._matchId}/pose.json`;
  }
}

export interface Pose{
  R:number[][];
  t:number[][];
}

export interface IValidMatches{
  valid_matches0_count:number;
  valid_matches1_count:number;
}