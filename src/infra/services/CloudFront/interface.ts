export interface ICloudFrontService {
  invalidarPaths: (payload: InvalidarPathsPayload) => Promise<void>;
}

export interface InvalidarPathsPayload {
  distributionId: string;
  paths: string[];
}
