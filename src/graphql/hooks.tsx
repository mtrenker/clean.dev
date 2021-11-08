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
  updateContact?: Maybe<Contact>;
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


export type MutationUpdateContactArgs = {
  contact: ContactInput;
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
  me: User;
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

export type User = {
  __typename?: 'User';
  contact?: Maybe<Contact>;
  id: Scalars['ID'];
};

export type GetBlogQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBlogQuery = { __typename?: 'Query', getBlog: { __typename?: 'Blog', posts: Array<{ __typename?: 'Post', content?: string | null | undefined, intro?: string | null | undefined, publishDate: string, slug: string, title: string, heroImage?: { __typename?: 'Image', title: string, description?: string | null | undefined, file: { __typename?: 'File', contentType: string, fileName: string, url: string, details: { __typename?: 'FileDetails', size: string, image?: { __typename?: 'ImageDetails', height: number, width: number } | null | undefined } } } | null | undefined }> } };

export type GetPostQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


export type GetPostQuery = { __typename?: 'Query', getPost?: { __typename?: 'Post', content?: string | null | undefined, intro?: string | null | undefined, publishDate: string, slug: string, title: string, heroImage?: { __typename?: 'Image', title: string, description?: string | null | undefined, file: { __typename?: 'File', contentType: string, fileName: string, url: string, details: { __typename?: 'FileDetails', size: string, image?: { __typename?: 'ImageDetails', height: number, width: number } | null | undefined } } } | null | undefined } | null | undefined };

export type PostFieldsFragment = { __typename?: 'Post', content?: string | null | undefined, intro?: string | null | undefined, publishDate: string, slug: string, title: string, heroImage?: { __typename?: 'Image', title: string, description?: string | null | undefined, file: { __typename?: 'File', contentType: string, fileName: string, url: string, details: { __typename?: 'FileDetails', size: string, image?: { __typename?: 'ImageDetails', height: number, width: number } | null | undefined } } } | null | undefined };

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = { __typename?: 'Query', getProjects: { __typename?: 'ProjectConnection', totalCount: number, items: Array<{ __typename?: 'Project', id: string, client: string, description: string, endDate?: string | null | undefined, industry: string, methodologies: Array<string>, startDate: string, technologies: Array<string>, contact: { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string }, trackings: { __typename?: 'TrackingConnection', items: Array<{ __typename?: 'Tracking', id: string, description?: string | null | undefined, startTime: string, endTime: string }> } }> } };

export type GetProjectQueryVariables = Exact<{
  projectId: Scalars['ID'];
}>;


export type GetProjectQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, client: string, description: string, endDate?: string | null | undefined, industry: string, methodologies: Array<string>, startDate: string, technologies: Array<string>, contact: { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string }, trackings: { __typename?: 'TrackingConnection', items: Array<{ __typename?: 'Tracking', id: string, description?: string | null | undefined, startTime: string, endTime: string }> } } };

export type CreateProjectMutationVariables = Exact<{
  input: ProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'ProjectMutationResponse', code: string, message: string, success: boolean, project: { __typename?: 'Project', id: string, client: string, description: string, endDate?: string | null | undefined, industry: string, methodologies: Array<string>, startDate: string, technologies: Array<string>, contact: { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string }, trackings: { __typename?: 'TrackingConnection', items: Array<{ __typename?: 'Tracking', id: string, description?: string | null | undefined, startTime: string, endTime: string }> } } } };

export type GetTrackingsQueryVariables = Exact<{
  date?: Maybe<Scalars['String']>;
  projectId: Scalars['String'];
}>;


export type GetTrackingsQuery = { __typename?: 'Query', getTrackings: { __typename?: 'TrackingConnection', items: Array<{ __typename?: 'Tracking', id: string, description?: string | null | undefined, startTime: string, endTime: string }> } };

export type CreateTrackingMutationVariables = Exact<{
  input: TrackingInput;
}>;


export type CreateTrackingMutation = { __typename?: 'Mutation', createTracking: { __typename?: 'TrackingMutationResponse', code: string, message: string, success: boolean, tracking: { __typename?: 'Tracking', id: string, description?: string | null | undefined, startTime: string, endTime: string } } };

export type UpdateTrackingMutationVariables = Exact<{
  id: Scalars['ID'];
  input: TrackingInput;
}>;


export type UpdateTrackingMutation = { __typename?: 'Mutation', updateTracking: { __typename?: 'TrackingMutationResponse', code: string, message: string, success: boolean, tracking: { __typename?: 'Tracking', id: string, description?: string | null | undefined, startTime: string, endTime: string } } };

export type DeleteTrackingMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteTrackingMutation = { __typename?: 'Mutation', deleteTracking: { __typename?: 'TrackingMutationResponse', code: string, message: string, success: boolean, tracking: { __typename?: 'Tracking', id: string, description?: string | null | undefined, startTime: string, endTime: string } } };

export type ProjectFieldsFragment = { __typename?: 'Project', id: string, client: string, description: string, endDate?: string | null | undefined, industry: string, methodologies: Array<string>, startDate: string, technologies: Array<string>, contact: { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string }, trackings: { __typename?: 'TrackingConnection', items: Array<{ __typename?: 'Tracking', id: string, description?: string | null | undefined, startTime: string, endTime: string }> } };

export type TrackingFieldsFragment = { __typename?: 'Tracking', id: string, description?: string | null | undefined, startTime: string, endTime: string };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', contact?: { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string } | null | undefined } };

export type ContactFieldsFragment = { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string };

export const PostFieldsFragmentDoc = gql`
    fragment postFields on Post {
  content
  heroImage {
    title
    description
    file {
      contentType
      details {
        image {
          height
          width
        }
        size
      }
      fileName
      url
    }
  }
  intro
  publishDate
  slug
  title
}
    `;
export const ContactFieldsFragmentDoc = gql`
    fragment contactFields on Contact {
  city
  email
  firstName
  lastName
  street
  zip
}
    `;
export const TrackingFieldsFragmentDoc = gql`
    fragment trackingFields on Tracking {
  id
  description
  startTime
  endTime
}
    `;
export const ProjectFieldsFragmentDoc = gql`
    fragment projectFields on Project {
  id
  client
  contact {
    ...contactFields
  }
  description
  endDate
  industry
  methodologies
  startDate
  technologies
  trackings {
    items {
      ...trackingFields
    }
  }
}
    ${ContactFieldsFragmentDoc}
${TrackingFieldsFragmentDoc}`;
export const GetBlogDocument = gql`
    query getBlog {
  getBlog {
    posts {
      ...postFields
    }
  }
}
    ${PostFieldsFragmentDoc}`;

/**
 * __useGetBlogQuery__
 *
 * To run a query within a React component, call `useGetBlogQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlogQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBlogQuery(baseOptions?: Apollo.QueryHookOptions<GetBlogQuery, GetBlogQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlogQuery, GetBlogQueryVariables>(GetBlogDocument, options);
      }
export function useGetBlogLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlogQuery, GetBlogQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlogQuery, GetBlogQueryVariables>(GetBlogDocument, options);
        }
export type GetBlogQueryHookResult = ReturnType<typeof useGetBlogQuery>;
export type GetBlogLazyQueryHookResult = ReturnType<typeof useGetBlogLazyQuery>;
export type GetBlogQueryResult = Apollo.QueryResult<GetBlogQuery, GetBlogQueryVariables>;
export const GetPostDocument = gql`
    query getPost($slug: String!) {
  getPost(slug: $slug) {
    ...postFields
  }
}
    ${PostFieldsFragmentDoc}`;

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
export function useGetPostQuery(baseOptions: Apollo.QueryHookOptions<GetPostQuery, GetPostQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPostQuery, GetPostQueryVariables>(GetPostDocument, options);
      }
export function useGetPostLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPostQuery, GetPostQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPostQuery, GetPostQueryVariables>(GetPostDocument, options);
        }
export type GetPostQueryHookResult = ReturnType<typeof useGetPostQuery>;
export type GetPostLazyQueryHookResult = ReturnType<typeof useGetPostLazyQuery>;
export type GetPostQueryResult = Apollo.QueryResult<GetPostQuery, GetPostQueryVariables>;
export const GetProjectsDocument = gql`
    query getProjects {
  getProjects {
    totalCount
    items {
      ...projectFields
    }
  }
}
    ${ProjectFieldsFragmentDoc}`;

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
export const GetProjectDocument = gql`
    query getProject($projectId: ID!) {
  getProject(id: $projectId) {
    ...projectFields
  }
}
    ${ProjectFieldsFragmentDoc}`;

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
export function useGetProjectQuery(baseOptions: Apollo.QueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, options);
      }
export function useGetProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, options);
        }
export type GetProjectQueryHookResult = ReturnType<typeof useGetProjectQuery>;
export type GetProjectLazyQueryHookResult = ReturnType<typeof useGetProjectLazyQuery>;
export type GetProjectQueryResult = Apollo.QueryResult<GetProjectQuery, GetProjectQueryVariables>;
export const CreateProjectDocument = gql`
    mutation createProject($input: ProjectInput!) {
  createProject(input: $input) {
    code
    message
    success
    project {
      ...projectFields
    }
  }
}
    ${ProjectFieldsFragmentDoc}`;
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
export const GetTrackingsDocument = gql`
    query getTrackings($date: String, $projectId: String!) {
  getTrackings(date: $date, projectId: $projectId) {
    items {
      ...trackingFields
    }
  }
}
    ${TrackingFieldsFragmentDoc}`;

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
 *      date: // value for 'date'
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useGetTrackingsQuery(baseOptions: Apollo.QueryHookOptions<GetTrackingsQuery, GetTrackingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTrackingsQuery, GetTrackingsQueryVariables>(GetTrackingsDocument, options);
      }
export function useGetTrackingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTrackingsQuery, GetTrackingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTrackingsQuery, GetTrackingsQueryVariables>(GetTrackingsDocument, options);
        }
export type GetTrackingsQueryHookResult = ReturnType<typeof useGetTrackingsQuery>;
export type GetTrackingsLazyQueryHookResult = ReturnType<typeof useGetTrackingsLazyQuery>;
export type GetTrackingsQueryResult = Apollo.QueryResult<GetTrackingsQuery, GetTrackingsQueryVariables>;
export const CreateTrackingDocument = gql`
    mutation createTracking($input: TrackingInput!) {
  createTracking(input: $input) {
    code
    message
    success
    tracking {
      ...trackingFields
    }
  }
}
    ${TrackingFieldsFragmentDoc}`;
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTrackingMutation, CreateTrackingMutationVariables>(CreateTrackingDocument, options);
      }
export type CreateTrackingMutationHookResult = ReturnType<typeof useCreateTrackingMutation>;
export type CreateTrackingMutationResult = Apollo.MutationResult<CreateTrackingMutation>;
export type CreateTrackingMutationOptions = Apollo.BaseMutationOptions<CreateTrackingMutation, CreateTrackingMutationVariables>;
export const UpdateTrackingDocument = gql`
    mutation updateTracking($id: ID!, $input: TrackingInput!) {
  updateTracking(id: $id, input: $input) {
    code
    message
    success
    tracking {
      ...trackingFields
    }
  }
}
    ${TrackingFieldsFragmentDoc}`;
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTrackingMutation, UpdateTrackingMutationVariables>(UpdateTrackingDocument, options);
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
    tracking {
      ...trackingFields
    }
  }
}
    ${TrackingFieldsFragmentDoc}`;
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTrackingMutation, DeleteTrackingMutationVariables>(DeleteTrackingDocument, options);
      }
export type DeleteTrackingMutationHookResult = ReturnType<typeof useDeleteTrackingMutation>;
export type DeleteTrackingMutationResult = Apollo.MutationResult<DeleteTrackingMutation>;
export type DeleteTrackingMutationOptions = Apollo.BaseMutationOptions<DeleteTrackingMutation, DeleteTrackingMutationVariables>;
export const MeDocument = gql`
    query me {
  me {
    contact {
      ...contactFields
    }
  }
}
    ${ContactFieldsFragmentDoc}`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;