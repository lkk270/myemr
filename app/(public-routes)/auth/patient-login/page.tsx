import { CardWrapper } from "@/auth/components/auth/card-wrapper";
import { LoginForm } from "@/auth/components/auth/login-form";
import { UserType } from "@prisma/client";

const PatientLoginPage = () => {
  return (
    <CardWrapper
      headerLabel={"Welcome Back Patient"}
      backButtonLabel="Don't have an account?"
      backButtonHref={"/auth/patient-register"}
      showSocial={true}
    >
      <LoginForm userType={UserType.PATIENT} />
    </CardWrapper>
  );
};

export default PatientLoginPage;
