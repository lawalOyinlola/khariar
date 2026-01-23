import { type ChangeEvent, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface BaseFormInputProps {
  label: string;
  name: string;
  id: string;
  placeholder?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

interface TextInputProps extends BaseFormInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "name" | "id" | "placeholder" | "value" | "defaultValue"> {
  type?: "text" | "email" | "password" | "tel" | "url";
  as?: "input";
}

interface TextareaInputProps extends BaseFormInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "name" | "id" | "placeholder" | "value" | "defaultValue"> {
  as: "textarea";
  rows?: number;
}

type FormInputProps = TextInputProps | TextareaInputProps;

const FormInput = (props: FormInputProps) => {
  const {
    label,
    name,
    id,
    placeholder,
    error,
    value,
    defaultValue,
    onChange,
    required,
    ...rest
  } = props;
  const isTextarea = props.as === "textarea";

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const commonProps = {
    name,
    id,
    placeholder,
    className: error ? "input-error" : "",
    onChange: handleChange,
    value,
    defaultValue,
    required,
    disabled: rest.disabled,
  };

  return (
    <div className="form-div">
      <label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isTextarea ? (
        <textarea
          {...commonProps}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          type={(rest as TextInputProps).type || "text"}
          {...commonProps}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default FormInput;
