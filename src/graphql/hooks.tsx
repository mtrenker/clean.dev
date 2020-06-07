/* eslint-disable */
import gql from 'graphql-tag';
import * as ApolloReactCommon from '@apollo/react-common';
import * as React from 'react';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHooks from '@apollo/react-hooks';
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSDate: Date;
  AWSDateTime: Date;
  AWSJSON: { [key: string]: any };
};




export type Mutation = {
  __typename?: 'Mutation';
  track: Tracking;
};


export type MutationTrackArgs = {
  input: TrackingInput;
};

export type Page = {
  __typename?: 'Page';
  slug: Scalars['String'];
  title: Scalars['String'];
  content: Scalars['String'];
};

export type PageInput = {
  slug: Scalars['String'];
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  client: Scalars['String'];
  industry: Scalars['String'];
  description: Scalars['String'];
  startDate: Scalars['AWSDate'];
  endDate: Scalars['AWSDate'];
  methodologies: Array<Scalars['String']>;
  technologies: Array<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  projects: Array<Project>;
  page?: Maybe<Page>;
  trackings?: Maybe<Array<Maybe<Tracking>>>;
};


export type QueryPageArgs = {
  input: PageInput;
};


export type QueryTrackingsArgs = {
  query?: Maybe<TrackingQuery>;
};

export type Tracking = {
  __typename?: 'Tracking';
  id: Scalars['ID'];
  project?: Maybe<Project>;
  description: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
};

export type TrackingInput = {
  id?: Maybe<Scalars['ID']>;
  projectId: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
};

export type TrackingQuery = {
  project: Scalars['String'];
  date: Scalars['String'];
};

export type TrackMutationVariables = {
  input: TrackingInput;
};


export type TrackMutation = (
  { __typename?: 'Mutation' }
  & { track: (
    { __typename?: 'Tracking' }
    & Pick<Tracking, 'id'>
  ) }
);

export type GetPageQueryVariables = {
  input: PageInput;
};


export type GetPageQuery = (
  { __typename?: 'Query' }
  & { page?: Maybe<(
    { __typename?: 'Page' }
    & Pick<Page, 'slug' | 'title' | 'content'>
  )> }
);

export type GetProjectsQueryVariables = {};


export type GetProjectsQuery = (
  { __typename?: 'Query' }
  & { projects: Array<(
    { __typename?: 'Project' }
    & Pick<Project, 'client' | 'industry' | 'description' | 'startDate' | 'endDate' | 'methodologies' | 'technologies'>
  )> }
);

export type GetTrackingsQueryVariables = {
  query?: Maybe<TrackingQuery>;
};


export type GetTrackingsQuery = (
  { __typename?: 'Query' }
  & { trackings?: Maybe<Array<Maybe<(
    { __typename?: 'Tracking' }
    & Pick<Tracking, 'id' | 'description' | 'startTime' | 'endTime'>
    & { project?: Maybe<(
      { __typename?: 'Project' }
      & Pick<Project, 'id'>
    )> }
  )>>> }
);


export const TrackDocument = gql`
    mutation track($input: TrackingInput!) {
  track(input: $input) {
    id
  }
}
    `;
export type TrackMutationFn = ApolloReactCommon.MutationFunction<TrackMutation, TrackMutationVariables>;
export type TrackComponentProps = Omit<ApolloReactComponents.MutationComponentOptions<TrackMutation, TrackMutationVariables>, 'mutation'>;

    export const TrackComponent = (props: TrackComponentProps) => (
      <ApolloReactComponents.Mutation<TrackMutation, TrackMutationVariables> mutation={TrackDocument} {...props} />
    );
    

/**
 * __useTrackMutation__
 *
 * To run a mutation, you first call `useTrackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTrackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [trackMutation, { data, loading, error }] = useTrackMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useTrackMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<TrackMutation, TrackMutationVariables>) {
        return ApolloReactHooks.useMutation<TrackMutation, TrackMutationVariables>(TrackDocument, baseOptions);
      }
export type TrackMutationHookResult = ReturnType<typeof useTrackMutation>;
export type TrackMutationResult = ApolloReactCommon.MutationResult<TrackMutation>;
export type TrackMutationOptions = ApolloReactCommon.BaseMutationOptions<TrackMutation, TrackMutationVariables>;
export const GetPageDocument = gql`
    query getPage($input: PageInput!) {
  page(input: $input) {
    slug
    title
    content
  }
}
    `;
export type GetPageComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<GetPageQuery, GetPageQueryVariables>, 'query'> & ({ variables: GetPageQueryVariables; skip?: boolean; } | { skip: boolean; });

    export const GetPageComponent = (props: GetPageComponentProps) => (
      <ApolloReactComponents.Query<GetPageQuery, GetPageQueryVariables> query={GetPageDocument} {...props} />
    );
    

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
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetPageQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetPageQuery, GetPageQueryVariables>) {
        return ApolloReactHooks.useQuery<GetPageQuery, GetPageQueryVariables>(GetPageDocument, baseOptions);
      }
export function useGetPageLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetPageQuery, GetPageQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetPageQuery, GetPageQueryVariables>(GetPageDocument, baseOptions);
        }
export type GetPageQueryHookResult = ReturnType<typeof useGetPageQuery>;
export type GetPageLazyQueryHookResult = ReturnType<typeof useGetPageLazyQuery>;
export type GetPageQueryResult = ApolloReactCommon.QueryResult<GetPageQuery, GetPageQueryVariables>;
export const GetProjectsDocument = gql`
    query getProjects {
  projects {
    client
    industry
    description
    startDate
    endDate
    methodologies
    technologies
  }
}
    `;
export type GetProjectsComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<GetProjectsQuery, GetProjectsQueryVariables>, 'query'>;

    export const GetProjectsComponent = (props: GetProjectsComponentProps) => (
      <ApolloReactComponents.Query<GetProjectsQuery, GetProjectsQueryVariables> query={GetProjectsDocument} {...props} />
    );
    

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
export function useGetProjectsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
        return ApolloReactHooks.useQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, baseOptions);
      }
export function useGetProjectsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, baseOptions);
        }
export type GetProjectsQueryHookResult = ReturnType<typeof useGetProjectsQuery>;
export type GetProjectsLazyQueryHookResult = ReturnType<typeof useGetProjectsLazyQuery>;
export type GetProjectsQueryResult = ApolloReactCommon.QueryResult<GetProjectsQuery, GetProjectsQueryVariables>;
export const GetTrackingsDocument = gql`
    query getTrackings($query: TrackingQuery) {
  trackings(query: $query) {
    id
    project {
      id
    }
    description
    startTime
    endTime
  }
}
    `;
export type GetTrackingsComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<GetTrackingsQuery, GetTrackingsQueryVariables>, 'query'>;

    export const GetTrackingsComponent = (props: GetTrackingsComponentProps) => (
      <ApolloReactComponents.Query<GetTrackingsQuery, GetTrackingsQueryVariables> query={GetTrackingsDocument} {...props} />
    );
    

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
export function useGetTrackingsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetTrackingsQuery, GetTrackingsQueryVariables>) {
        return ApolloReactHooks.useQuery<GetTrackingsQuery, GetTrackingsQueryVariables>(GetTrackingsDocument, baseOptions);
      }
export function useGetTrackingsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetTrackingsQuery, GetTrackingsQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetTrackingsQuery, GetTrackingsQueryVariables>(GetTrackingsDocument, baseOptions);
        }
export type GetTrackingsQueryHookResult = ReturnType<typeof useGetTrackingsQuery>;
export type GetTrackingsLazyQueryHookResult = ReturnType<typeof useGetTrackingsLazyQuery>;
export type GetTrackingsQueryResult = ApolloReactCommon.QueryResult<GetTrackingsQuery, GetTrackingsQueryVariables>;