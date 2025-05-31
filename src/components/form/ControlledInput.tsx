import { type Control, Controller, type ControllerProps, type FieldValues, type Path } from 'react-hook-form';
import { Input, type InputProps } from '../ui/Input';

export interface ControlledInputProps<T extends FieldValues> extends Omit<InputProps, 'error'> {
  name: Path<T>;
  control?: Control<T>;
  controllerProps?: Omit<ControllerProps<T>, 'name' | 'control' | 'render'>;
}

export function ControlledInput<T extends FieldValues>({
  name,
  control,
  controllerProps,
  ...props
}: ControlledInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      {...controllerProps}
      render={({ field, fieldState: { error } }) => <Input {...props} {...field} error={!!error} />}
    />
  );
}
