import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
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
  city?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  street?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

export type ContactInput = {
  city?: InputMaybe<Scalars['String']>;
  company?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  street?: InputMaybe<Scalars['String']>;
  zip?: InputMaybe<Scalars['String']>;
};

export type HighlightInput = {
  description: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  contact?: Maybe<Scalars['String']>;
  createProject: Project;
  createTracking: Tracking;
  removeProject: Scalars['String'];
  removeTracking: Scalars['String'];
  updateProject: Project;
};


export type MutationContactArgs = {
  email?: InputMaybe<Scalars['String']>;
  message?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};


export type MutationCreateProjectArgs = {
  input: ProjectInput;
};


export type MutationCreateTrackingArgs = {
  input: TrackingInput;
};


export type MutationRemoveProjectArgs = {
  id: Scalars['ID'];
};


export type MutationRemoveTrackingArgs = {
  input: TrackingInput;
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID'];
  input: ProjectInput;
};

export type Project = {
  __typename?: 'Project';
  categories: Array<Maybe<ProjectCategory>>;
  client: Scalars['String'];
  contact?: Maybe<Contact>;
  endDate?: Maybe<Scalars['AWSDate']>;
  featured: Scalars['Boolean'];
  highlights: Array<Maybe<ProjectHighlight>>;
  id: Scalars['ID'];
  location?: Maybe<Scalars['String']>;
  position: Scalars['String'];
  startDate?: Maybe<Scalars['AWSDate']>;
  summary: Scalars['String'];
};

export type ProjectCategory = {
  __typename?: 'ProjectCategory';
  color?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  rate?: Maybe<Scalars['Float']>;
};

export type ProjectCategoryInput = {
  color?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  rate?: InputMaybe<Scalars['Float']>;
};

export type ProjectHighlight = {
  __typename?: 'ProjectHighlight';
  description: Scalars['String'];
};

export type ProjectInput = {
  categories?: InputMaybe<Array<InputMaybe<ProjectCategoryInput>>>;
  client: Scalars['String'];
  contact?: InputMaybe<ContactInput>;
  endDate?: InputMaybe<Scalars['AWSDate']>;
  featured?: InputMaybe<Scalars['Boolean']>;
  highlights?: InputMaybe<Array<InputMaybe<HighlightInput>>>;
  location?: InputMaybe<Scalars['String']>;
  position: Scalars['String'];
  startDate?: InputMaybe<Scalars['AWSDate']>;
  summary: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  projects: Array<Project>;
};

export type Tracking = {
  __typename?: 'Tracking';
  category?: Maybe<Scalars['String']>;
  endTime?: Maybe<Scalars['AWSDateTime']>;
  startTime: Scalars['AWSDateTime'];
  summary?: Maybe<Scalars['String']>;
};

export type TrackingInput = {
  category?: InputMaybe<Scalars['String']>;
  endTime?: InputMaybe<Scalars['AWSDateTime']>;
  projectId: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
  summary?: InputMaybe<Scalars['String']>;
};

export type ContactFragmentFragment = { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null };

export type ProjectFragmentFragment = { __typename?: 'Project', client: string, endDate?: string | null, featured: boolean, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, categories: Array<{ __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null } | null>, highlights: Array<{ __typename?: 'ProjectHighlight', description: string } | null> };

export type ProjectHighlightFragmentFragment = { __typename?: 'ProjectHighlight', description: string };

export type ProjectCategoryFragmentFragment = { __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null };

export type TrackingFragmentFragment = { __typename?: 'Tracking', category?: string | null, endTime?: string | null, startTime: string, summary?: string | null };

export type CreateProjectMutationVariables = Exact<{
  input: ProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'Project', client: string, endDate?: string | null, featured: boolean, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null } | null, categories: Array<{ __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null } | null>, highlights: Array<{ __typename?: 'ProjectHighlight', description: string } | null> } };

export type UpdateProjectMutationVariables = Exact<{
  id: Scalars['ID'];
  input: ProjectInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'Project', client: string, endDate?: string | null, featured: boolean, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null } | null, categories: Array<{ __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null } | null>, highlights: Array<{ __typename?: 'ProjectHighlight', description: string } | null> } };

export type RemoveProjectMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type RemoveProjectMutation = { __typename?: 'Mutation', removeProject: string };

export type CreateTrackingMutationVariables = Exact<{
  input: TrackingInput;
}>;


export type CreateTrackingMutation = { __typename?: 'Mutation', createTracking: { __typename?: 'Tracking', category?: string | null, endTime?: string | null, startTime: string, summary?: string | null } };

export type RemoveTrackingMutationVariables = Exact<{
  input: TrackingInput;
}>;


export type RemoveTrackingMutation = { __typename?: 'Mutation', removeTracking: string };

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = { __typename?: 'Query', projects: Array<{ __typename?: 'Project', client: string, endDate?: string | null, featured: boolean, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null } | null, categories: Array<{ __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null } | null>, highlights: Array<{ __typename?: 'ProjectHighlight', description: string } | null> }> };

export const ContactFragmentFragmentDoc = gql`
    fragment ContactFragment on Contact {
  company
  firstName
  lastName
  email
  street
  city
  zip
  country
}
    `;
export const ProjectCategoryFragmentFragmentDoc = gql`
    fragment ProjectCategoryFragment on ProjectCategory {
  name
  color
  rate
}
    `;
export const ProjectHighlightFragmentFragmentDoc = gql`
    fragment ProjectHighlightFragment on ProjectHighlight {
  description
}
    `;
export const ProjectFragmentFragmentDoc = gql`
    fragment ProjectFragment on Project {
  categories {
    ...ProjectCategoryFragment
  }
  client
  endDate
  featured
  highlights {
    ...ProjectHighlightFragment
  }
  id
  location
  position
  startDate
  summary
}
    ${ProjectCategoryFragmentFragmentDoc}
${ProjectHighlightFragmentFragmentDoc}`;
export const TrackingFragmentFragmentDoc = gql`
    fragment TrackingFragment on Tracking {
  category
  endTime
  startTime
  summary
}
    `;
export const CreateProjectDocument = gql`
    mutation createProject($input: ProjectInput!) {
  createProject(input: $input) {
    ...ProjectFragment
    contact {
      ...ContactFragment
    }
  }
}
    ${ProjectFragmentFragmentDoc}
${ContactFragmentFragmentDoc}`;
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
export function useCreateProjectMutation (baseOptions?: Apollo.MutationHookOptions<CreateProjectMutation, CreateProjectMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, options);
}
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<CreateProjectMutation, CreateProjectMutationVariables>;
export const UpdateProjectDocument = gql`
    mutation updateProject($id: ID!, $input: ProjectInput!) {
  updateProject(id: $id, input: $input) {
    ...ProjectFragment
    contact {
      ...ContactFragment
    }
  }
}
    ${ProjectFragmentFragmentDoc}
${ContactFragmentFragmentDoc}`;
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
export function useUpdateProjectMutation (baseOptions?: Apollo.MutationHookOptions<UpdateProjectMutation, UpdateProjectMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateProjectMutation, UpdateProjectMutationVariables>(UpdateProjectDocument, options);
}
export type UpdateProjectMutationHookResult = ReturnType<typeof useUpdateProjectMutation>;
export type UpdateProjectMutationResult = Apollo.MutationResult<UpdateProjectMutation>;
export type UpdateProjectMutationOptions = Apollo.BaseMutationOptions<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const RemoveProjectDocument = gql`
    mutation removeProject($id: ID!) {
  removeProject(id: $id)
}
    `;
export type RemoveProjectMutationFn = Apollo.MutationFunction<RemoveProjectMutation, RemoveProjectMutationVariables>;

/**
 * __useRemoveProjectMutation__
 *
 * To run a mutation, you first call `useRemoveProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeProjectMutation, { data, loading, error }] = useRemoveProjectMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemoveProjectMutation (baseOptions?: Apollo.MutationHookOptions<RemoveProjectMutation, RemoveProjectMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RemoveProjectMutation, RemoveProjectMutationVariables>(RemoveProjectDocument, options);
}
export type RemoveProjectMutationHookResult = ReturnType<typeof useRemoveProjectMutation>;
export type RemoveProjectMutationResult = Apollo.MutationResult<RemoveProjectMutation>;
export type RemoveProjectMutationOptions = Apollo.BaseMutationOptions<RemoveProjectMutation, RemoveProjectMutationVariables>;
export const CreateTrackingDocument = gql`
    mutation createTracking($input: TrackingInput!) {
  createTracking(input: $input) {
    ...TrackingFragment
  }
}
    ${TrackingFragmentFragmentDoc}`;
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
export function useCreateTrackingMutation (baseOptions?: Apollo.MutationHookOptions<CreateTrackingMutation, CreateTrackingMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateTrackingMutation, CreateTrackingMutationVariables>(CreateTrackingDocument, options);
}
export type CreateTrackingMutationHookResult = ReturnType<typeof useCreateTrackingMutation>;
export type CreateTrackingMutationResult = Apollo.MutationResult<CreateTrackingMutation>;
export type CreateTrackingMutationOptions = Apollo.BaseMutationOptions<CreateTrackingMutation, CreateTrackingMutationVariables>;
export const RemoveTrackingDocument = gql`
    mutation removeTracking($input: TrackingInput!) {
  removeTracking(input: $input)
}
    `;
export type RemoveTrackingMutationFn = Apollo.MutationFunction<RemoveTrackingMutation, RemoveTrackingMutationVariables>;

/**
 * __useRemoveTrackingMutation__
 *
 * To run a mutation, you first call `useRemoveTrackingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveTrackingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeTrackingMutation, { data, loading, error }] = useRemoveTrackingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveTrackingMutation (baseOptions?: Apollo.MutationHookOptions<RemoveTrackingMutation, RemoveTrackingMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RemoveTrackingMutation, RemoveTrackingMutationVariables>(RemoveTrackingDocument, options);
}
export type RemoveTrackingMutationHookResult = ReturnType<typeof useRemoveTrackingMutation>;
export type RemoveTrackingMutationResult = Apollo.MutationResult<RemoveTrackingMutation>;
export type RemoveTrackingMutationOptions = Apollo.BaseMutationOptions<RemoveTrackingMutation, RemoveTrackingMutationVariables>;
export const GetProjectsDocument = gql`
    query getProjects {
  projects {
    ...ProjectFragment
    contact {
      ...ContactFragment
    }
  }
}
    ${ProjectFragmentFragmentDoc}
${ContactFragmentFragmentDoc}`;

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
export function useGetProjectsQuery (baseOptions?: Apollo.QueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
}
export function useGetProjectsLazyQuery (baseOptions?: Apollo.LazyQueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
}
export type GetProjectsQueryHookResult = ReturnType<typeof useGetProjectsQuery>;
export type GetProjectsLazyQueryHookResult = ReturnType<typeof useGetProjectsLazyQuery>;
export type GetProjectsQueryResult = Apollo.QueryResult<GetProjectsQuery, GetProjectsQueryVariables>;