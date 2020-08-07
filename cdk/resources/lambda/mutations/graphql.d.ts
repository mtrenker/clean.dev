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
  blog: Blog;
  projects: ProjectConnection;
  project: Project;
  trackings: TrackingConnection;
};


export type QueryPageArgs = {
  input: PageInput;
};


export type QueryProjectArgs = {
  query?: Maybe<ProjectQuery>;
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

export type Blog = {
  __typename?: 'Blog';
  post: BlogPost;
  list: BlogPostConnection;
};


export type BlogPostArgs = {
  input: BlogPostQuery;
};

export type BlogPostConnection = {
  __typename?: 'BlogPostConnection';
  items: Array<BlogPost>;
};

export type BlogPost = {
  __typename?: 'BlogPost';
  id: Scalars['ID'];
  title: Scalars['String'];
  slug: Scalars['String'];
  publishDate: Scalars['AWSDateTime'];
  author: Author;
  heroImage?: Maybe<Image>;
  intro: Scalars['String'];
  content: Scalars['String'];
};

export type Image = {
  __typename?: 'Image';
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  width: Scalars['Int'];
  height: Scalars['Int'];
  size: Scalars['Int'];
  url: Scalars['String'];
};

export type Author = {
  __typename?: 'Author';
  name: Scalars['String'];
  avatar?: Maybe<Image>;
};

export type PageInput = {
  slug: Scalars['String'];
};

export type BlogPostQuery = {
  post: Scalars['String'];
};

export type TrackingInput = {
  id?: Maybe<Scalars['ID']>;
  projectId: Scalars['String'];
  description: Scalars['String'];
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

export type ProjectQuery = {
  project: Scalars['String'];
};
