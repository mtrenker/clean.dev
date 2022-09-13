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
  AWSJSON: string;
};

export type Mutation = {
  __typename?: 'Mutation';
  contact?: Maybe<Scalars['String']>;
  createProject: Project;
  removeProject: Project;
  updateProject: Project;
};


export type MutationContactArgs = {
  email?: InputMaybe<Scalars['String']>;
  message?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};


export type MutationCreateProjectArgs = {
  project: ProjectInput;
};


export type MutationRemoveProjectArgs = {
  id: Scalars['ID'];
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID'];
  project: ProjectInput;
};

export type Project = {
  __typename?: 'Project';
  client: Scalars['String'];
  endDate?: Maybe<Scalars['AWSDate']>;
  featured?: Maybe<Scalars['Boolean']>;
  hightlights: Array<ProjectHightlight>;
  id: Scalars['ID'];
  location?: Maybe<Scalars['String']>;
  position: Scalars['String'];
  startDate?: Maybe<Scalars['AWSDate']>;
  summary: Scalars['String'];
};

export type ProjectHightlight = {
  __typename?: 'ProjectHightlight';
  description: Scalars['String'];
  title: Scalars['String'];
};

export type ProjectInput = {
  client: Scalars['String'];
  endDate?: InputMaybe<Scalars['AWSDate']>;
  featured?: InputMaybe<Scalars['Boolean']>;
  hightlights?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
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
  project: ProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'Project', id: string } };

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = { __typename?: 'Query', projects: Array<{ __typename?: 'Project', client: string, endDate?: string | null, featured?: boolean | null, id: string, location?: string | null, position: string, startDate?: string | null, summary: string }> };

export type ProjectFragmentFragment = { __typename?: 'Project', client: string, endDate?: string | null, featured?: boolean | null, id: string, location?: string | null, position: string, startDate?: string | null, summary: string };

export const ProjectFragmentFragmentDoc = gql`
    fragment ProjectFragment on Project {
  client
  endDate
  featured
  id
  location
  position
  startDate
  summary
}
    `;
export const CreateProjectDocument = gql`
    mutation createProject($project: ProjectInput!) {
  createProject(project: $project) {
    id
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
 *      project: // value for 'project'
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
export const GetProjectsDocument = gql`
    query getProjects {
  projects {
    ...ProjectFragment
  }
}
    ${ProjectFragmentFragmentDoc}`;

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