/* eslint-disable */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSDate: string;
  AWSDateTime: string;
};



export type Author = {
  __typename?: 'Author';
  avatar?: Maybe<Image>;
  name: Scalars['String'];
};

export type Blog = {
  __typename?: 'Blog';
  posts: Array<Post>;
};

export type Contact = {
  __typename?: 'Contact';
  city: Scalars['String'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  street: Scalars['String'];
  zip: Scalars['String'];
};

export type ContactInput = {
  city: Scalars['String'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  street: Scalars['String'];
  zip: Scalars['String'];
};

export type File = {
  __typename?: 'File';
  contentType: Scalars['String'];
  details: FileDetails;
  fileName: Scalars['String'];
  url: Scalars['String'];
};

export type FileDetails = {
  __typename?: 'FileDetails';
  image?: Maybe<ImageDetails>;
  size: Scalars['String'];
};

export type Image = {
  __typename?: 'Image';
  description?: Maybe<Scalars['String']>;
  file: File;
  title: Scalars['String'];
};

export type ImageDetails = {
  __typename?: 'ImageDetails';
  height: Scalars['Int'];
  width: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createProject: ProjectMutationResponse;
  createTracking: TrackingMutationResponse;
  deleteProject: ProjectMutationResponse;
  deleteTracking: TrackingMutationResponse;
  updateProject: ProjectMutationResponse;
  updateTracking: TrackingMutationResponse;
};


export type MutationCreateProjectArgs = {
  input: ProjectInput;
};


export type MutationCreateTrackingArgs = {
  input: TrackingInput;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteTrackingArgs = {
  id: Scalars['ID'];
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID'];
  input: ProjectInput;
};


export type MutationUpdateTrackingArgs = {
  id: Scalars['ID'];
  input: TrackingInput;
};

export type Page = {
  __typename?: 'Page';
  content: Scalars['String'];
  layout: Scalars['String'];
  slug: Scalars['String'];
  title: Scalars['String'];
};

export type Post = {
  __typename?: 'Post';
  author: Author;
  content?: Maybe<Scalars['String']>;
  heroImage?: Maybe<Image>;
  intro?: Maybe<Scalars['String']>;
  publishDate: Scalars['AWSDateTime'];
  slug: Scalars['String'];
  title: Scalars['String'];
};

export type Project = {
  __typename?: 'Project';
  client: Scalars['String'];
  contact: Contact;
  description: Scalars['String'];
  endDate?: Maybe<Scalars['AWSDate']>;
  id: Scalars['ID'];
  industry: Scalars['String'];
  methodologies: Array<Scalars['String']>;
  startDate: Scalars['AWSDate'];
  technologies: Array<Scalars['String']>;
  trackings: TrackingConnection;
};


export type ProjectTrackingsArgs = {
  date?: Maybe<Scalars['String']>;
};

export type ProjectConnection = {
  __typename?: 'ProjectConnection';
  cursor?: Maybe<Scalars['String']>;
  items: Array<Project>;
  totalCount: Scalars['Int'];
};

export type ProjectInput = {
  client: Scalars['String'];
  contact: ContactInput;
  description: Scalars['String'];
  endDate?: Maybe<Scalars['AWSDate']>;
  industry: Scalars['String'];
  methodologies: Array<Scalars['String']>;
  startDate: Scalars['AWSDate'];
  technologies: Array<Scalars['String']>;
};

export type ProjectMutationResponse = {
  __typename?: 'ProjectMutationResponse';
  code: Scalars['String'];
  message: Scalars['String'];
  project: Project;
  success: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  getBlog: Blog;
  getPage?: Maybe<Page>;
  getPost?: Maybe<Post>;
  getProject: Project;
  getProjects: ProjectConnection;
  getTrackings: TrackingConnection;
};


export type QueryGetPageArgs = {
  slug: Scalars['String'];
};


export type QueryGetPostArgs = {
  slug: Scalars['String'];
};


export type QueryGetProjectArgs = {
  id: Scalars['ID'];
};


export type QueryGetTrackingsArgs = {
  date?: Maybe<Scalars['String']>;
  projectId: Scalars['String'];
};

export type Tracking = {
  __typename?: 'Tracking';
  description?: Maybe<Scalars['String']>;
  endTime: Scalars['AWSDateTime'];
  id: Scalars['ID'];
  startTime: Scalars['AWSDateTime'];
};

export type TrackingConnection = {
  __typename?: 'TrackingConnection';
  cursor?: Maybe<Scalars['String']>;
  items: Array<Tracking>;
  totalCount: Scalars['Int'];
};

export type TrackingInput = {
  description?: Maybe<Scalars['String']>;
  endTime: Scalars['AWSDateTime'];
  projectId: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
};

export type TrackingMutationResponse = {
  __typename?: 'TrackingMutationResponse';
  code: Scalars['String'];
  message: Scalars['String'];
  success: Scalars['Boolean'];
  tracking: Tracking;
};

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = (
  { __typename?: 'Query' }
  & { getProjects: (
    { __typename?: 'ProjectConnection' }
    & Pick<ProjectConnection, 'totalCount'>
    & { items: Array<(
      { __typename?: 'Project' }
      & Pick<Project, 'id'>
    )> }
  ) }
);

export type CreateProjectMutationVariables = Exact<{
  input: ProjectInput;
}>;


export type CreateProjectMutation = (
  { __typename?: 'Mutation' }
  & { createProject: (
    { __typename?: 'ProjectMutationResponse' }
    & Pick<ProjectMutationResponse, 'code'>
  ) }
);


export const GetProjectsDocument = gql`
    query getProjects {
  getProjects {
    totalCount
    items {
      id
    }
  }
}
    `;

/**
 * __useGetProjectsQuery__
 *
 * To run a query within a React component, call `useGetProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetProjectsQuery(baseOptions?: Apollo.QueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
      }
export function useGetProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
        }
export type GetProjectsQueryHookResult = ReturnType<typeof useGetProjectsQuery>;
export type GetProjectsLazyQueryHookResult = ReturnType<typeof useGetProjectsLazyQuery>;
export type GetProjectsQueryResult = Apollo.QueryResult<GetProjectsQuery, GetProjectsQueryVariables>;
export const CreateProjectDocument = gql`
    mutation createProject($input: ProjectInput!) {
  createProject(input: $input) {
    code
  }
}
    `;
export type CreateProjectMutationFn = Apollo.MutationFunction<CreateProjectMutation, CreateProjectMutationVariables>;

/**
 * __useCreateProjectMutation__
 *
 * To run a mutation, you first call `useCreateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProjectMutation, { data, loading, error }] = useCreateProjectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateProjectMutation(baseOptions?: Apollo.MutationHookOptions<CreateProjectMutation, CreateProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, options);
      }
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<CreateProjectMutation, CreateProjectMutationVariables>;