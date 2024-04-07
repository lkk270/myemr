import { TermsParagraphType } from "@/app/types";
import { TermsParagraph } from "@/components/terms-paragraph";

const paragraphs: TermsParagraphType[] = [
  {
    title: "1. Introduction",
    description: `Welcome to MyEMR, accessible at https://myemr.io ("Site"). MyEMR ("Company," "we," "us," or "our") offers a comprehensive, patient-focused Electronic Medical Records (EMR) system designed to streamline the management and security of your health records. These Terms and Conditions ("Terms") govern your access to and use of our website and services ("Service"). By accessing or using the Service, you ("User," "you," or "your") agree to be bound by these Terms. If you disagree with any part of the Terms, then you do not have permission to access the Service.`,
    headerClassName: "text-xl font-bold mb-2",
  },
  {
    title: "2. HIPAA Compliance and Data Security",
    bullets: [
      `At MyEMR, we are committed to the highest standards of privacy and security in compliance with the Health Insurance Portability and Accountability Act (HIPAA) and relevant regulations. To safeguard your Protected Health Information (PHI), we employ robust encryption methods for the storage and transmission of your data.`,
      `Encryption Practices: It is important for our users to understand that while we encrypt most patient fields to ensure their confidentiality and integrity, there are exceptions to our encryption practices. Specifically, patient profile pictures and email addresses are not encrypted. This approach is taken to facilitate certain functionalities within our Service that require these fields to be quickly accessible and identifiable by our system and healthcare providers. Despite the lack of encryption for these two fields, MyEMR employs other security measures to protect your information, including these more accessible data elements.`,
      `However, notwithstanding our advanced security measures, no system can be entirely immune to potential breaches. In the event of any unauthorized access to your PHI, except where such access involves the aforementioned non-encrypted fields due to MyEMR's gross negligence or willful misconduct, MyEMR disclaims liability for any consequences arising from such breaches. We remain dedicated to promptly addressing any security concerns and urge our users to report any suspicious activities or vulnerabilities to hello@myemr.io.`,
    ],
  },
  {
    title: "3. Limitation of Liability for Data Breaches",
    description: `In the event of any unauthorized access to or use of your PHI, notwithstanding the security measures employed by MyEMR, you acknowledge and agree that MyEMR shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to, damages for loss of profits, goodwill, use, data, or other intangible losses, even if MyEMR has been advised of the possibility of such damages.`,
  },
  {
    title: "4. Pricing and Subscription Modifications",
    description: `MyEMR reserves the right, at its sole discretion, to modify or replace the pricing, terms, conditions, and the features of any subscription plans at any time. Such changes will become effective immediately upon posting to the Site or by direct communication to you. Your continued use of the Services following the posting of any changes to the subscription terms constitutes acceptance of those changes.`,
  },
  {
    title: "5. Amendments to Terms",
    description: `MyEMR reserves the right, at its sole discretion, to modify or replace these Terms at any time. If a revision is material, MyEMR will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at MyEMR's sole discretion. Your continued use of the Site or Services following the notification of amended Terms constitutes acceptance of the amended terms.`,
  },
  {
    title: "6. Contact Information",
    description: `Should you have any questions regarding these Terms, please contact us at hello@myemr.io.`,
  },
  {
    title: "7. Governing Law",
    description: `These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which MyEMR is registered, without regard to its conflict of law provisions. You agree to submit to the personal jurisdiction of the courts located within the jurisdiction for the resolution of any disputes.`,
  },
  {
    title: "8. Severability",
    description: `If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.`,
  },
  {
    title: "9. Changes to Service",
    description: `MyEMR reserves the right, at its sole discretion, to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice at any time.`,
  },
  {
    title: "10. Termination Clause",
    description: `MyEMR reserves the right to terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including, without limitation, if you breach the Terms. Upon termination, your right to use the Service will cease immediately.`,
  },
  {
    title: "11. Governing Law",
    description: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
    MyEmr is established, without regard to its conflict of law provisions.`,
  },
  {
    title: "12. Use License",
    description: `The Service and its original content, features, and functionality are and will remain the exclusive property of MyEMR and its licensors. This license shall automatically terminate if you violate any of these restrictions and may be terminated by MyEMR at any time.`,
  },
  {
    title: "13. User Conduct",
    description: `You agree not to use the Service to upload, transmit, or otherwise distribute any content that is unlawful, defamatory, infringing, obscene, invasive of privacy or publicity rights, harassing, threatening, abusive, inflammatory, or otherwise objectionable.`,
  },
  {
    title: "14. Disclaimer of Warranties",
    description: `The Service is provided on an "AS IS" and "AS AVAILABLE" basis. MyEMR expressly disclaims all warranties of any kind, whether express or implied, including, but not limited to, the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.`,
  },
  {
    title: "15. Limitation of Liability",
    description: `In no event shall MyEMR, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.`,
  },
  {
    title: "16. Indemnification",
    description: `You agree to defend, indemnify, and hold harmless MyEMR, its officers, directors, employees, and agents, from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service, including, but not limited to, your User Content, any use of the Service's content, services, and products other than as expressly authorized in these Terms, or your use of any information obtained from the Service.`,
  },
  {
    title: "17. Indemnification",
    description: `Any feedback you provide regarding the Service will be deemed to be non-confidential. MyEMR shall be free to use such information on an unrestricted basis.`,
  },
  {
    title: "18. Entire Agreement",
    description: `These Terms constitute the entire agreement between us regarding our Services, and supersede and replace any prior agreements we might have between us regarding the Services.`,
  },
  {
    title: "",
    description:
      "BY USING OR ACCESSING THE SITE OR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS AND AGREE TO BE BOUND BY THEM.",
  },
];

const TermsPage = () => {
  return (
    <div className="min-h-full flex flex-col xs:pt-8 sm:pt-12">
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
        <div className="bg-[#fbe2e3] absolute top-[-6rem] -z-10 right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[10rem] sm:w-[68.75rem] dark:bg-[#1F1F1F]"></div>
        <div className="bg-[#dbd7fb] absolute top-[-1rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#25284a]"></div>
        <div className="justify-start flex flex-col items-left text-left overflow-y-scroll max-w-[850px] w-full gap-y-5">
          <div className="flex flex-col gap-y-3">
            <h1 className="text-xl sm:text-3xl font-bold pb-4">Terms & Conditions for MyEMR</h1>
            <h2 className="text-md sm:text-lg font-semibold">Last updated: March 24, 2024</h2>
          </div>
          {paragraphs.map((paragraph, index) => {
            return (
              <TermsParagraph
                key={index}
                title={paragraph.title}
                headerClassName={paragraph.headerClassName}
                description={paragraph.description}
                bullets={paragraph.bullets}
              />
            );
          })}
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default TermsPage;
