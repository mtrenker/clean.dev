import clsx from 'clsx';
import type { NextPage } from 'next';
import { Button } from '../common/components/Button';
import { TextArea } from '../common/components/TextArea';
import { TextField } from '../common/components/TextField';

const Contact: NextPage = () => (
  <main className={clsx([
    'container mx-auto p-4',
  ])}
  >
    <form className="flex flex-col">
      <TextField id="name" label="Name" type="text" />
      <TextArea id="message" label="Message" />
      <Button primary type="submit">Send</Button>
    </form>
  </main>
);

export default Contact;
