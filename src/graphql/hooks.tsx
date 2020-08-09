/* eslint-disable */
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
const gql = Apollo.gql;

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
  blog: Blog;
  projects: ProjectConnection;
  project: Project;
  trackings: TrackingConnection;
};


export type QueryPageArgs = {
  pageQuery: PageQuery;
};


export type QueryProjectArgs = {
  projectQuery: ProjectQuery;
};


export type QueryTrackingsArgs = {
  trackingQuery: TrackingQuery;
};

export type Mutation = {
  __typename?: 'Mutation';
  track: Tracking;
  addProject: Project;
};


export type MutationTrackArgs = {
  trackingInput: TrackingInput;
};


export type MutationAddProjectArgs = {
  projectInput: ProjectInput;
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
  trackings: TrackingConnection;
};


export type ProjectTrackingsArgs = {
  trackingQuery: TrackingQuery;
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

export type Blog = {
  __typename?: 'Blog';
  post: BlogPost;
  list: BlogPostConnection;
};


export type BlogPostArgs = {
  blogPostQuery: BlogPostQuery;
};

export type BlogPostConnection = {
  __typename?: 'BlogPostConnection';
  items: Array<BlogPost>;
};

export type BlogPost = {
  __typename?: 'BlogPost';
  id: Scalars['ID'];
  title: Scalars['String'];
  slug: Scalars['String'];
  publishDate: Scalars['AWSDateTime'];
  author: Author;
  heroImage?: Maybe<Image>;
  intro: Scalars['String'];
  content: Scalars['String'];
};

export type Image = {
  __typename?: 'Image';
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  width: Scalars['Int'];
  height: Scalars['Int'];
  size: Scalars['Int'];
  url: Scalars['String'];
};

export type Author = {
  __typename?: 'Author';
  name: Scalars['String'];
  avatar?: Maybe<Image>;
};

export type PageQuery = {
  slug: Scalars['String'];
};

export type BlogPostQuery = {
  post: Scalars['String'];
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
  project?: Maybe<Scalars['String']>;
  date: Scalars['String'];
};

export type ProjectQuery = {
  project: Scalars['String'];
};

export type AddProjectMutationVariables = Exact<{
  projectInput: ProjectInput;
}>;


export type AddProjectMutation = (
  { __typename?: 'Mutation' }
  & { addProject: (
    { __typename?: 'Project' }
    & Pick<Project, 'id' | 'client' | 'industry' | 'description' | 'startDate' | 'endDate' | 'methodologies' | 'technologies'>
  ) }
);

export type TrackMutationVariables = Exact<{
  trackingInput: TrackingInput;
}>;


export type TrackMutation = (
  { __typename?: 'Mutation' }
  & { track: (
    { __typename?: 'Tracking' }
    & Pick<Tracking, 'id' | 'startTime' | 'endTime' | 'description'>
  ) }
);

export type GetBlogListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBlogListQuery = (
  { __typename?: 'Query' }
  & { blog: (
    { __typename?: 'Blog' }
    & { list: (
      { __typename?: 'BlogPostConnection' }
      & { items: Array<(
        { __typename?: 'BlogPost' }
        & Pick<BlogPost, 'id' | 'publishDate' | 'slug' | 'title' | 'intro'>
        & { heroImage?: Maybe<(
          { __typename?: 'Image' }
          & Pick<Image, 'url' | 'width' | 'height' | 'description'>
        )>, author: (
          { __typename?: 'Author' }
          & Pick<Author, 'name'>
          & { avatar?: Maybe<(
            { __typename?: 'Image' }
            & Pick<Image, 'url'>
          )> }
        ) }
      )> }
    ) }
  ) }
);

export type GetBlogPostQueryVariables = Exact<{
  blogPostQuery: BlogPostQuery;
}>;


export type GetBlogPostQuery = (
  { __typename?: 'Query' }
  & { blog: (
    { __typename?: 'Blog' }
    & { post: (
      { __typename?: 'BlogPost' }
      & Pick<BlogPost, 'id' | 'title' | 'slug' | 'intro' | 'content'>
      & { heroImage?: Maybe<(
        { __typename?: 'Image' }
        & Pick<Image, 'url' | 'width' | 'height' | 'description'>
      )>, author: (
        { __typename?: 'Author' }
        & Pick<Author, 'name'>
        & { avatar?: Maybe<(
          { __typename?: 'Image' }
          & Pick<Image, 'url'>
        )> }
      ) }
    ) }
  ) }
);

export type GetPageQueryVariables = Exact<{
  pageQuery: PageQuery;
}>;


export type GetPageQuery = (
  { __typename?: 'Query' }
  & { page?: Maybe<(
    { __typename?: 'Page' }
    & Pick<Page, 'slug' | 'title' | 'content'>
  )> }
);

export type ProjectPartsFragment = (
  { __typename?: 'Project' }
  & Pick<Project, 'id' | 'client' | 'industry' | 'description' | 'startDate' | 'endDate' | 'methodologies' | 'technologies'>
);

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = (
  { __typename?: 'Query' }
  & { projects: (
    { __typename?: 'ProjectConnection' }
    & Pick<ProjectConnection, 'nextToken'>
    & { items: Array<(
      { __typename?: 'Project' }
      & ProjectPartsFragment
    )> }
  ) }
);

export type GetProjectQueryVariables = Exact<{
  projectQuery: ProjectQuery;
  trackingQuery: TrackingQuery;
}>;


export type GetProjectQuery = (
  { __typename?: 'Query' }
  & { project: (
    { __typename?: 'Project' }
    & { trackings: (
      { __typename?: 'TrackingConnection' }
      & { items: Array<(
        { __typename?: 'Tracking' }
        & TrackingPartsFragment
      )> }
    ) }
    & ProjectPartsFragment
  ) }
);

export type TrackingPartsFragment = (
  { __typename?: 'Tracking' }
  & Pick<Tracking, 'id' | 'description' | 'startTime' | 'endTime'>
);

export type GetTrackingOverviewQueryVariables = Exact<{
  trackingQuery: TrackingQuery;
}>;


export type GetTrackingOverviewQuery = (
  { __typename?: 'Query' }
  & { trackings: (
    { __typename?: 'TrackingConnection' }
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
}
    `;
export const TrackingPartsFragmentDoc = gql`
    fragment TrackingParts on Tracking {
  id
  description
  startTime
  endTime
}
    `;
export const AddProjectDocument = gql`
    mutation addProject($projectInput: ProjectInput!) {
  addProject(projectInput: $projectInput) {
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
export type AddProjectMutationFn = Apollo.MutationFunction<AddProjectMutation, AddProjectMutationVariables>;

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
 *      projectInput: // value for 'projectInput'
 *   },
 * });
 */
export function useAddProjectMutation(baseOptions?: Apollo.MutationHookOptions<AddProjectMutation, AddProjectMutationVariables>) {
        return Apollo.useMutation<AddProjectMutation, AddProjectMutationVariables>(AddProjectDocument, baseOptions);
      }
export type AddProjectMutationHookResult = ReturnType<typeof useAddProjectMutation>;
export type AddProjectMutationResult = Apollo.MutationResult<AddProjectMutation>;
export type AddProjectMutationOptions = Apollo.BaseMutationOptions<AddProjectMutation, AddProjectMutationVariables>;
export const TrackDocument = gql`
    mutation track($trackingInput: TrackingInput!) {
  track(trackingInput: $trackingInput) {
    id
    startTime
    endTime
    description
  }
}
    `;
export type TrackMutationFn = Apollo.MutationFunction<TrackMutation, TrackMutationVariables>;

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
 *      trackingInput: // value for 'trackingInput'
 *   },
 * });
 */
export function useTrackMutation(baseOptions?: Apollo.MutationHookOptions<TrackMutation, TrackMutationVariables>) {
        return Apollo.useMutation<TrackMutation, TrackMutationVariables>(TrackDocument, baseOptions);
      }
export type TrackMutationHookResult = ReturnType<typeof useTrackMutation>;
export type TrackMutationResult = Apollo.MutationResult<TrackMutation>;
export type TrackMutationOptions = Apollo.BaseMutationOptions<TrackMutation, TrackMutationVariables>;
export const GetBlogListDocument = gql`
    query getBlogList {
  blog {
    list {
      items {
        id
        publishDate
        slug
        title
        heroImage {
          url
          width
          height
          description
        }
        intro
        author {
          name
          avatar {
            url
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetBlogListQuery__
 *
 * To run a query within a React component, call `useGetBlogListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlogListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlogListQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBlogListQuery(baseOptions?: Apollo.QueryHookOptions<GetBlogListQuery, GetBlogListQueryVariables>) {
        return Apollo.useQuery<GetBlogListQuery, GetBlogListQueryVariables>(GetBlogListDocument, baseOptions);
      }
export function useGetBlogListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlogListQuery, GetBlogListQueryVariables>) {
          return Apollo.useLazyQuery<GetBlogListQuery, GetBlogListQueryVariables>(GetBlogListDocument, baseOptions);
        }
export type GetBlogListQueryHookResult = ReturnType<typeof useGetBlogListQuery>;
export type GetBlogListLazyQueryHookResult = ReturnType<typeof useGetBlogListLazyQuery>;
export type GetBlogListQueryResult = Apollo.QueryResult<GetBlogListQuery, GetBlogListQueryVariables>;
export const GetBlogPostDocument = gql`
    query getBlogPost($blogPostQuery: BlogPostQuery!) {
  blog {
    post(blogPostQuery: $blogPostQuery) {
      id
      title
      slug
      heroImage {
        url
        width
        height
        description
      }
      intro
      content
      author {
        name
        avatar {
          url
        }
      }
    }
  }
}
    `;

/**
 * __useGetBlogPostQuery__
 *
 * To run a query within a React component, call `useGetBlogPostQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlogPostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlogPostQuery({
 *   variables: {
 *      blogPostQuery: // value for 'blogPostQuery'
 *   },
 * });
 */
export function useGetBlogPostQuery(baseOptions?: Apollo.QueryHookOptions<GetBlogPostQuery, GetBlogPostQueryVariables>) {
        return Apollo.useQuery<GetBlogPostQuery, GetBlogPostQueryVariables>(GetBlogPostDocument, baseOptions);
      }
export function useGetBlogPostLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlogPostQuery, GetBlogPostQueryVariables>) {
          return Apollo.useLazyQuery<GetBlogPostQuery, GetBlogPostQueryVariables>(GetBlogPostDocument, baseOptions);
        }
export type GetBlogPostQueryHookResult = ReturnType<typeof useGetBlogPostQuery>;
export type GetBlogPostLazyQueryHookResult = ReturnType<typeof useGetBlogPostLazyQuery>;
export type GetBlogPostQueryResult = Apollo.QueryResult<GetBlogPostQuery, GetBlogPostQueryVariables>;
export const GetPageDocument = gql`
    query getPage($pageQuery: PageQuery!) {
  page(pageQuery: $pageQuery) {
    slug
    title
    content
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
 *      pageQuery: // value for 'pageQuery'
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
  projects {
    items {
      ...ProjectParts
    }
    nextToken
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
    query getProject($projectQuery: ProjectQuery!, $trackingQuery: TrackingQuery!) {
  project(projectQuery: $projectQuery) {
    ...ProjectParts
    trackings(trackingQuery: $trackingQuery) {
      items {
        ...TrackingParts
      }
    }
  }
}
    ${ProjectPartsFragmentDoc}
${TrackingPartsFragmentDoc}`;

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
 *      projectQuery: // value for 'projectQuery'
 *      trackingQuery: // value for 'trackingQuery'
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
export const GetTrackingOverviewDocument = gql`
    query getTrackingOverview($trackingQuery: TrackingQuery!) {
  trackings(trackingQuery: $trackingQuery) {
    items {
      ...TrackingParts
    }
  }
}
    ${TrackingPartsFragmentDoc}`;

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
 *      trackingQuery: // value for 'trackingQuery'
 *   },
 * });
 */
export function useGetTrackingOverviewQuery(baseOptions?: Apollo.QueryHookOptions<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables>) {
        return Apollo.useQuery<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables>(GetTrackingOverviewDocument, baseOptions);
      }
export function useGetTrackingOverviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables>) {
          return Apollo.useLazyQuery<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables>(GetTrackingOverviewDocument, baseOptions);
        }
export type GetTrackingOverviewQueryHookResult = ReturnType<typeof useGetTrackingOverviewQuery>;
export type GetTrackingOverviewLazyQueryHookResult = ReturnType<typeof useGetTrackingOverviewLazyQuery>;
export type GetTrackingOverviewQueryResult = Apollo.QueryResult<GetTrackingOverviewQuery, GetTrackingOverviewQueryVariables>;