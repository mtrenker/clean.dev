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
  bank?: Maybe<Scalars['String']>;
  bic?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  iban?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  street?: Maybe<Scalars['String']>;
  vat?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

export type ContactInput = {
  bank?: InputMaybe<Scalars['String']>;
  bic?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  company?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  iban?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  street?: InputMaybe<Scalars['String']>;
  vat?: InputMaybe<Scalars['String']>;
  zip?: InputMaybe<Scalars['String']>;
};

export type HighlightInput = {
  description: Scalars['String'];
};

export type Invoice = {
  __typename?: 'Invoice';
  client: InvoiceContact;
  date: Scalars['AWSDate'];
  deliveryDate: Scalars['AWSDate'];
  dueDate: Scalars['AWSDate'];
  number: Scalars['Int'];
  positions?: Maybe<Array<InvoicePosition>>;
  project: Scalars['String'];
  vendor: InvoiceContact;
};

export type InvoiceContact = {
  __typename?: 'InvoiceContact';
  bank?: Maybe<Scalars['String']>;
  bic?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  iban?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  street?: Maybe<Scalars['String']>;
  vat?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

export type InvoiceContactInput = {
  bank?: InputMaybe<Scalars['String']>;
  bic?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  company?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  iban?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<Scalars['String']>;
  street?: InputMaybe<Scalars['String']>;
  vat?: InputMaybe<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
  zip?: InputMaybe<Scalars['String']>;
};

export type InvoiceInput = {
  client: InvoiceContactInput;
  date: Scalars['AWSDate'];
  deliveryDate: Scalars['AWSDate'];
  dueDate: Scalars['AWSDate'];
  number: Scalars['Int'];
  positions?: InputMaybe<Array<InvoicePositionInput>>;
  project: Scalars['String'];
  vendor: InvoiceContactInput;
};

export type InvoicePosition = {
  __typename?: 'InvoicePosition';
  description?: Maybe<Scalars['String']>;
  quantity?: Maybe<Scalars['Float']>;
  tax?: Maybe<Scalars['Float']>;
  unitPrice?: Maybe<Scalars['Float']>;
};

export type InvoicePositionInput = {
  description?: InputMaybe<Scalars['String']>;
  quantity?: InputMaybe<Scalars['Float']>;
  tax?: InputMaybe<Scalars['Float']>;
  unitPrice?: InputMaybe<Scalars['Float']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  contact?: Maybe<Scalars['String']>;
  createInvoice?: Maybe<Invoice>;
  createProject: Project;
  createTracking: Tracking;
  removeProject: Scalars['String'];
  removeTracking: Scalars['String'];
  updateProfile: User;
  updateProject: Project;
};


export type MutationContactArgs = {
  email?: InputMaybe<Scalars['String']>;
  message?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};


export type MutationCreateInvoiceArgs = {
  input: InvoiceInput;
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


export type MutationUpdateProfileArgs = {
  input: UserInput;
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID'];
  input: ProjectInput;
};

export type Project = {
  __typename?: 'Project';
  categories: Array<ProjectCategory>;
  client: Scalars['String'];
  contact?: Maybe<Contact>;
  endDate?: Maybe<Scalars['AWSDate']>;
  featured: Scalars['Boolean'];
  highlights: Array<ProjectHighlight>;
  id: Scalars['ID'];
  location?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  position: Scalars['String'];
  startDate?: Maybe<Scalars['AWSDate']>;
  summary: Scalars['String'];
  trackings: Array<Tracking>;
};


export type ProjectTrackingsArgs = {
  date?: InputMaybe<Scalars['String']>;
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
  name?: InputMaybe<Scalars['String']>;
  position: Scalars['String'];
  startDate?: InputMaybe<Scalars['AWSDate']>;
  summary: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  getInvoice?: Maybe<Invoice>;
  getInvoices: Array<Maybe<Invoice>>;
  me?: Maybe<User>;
  project: Project;
  projects: Array<Project>;
};


export type QueryGetInvoiceArgs = {
  number: Scalars['Int'];
};


export type QueryGetInvoicesArgs = {
  date?: InputMaybe<Scalars['String']>;
};


export type QueryProjectArgs = {
  id: Scalars['ID'];
};

export type Tracking = {
  __typename?: 'Tracking';
  category: Scalars['String'];
  endTime: Scalars['AWSDateTime'];
  startTime: Scalars['AWSDateTime'];
  summary: Scalars['String'];
};

export type TrackingInput = {
  category: Scalars['String'];
  endTime: Scalars['AWSDateTime'];
  projectId: Scalars['String'];
  startTime: Scalars['AWSDateTime'];
  summary: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  contact?: Maybe<Contact>;
};

export type UserInput = {
  contact?: InputMaybe<ContactInput>;
};

export type ContactFragmentFragment = { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null, bank?: string | null, iban?: string | null, bic?: string | null, vat?: string | null };

export type ProjectFragmentFragment = { __typename?: 'Project', client: string, endDate?: string | null, featured: boolean, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, categories: Array<{ __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null }>, highlights: Array<{ __typename?: 'ProjectHighlight', description: string }> };

export type ProjectHighlightFragmentFragment = { __typename?: 'ProjectHighlight', description: string };

export type ProjectCategoryFragmentFragment = { __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null };

export type TrackingFragmentFragment = { __typename?: 'Tracking', category: string, endTime: string, startTime: string, summary: string };

export type InvoiceContactFragmentFragment = { __typename?: 'InvoiceContact', company?: string | null, firstName?: string | null, lastName?: string | null, street?: string | null, city?: string | null, state?: string | null, zip?: string | null, vat?: string | null, email?: string | null, website?: string | null, bank?: string | null, iban?: string | null, bic?: string | null };

export type InvoicePositionFragmentFragment = { __typename?: 'InvoicePosition', description?: string | null, quantity?: number | null, tax?: number | null, unitPrice?: number | null };

export type InvoiceFragmentFragment = { __typename?: 'Invoice', number: number, date: string, deliveryDate: string, dueDate: string, project: string, vendor: { __typename?: 'InvoiceContact', company?: string | null, firstName?: string | null, lastName?: string | null, street?: string | null, city?: string | null, state?: string | null, zip?: string | null, vat?: string | null, email?: string | null, website?: string | null, bank?: string | null, iban?: string | null, bic?: string | null }, client: { __typename?: 'InvoiceContact', company?: string | null, firstName?: string | null, lastName?: string | null, street?: string | null, city?: string | null, state?: string | null, zip?: string | null, vat?: string | null, email?: string | null, website?: string | null, bank?: string | null, iban?: string | null, bic?: string | null }, positions?: Array<{ __typename?: 'InvoicePosition', description?: string | null, quantity?: number | null, tax?: number | null, unitPrice?: number | null }> | null };

export type CreateProjectMutationVariables = Exact<{
  input: ProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'Project', client: string, endDate?: string | null, featured: boolean, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null, bank?: string | null, iban?: string | null, bic?: string | null, vat?: string | null } | null, categories: Array<{ __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null }>, highlights: Array<{ __typename?: 'ProjectHighlight', description: string }> } };

export type UpdateProjectMutationVariables = Exact<{
  id: Scalars['ID'];
  input: ProjectInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'Project', client: string, endDate?: string | null, featured: boolean, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null, bank?: string | null, iban?: string | null, bic?: string | null, vat?: string | null } | null, categories: Array<{ __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null }>, highlights: Array<{ __typename?: 'ProjectHighlight', description: string }> } };

export type RemoveProjectMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type RemoveProjectMutation = { __typename?: 'Mutation', removeProject: string };

export type CreateTrackingMutationVariables = Exact<{
  input: TrackingInput;
}>;


export type CreateTrackingMutation = { __typename?: 'Mutation', createTracking: { __typename?: 'Tracking', category: string, endTime: string, startTime: string, summary: string } };

export type RemoveTrackingMutationVariables = Exact<{
  input: TrackingInput;
}>;


export type RemoveTrackingMutation = { __typename?: 'Mutation', removeTracking: string };

export type UpdateProfileMutationVariables = Exact<{
  input: UserInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'User', contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null, bank?: string | null, iban?: string | null, bic?: string | null, vat?: string | null } | null } };

export type CreateInvoiceMutationVariables = Exact<{
  input: InvoiceInput;
}>;


export type CreateInvoiceMutation = { __typename?: 'Mutation', createInvoice?: { __typename?: 'Invoice', number: number, date: string, deliveryDate: string, dueDate: string, project: string, vendor: { __typename?: 'InvoiceContact', company?: string | null, firstName?: string | null, lastName?: string | null, street?: string | null, city?: string | null, state?: string | null, zip?: string | null, vat?: string | null, email?: string | null, website?: string | null, bank?: string | null, iban?: string | null, bic?: string | null }, client: { __typename?: 'InvoiceContact', company?: string | null, firstName?: string | null, lastName?: string | null, street?: string | null, city?: string | null, state?: string | null, zip?: string | null, vat?: string | null, email?: string | null, website?: string | null, bank?: string | null, iban?: string | null, bic?: string | null }, positions?: Array<{ __typename?: 'InvoicePosition', description?: string | null, quantity?: number | null, tax?: number | null, unitPrice?: number | null }> | null } | null };

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = { __typename?: 'Query', projects: Array<{ __typename?: 'Project', client: string, endDate?: string | null, featured: boolean, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null, bank?: string | null, iban?: string | null, bic?: string | null, vat?: string | null } | null, categories: Array<{ __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null }>, highlights: Array<{ __typename?: 'ProjectHighlight', description: string }> }> };

export type GetProjectsWithTrackingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsWithTrackingsQuery = { __typename?: 'Query', projects: Array<{ __typename?: 'Project', client: string, endDate?: string | null, featured: boolean, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null, bank?: string | null, iban?: string | null, bic?: string | null, vat?: string | null } | null, trackings: Array<{ __typename?: 'Tracking', category: string, endTime: string, startTime: string, summary: string }>, categories: Array<{ __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null }>, highlights: Array<{ __typename?: 'ProjectHighlight', description: string }> }> };

export type GetProjectWithTrackingsQueryVariables = Exact<{
  id: Scalars['ID'];
  date: Scalars['String'];
}>;


export type GetProjectWithTrackingsQuery = { __typename?: 'Query', project: { __typename?: 'Project', client: string, endDate?: string | null, featured: boolean, id: string, location?: string | null, position: string, startDate?: string | null, summary: string, contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null, bank?: string | null, iban?: string | null, bic?: string | null, vat?: string | null } | null, trackings: Array<{ __typename?: 'Tracking', category: string, endTime: string, startTime: string, summary: string }>, categories: Array<{ __typename?: 'ProjectCategory', name: string, color?: string | null, rate?: number | null }>, highlights: Array<{ __typename?: 'ProjectHighlight', description: string }> } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', contact?: { __typename?: 'Contact', company?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, street?: string | null, city?: string | null, zip?: string | null, country?: string | null, bank?: string | null, iban?: string | null, bic?: string | null, vat?: string | null } | null } | null };

export type InvoicesQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']>;
}>;


export type InvoicesQuery = { __typename?: 'Query', getInvoices: Array<{ __typename?: 'Invoice', number: number, date: string, deliveryDate: string, dueDate: string, project: string, vendor: { __typename?: 'InvoiceContact', company?: string | null, firstName?: string | null, lastName?: string | null, street?: string | null, city?: string | null, state?: string | null, zip?: string | null, vat?: string | null, email?: string | null, website?: string | null, bank?: string | null, iban?: string | null, bic?: string | null }, client: { __typename?: 'InvoiceContact', company?: string | null, firstName?: string | null, lastName?: string | null, street?: string | null, city?: string | null, state?: string | null, zip?: string | null, vat?: string | null, email?: string | null, website?: string | null, bank?: string | null, iban?: string | null, bic?: string | null }, positions?: Array<{ __typename?: 'InvoicePosition', description?: string | null, quantity?: number | null, tax?: number | null, unitPrice?: number | null }> | null } | null> };

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
  bank
  iban
  bic
  vat
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
export const InvoiceContactFragmentFragmentDoc = gql`
    fragment InvoiceContactFragment on InvoiceContact {
  company
  firstName
  lastName
  street
  city
  state
  zip
  vat
  email
  website
  bank
  iban
  bic
}
    `;
export const InvoicePositionFragmentFragmentDoc = gql`
    fragment InvoicePositionFragment on InvoicePosition {
  description
  quantity
  tax
  unitPrice
}
    `;
export const InvoiceFragmentFragmentDoc = gql`
    fragment InvoiceFragment on Invoice {
  vendor {
    ...InvoiceContactFragment
  }
  client {
    ...InvoiceContactFragment
  }
  number
  date
  deliveryDate
  dueDate
  project
  positions {
    ...InvoicePositionFragment
  }
}
    ${InvoiceContactFragmentFragmentDoc}
${InvoicePositionFragmentFragmentDoc}`;
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
export const UpdateProfileDocument = gql`
    mutation updateProfile($input: UserInput!) {
  updateProfile(input: $input) {
    contact {
      ...ContactFragment
    }
  }
}
    ${ContactFragmentFragmentDoc}`;
export type UpdateProfileMutationFn = Apollo.MutationFunction<UpdateProfileMutation, UpdateProfileMutationVariables>;

/**
 * __useUpdateProfileMutation__
 *
 * To run a mutation, you first call `useUpdateProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProfileMutation, { data, loading, error }] = useUpdateProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProfileMutation (baseOptions?: Apollo.MutationHookOptions<UpdateProfileMutation, UpdateProfileMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument, options);
}
export type UpdateProfileMutationHookResult = ReturnType<typeof useUpdateProfileMutation>;
export type UpdateProfileMutationResult = Apollo.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions = Apollo.BaseMutationOptions<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const CreateInvoiceDocument = gql`
    mutation createInvoice($input: InvoiceInput!) {
  createInvoice(input: $input) {
    ...InvoiceFragment
  }
}
    ${InvoiceFragmentFragmentDoc}`;
export type CreateInvoiceMutationFn = Apollo.MutationFunction<CreateInvoiceMutation, CreateInvoiceMutationVariables>;

/**
 * __useCreateInvoiceMutation__
 *
 * To run a mutation, you first call `useCreateInvoiceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateInvoiceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createInvoiceMutation, { data, loading, error }] = useCreateInvoiceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateInvoiceMutation (baseOptions?: Apollo.MutationHookOptions<CreateInvoiceMutation, CreateInvoiceMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateInvoiceMutation, CreateInvoiceMutationVariables>(CreateInvoiceDocument, options);
}
export type CreateInvoiceMutationHookResult = ReturnType<typeof useCreateInvoiceMutation>;
export type CreateInvoiceMutationResult = Apollo.MutationResult<CreateInvoiceMutation>;
export type CreateInvoiceMutationOptions = Apollo.BaseMutationOptions<CreateInvoiceMutation, CreateInvoiceMutationVariables>;
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
export const GetProjectsWithTrackingsDocument = gql`
    query getProjectsWithTrackings {
  projects {
    ...ProjectFragment
    contact {
      ...ContactFragment
    }
    trackings {
      ...TrackingFragment
    }
  }
}
    ${ProjectFragmentFragmentDoc}
${ContactFragmentFragmentDoc}
${TrackingFragmentFragmentDoc}`;

/**
 * __useGetProjectsWithTrackingsQuery__
 *
 * To run a query within a React component, call `useGetProjectsWithTrackingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectsWithTrackingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectsWithTrackingsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetProjectsWithTrackingsQuery (baseOptions?: Apollo.QueryHookOptions<GetProjectsWithTrackingsQuery, GetProjectsWithTrackingsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetProjectsWithTrackingsQuery, GetProjectsWithTrackingsQueryVariables>(GetProjectsWithTrackingsDocument, options);
}
export function useGetProjectsWithTrackingsLazyQuery (baseOptions?: Apollo.LazyQueryHookOptions<GetProjectsWithTrackingsQuery, GetProjectsWithTrackingsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetProjectsWithTrackingsQuery, GetProjectsWithTrackingsQueryVariables>(GetProjectsWithTrackingsDocument, options);
}
export type GetProjectsWithTrackingsQueryHookResult = ReturnType<typeof useGetProjectsWithTrackingsQuery>;
export type GetProjectsWithTrackingsLazyQueryHookResult = ReturnType<typeof useGetProjectsWithTrackingsLazyQuery>;
export type GetProjectsWithTrackingsQueryResult = Apollo.QueryResult<GetProjectsWithTrackingsQuery, GetProjectsWithTrackingsQueryVariables>;
export const GetProjectWithTrackingsDocument = gql`
    query getProjectWithTrackings($id: ID!, $date: String!) {
  project(id: $id) {
    ...ProjectFragment
    contact {
      ...ContactFragment
    }
    trackings(date: $date) {
      ...TrackingFragment
    }
  }
}
    ${ProjectFragmentFragmentDoc}
${ContactFragmentFragmentDoc}
${TrackingFragmentFragmentDoc}`;

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
 *      date: // value for 'date'
 *   },
 * });
 */
export function useGetProjectWithTrackingsQuery (baseOptions: Apollo.QueryHookOptions<GetProjectWithTrackingsQuery, GetProjectWithTrackingsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetProjectWithTrackingsQuery, GetProjectWithTrackingsQueryVariables>(GetProjectWithTrackingsDocument, options);
}
export function useGetProjectWithTrackingsLazyQuery (baseOptions?: Apollo.LazyQueryHookOptions<GetProjectWithTrackingsQuery, GetProjectWithTrackingsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetProjectWithTrackingsQuery, GetProjectWithTrackingsQueryVariables>(GetProjectWithTrackingsDocument, options);
}
export type GetProjectWithTrackingsQueryHookResult = ReturnType<typeof useGetProjectWithTrackingsQuery>;
export type GetProjectWithTrackingsLazyQueryHookResult = ReturnType<typeof useGetProjectWithTrackingsLazyQuery>;
export type GetProjectWithTrackingsQueryResult = Apollo.QueryResult<GetProjectWithTrackingsQuery, GetProjectWithTrackingsQueryVariables>;
export const MeDocument = gql`
    query me {
  me {
    contact {
      ...ContactFragment
    }
  }
}
    ${ContactFragmentFragmentDoc}`;

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
export function useMeQuery (baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export function useMeLazyQuery (baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const InvoicesDocument = gql`
    query invoices($date: String) {
  getInvoices(date: $date) {
    ...InvoiceFragment
  }
}
    ${InvoiceFragmentFragmentDoc}`;

/**
 * __useInvoicesQuery__
 *
 * To run a query within a React component, call `useInvoicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useInvoicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInvoicesQuery({
 *   variables: {
 *      date: // value for 'date'
 *   },
 * });
 */
export function useInvoicesQuery (baseOptions?: Apollo.QueryHookOptions<InvoicesQuery, InvoicesQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<InvoicesQuery, InvoicesQueryVariables>(InvoicesDocument, options);
}
export function useInvoicesLazyQuery (baseOptions?: Apollo.LazyQueryHookOptions<InvoicesQuery, InvoicesQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<InvoicesQuery, InvoicesQueryVariables>(InvoicesDocument, options);
}
export type InvoicesQueryHookResult = ReturnType<typeof useInvoicesQuery>;
export type InvoicesLazyQueryHookResult = ReturnType<typeof useInvoicesLazyQuery>;
export type InvoicesQueryResult = Apollo.QueryResult<InvoicesQuery, InvoicesQueryVariables>;