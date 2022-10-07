import { NextPage } from 'next';

import { ProfileForm, ProfileFormData } from '../../features/users/components/ProfileForm';
import { useUpdateProfileMutation } from '../../graphql/generated';

const ProfilePage: NextPage = () => {
  const [updateProfile] = useUpdateProfileMutation();
  const onSubmit = (input: ProfileFormData) => {
    updateProfile({
      variables: {
        input,
      },
    });
  };
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-800">
      <main className="container mx-auto">
        <ProfileForm onSubmit={onSubmit} />
      </main>
    </div>
  );
};

export default ProfilePage;
