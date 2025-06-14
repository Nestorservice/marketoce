import React, { forwardRef, createContext, useContext, useId } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form';
import { Label } from './Label'; // Assuming Label is already converted for React Native CLI

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

interface FormItemProps {
  style?: any;
  children: React.ReactNode;
}

const FormItem = forwardRef<View, FormItemProps>(({ style, children }, ref) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <View ref={ref} style={[styles.formItem, style]}>
        {children}
      </View>
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

interface FormLabelProps {
  style?: any;
  children: React.ReactNode;
}

const FormLabel = forwardRef<Text, FormLabelProps>(({ style, children, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      style={[error && styles.errorLabel, style]}
      nativeID={formItemId}
      {...props}
    >
      {children}
    </Label>
  );
});
FormLabel.displayName = 'FormLabel';

interface FormControlProps {
  children: React.ReactNode;
  style?: any;
}

const FormControl = forwardRef<View, FormControlProps>(({ children, style, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <View
      ref={ref}
      style={style}
      accessibilityLabel={formItemId}
      accessibilityHint={
        !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`
      }
      accessibilityState={{ invalid: !!error }}
      {...props}
    >
      {children}
    </View>
  );
});
FormControl.displayName = 'FormControl';

interface FormDescriptionProps {
  style?: any;
  children: React.ReactNode;
}

const FormDescription = forwardRef<Text, FormDescriptionProps>(({ style, children }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <Text
      ref={ref}
      nativeID={formDescriptionId}
      style={[styles.description, style]}
    >
      {children}
    </Text>
  );
});
FormDescription.displayName = 'FormDescription';

interface FormMessageProps {
  style?: any;
  children?: React.ReactNode;
}

const FormMessage = forwardRef<Text, FormMessageProps>(({ style, children }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <Text
      ref={ref}
      nativeID={formMessageId}
      style={[styles.message, style]}
    >
      {body}
    </Text>
  );
});
FormMessage.displayName = 'FormMessage';

const styles = StyleSheet.create({
  formItem: {
    gap: 8,
    marginBottom: 16,
  },
  errorLabel: {
    color: '#ef4444',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
});

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};