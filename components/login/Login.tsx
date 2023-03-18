import { ILoginData, useAuth } from "$store/commerce/shopify/hooks/useAuth.ts";
import { JSX } from "preact/jsx-runtime";
import { useCallback, useEffect, useState } from "preact/hooks";
import Input from "$store/components/ui/Input.tsx";
import Spinner from "../ui/Spinner.tsx";

export interface Props {
  title?: string;
}

const Login = ({ title }: Props) => {
  const { user, loading, login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const isLoading = loading.value;
  const currentUser = user.value;

  const handleSubmit = useCallback(
    async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
      setIsPending(true);
      setErrorMessage("");
      e.preventDefault();

      const $target = e.target as HTMLFormElement;

      const $inputs = $target.querySelectorAll("input");

      const data = Array.from($inputs).reduce(
        (acc, input) => ({
          ...acc,
          [input.name]: input.value,
        }),
        {} as ILoginData,
      );

      const err = await login(data);

      if (err) {
        err.forEach((error) => setErrorMessage(error.formattedMessage));
      }
      setIsPending(false);
    },
    [login],
  );

  useEffect(() => {
    if (!isLoading && currentUser) {
      const searchParams = new URLSearchParams(window.location.search);
      const returnUrl = searchParams.get("returnUrl");
      window.location.href = returnUrl ?? "/";
    }
  }, [isLoading, currentUser]);

  return (
    <div>
      {isLoading && (
        <div className="flex justify-center items-center h-full">
          <Spinner size={24} />
        </div>
      )}
      {!isLoading && !currentUser && (
        <form
          className="flex flex-col h-full max-w-[500px] mx-auto border-1 w-full p-3"
          onSubmit={handleSubmit}
        >
          {title && (
            <span className="font-bold text-2xl text-center">{title}</span>
          )}
          <Input name="email" label="Email" type="email" />
          <Input name="password" label="Senha" type="password" />
          {errorMessage && <span className="text-red-900">{errorMessage}</span>}
          <button
            type="submit"
            className="border-1 w-fit mx-auto px-3 mt-3 mb-2"
          >
            Confirmar {isPending && <Spinner />}
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;
