const axios = require("axios");

const sendEmail = async (to, subject, html) => {
    try {

        // Support both:
        // sendEmail(to, subject, html)
        // sendEmail({ to, subject, html })

        if (typeof to === "object" && to !== null) {
            subject = to.subject;
            html = to.html;
            to = to.to;
        }

        if (!process.env.BREVO_KEY) {
            throw new Error("BREVO_KEY is missing in .env");
        }

        if (!process.env.BREVO_EMAIL) {
            throw new Error("BREVO_EMAIL is missing in .env");
        }

        if (!to) {
            throw new Error("Recipient email is required");
        }

        if (!subject) {
            throw new Error("Email subject is required");
        }

        if (!html) {
            throw new Error("Email HTML content is required");
        }

        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "Luxstay",
                    email: process.env.BREVO_EMAIL,
                },

                to: [
                    {
                        email: to,
                    },
                ],

                subject: subject,

                htmlContent: html,
            },
            {
                headers: {
                    accept: "application/json",
                    "api-key": process.env.BREVO_KEY,
                    "content-type": "application/json",
                },

                timeout: 15000,
            }
        );

        console.log("✅ Brevo Email Sent Successfully");
        console.log("Message ID:", response.data.messageId);

        return {
            success: true,
            sent: true,
            data: response.data,
        };

    } catch (error) {

        console.error(
            "❌ Brevo Email Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

module.exports = sendEmail;