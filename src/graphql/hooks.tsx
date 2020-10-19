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
  getProject: Project;
  getTrackings: TrackingConnection;
};


export type QueryGetPageArgs = {
  slug: Scalars['String'];
};


export type QueryGetProjectArgs = {
  query: ProjectQuery;
};


export type QueryGetTrackingsArgs = {
  query: TrackingsQuery;
};

export type Mutation = {
  __typename?: 'Mutation';
  createProject: ProjectMutationResponse;
  updateProject: ProjectMutationResponse;
  deleteProject: ProjectMutationResponse;
  createTracking: TrackingMutationResponse;
  updateTracking: TrackingMutationResponse;
  deleteTracking: TrackingMutationResponse;
};


export type MutationCreateProjectArgs = {
  input: ProjectInput;
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID'];
  input: ProjectInput;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationCreateTrackingArgs = {
  input: TrackingInput;
};


export type MutationUpdateTrackingArgs = {
  id: Scalars['ID'];
  input: TrackingInput;
};


export type MutationDeleteTrackingArgs = {
  id: Scalars['ID'];
};

export type Node = {
  id: Scalars['ID'];
};

export type Connection = {
  totalCount: Scalars['Int'];
  edges: Array<Node>;
  cursor?: Maybe<Scalars['String']>;
};

export type MutationResponse = {
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
};

export type Page = Node & {
  __typename?: 'Page';
  id: Scalars['ID'];
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

export type Project = Node & {
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

export type Tracking = Node & {
  __typename?: 'Tracking';
  id: Scalars['ID'];
  project: Project;
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
  description?: Maybe<Scalars['String']>;
};

export type ProjectQuery = {
  projectId: Scalars['ID'];
};

export type TrackingsQuery = {
  projectId: Scalars['ID'];
  date?: Maybe<Scalars['String']>;
};

export type ProjectInput = {
  client: Scalars['String'];
  industry: Scalars['String'];
  description: Scalars['String'];
  startDate: Scalars['AWSDate'];
  endDate?: Maybe<Scalars['AWSDate']>;
  methodologies: Array<Scalars['String']>;
  technologies: Array<Scalars['String']>;
};

export type TrackingInput = {
  projectId: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
  description?: Maybe<Scalars['String']>;
};

export type ProjectMutationResponse = MutationResponse & {
  __typename?: 'ProjectMutationResponse';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
  project?: Maybe<Project>;
};

export type TrackingMutationResponse = MutationResponse & {
  __typename?: 'TrackingMutationResponse';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
  tracking?: Maybe<Tracking>;
};

export type ProjectConnection = Connection & {
  __typename?: 'ProjectConnection';
  totalCount: Scalars['Int'];
  edges: Array<Project>;
  cursor?: Maybe<Scalars['String']>;
};

export type TrackingConnection = Connection & {
  __typename?: 'TrackingConnection';
  totalCount: Scalars['Int'];
  edges: Array<Tracking>;
  cursor?: Maybe<Scalars['String']>;
};

export type ProjectPartsFragment = (
  { __typename?: 'Project' }
  & Pick<Project, 'id' | 'client' | 'industry' | 'description' | 'startDate' | 'endDate' | 'methodologies' | 'technologies'>
);

export type TrackingPartsFragment = (
  { __typename?: 'Tracking' }
  & Pick<Tracking, 'id' | 'startTime' | 'endTime' | 'description'>
);

export type CreateProjectMutationVariables = Exact<{
  input: ProjectInput;
}>;


export type CreateProjectMutation = (
  { __typename?: 'Mutation' }
  & { createProject: (
    { __typename?: 'ProjectMutationResponse' }
    & Pick<ProjectMutationResponse, 'code' | 'message' | 'success'>
    & { project?: Maybe<(
      { __typename?: 'Project' }
      & ProjectPartsFragment
    )> }
  ) }
);

export type UpdateProjectMutationVariables = Exact<{
  id: Scalars['ID'];
  input: ProjectInput;
}>;


export type UpdateProjectMutation = (
  { __typename?: 'Mutation' }
  & { updateProject: (
    { __typename?: 'ProjectMutationResponse' }
    & Pick<ProjectMutationResponse, 'code' | 'message' | 'success'>
    & { project?: Maybe<(
      { __typename?: 'Project' }
      & ProjectPartsFragment
    )> }
  ) }
);

export type DeleteProjectMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteProjectMutation = (
  { __typename?: 'Mutation' }
  & { deleteProject: (
    { __typename?: 'ProjectMutationResponse' }
    & Pick<ProjectMutationResponse, 'code' | 'message' | 'success'>
  ) }
);

export type CreateTrackingMutationVariables = Exact<{
  input: TrackingInput;
}>;


export type CreateTrackingMutation = (
  { __typename?: 'Mutation' }
  & { createTracking: (
    { __typename?: 'TrackingMutationResponse' }
    & Pick<TrackingMutationResponse, 'code' | 'message' | 'success'>
    & { tracking?: Maybe<(
      { __typename?: 'Tracking' }
      & TrackingPartsFragment
    )> }
  ) }
);

export type UpdateTrackingMutationVariables = Exact<{
  id: Scalars['ID'];
  input: TrackingInput;
}>;


export type UpdateTrackingMutation = (
  { __typename?: 'Mutation' }
  & { updateTracking: (
    { __typename?: 'TrackingMutationResponse' }
    & Pick<TrackingMutationResponse, 'code' | 'message' | 'success'>
    & { tracking?: Maybe<(
      { __typename?: 'Tracking' }
      & TrackingPartsFragment
    )> }
  ) }
);

export type DeleteTrackingMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteTrackingMutation = (
  { __typename?: 'Mutation' }
  & { deleteTracking: (
    { __typename?: 'TrackingMutationResponse' }
    & Pick<TrackingMutationResponse, 'code' | 'message' | 'success'>
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

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = (
  { __typename?: 'Query' }
  & { getProjects: (
    { __typename?: 'ProjectConnection' }
    & Pick<ProjectConnection, 'cursor' | 'totalCount'>
    & { edges: Array<(
      { __typename?: 'Project' }
      & ProjectPartsFragment
    )> }
  ) }
);

export type GetProjectQueryVariables = Exact<{
  query: ProjectQuery;
}>;


export type GetProjectQuery = (
  { __typename?: 'Query' }
  & { getProject: (
    { __typename?: 'Project' }
    & ProjectPartsFragment
  ) }
);

export type GetProjectWithTrackingsQueryVariables = Exact<{
  query: ProjectQuery;
}>;


export type GetProjectWithTrackingsQuery = (
  { __typename?: 'Query' }
  & { getProject: (
    { __typename?: 'Project' }
    & { trackings: (
      { __typename?: 'TrackingConnection' }
      & Pick<TrackingConnection, 'totalCount'>
      & { edges: Array<(
        { __typename?: 'Tracking' }
        & TrackingPartsFragment
      )> }
    ) }
    & ProjectPartsFragment
  ) }
);

export type GetTrackingsQueryVariables = Exact<{
  query: TrackingsQuery;
}>;


export type GetTrackingsQuery = (
  { __typename?: 'Query' }
  & { getTrackings: (
    { __typename?: 'TrackingConnection' }
    & Pick<TrackingConnection, 'cursor' | 'totalCount'>
    & { edges: Array<(
      { __typename?: 'Tracking' }
      & TrackingPartsFragment
    )> }
  ) }
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
export const TrackingPartsFragmentDoc = gql`
    fragment TrackingParts on Tracking {
  id
  startTime
  endTime
  description
}
    `;
export const CreateProjectDocument = gql`
    mutation createProject($input: ProjectInput!) {
  createProject(input: $input) {
    project {
      ...ProjectParts
    }
    code
    message
    success
  }
}
    ${ProjectPartsFragmentDoc}`;
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
        return Apollo.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, baseOptions);
      }
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<CreateProjectMutation, CreateProjectMutationVariables>;
export const UpdateProjectDocument = gql`
    mutation updateProject($id: ID!, $input: ProjectInput!) {
  updateProject(id: $id, input: $input) {
    project {
      ...ProjectParts
    }
    code
    message
    success
  }
}
    ${ProjectPartsFragmentDoc}`;
export type UpdateProjectMutationFn = Apollo.MutationFunction<UpdateProjectMutation, UpdateProjectMutationVariables>;

/**
 * __useUpdateProjectMutation__
 *
 * To run a mutation, you first call `useUpdateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectMutation, { data, loading, error }] = useUpdateProjectMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProjectMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectMutation, UpdateProjectMutationVariables>) {
        return Apollo.useMutation<UpdateProjectMutation, UpdateProjectMutationVariables>(UpdateProjectDocument, baseOptions);
      }
export type UpdateProjectMutationHookResult = ReturnType<typeof useUpdateProjectMutation>;
export type UpdateProjectMutationResult = Apollo.MutationResult<UpdateProjectMutation>;
export type UpdateProjectMutationOptions = Apollo.BaseMutationOptions<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const DeleteProjectDocument = gql`
    mutation deleteProject($id: ID!) {
  deleteProject(id: $id) {
    code
    message
    success
  }
}
    `;
export type DeleteProjectMutationFn = Apollo.MutationFunction<DeleteProjectMutation, DeleteProjectMutationVariables>;

/**
 * __useDeleteProjectMutation__
 *
 * To run a mutation, you first call `useDeleteProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProjectMutation, { data, loading, error }] = useDeleteProjectMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteProjectMutation(baseOptions?: Apollo.MutationHookOptions<DeleteProjectMutation, DeleteProjectMutationVariables>) {
        return Apollo.useMutation<DeleteProjectMutation, DeleteProjectMutationVariables>(DeleteProjectDocument, baseOptions);
      }
export type DeleteProjectMutationHookResult = ReturnType<typeof useDeleteProjectMutation>;
export type DeleteProjectMutationResult = Apollo.MutationResult<DeleteProjectMutation>;
export type DeleteProjectMutationOptions = Apollo.BaseMutationOptions<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const CreateTrackingDocument = gql`
    mutation createTracking($input: TrackingInput!) {
  createTracking(input: $input) {
    tracking {
      ...TrackingParts
    }
    code
    message
    success
  }
}
    ${TrackingPartsFragmentDoc}`;
export type CreateTrackingMutationFn = Apollo.MutationFunction<CreateTrackingMutation, CreateTrackingMutationVariables>;

/**
 * __useCreateTrackingMutation__
 *
 * To run a mutation, you first call `useCreateTrackingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTrackingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTrackingMutation, { data, loading, error }] = useCreateTrackingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTrackingMutation(baseOptions?: Apollo.MutationHookOptions<CreateTrackingMutation, CreateTrackingMutationVariables>) {
        return Apollo.useMutation<CreateTrackingMutation, CreateTrackingMutationVariables>(CreateTrackingDocument, baseOptions);
      }
export type CreateTrackingMutationHookResult = ReturnType<typeof useCreateTrackingMutation>;
export type CreateTrackingMutationResult = Apollo.MutationResult<CreateTrackingMutation>;
export type CreateTrackingMutationOptions = Apollo.BaseMutationOptions<CreateTrackingMutation, CreateTrackingMutationVariables>;
export const UpdateTrackingDocument = gql`
    mutation updateTracking($id: ID!, $input: TrackingInput!) {
  updateTracking(id: $id, input: $input) {
    tracking {
      ...TrackingParts
    }
    code
    message
    success
  }
}
    ${TrackingPartsFragmentDoc}`;
export type UpdateTrackingMutationFn = Apollo.MutationFunction<UpdateTrackingMutation, UpdateTrackingMutationVariables>;

/**
 * __useUpdateTrackingMutation__
 *
 * To run a mutation, you first call `useUpdateTrackingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTrackingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTrackingMutation, { data, loading, error }] = useUpdateTrackingMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTrackingMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTrackingMutation, UpdateTrackingMutationVariables>) {
        return Apollo.useMutation<UpdateTrackingMutation, UpdateTrackingMutationVariables>(UpdateTrackingDocument, baseOptions);
      }
export type UpdateTrackingMutationHookResult = ReturnType<typeof useUpdateTrackingMutation>;
export type UpdateTrackingMutationResult = Apollo.MutationResult<UpdateTrackingMutation>;
export type UpdateTrackingMutationOptions = Apollo.BaseMutationOptions<UpdateTrackingMutation, UpdateTrackingMutationVariables>;
export const DeleteTrackingDocument = gql`
    mutation deleteTracking($id: ID!) {
  deleteTracking(id: $id) {
    code
    message
    success
  }
}
    `;
export type DeleteTrackingMutationFn = Apollo.MutationFunction<DeleteTrackingMutation, DeleteTrackingMutationVariables>;

/**
 * __useDeleteTrackingMutation__
 *
 * To run a mutation, you first call `useDeleteTrackingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTrackingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTrackingMutation, { data, loading, error }] = useDeleteTrackingMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTrackingMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTrackingMutation, DeleteTrackingMutationVariables>) {
        return Apollo.useMutation<DeleteTrackingMutation, DeleteTrackingMutationVariables>(DeleteTrackingDocument, baseOptions);
      }
export type DeleteTrackingMutationHookResult = ReturnType<typeof useDeleteTrackingMutation>;
export type DeleteTrackingMutationResult = Apollo.MutationResult<DeleteTrackingMutation>;
export type DeleteTrackingMutationOptions = Apollo.BaseMutationOptions<DeleteTrackingMutation, DeleteTrackingMutationVariables>;
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
export const GetProjectsDocument = gql`
    query getProjects {
  getProjects {
    edges {
      ...ProjectParts
    }
    cursor
    totalCount
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
export const GetProjectDocument = gql`
    query getProject($query: ProjectQuery!) {
  getProject(query: $query) {
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
 *      query: // value for 'query'
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
export const GetProjectWithTrackingsDocument = gql`
    query getProjectWithTrackings($query: ProjectQuery!) {
  getProject(query: $query) {
    ...ProjectParts
    trackings {
      edges {
        ...TrackingParts
      }
      totalCount
    }
  }
}
    ${ProjectPartsFragmentDoc}
${TrackingPartsFragmentDoc}`;

/**
 * __useGetProjectWithTrackingsQuery__
 *
 * To run a query within a React component, call `useGetProjectWithTrackingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectWithTrackingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectWithTrackingsQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetProjectWithTrackingsQuery(baseOptions?: Apollo.QueryHookOptions<GetProjectWithTrackingsQuery, GetProjectWithTrackingsQueryVariables>) {
        return Apollo.useQuery<GetProjectWithTrackingsQuery, GetProjectWithTrackingsQueryVariables>(GetProjectWithTrackingsDocument, baseOptions);
      }
export function useGetProjectWithTrackingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectWithTrackingsQuery, GetProjectWithTrackingsQueryVariables>) {
          return Apollo.useLazyQuery<GetProjectWithTrackingsQuery, GetProjectWithTrackingsQueryVariables>(GetProjectWithTrackingsDocument, baseOptions);
        }
export type GetProjectWithTrackingsQueryHookResult = ReturnType<typeof useGetProjectWithTrackingsQuery>;
export type GetProjectWithTrackingsLazyQueryHookResult = ReturnType<typeof useGetProjectWithTrackingsLazyQuery>;
export type GetProjectWithTrackingsQueryResult = Apollo.QueryResult<GetProjectWithTrackingsQuery, GetProjectWithTrackingsQueryVariables>;
export const GetTrackingsDocument = gql`
    query getTrackings($query: TrackingsQuery!) {
  getTrackings(query: $query) {
    edges {
      ...TrackingParts
    }
    cursor
    totalCount
  }
}
    ${TrackingPartsFragmentDoc}`;

/**
 * __useGetTrackingsQuery__
 *
 * To run a query within a React component, call `useGetTrackingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTrackingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTrackingsQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetTrackingsQuery(baseOptions?: Apollo.QueryHookOptions<GetTrackingsQuery, GetTrackingsQueryVariables>) {
        return Apollo.useQuery<GetTrackingsQuery, GetTrackingsQueryVariables>(GetTrackingsDocument, baseOptions);
      }
export function useGetTrackingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTrackingsQuery, GetTrackingsQueryVariables>) {
          return Apollo.useLazyQuery<GetTrackingsQuery, GetTrackingsQueryVariables>(GetTrackingsDocument, baseOptions);
        }
export type GetTrackingsQueryHookResult = ReturnType<typeof useGetTrackingsQuery>;
export type GetTrackingsLazyQueryHookResult = ReturnType<typeof useGetTrackingsLazyQuery>;
export type GetTrackingsQueryResult = Apollo.QueryResult<GetTrackingsQuery, GetTrackingsQueryVariables>;