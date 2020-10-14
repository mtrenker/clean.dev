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
  query: ProjectQuery;
};


export type QueryGetTrackingsArgs = {
  query: TrackingsQuery;
};

export type Mutation = {
  __typename?: 'Mutation';
  createProject: CreateProjectResponse;
  updateProject: UpdateProjectResponse;
  deleteProject: DeleteProjectResponse;
  createTracking: CreateTrackingResponse;
  updateTracking: UpdateTrackingResponse;
  deleteTracking: DeleteTrackingResponse;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};


export type MutationDeleteProjectArgs = {
  input: DeleteProjectInput;
};


export type MutationCreateTrackingArgs = {
  input: CreateTrackingInput;
};


export type MutationUpdateTrackingArgs = {
  input: UpdateTrackingInput;
};


export type MutationDeleteTrackingArgs = {
  input: DeleteTrackingInput;
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

export type CreateProjectInput = {
  client: Scalars['String'];
  industry: Scalars['String'];
  description: Scalars['String'];
  startDate: Scalars['AWSDate'];
  endDate?: Maybe<Scalars['AWSDate']>;
  methodologies: Array<Scalars['String']>;
  technologies: Array<Scalars['String']>;
};

export type UpdateProjectInput = {
  projectId: Scalars['ID'];
  client: Scalars['String'];
  industry: Scalars['String'];
  description: Scalars['String'];
  startDate: Scalars['AWSDate'];
  endDate?: Maybe<Scalars['AWSDate']>;
  methodologies: Array<Scalars['String']>;
  technologies: Array<Scalars['String']>;
};

export type DeleteProjectInput = {
  projectId: Scalars['ID'];
};

export type CreateTrackingInput = {
  projectId: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
  description?: Maybe<Scalars['String']>;
};

export type UpdateTrackingInput = {
  trackingId: Scalars['ID'];
  projectId: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
  description?: Maybe<Scalars['String']>;
};

export type DeleteTrackingInput = {
  trackingId: Scalars['ID'];
};

export type CreateProjectResponse = MutationResponse & {
  __typename?: 'CreateProjectResponse';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
  project: Project;
};

export type UpdateProjectResponse = MutationResponse & {
  __typename?: 'UpdateProjectResponse';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
  project: Project;
};

export type DeleteProjectResponse = MutationResponse & {
  __typename?: 'DeleteProjectResponse';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
};

export type CreateTrackingResponse = MutationResponse & {
  __typename?: 'CreateTrackingResponse';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
  tracking: Tracking;
};

export type UpdateTrackingResponse = MutationResponse & {
  __typename?: 'UpdateTrackingResponse';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
  tracking: Tracking;
};

export type DeleteTrackingResponse = MutationResponse & {
  __typename?: 'DeleteTrackingResponse';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
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
  & Pick<Tracking, 'id' | 'startTime' | 'description'>
);

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;


export type CreateProjectMutation = (
  { __typename?: 'Mutation' }
  & { createProject: (
    { __typename?: 'CreateProjectResponse' }
    & Pick<CreateProjectResponse, 'code' | 'message' | 'success'>
    & { project: (
      { __typename?: 'Project' }
      & ProjectPartsFragment
    ) }
  ) }
);

export type UpdateProjectMutationVariables = Exact<{
  input: UpdateProjectInput;
}>;


export type UpdateProjectMutation = (
  { __typename?: 'Mutation' }
  & { updateProject: (
    { __typename?: 'UpdateProjectResponse' }
    & Pick<UpdateProjectResponse, 'code' | 'message' | 'success'>
    & { project: (
      { __typename?: 'Project' }
      & ProjectPartsFragment
    ) }
  ) }
);

export type DeleteProjectMutationVariables = Exact<{
  input: DeleteProjectInput;
}>;


export type DeleteProjectMutation = (
  { __typename?: 'Mutation' }
  & { deleteProject: (
    { __typename?: 'DeleteProjectResponse' }
    & Pick<DeleteProjectResponse, 'code' | 'message' | 'success'>
  ) }
);

export type CreateTrackingMutationVariables = Exact<{
  input: CreateTrackingInput;
}>;


export type CreateTrackingMutation = (
  { __typename?: 'Mutation' }
  & { createTracking: (
    { __typename?: 'CreateTrackingResponse' }
    & Pick<CreateTrackingResponse, 'code' | 'message' | 'success'>
    & { tracking: (
      { __typename?: 'Tracking' }
      & TrackingPartsFragment
    ) }
  ) }
);

export type UpdateTrackingMutationVariables = Exact<{
  input: UpdateTrackingInput;
}>;


export type UpdateTrackingMutation = (
  { __typename?: 'Mutation' }
  & { updateTracking: (
    { __typename?: 'UpdateTrackingResponse' }
    & Pick<UpdateTrackingResponse, 'code' | 'message' | 'success'>
    & { tracking: (
      { __typename?: 'Tracking' }
      & TrackingPartsFragment
    ) }
  ) }
);

export type DeleteTrackingMutationVariables = Exact<{
  input: DeleteTrackingInput;
}>;


export type DeleteTrackingMutation = (
  { __typename?: 'Mutation' }
  & { deleteTracking: (
    { __typename?: 'DeleteTrackingResponse' }
    & Pick<DeleteTrackingResponse, 'code' | 'message' | 'success'>
  ) }
);

export type GetProjectQueryVariables = Exact<{
  query: ProjectQuery;
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
    & Pick<ProjectConnection, 'cursor' | 'totalCount'>
    & { edges: Array<(
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
export const TrackingPartsFragmentDoc = gql`
    fragment TrackingParts on Tracking {
  id
  startTime
  startTime
  description
}
    `;
export const CreateProjectDocument = gql`
    mutation createProject($input: CreateProjectInput!) {
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
    mutation updateProject($input: UpdateProjectInput!) {
  updateProject(input: $input) {
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
    mutation deleteProject($input: DeleteProjectInput!) {
  deleteProject(input: $input) {
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
 *      input: // value for 'input'
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
    mutation createTracking($input: CreateTrackingInput!) {
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
    mutation updateTracking($input: UpdateTrackingInput!) {
  updateTracking(input: $input) {
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
    mutation deleteTracking($input: DeleteTrackingInput!) {
  deleteTracking(input: $input) {
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
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteTrackingMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTrackingMutation, DeleteTrackingMutationVariables>) {
        return Apollo.useMutation<DeleteTrackingMutation, DeleteTrackingMutationVariables>(DeleteTrackingDocument, baseOptions);
      }
export type DeleteTrackingMutationHookResult = ReturnType<typeof useDeleteTrackingMutation>;
export type DeleteTrackingMutationResult = Apollo.MutationResult<DeleteTrackingMutation>;
export type DeleteTrackingMutationOptions = Apollo.BaseMutationOptions<DeleteTrackingMutation, DeleteTrackingMutationVariables>;
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