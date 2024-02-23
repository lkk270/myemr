import { Resend } from "resend";

// let resendClient = null;
// if (process.env.RESEND_API_KEY)
let resendClient = new Resend(process.env.RESEND_API_KEY);

export default resendClient;
