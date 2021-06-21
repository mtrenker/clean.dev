import { VFC } from 'react';
import { useForm } from 'react-hook-form';

export const Form: VFC = () => {
  const {} = useForm();
  return (
    <form>
      <input type="text" />
    </form>
  );
};
