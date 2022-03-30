/* eslint-disable */
import { api } from './baseApi';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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
  date?: InputMaybe<Scalars['String']>;
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
  endDate?: InputMaybe<Scalars['AWSDate']>;
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
  date?: InputMaybe<Scalars['String']>;
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
  description?: InputMaybe<Scalars['String']>;
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


export type GetBlogQuery = { __typename?: 'Query', getBlog: { __typename?: 'Blog', posts: Array<{ __typename?: 'Post', content?: string | null, intro?: string | null, publishDate: string, slug: string, title: string, heroImage?: { __typename?: 'Image', title: string, description?: string | null, file: { __typename?: 'File', contentType: string, fileName: string, url: string, details: { __typename?: 'FileDetails', size: string, image?: { __typename?: 'ImageDetails', height: number, width: number } | null } } } | null }> } };

export type GetPostQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


export type GetPostQuery = { __typename?: 'Query', getPost?: { __typename?: 'Post', content?: string | null, intro?: string | null, publishDate: string, slug: string, title: string, heroImage?: { __typename?: 'Image', title: string, description?: string | null, file: { __typename?: 'File', contentType: string, fileName: string, url: string, details: { __typename?: 'FileDetails', size: string, image?: { __typename?: 'ImageDetails', height: number, width: number } | null } } } | null } | null };

export type PostFieldsFragment = { __typename?: 'Post', content?: string | null, intro?: string | null, publishDate: string, slug: string, title: string, heroImage?: { __typename?: 'Image', title: string, description?: string | null, file: { __typename?: 'File', contentType: string, fileName: string, url: string, details: { __typename?: 'FileDetails', size: string, image?: { __typename?: 'ImageDetails', height: number, width: number } | null } } } | null };

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = { __typename?: 'Query', getProjects: { __typename?: 'ProjectConnection', totalCount: number, items: Array<{ __typename?: 'Project', id: string, client: string, description: string, endDate?: string | null, industry: string, methodologies: Array<string>, startDate: string, technologies: Array<string>, contact: { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string }, trackings: { __typename?: 'TrackingConnection', items: Array<{ __typename?: 'Tracking', id: string, description?: string | null, startTime: string, endTime: string }> } }> } };

export type GetProjectQueryVariables = Exact<{
  projectId: Scalars['ID'];
}>;


export type GetProjectQuery = { __typename?: 'Query', getProject: { __typename?: 'Project', id: string, client: string, description: string, endDate?: string | null, industry: string, methodologies: Array<string>, startDate: string, technologies: Array<string>, contact: { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string }, trackings: { __typename?: 'TrackingConnection', items: Array<{ __typename?: 'Tracking', id: string, description?: string | null, startTime: string, endTime: string }> } } };

export type CreateProjectMutationVariables = Exact<{
  input: ProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'ProjectMutationResponse', code: string, message: string, success: boolean, project: { __typename?: 'Project', id: string, client: string, description: string, endDate?: string | null, industry: string, methodologies: Array<string>, startDate: string, technologies: Array<string>, contact: { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string }, trackings: { __typename?: 'TrackingConnection', items: Array<{ __typename?: 'Tracking', id: string, description?: string | null, startTime: string, endTime: string }> } } } };

export type GetTrackingsQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']>;
  projectId: Scalars['String'];
}>;


export type GetTrackingsQuery = { __typename?: 'Query', getTrackings: { __typename?: 'TrackingConnection', items: Array<{ __typename?: 'Tracking', id: string, description?: string | null, startTime: string, endTime: string }> } };

export type CreateTrackingMutationVariables = Exact<{
  input: TrackingInput;
}>;


export type CreateTrackingMutation = { __typename?: 'Mutation', createTracking: { __typename?: 'TrackingMutationResponse', code: string, message: string, success: boolean, tracking: { __typename?: 'Tracking', id: string, description?: string | null, startTime: string, endTime: string } } };

export type UpdateTrackingMutationVariables = Exact<{
  id: Scalars['ID'];
  input: TrackingInput;
}>;


export type UpdateTrackingMutation = { __typename?: 'Mutation', updateTracking: { __typename?: 'TrackingMutationResponse', code: string, message: string, success: boolean, tracking: { __typename?: 'Tracking', id: string, description?: string | null, startTime: string, endTime: string } } };

export type DeleteTrackingMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteTrackingMutation = { __typename?: 'Mutation', deleteTracking: { __typename?: 'TrackingMutationResponse', code: string, message: string, success: boolean, tracking: { __typename?: 'Tracking', id: string, description?: string | null, startTime: string, endTime: string } } };

export type ProjectFieldsFragment = { __typename?: 'Project', id: string, client: string, description: string, endDate?: string | null, industry: string, methodologies: Array<string>, startDate: string, technologies: Array<string>, contact: { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string }, trackings: { __typename?: 'TrackingConnection', items: Array<{ __typename?: 'Tracking', id: string, description?: string | null, startTime: string, endTime: string }> } };

export type TrackingFieldsFragment = { __typename?: 'Tracking', id: string, description?: string | null, startTime: string, endTime: string };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', contact?: { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string } | null } };

export type ContactFieldsFragment = { __typename?: 'Contact', city: string, email: string, firstName: string, lastName: string, street: string, zip: string };

export const PostFieldsFragmentDoc = `
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
export const ContactFieldsFragmentDoc = `
    fragment contactFields on Contact {
  city
  email
  firstName
  lastName
  street
  zip
}
    `;
export const TrackingFieldsFragmentDoc = `
    fragment trackingFields on Tracking {
  id
  description
  startTime
  endTime
}
    `;
export const ProjectFieldsFragmentDoc = `
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
export const GetBlogDocument = `
    query getBlog {
  getBlog {
    posts {
      ...postFields
    }
  }
}
    ${PostFieldsFragmentDoc}`;
export const GetPostDocument = `
    query getPost($slug: String!) {
  getPost(slug: $slug) {
    ...postFields
  }
}
    ${PostFieldsFragmentDoc}`;
export const GetProjectsDocument = `
    query getProjects {
  getProjects {
    totalCount
    items {
      ...projectFields
    }
  }
}
    ${ProjectFieldsFragmentDoc}`;
export const GetProjectDocument = `
    query getProject($projectId: ID!) {
  getProject(id: $projectId) {
    ...projectFields
  }
}
    ${ProjectFieldsFragmentDoc}`;
export const CreateProjectDocument = `
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
export const GetTrackingsDocument = `
    query getTrackings($date: String, $projectId: String!) {
  getTrackings(date: $date, projectId: $projectId) {
    items {
      ...trackingFields
    }
  }
}
    ${TrackingFieldsFragmentDoc}`;
export const CreateTrackingDocument = `
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
export const UpdateTrackingDocument = `
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
export const DeleteTrackingDocument = `
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
export const MeDocument = `
    query me {
  me {
    contact {
      ...contactFields
    }
  }
}
    ${ContactFieldsFragmentDoc}`;

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBlog: build.query<GetBlogQuery, GetBlogQueryVariables | void>({
      query: (variables) => ({ document: GetBlogDocument, variables })
    }),
    getPost: build.query<GetPostQuery, GetPostQueryVariables>({
      query: (variables) => ({ document: GetPostDocument, variables })
    }),
    getProjects: build.query<GetProjectsQuery, GetProjectsQueryVariables | void>({
      query: (variables) => ({ document: GetProjectsDocument, variables })
    }),
    getProject: build.query<GetProjectQuery, GetProjectQueryVariables>({
      query: (variables) => ({ document: GetProjectDocument, variables })
    }),
    createProject: build.mutation<CreateProjectMutation, CreateProjectMutationVariables>({
      query: (variables) => ({ document: CreateProjectDocument, variables })
    }),
    getTrackings: build.query<GetTrackingsQuery, GetTrackingsQueryVariables>({
      query: (variables) => ({ document: GetTrackingsDocument, variables })
    }),
    createTracking: build.mutation<CreateTrackingMutation, CreateTrackingMutationVariables>({
      query: (variables) => ({ document: CreateTrackingDocument, variables })
    }),
    updateTracking: build.mutation<UpdateTrackingMutation, UpdateTrackingMutationVariables>({
      query: (variables) => ({ document: UpdateTrackingDocument, variables })
    }),
    deleteTracking: build.mutation<DeleteTrackingMutation, DeleteTrackingMutationVariables>({
      query: (variables) => ({ document: DeleteTrackingDocument, variables })
    }),
    me: build.query<MeQuery, MeQueryVariables | void>({
      query: (variables) => ({ document: MeDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };
export const { useGetBlogQuery, useLazyGetBlogQuery, useGetPostQuery, useLazyGetPostQuery, useGetProjectsQuery, useLazyGetProjectsQuery, useGetProjectQuery, useLazyGetProjectQuery, useCreateProjectMutation, useGetTrackingsQuery, useLazyGetTrackingsQuery, useCreateTrackingMutation, useUpdateTrackingMutation, useDeleteTrackingMutation, useMeQuery, useLazyMeQuery } = injectedRtkApi;

