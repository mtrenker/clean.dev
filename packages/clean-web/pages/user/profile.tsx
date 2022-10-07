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
    <main className="container mx-auto">
      <ProfileForm onSubmit={onSubmit} />
    </main>
  );
};

export default ProfilePage;
