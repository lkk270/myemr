import { CardWrapper } from "@/auth/components/auth/card-wrapper";
import { LoginForm } from "@/auth/components/auth/login-form";

const ProviderLoginPage = () => {
  return (
    <CardWrapper
      headerLabel={"Welcome Back Provider"}
      backButtonLabel="Don't have an account?"
      backButtonHref={"/auth/provider-register"}
      showSocial={false}
    >
      <LoginForm userType={"PROVIDER"} />
    </CardWrapper>
  );
};

export default ProviderLoginPage;
