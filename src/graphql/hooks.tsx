/* eslint-disable */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
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
  ping: Scalars['String'];
  me?: Maybe<User>;
  getPage?: Maybe<Page>;
  getProjects: ProjectConnection;
  getProject?: Maybe<Project>;
  getTrackings: TrackingConnection;
};


export type QueryGetPageArgs = {
  slug: Scalars['String'];
};


export type QueryGetProjectArgs = {
  projectId: Scalars['String'];
};


export type QueryGetTrackingsArgs = {
  query: ProjectTrackingsQuery;
};

export type Mutation = {
  __typename?: 'Mutation';
  addProject: Project;
  addTracking: Tracking;
};


export type MutationAddProjectArgs = {
  project: AddProjectInput;
};


export type MutationAddTrackingArgs = {
  tracking: AddTrackingInput;
};

export type Page = {
  __typename?: 'Page';
  title: Scalars['String'];
  slug: Scalars['String'];
  content: Scalars['String'];
  layout: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  projects: ProjectConnection;
  project?: Maybe<Project>;
};


export type UserProjectArgs = {
  projectId: Scalars['String'];
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
  trackings: TrackingConnection;
};

export type TrackingConnection = {
  __typename?: 'TrackingConnection';
  items: Array<Tracking>;
  nextToken?: Maybe<Scalars['String']>;
};

export type Tracking = {
  __typename?: 'Tracking';
  id: Scalars['String'];
  project: Project;
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
  description?: Maybe<Scalars['String']>;
};

export type AddProjectInput = {
  client: Scalars['String'];
  industry: Scalars['String'];
  description: Scalars['String'];
  startDate: Scalars['AWSDate'];
  endDate?: Maybe<Scalars['AWSDate']>;
  methodologies: Array<Scalars['String']>;
  technologies: Array<Scalars['String']>;
};

export type AddTrackingInput = {
  projectId: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
  description?: Maybe<Scalars['String']>;
};

export type ProjectTrackingsQuery = {
  projectId: Scalars['String'];
  date?: Maybe<Scalars['String']>;
};

export type ProjectPartsFragment = (
  { __typename?: 'Project' }
  & Pick<Project, 'id' | 'client' | 'industry' | 'description' | 'startDate' | 'endDate' | 'methodologies' | 'technologies'>
);

export type AddProjectMutationVariables = Exact<{
  project: AddProjectInput;
}>;


export type AddProjectMutation = (
  { __typename?: 'Mutation' }
  & { addProject: (
    { __typename?: 'Project' }
    & ProjectPartsFragment
  ) }
);

export type AddTrackingMutationVariables = Exact<{
  trackingInput: AddTrackingInput;
}>;


export type AddTrackingMutation = (
  { __typename?: 'Mutation' }
  & { addTracking: (
    { __typename?: 'Tracking' }
    & Pick<Tracking, 'id' | 'startTime' | 'endTime' | 'description'>
  ) }
);

export type GetProjectQueryVariables = Exact<{
  projectId: Scalars['String'];
}>;


export type GetProjectQuery = (
  { __typename?: 'Query' }
  & { getProject?: Maybe<(
    { __typename?: 'Project' }
    & ProjectPartsFragment
  )> }
);

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = (
  { __typename?: 'Query' }
  & { getProjects: (
    { __typename?: 'ProjectConnection' }
    & { items: Array<(
      { __typename?: 'Project' }
      & ProjectPartsFragment
    )> }
  ) }
);

export type GetPageQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


export type GetPageQuery = (
  { __typename?: 'Query' }
  & { getPage?: Maybe<(
    { __typename?: 'Page' }
    & Pick<Page, 'slug' | 'title' | 'content' | 'layout'>
  )> }
);

export const ProjectPartsFragmentDoc = gql`
    fragment ProjectParts on Project {
  id
  client
  industry
  description
  startDate
  endDate
  methodologies
  technologies
}
    `;
export const AddProjectDocument = gql`
    mutation addProject($project: AddProjectInput!) {
  addProject(project: $project) {
    ...ProjectParts
  }
}
    ${ProjectPartsFragmentDoc}`;
export type AddProjectMutationFn = Apollo.MutationFunction<AddProjectMutation, AddProjectMutationVariables>;

/**
 * __useAddProjectMutation__
 *
 * To run a mutation, you first call `useAddProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addProjectMutation, { data, loading, error }] = useAddProjectMutation({
 *   variables: {
 *      project: // value for 'project'
 *   },
 * });
 */
export function useAddProjectMutation(baseOptions?: Apollo.MutationHookOptions<AddProjectMutation, AddProjectMutationVariables>) {
        return Apollo.useMutation<AddProjectMutation, AddProjectMutationVariables>(AddProjectDocument, baseOptions);
      }
export type AddProjectMutationHookResult = ReturnType<typeof useAddProjectMutation>;
export type AddProjectMutationResult = Apollo.MutationResult<AddProjectMutation>;
export type AddProjectMutationOptions = Apollo.BaseMutationOptions<AddProjectMutation, AddProjectMutationVariables>;
export const AddTrackingDocument = gql`
    mutation addTracking($trackingInput: AddTrackingInput!) {
  addTracking(tracking: $trackingInput) {
    id
    startTime
    endTime
    description
  }
}
    `;
export type AddTrackingMutationFn = Apollo.MutationFunction<AddTrackingMutation, AddTrackingMutationVariables>;

/**
 * __useAddTrackingMutation__
 *
 * To run a mutation, you first call `useAddTrackingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTrackingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTrackingMutation, { data, loading, error }] = useAddTrackingMutation({
 *   variables: {
 *      trackingInput: // value for 'trackingInput'
 *   },
 * });
 */
export function useAddTrackingMutation(baseOptions?: Apollo.MutationHookOptions<AddTrackingMutation, AddTrackingMutationVariables>) {
        return Apollo.useMutation<AddTrackingMutation, AddTrackingMutationVariables>(AddTrackingDocument, baseOptions);
      }
export type AddTrackingMutationHookResult = ReturnType<typeof useAddTrackingMutation>;
export type AddTrackingMutationResult = Apollo.MutationResult<AddTrackingMutation>;
export type AddTrackingMutationOptions = Apollo.BaseMutationOptions<AddTrackingMutation, AddTrackingMutationVariables>;
export const GetProjectDocument = gql`
    query getProject($projectId: String!) {
  getProject(projectId: $projectId) {
    ...ProjectParts
  }
}
    ${ProjectPartsFragmentDoc}`;

/**
 * __useGetProjectQuery__
 *
 * To run a query within a React component, call `useGetProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useGetProjectQuery(baseOptions?: Apollo.QueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
        return Apollo.useQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, baseOptions);
      }
export function useGetProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
          return Apollo.useLazyQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, baseOptions);
        }
export type GetProjectQueryHookResult = ReturnType<typeof useGetProjectQuery>;
export type GetProjectLazyQueryHookResult = ReturnType<typeof useGetProjectLazyQuery>;
export type GetProjectQueryResult = Apollo.QueryResult<GetProjectQuery, GetProjectQueryVariables>;
export const GetProjectsDocument = gql`
    query getProjects {
  getProjects {
    items {
      ...ProjectParts
    }
  }
}
    ${ProjectPartsFragmentDoc}`;

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
        return Apollo.useQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, baseOptions);
      }
export function useGetProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
          return Apollo.useLazyQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, baseOptions);
        }
export type GetProjectsQueryHookResult = ReturnType<typeof useGetProjectsQuery>;
export type GetProjectsLazyQueryHookResult = ReturnType<typeof useGetProjectsLazyQuery>;
export type GetProjectsQueryResult = Apollo.QueryResult<GetProjectsQuery, GetProjectsQueryVariables>;
export const GetPageDocument = gql`
    query getPage($slug: String!) {
  getPage(slug: $slug) {
    slug
    title
    content
    layout
  }
}
    `;

/**
 * __useGetPageQuery__
 *
 * To run a query within a React component, call `useGetPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPageQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetPageQuery(baseOptions?: Apollo.QueryHookOptions<GetPageQuery, GetPageQueryVariables>) {
        return Apollo.useQuery<GetPageQuery, GetPageQueryVariables>(GetPageDocument, baseOptions);
      }
export function useGetPageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPageQuery, GetPageQueryVariables>) {
          return Apollo.useLazyQuery<GetPageQuery, GetPageQueryVariables>(GetPageDocument, baseOptions);
        }
export type GetPageQueryHookResult = ReturnType<typeof useGetPageQuery>;
export type GetPageLazyQueryHookResult = ReturnType<typeof useGetPageLazyQuery>;
export type GetPageQueryResult = Apollo.QueryResult<GetPageQuery, GetPageQueryVariables>;