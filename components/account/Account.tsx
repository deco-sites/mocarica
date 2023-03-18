import { useEffect } from "preact/hooks";
import { useAuth } from "../../commerce/shopify/hooks/useAuth.ts";

const Account = () => {
  const { loading, user, logout } = useAuth();

  const isLoading = loading.value;
  const currentUser = user.value;

  useEffect(() => {
    if (!isLoading && !currentUser) {
      window.location.href = "/login?returnUrl=/account";
    }
  }, [loading, currentUser]);

  return (
    <div className="w-full flex flex-col items-center">
      {!isLoading && currentUser && (
        <div className="flex flex-col items-start">
          <span>Olá, {currentUser.displayName}!</span>
          <button onClick={logout}>Sair</button>
        </div>
      )}
    </div>
  );
};

export default Account;
