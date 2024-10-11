import { TermsParagraphType } from "@/app/types";
import { TermsParagraph } from "@/components/terms-paragraph";

const paragraphs: TermsParagraphType[] = [
  {
    title: "Collection of Your Information",
    description: `We may collect information about you in a variety of ways. The information we may collect on the Site includes:`,
    bullets: [
      `Personal Data: Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you choose to participate in various activities related to the Site, such as online chat and message boards. Except for your profile picture and email address, all patient data is encrypted to ensure your privacy and security.`,
      `Derivative Data: Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.`,
      `Financial Data: Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site. [Note: Adjust or remove this section if you do not collect financial data]`,
      `Data from Contests, Giveaways, and Surveys: Personal and other information you may provide when entering contests or giveaways and/or responding to surveys.`,
    ],
    headerClassName: "text-xl font-bold mb-2",
  },
  {
    title: "Use of Your Information",
    description: `Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:`,
    bullets: [
      `Create and manage your account.`,
      `Encrypt your health records to ensure their privacy and security.`,
      `Increase the efficiency and operation of the Site.`,
      `Monitor and analyze usage and trends to improve your experience with the Site.`,
      `Perform other business activities as needed.`,
    ],
  },
  {
    title: "Disclosure of Your Information",
    description: `We will NEVER sell, rent, or lease your personal information to third parties. Your information may be disclosed as follows:`,
    bullets: [
      `Third-Party Service Providers: We may share your email with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, customer service, and marketing assistance.`,
    ],
  },
  {
    title: "Cookies and Web Beacons",
    description: `We do not use cookies for tracking purposes. The only cookies in use are for understanding and improving the performance of our Site and are strictly necessary for providing functionality on the Site.`,
  },
  {
    title: "Security of Your Information",
    description: `In addition to almost all patient data being encrypted, we use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.`,
  },
  {
    title: "Contact Us",
    description: `If you have questions or comments about this Privacy Policy, please contact us at: hello@myemr.io`,
  },
];

const PrivacyPage = () => {
  return (
    <div className="min-h-full flex flex-col xs:pt-8 sm:pt-12">
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
        <div className="bg-[#fbe2e3] fixed top-[-6rem] -z-10 right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[10rem] sm:w-[68.75rem] dark:bg-[#1F1F1F]"></div>
        <div className="bg-[#dbd7fb] fixed top-[-1rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#25284a]"></div>
        <div className="justify-start flex flex-col items-left text-left overflow-y-scroll max-w-[850px] w-full gap-y-5">
          <div className="flex flex-col gap-y-3">
            <h1 className="text-xl sm:text-3xl font-bold pb-4">Privacy Policy for MyEMR</h1>
            <h2 className="text-md sm:text-lg font-semibold">Last updated: March 24, 2024</h2>
            <p>
              {`Welcome to MyEMR, accessible at https://myemr.io (Site"). MyEMR ("Company," "we," "us," or "our") is
              committed to protecting the privacy and security of your personal information. Our Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you visit our Site, including any other
              media form, media channel, mobile website, or mobile application related or connected thereto
              (collectively, the “Site”).`}
            </p>
            <p>
              {`By accessing or using the Site, you signify your agreement to this Privacy Policy. If you do not agree
              with the terms of this Privacy Policy, please do not access the Site.`}
            </p>
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

export default PrivacyPage;
