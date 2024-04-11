import { RegisterForm } from "@/auth/components/auth/register-form";

const RegisterPage = () => {
  return (
    <div className="pb-28 sm:pb-0">
      <RegisterForm userType="PATIENT" />
    </div>
  );
};

export default RegisterPage;
