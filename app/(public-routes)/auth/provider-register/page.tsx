import { RegisterForm } from "@/auth/components/auth/register-form";

const RegisterPage = () => {
  return (
    <div className="pb-[124px] sm:pb-0">
      <RegisterForm userType="PROVIDER" />
    </div>
  );
};

export default RegisterPage;
