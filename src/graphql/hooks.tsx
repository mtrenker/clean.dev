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

export type HeroImage = {
  __typename?: 'HeroImage';
  description: Scalars['String'];
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
  content: Scalars['String'];
  heroImage?: Maybe<HeroImage>;
  intro: Scalars['String'];
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

export type ProjectConnection = {
  __typename?: 'ProjectConnection';
  cursor?: Maybe<Scalars['String']>;
  items: Array<Project>;
  totalCount: Scalars['Int'];
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

export type TrackingMutationResponse = {
  __typename?: 'TrackingMutationResponse';
  code: Scalars['String'];
  message: Scalars['String'];
  success: Scalars['Boolean'];
  tracking: Tracking;
};

export type ContactInput = {
  city: Scalars['String'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  street: Scalars['String'];
  zip: Scalars['String'];
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

export type TrackingInput = {
  description?: Maybe<Scalars['String']>;
  endTime: Scalars['AWSDateTime'];
  projectId: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
};

export type ProjectPartsFragment = (
  { __typename?: 'Project' }
  & Pick<Project, 'id' | 'client' | 'industry' | 'description' | 'startDate' | 'endDate' | 'methodologies' | 'technologies'>
  & { contact: (
    { __typename?: 'Contact' }
    & Pick<Contact, 'firstName' | 'lastName' | 'email' | 'street' | 'city' | 'zip'>
  ) }
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
    & { project: (
      { __typename?: 'Project' }
      & ProjectPartsFragment
    ) }
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
    & { project: (
      { __typename?: 'Project' }
      & ProjectPartsFragment
    ) }
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
    & { tracking: (
      { __typename?: 'Tracking' }
      & TrackingPartsFragment
    ) }
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
    & { tracking: (
      { __typename?: 'Tracking' }
      & TrackingPartsFragment
    ) }
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

export type GetPostQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


export type GetPostQuery = (
  { __typename?: 'Query' }
  & { getPost?: Maybe<(
    { __typename?: 'Post' }
    & Pick<Post, 'content' | 'intro' | 'publishDate' | 'slug' | 'title'>
    & { heroImage?: Maybe<(
      { __typename?: 'HeroImage' }
      & Pick<HeroImage, 'title' | 'description'>
      & { file: (
        { __typename?: 'File' }
        & Pick<File, 'url'>
        & { details: (
          { __typename?: 'FileDetails' }
          & Pick<FileDetails, 'size'>
          & { image?: Maybe<(
            { __typename?: 'ImageDetails' }
            & Pick<ImageDetails, 'height' | 'width'>
          )> }
        ) }
      ) }
    )> }
  )> }
);

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = (
  { __typename?: 'Query' }
  & { getProjects: (
    { __typename?: 'ProjectConnection' }
    & Pick<ProjectConnection, 'cursor' | 'totalCount'>
    & { items: Array<(
      { __typename?: 'Project' }
      & ProjectPartsFragment
    )> }
  ) }
);

export type GetProjectQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetProjectQuery = (
  { __typename?: 'Query' }
  & { getProject: (
    { __typename?: 'Project' }
    & ProjectPartsFragment
  ) }
);

export type GetProjectWithTrackingsQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetProjectWithTrackingsQuery = (
  { __typename?: 'Query' }
  & { getProject: (
    { __typename?: 'Project' }
    & { trackings: (
      { __typename?: 'TrackingConnection' }
      & Pick<TrackingConnection, 'totalCount'>
      & { items: Array<(
        { __typename?: 'Tracking' }
        & TrackingPartsFragment
      )> }
    ) }
    & ProjectPartsFragment
  ) }
);

export type GetTrackingsQueryVariables = Exact<{
  projectId: Scalars['String'];
  date?: Maybe<Scalars['String']>;
}>;


export type GetTrackingsQuery = (
  { __typename?: 'Query' }
  & { getTrackings: (
    { __typename?: 'TrackingConnection' }
    & Pick<TrackingConnection, 'cursor' | 'totalCount'>
    & { items: Array<(
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
  contact {
    firstName
    lastName
    email
    street
    city
    zip
  }
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
export const GetPostDocument = gql`
    query getPost($slug: String!) {
  getPost(slug: $slug) {
    content
    intro
    publishDate
    slug
    title
    heroImage {
      title
      description
      file {
        url
        details {
          size
          image {
            height
            width
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetPostQuery__
 *
 * To run a query within a React component, call `useGetPostQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPostQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetPostQuery(baseOptions?: Apollo.QueryHookOptions<GetPostQuery, GetPostQueryVariables>) {
        return Apollo.useQuery<GetPostQuery, GetPostQueryVariables>(GetPostDocument, baseOptions);
      }
export function useGetPostLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPostQuery, GetPostQueryVariables>) {
          return Apollo.useLazyQuery<GetPostQuery, GetPostQueryVariables>(GetPostDocument, baseOptions);
        }
export type GetPostQueryHookResult = ReturnType<typeof useGetPostQuery>;
export type GetPostLazyQueryHookResult = ReturnType<typeof useGetPostLazyQuery>;
export type GetPostQueryResult = Apollo.QueryResult<GetPostQuery, GetPostQueryVariables>;
export const GetProjectsDocument = gql`
    query getProjects {
  getProjects {
    items {
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
    query getProject($id: ID!) {
  getProject(id: $id) {
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
 *      id: // value for 'id'
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
    query getProjectWithTrackings($id: ID!) {
  getProject(id: $id) {
    ...ProjectParts
    trackings {
      items {
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
 *      id: // value for 'id'
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
    query getTrackings($projectId: String!, $date: String) {
  getTrackings(projectId: $projectId, date: $date) {
    items {
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
 *      projectId: // value for 'projectId'
 *      date: // value for 'date'
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