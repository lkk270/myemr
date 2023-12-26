import { Separator } from "@/components/ui/separator";
import { ContactForm } from "./contact-form";

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Contact</h3>
        <p className="text-sm text-muted-foreground">Update your contact fields.</p>
      </div>
      <Separator />
      <ContactForm
        patientDemographics={{
          email: "",
          mobilePhone: undefined,
          homePhone: undefined,
          addresses: [],
        }}
      />
    </div>
  );
}
