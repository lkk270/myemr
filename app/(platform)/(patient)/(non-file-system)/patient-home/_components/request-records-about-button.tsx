import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface RequestRecordsAboutButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface ParagraphComponentProps {
  title: string;
  description?: string;
  headerClassName?: string;
  bullets?: string[];
}

const ParagraphComponent = ({
  title,
  description,
  headerClassName = "text-lg font-semibold",
  bullets,
}: ParagraphComponentProps) => {
  return (
    <div className="flex flex-col gap-y-2">
      <h2 className={headerClassName ? headerClassName : "text-lg font-semibold"}>{title}</h2>
      {bullets ? (
        <ul className="list-disc list-inside space-y-2 pl-2">
          {bullets.map((bullet) => {
            return <li>{bullet}</li>;
          })}
        </ul>
      ) : (
        <p className="text-md">{description}</p>
      )}
    </div>
  );
};

const paragraphs: ParagraphComponentProps[] = [
  {
    title: "Terms of Use for Medical Records Request and Upload",
    description: `Welcome to MyEmr. By requesting a doctor or healthcare provider to upload medical records through our
    platform, you ("Requestor") are entering into a legally binding agreement with MyEmr
    ("Company," "we," "us," or "our") based on the terms and conditions
    outlined below. Please read these terms carefully before submitting your request.`,
    headerClassName: "text-xl font-bold mb-2",
  },
  {
    title: "2. Description of Service",
    description: `By clicking the "Submit" button and using the medical records request and upload feature
    ("Service"), you agree to be bound by these Terms of Use ("Terms"), our Privacy Policy,
    and all applicable laws and regulations governing the use of our Service. If you do not agree with any part
    of these Terms, you must not use this Service.`,
  },
  {
    title: "3. Authorization and Consent",
    bullets: [
      `By using this Service, you represent that you are at least the age of majority in your state or province
    of residence and you have given us your consent to allow any of your minor dependents to use this Service
    where applicable.`,
      `You warrant that you have the legal authority or have obtained all necessary consents to request the
    disclosure and transmission of personal medical records from the Provider to MyEmr.`,
    ],
  },
  {
    title: "4. Privacy and Security",
    description: `We are committed to maintaining the privacy and security of your personal information and medical records in
    accordance with applicable laws and regulations. Please refer to our Privacy Policy for detailed information
    on how we collect, use, and protect your data.`,
  },
  {
    title: "5. Provider's Obligations",
    description: `The Provider is responsible for verifying the authenticity of the request and the identity of the Requestor
    before uploading any medical records. The Provider must ensure that the upload of medical records complies
    with all applicable laws, including but not limited to privacy and health information regulations.`,
  },
  {
    title: "6. Limitations of Use",
    description: `The medical records uploaded by the Provider are for personal use by the Requestor and should not be used
    for any unlawful purpose. The Requestor agrees not to use the Service to infringe on the privacy rights or
    intellectual property rights of others, or in any way that is illegal, immoral, or harmful to others.`,
  },
  {
    title: "7. Disclaimer of Warranties",
    description: `The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all
    warranties of any kind, whether express or implied, including but not limited to the implied warranties of
    merchantability, fitness for a particular purpose, and non-infringement.`,
  },
  {
    title: "8. Limitation of Liability",
    description: `In no event shall MyEmr, its officers, directors, employees, or agents be liable for any direct, indirect,
    incidental, special, consequential, or punitive damages resulting from the use of or inability to use the
    Service.`,
  },
  {
    title: "9. Indemnification",
    description: `You agree to indemnify and hold harmless MyEmr, its officers, directors, employees, and agents from any
    claims, damages, liabilities, and expenses arising from your use of the Service or your violation of these
    Terms.`,
  },
  {
    title: "10. Modification of Terms",
    description: `We reserve the right to modify these Terms at any time. You agree to review the Terms regularly. Your
    continued use of the Service after any such modifications signifies your acceptance of the new Terms.`,
  },
  {
    title: "11. Governing Law",
    description: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
    MyEmr is established, without regard to its conflict of law provisions.`,
  },
  {
    title: "12. Contact Information",
    description: `If you have any questions about these Terms, please contact us at support@myemr.io.`,
  },
];

export const RequestRecordsAboutButton = ({ children, asChild }: RequestRecordsAboutButtonProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="overflow-y-scroll h-5/6 xs:h-3/5 max-w-[850px] w-full">
        {paragraphs.map((paragraph, index) => {
          return (
            <ParagraphComponent
              key={index}
              title={paragraph.title}
              headerClassName={paragraph.headerClassName}
              description={paragraph.description}
              bullets={paragraph.bullets}
            />
          );
        })}
      </DialogContent>
    </Dialog>
  );
};
