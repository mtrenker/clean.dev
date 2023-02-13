import { NextPage } from 'next';
import { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '../../../../common/components/TextField';
import { Invoice } from '../../../../features/projects/components/Invoice';
import { InvoiceInput, useCreateInvoiceMutation, useGetProjectsQuery, useGetProjectWithTrackingsLazyQuery } from '../../../../graphql/generated';

const InvoicePage: NextPage = () => {
  const { handleSubmit, register, watch } = useForm<InvoiceInput>();
  const [createInvoice] = useCreateInvoiceMutation();
  const { data: projectsData } = useGetProjectsQuery();
  const [_getProjectWithTrackings] = useGetProjectWithTrackingsLazyQuery();
  const onSubmit = (input: InvoiceInput) => {
    createInvoice({
      variables: {
        input,
      },
    });
  };
  const onProjectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    console.log(e);
  };
  return (
    <div className="container mx-auto">
      Invoice
      <div>
        <select className="text-black" onChange={onProjectChange}>
          {projectsData?.projects.map(project => (
            <option key={project.id}>{project.client}</option>
          ))}
        </select>
      </div>
      <form className="w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <TextField id="number" label="number" {...register('number')} />
        <TextField id="dueDate" label="dueDate" {...register('dueDate')} />
      </form>
      <Invoice
        date="2021"
        dueDate={watch('dueDate')}
        invoiceDate={watch('date')}
        invoiceDeliveryDate={watch('deliveryDate')}
        invoiceNumber={watch('number').toString()}
        projectId="1"
      />
    </div>
  );
};

export default InvoicePage;
