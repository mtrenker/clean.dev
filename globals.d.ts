/* eslint-disable */
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSDate: string;
  AWSDateTime: string;
  AWSJSON: { [key: string]: any };
};




export type Query = {
  __typename?: 'Query';
  page?: Maybe<Page>;
  projects: ProjectConnection;
  trackings: TrackingConnection;
};


export type QueryPageArgs = {
  input: PageInput;
};


export type QueryTrackingsArgs = {
  query?: Maybe<TrackingQuery>;
};

export type Mutation = {
  __typename?: 'Mutation';
  track: Tracking;
  addProject: Project;
};


export type MutationTrackArgs = {
  input: TrackingInput;
};


export type MutationAddProjectArgs = {
  input: ProjectInput;
};

export type Page = {
  __typename?: 'Page';
  slug: Scalars['String'];
  title: Scalars['String'];
  content: Scalars['String'];
};

export type ProjectConnection = {
  __typename?: 'ProjectConnection';
  items: Array<Project>;
  nextToken?: Maybe<Scalars['String']>;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  client: Scalars['String'];
  industry: Scalars['String'];
  description: Scalars['String'];
  startDate: Scalars['AWSDate'];
  endDate?: Maybe<Scalars['AWSDate']>;
  methodologies: Array<Scalars['String']>;
  technologies: Array<Scalars['String']>;
};

export type TrackingConnection = {
  __typename?: 'TrackingConnection';
  items: Array<Tracking>;
  nextToken?: Maybe<Scalars['String']>;
};

export type Tracking = {
  __typename?: 'Tracking';
  id: Scalars['ID'];
  project?: Maybe<Project>;
  description: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
};

export type PageInput = {
  slug: Scalars['String'];
};

export type TrackingInput = {
  id?: Maybe<Scalars['ID']>;
  projectId: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
};

export type ProjectInput = {
  id?: Maybe<Scalars['ID']>;
  client: Scalars['String'];
  industry: Scalars['String'];
  description: Scalars['String'];
  startDate: Scalars['AWSDate'];
  endDate?: Maybe<Scalars['AWSDate']>;
  methodologies: Array<Scalars['String']>;
  technologies: Array<Scalars['String']>;
};

export type TrackingQuery = {
  project: Scalars['String'];
  date: Scalars['String'];
};
