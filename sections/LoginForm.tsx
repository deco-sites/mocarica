import Login from "$store/islands/Login.tsx";
import type { Props } from "$store/components/login/Login.tsx";

function LoginSection(props: Props) {
  return <Login {...props} />;
}

export default LoginSection;
