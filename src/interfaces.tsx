export interface Herder {
  name: string;
  id?: string;
}

export interface Job {
  user: string;
  index: string;
  host: string;
  token: string;
  workflow: string;
}

export interface ErrorResponse {
  error: any;
}
