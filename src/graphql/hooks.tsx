/* eslint-disable */
import gql from 'graphql-tag';
import * as ApolloReactCommon from '@apollo/react-common';
import * as React from 'react';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHooks from '@apollo/react-hooks';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

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
  page?: Maybe<Page>;
  projects: ProjectConnection;
  trackings: TrackingConnection;
};


export type QueryPageArgs = {
  input: PageInput;
};


export type QueryTrackingsArgs = {
  query?: Maybe<TrackingQuery>;
};

export type Mutation = {
  __typename?: 'Mutation';
  track: Tracking;
  addProject: Project;
};


export type MutationTrackArgs = {
  input: TrackingInput;
};


export type MutationAddProjectArgs = {
  input: ProjectInput;
};

export type Page = {
  __typename?: 'Page';
  slug: Scalars['String'];
  title: Scalars['String'];
  content: Scalars['String'];
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
};

export type TrackingConnection = {
  __typename?: 'TrackingConnection';
  items: Array<Tracking>;
  nextToken?: Maybe<Scalars['String']>;
};

export type Tracking = {
  __typename?: 'Tracking';
  id: Scalars['ID'];
  project?: Maybe<Project>;
  description: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
};

export type PageInput = {
  slug: Scalars['String'];
};

export type TrackingInput = {
  id?: Maybe<Scalars['ID']>;
  projectId: Scalars['String'];
  description: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
  endTime: Scalars['AWSDateTime'];
};

export type ProjectInput = {
  id?: Maybe<Scalars['ID']>;
  client: Scalars['String'];
  industry: Scalars['String'];
  description: Scalars['String'];
  startDate: Scalars['AWSDate'];
  endDate?: Maybe<Scalars['AWSDate']>;
  methodologies: Array<Scalars['String']>;
  technologies: Array<Scalars['String']>;
};

export type TrackingQuery = {
  project: Scalars['String'];
  date: Scalars['String'];
};

export type AddProjectMutationVariables = Exact<{
  input: ProjectInput;
}>;


export type AddProjectMutation = (
  { __typename?: 'Mutation' }
  & { addProject: (
    { __typename?: 'Project' }
    & Pick<Project, 'id' | 'client' | 'industry' | 'description' | 'startDate' | 'endDate' | 'methodologies' | 'technologies'>
  ) }
);

export type TrackMutationVariables = Exact<{
  input: TrackingInput;
}>;


export type TrackMutation = (
  { __typename?: 'Mutation' }
  & { track: (
    { __typename?: 'Tracking' }
    & Pick<Tracking, 'id' | 'startTime' | 'endTime' | 'description'>
  ) }
);

export type GetPageQueryVariables = Exact<{
  input: PageInput;
}>;


export type GetPageQuery = (
  { __typename?: 'Query' }
  & { page?: Maybe<(
    { __typename?: 'Page' }
    & Pick<Page, 'slug' | 'title' | 'content'>
  )> }
);

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = (
  { __typename?: 'Query' }
  & { projects: (
    { __typename?: 'ProjectConnection' }
    & Pick<ProjectConnection, 'nextToken'>
    & { items: Array<(
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'client' | 'industry' | 'description' | 'startDate' | 'endDate' | 'methodologies' | 'technologies'>
    )> }
  ) }
);

export type GetTrackingOverviewQueryVariables = Exact<{
  query?: Maybe<TrackingQuery>;
}>;


export type GetTrackingOverviewQuery = (
  { __typename?: 'Query' }
  & { trackings: (
    { __typename?: 'TrackingConnection' }
    & { items: Array<(
      { __typename?: 'Tracking' }
      & Pick<Tracking, 'id' | 'description' | 'startTime' | 'endTime'>
    )> }
  ) }
);


export const AddProjectDocument = gql`
    mutation addProject($input: ProjectInput!) {
  addProject(input: $input) {
    id
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
export type AddProjectMutationFn = ApolloReactCommon.MutationFunction<AddProjectMutation, AddProjectMutationVariables>;
export type AddProjectComponentProps = Omit<ApolloReactComponents.MutationComponentOptions<AddProjectMutation, AddProjectMutationVariables>, 'mutation'>;

    export const AddProjectComponent = (props: AddProjectComponentProps) => (
      <ApolloReactComponents.Mutation<AddProjectMutation, AddProjectMutationVariables> mutation={AddProjectDocument} {...props} />
    );
    

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
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddProjectMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AddProjectMutation, AddProjectMutationVariables>) {
        return ApolloReactHooks.useMutation<AddProjectMutation, AddProjectMutationVariables>(AddProjectDocument, baseOptions);
      }
export type AddProjectMutationHookResult = ReturnType<typeof useAddProjectMutation>;
export type AddProjectMutationResult = ApolloReactCommon.MutationResult<AddProjectMutation>;
export type AddProjectMutationOptions = ApolloReactCommon.BaseMutationOptions<AddProjectMutation, AddProjectMutationVariables>;
export const TrackDocument = gql`
    mutation track($input: TrackingInput!) {
  track(input: $input) {
    id
    startTime
    endTime
    description
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
    items {
      id
      client
      industry
      description
      startDate
      endDate
      methodologies
      technologies
    }
    nextToken
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
export const GetTrackingOverviewDocument = gql`
    query getTrackingOverview($query: TrackingQuery) {
  trackings(query: $query) {
    items {
      id
      description
      startTime
      endTime
    }
  }
}
    `;
export type GetTrackingOverviewComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables>, 'query'>;

    export const GetTrackingOverviewComponent = (props: GetTrackingOverviewComponentProps) => (
      <ApolloReactComponents.Query<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables> query={GetTrackingOverviewDocument} {...props} />
    );
    

/**
 * __useGetTrackingOverviewQuery__
 *
 * To run a query within a React component, call `useGetTrackingOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTrackingOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTrackingOverviewQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetTrackingOverviewQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables>) {
        return ApolloReactHooks.useQuery<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables>(GetTrackingOverviewDocument, baseOptions);
      }
export function useGetTrackingOverviewLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables>(GetTrackingOverviewDocument, baseOptions);
        }
export type GetTrackingOverviewQueryHookResult = ReturnType<typeof useGetTrackingOverviewQuery>;
export type GetTrackingOverviewLazyQueryHookResult = ReturnType<typeof useGetTrackingOverviewLazyQuery>;
export type GetTrackingOverviewQueryResult = ApolloReactCommon.QueryResult<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables>;