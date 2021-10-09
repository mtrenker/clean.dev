import { VFC } from 'react';
import { useForm } from 'react-hook-form';

export const UserProfile: VFC = () => {
  const { register, handleSubmit } = useForm();
  const onSubmit = () => {};
  return (
    <form onSubmit={() => handleSubmit(onSubmit)}>
      <label htmlFor="firstName">
        <input type="text" {...register('firstName')} />
      </label>
      <label htmlFor="lastName">
        <input type="text" {...register('lastName')} />
      </label>
      <label htmlFor="email">
        <input type="text" {...register('email')} />
      </label>
      <label htmlFor="street">
        <input type="text" {...register('street')} />
      </label>
      <label htmlFor="city">
        <input type="text" {...register('city')} />
      </label>
      <label htmlFor="zip">
        <input type="text" {...register('zip')} />
      </label>
    </form>
  );
};
