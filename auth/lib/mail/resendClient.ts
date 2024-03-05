import { Resend } from "resend";

// let resendClient = null;
// if (process.env.RESEND_API_KEY)
const key = "re_3DaduMwp_LMXXHYwgRUJVKz9FTXmc24UX";
let resendClient = new Resend(key);

export default resendClient;
