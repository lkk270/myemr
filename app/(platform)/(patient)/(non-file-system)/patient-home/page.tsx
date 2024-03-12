import { PatientHome } from "./_components/patient-home";
import { auth } from "@/auth";
const Home = async () => {
  const session = await auth();
  // console.log(session);
  return <PatientHome />;
};
export default Home;
