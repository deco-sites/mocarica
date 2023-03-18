interface Props {
  label: string;
  type: "text" | "email" | "password";
  name: string;
}

const Input = ({ label, type, name }: Props) => {
  return (
    <label className="flex flex-col p-2">
      <span className="font-bold">{label}</span>
      <input name={name} className="border-1 p-2" type={type} required />
    </label>
  );
};

export default Input;
