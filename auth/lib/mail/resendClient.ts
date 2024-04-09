import { Resend } from "resend";

// let resendClient = null;
// if (process.env.RESEND_API_KEY)
const key = process.env.RESEND_API_KEY;
let resendClient = new Resend(key);

export default resendClient;
