import { IconPlus } from '@tabler/icons';
import { useFieldArray, useForm } from 'react-hook-form';
import { TextField } from '../../../common/components/TextField';

export interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
}

interface ProjectHighlight {
  title: string;
  description: string;
}

interface ProjectFormData {
  highlights: ProjectHighlight[]
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit }) => {
  const { control, handleSubmit } = useForm<ProjectFormData>();
  useFieldArray({
    name: 'highlights',
    control,
  });
  return (
    <div>
      <form
        className="flex flex-col"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <TextField placeholder="Project Title" />
        </div>
        <div>
          <textarea placeholder="Project Description" />
        </div>
        <div>
          <IconPlus />
        </div>
        <div>
          <TextField placeholder="Start Date" />
        </div>
        <div>
          <TextField placeholder="End Date" />
        </div>
      </form>
    </div>
  );
};
