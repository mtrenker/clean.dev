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

export type Mutation = {
  __typename?: 'Mutation';
  contact?: Maybe<Scalars['String']>;
  createProject: Project;
  removeProject: Scalars['String'];
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


export type MutationRemoveProjectArgs = {
  id: Scalars['ID'];
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID'];
  input: ProjectInput;
};

export type Project = {
  __typename?: 'Project';
  client: Scalars['String'];
  contact?: Maybe<Contact>;
  endDate?: Maybe<Scalars['AWSDate']>;
  featured?: Maybe<Scalars['Boolean']>;
  highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
  id: Scalars['ID'];
  location?: Maybe<Scalars['String']>;
  position: Scalars['String'];
  startDate?: Maybe<Scalars['AWSDate']>;
  summary: Scalars['String'];
};

export type ProjectInput = {
  client: Scalars['String'];
  contact?: InputMaybe<ContactInput>;
  endDate?: InputMaybe<Scalars['AWSDate']>;
  featured?: InputMaybe<Scalars['Boolean']>;
  highlights?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  location?: InputMaybe<Scalars['String']>;
  position: Scalars['String'];
  startDate?: InputMaybe<Scalars['AWSDate']>;
  summary: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  projects: Array<Project>;
};

export type CreateProjectMutationVariables = Exact<{
  input: ProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'Project', client: string, endDate?: string | null, featured?: boolean | null, highlights?: Array<string | null> | null, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null } | null } };

export type UpdateProjectMutationVariables = Exact<{
  id: Scalars['ID'];
  input: ProjectInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'Project', client: string, endDate?: string | null, featured?: boolean | null, highlights?: Array<string | null> | null, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null } | null } };

export type RemoveProjectMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type RemoveProjectMutation = { __typename?: 'Mutation', removeProject: string };

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = { __typename?: 'Query', projects: Array<{ __typename?: 'Project', client: string, endDate?: string | null, featured?: boolean | null, highlights?: Array<string | null> | null, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null } | null }> };

export type ContactFragmentFragment = { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null };

export type ProjectFragmentFragment = { __typename?: 'Project', client: string, endDate?: string | null, featured?: boolean | null, highlights?: Array<string | null> | null, id: string, location?: string | null, position: string, startDate?: string | null, summary: string };

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
export const ProjectFragmentFragmentDoc = gql`
    fragment ProjectFragment on Project {
  client
  endDate
  featured
  highlights
  id
  location
  position
  startDate
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