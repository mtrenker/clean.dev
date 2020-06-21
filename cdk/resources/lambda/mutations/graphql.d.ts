export declare type Maybe<T> = T | null;
export declare type Exact<T extends {
    [key: string]: any;
}> = {
    [K in keyof T]: T[K];
};
/** All built-in and custom scalars, mapped to their actual values */
export declare type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    AWSDate: string;
    AWSDateTime: string;
    AWSJSON: {
        [key: string]: any;
    };
};
export declare type Query = {
    __typename?: 'Query';
    page?: Maybe<Page>;
    projects: ProjectConnection;
    trackings: TrackingConnection;
};
export declare type QueryPageArgs = {
    input: PageInput;
};
export declare type QueryTrackingsArgs = {
    query?: Maybe<TrackingQuery>;
};
export declare type Mutation = {
    __typename?: 'Mutation';
    track: Tracking;
    addProject: Project;
};
export declare type MutationTrackArgs = {
    input: TrackingInput;
};
export declare type MutationAddProjectArgs = {
    input: ProjectInput;
};
export declare type Page = {
    __typename?: 'Page';
    slug: Scalars['String'];
    title: Scalars['String'];
    content: Scalars['String'];
};
export declare type ProjectConnection = {
    __typename?: 'ProjectConnection';
    items: Array<Project>;
    nextToken?: Maybe<Scalars['String']>;
};
export declare type Project = {
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
export declare type TrackingConnection = {
    __typename?: 'TrackingConnection';
    items: Array<Tracking>;
    nextToken?: Maybe<Scalars['String']>;
};
export declare type Tracking = {
    __typename?: 'Tracking';
    id: Scalars['ID'];
    project?: Maybe<Project>;
    description: Scalars['String'];
    startTime: Scalars['AWSDateTime'];
    endTime: Scalars['AWSDateTime'];
};
export declare type PageInput = {
    slug: Scalars['String'];
};
export declare type TrackingInput = {
    id?: Maybe<Scalars['ID']>;
    projectId: Scalars['String'];
    description?: Maybe<Scalars['String']>;
    startTime: Scalars['AWSDateTime'];
    endTime: Scalars['AWSDateTime'];
};
export declare type ProjectInput = {
    id?: Maybe<Scalars['ID']>;
    client: Scalars['String'];
    industry: Scalars['String'];
    description: Scalars['String'];
    startDate: Scalars['AWSDate'];
    endDate?: Maybe<Scalars['AWSDate']>;
    methodologies: Array<Scalars['String']>;
    technologies: Array<Scalars['String']>;
};
export declare type TrackingQuery = {
    project: Scalars['String'];
    date: Scalars['String'];
};
