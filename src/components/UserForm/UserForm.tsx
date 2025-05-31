import { FormProvider, useForm } from 'react-hook-form';
import { ControlledInput } from '../form/ControlledInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserRequest } from '../../lib/user';

interface UserFormProps {
  onSubmit: (data: UserRequest) => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onSubmit }) => {
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ControlledInput name="name" placeholder="Seu apelido" />
        <button type="submit">Entrar na sessão</button>
      </form>
    </FormProvider>
  );
};
