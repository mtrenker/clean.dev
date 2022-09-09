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
  endDate?: InputMaybe<Scalars['AWSDate']>;
  hightlights?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  position: Scalars['String'];
  startDate?: InputMaybe<Scalars['AWSDate']>;
  summary: Scalars['String'];
};


export type MutationRemoveProjectArgs = {
  id: Scalars['ID'];
};


export type MutationUpdateProjectArgs = {
  endDate?: InputMaybe<Scalars['AWSDate']>;
  hightlights?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id: Scalars['ID'];
  position: Scalars['String'];
  startDate?: InputMaybe<Scalars['AWSDate']>;
  summary: Scalars['String'];
};

export type Project = {
  __typename?: 'Project';
  endDate?: Maybe<Scalars['AWSDate']>;
  hightlights: Array<ProjectHightlight>;
  id: Scalars['ID'];
  position: Scalars['String'];
  startDate?: Maybe<Scalars['AWSDate']>;
  summary: Scalars['String'];
};

export type ProjectHightlight = {
  __typename?: 'ProjectHightlight';
  description: Scalars['String'];
  title: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  projects: Array<Project>;
};

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = { __typename?: 'Query', projects: Array<{ __typename?: 'Project', id: string }> };


export const GetProjectsDocument = gql`
    query getProjects {
  projects {
    id
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
