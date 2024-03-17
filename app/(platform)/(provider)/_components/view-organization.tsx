import { Button } from "@/components/ui/button";

export const ViewOrganization = ({ company }: any) => {
  return (
    <div className="max-w-md mx-auto rounded-xl  overflow-hidden md:max-w-2xl">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img className="h-48 w-full object-cover md:w-48" src={company.image} alt={company.title} />
        </div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            {company.organizationType}
          </div>
          <a href="#" className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">
            {company.title}
          </a>
          <p className="mt-2 text-gray-500">{company.subtitle}</p>
          <p className="mt-2 text-gray-500">{company.description}</p>
          <div className="mt-4">
            <div className="text-gray-900 font-semibold">
              Email:{" "}
              <a href={`mailto:${company.email}`} className="text-indigo-500 hover:underline">
                {company.email}
              </a>
            </div>
            <div className="text-gray-900 font-semibold">
              Phone:{" "}
              <a href={`tel:${company.phone}`} className="text-indigo-500 hover:underline">
                {company.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
