from datetime import datetime, timedelta
import random
import uuid

SEED_TRACES = [
    # Billing (5)
    {
        "user_message": "Why was I charged twice this month for my subscription?",
        "bot_response": "I apologize for the confusion! Double charges sometimes occur due to a payment processing glitch. I can see your account shows two charges of $49.99 on March 1st. I'll escalate this to our billing team immediately to investigate and refund the duplicate charge within 3-5 business days. You'll receive an email confirmation once it's processed.",
        "category": "Billing",
        "response_time_ms": 1823,
    },
    {
        "user_message": "What payment methods do you accept?",
        "bot_response": "BillFlow accepts all major credit and debit cards (Visa, Mastercard, AmEx, Discover), PayPal, and ACH bank transfers for annual plans. You can manage your payment methods anytime under Settings → Billing in your dashboard. Is there a specific payment method you'd like to add?",
        "category": "Billing",
        "response_time_ms": 1204,
    },
    {
        "user_message": "Can you explain what the 'platform fee' on my invoice is?",
        "bot_response": "The platform fee is a small 2% transaction fee applied to payments processed through BillFlow's payment gateway. It covers payment processing infrastructure costs. This fee is separate from your subscription plan cost and is only charged on successful transactions you collect from your own customers. You can find a full breakdown in Settings → Billing → Fee Schedule.",
        "category": "Billing",
        "response_time_ms": 1567,
    },
    {
        "user_message": "I need to update my billing address for tax purposes",
        "bot_response": "Sure! You can update your billing address by going to Settings → Billing → Billing Information and clicking 'Edit'. Changes take effect immediately and will appear on your next invoice. If you need to update past invoices for tax compliance, please contact our billing team at billing@billflow.io with your account details and they can issue amended invoices.",
        "category": "Billing",
        "response_time_ms": 1389,
    },
    {
        "user_message": "How much does the Pro plan cost per year if I pay annually?",
        "bot_response": "The Pro plan costs $399/year when billed annually — that's $33.25/month, saving you 30% compared to our monthly rate of $49.99/month. The annual plan also includes priority support and advanced reporting features. You can switch to annual billing anytime from Settings → Billing → Subscription. Would you like me to walk you through the upgrade process?",
        "category": "Billing",
        "response_time_ms": 1102,
    },

    # Refund (4)
    {
        "user_message": "I was charged for a plan I never signed up for. I want a full refund.",
        "bot_response": "I'm sorry to hear this happened — that's definitely not okay. I can see an unexpected charge on your account and I want to make this right. I'm flagging this as a priority dispute for our billing team. You'll receive a full refund within 5-7 business days. I'm also adding a note to investigate how this charge occurred to prevent it happening again. Can you confirm the email on your account?",
        "category": "Refund",
        "response_time_ms": 2103,
    },
    {
        "user_message": "I cancelled within the 14-day trial but still got charged. I need my money back.",
        "bot_response": "You're absolutely right to reach out. Our 14-day trial is completely free and you should not have been charged. I can confirm you cancelled within the trial period. I've initiated a full refund of $49.99 which will appear on your statement within 5-7 business days depending on your bank. I apologize for the inconvenience — this was an error on our end.",
        "category": "Refund",
        "response_time_ms": 1876,
    },
    {
        "user_message": "The feature I paid for doesn't work. I want a partial refund.",
        "bot_response": "I'm sorry the feature isn't working as expected — that's genuinely frustrating. Could you tell me which feature is affected? In the meantime, I've logged a bug report. If the issue is confirmed as a platform defect, you would be eligible for a prorated credit or partial refund. Our team will review within 1-2 business days and reach out with a resolution. Is there anything else I can help with in the meantime?",
        "category": "Refund",
        "response_time_ms": 1654,
    },
    {
        "user_message": "I accidentally upgraded to the wrong plan. Can I get refunded for the difference?",
        "bot_response": "Absolutely, mistakes happen! I can see the upgrade was made today. I'll downgrade your account back to your previous plan right now and issue a prorated refund for the price difference. You should see the refund of $30.00 within 5-7 business days. Going forward, you can always preview what each plan includes before upgrading by visiting our pricing page. Is there anything else I can help you with?",
        "category": "Refund",
        "response_time_ms": 1445,
    },

    # Account Access (4)
    {
        "user_message": "I can't log in to my account. It keeps saying my password is wrong.",
        "bot_response": "I'm sorry you're locked out! Let's get you back in quickly. First, try resetting your password using the 'Forgot Password' link on the login page — you'll receive an email within 2 minutes. If you don't see it, check your spam folder. If you still can't access your account after resetting, it's possible your account email was changed. In that case, reply here with your registered email and I'll look into it directly.",
        "category": "Account Access",
        "response_time_ms": 1334,
    },
    {
        "user_message": "My team member lost access after we enabled SSO. How do we fix this?",
        "bot_response": "SSO configuration issues can sometimes lock out existing users if their email domain doesn't match the SSO provider settings. To fix this: go to Settings → Security → SSO Configuration and verify the email domain matches your team member's email. You can also temporarily disable SSO from that page to restore access while you troubleshoot. If you need immediate help, our Enterprise support team can override SSO for individual accounts — just email enterprise@billflow.io.",
        "category": "Account Access",
        "response_time_ms": 2341,
    },
    {
        "user_message": "I'm not receiving the MFA verification code on my phone",
        "bot_response": "Let's troubleshoot this! A few common causes: (1) Check your phone's signal and that SMS isn't blocked by your carrier. (2) If you're using an authenticator app, make sure your phone's time is synced correctly. (3) Try clicking 'Resend Code' and wait 30 seconds. If none of these work, you can use a backup code from when you first set up MFA — they're in the email we sent you. If you've lost those too, contact us with your account email and we'll help you recover access securely.",
        "category": "Account Access",
        "response_time_ms": 1789,
    },
    {
        "user_message": "I think my account was hacked. Someone changed my email address.",
        "bot_response": "This is urgent and I'm treating it as a security incident right now. I'm immediately flagging your account for our security team. Please do the following right away: (1) Check if you still have access via your original email. (2) Change your password from a secure device. (3) Check your connected payment methods for unauthorized activity. Our security team will contact you within 1 hour. If you believe a fraudulent charge occurred, we'll ensure you're fully protected.",
        "category": "Account Access",
        "response_time_ms": 1956,
    },

    # Cancellation (4)
    {
        "user_message": "I want to cancel my subscription. How do I do that?",
        "bot_response": "I'm sorry to hear you'd like to cancel. You can cancel anytime from Settings → Billing → Subscription → Cancel Plan. Your access will continue until the end of your current billing period — no pro-rated refunds for partial months, but you won't be charged again after that. Before you go, may I ask what led to this decision? We'd love the chance to address any issues or show you features you might not have discovered yet.",
        "category": "Cancellation",
        "response_time_ms": 1298,
    },
    {
        "user_message": "I want to downgrade from Pro to the free plan",
        "bot_response": "Totally understood! You can downgrade by going to Settings → Billing → Change Plan and selecting the Free tier. The downgrade takes effect at the end of your current billing cycle so you keep Pro features until then. Note that the Free plan is limited to 100 transactions/month and 1 team member. Some of your current data and integrations may become read-only. Would you like me to send you a comparison of what changes so you can plan accordingly?",
        "category": "Cancellation",
        "response_time_ms": 1512,
    },
    {
        "user_message": "We're shutting down our startup and need to close our BillFlow account entirely",
        "bot_response": "I'm sorry to hear about your startup — that's a tough situation. To close your account completely: go to Settings → Account → Danger Zone → Delete Account. Before doing so, please export any data you need (invoices, customer records) from Settings → Data Export, as deletion is permanent. If you have an active subscription, it will be cancelled immediately and you'll receive a prorated refund for unused days. Is there anything I can help you export before closing?",
        "category": "Cancellation",
        "response_time_ms": 1723,
    },
    {
        "user_message": "Can I pause my subscription instead of cancelling?",
        "bot_response": "Great question — yes, we do offer a pause option! You can pause your subscription for up to 3 months from Settings → Billing → Subscription → Pause Plan. During the pause, you won't be charged but your data and settings are preserved. This is a great alternative to cancelling if you're just taking a break. The pause option is available once per year on Pro and Business plans. Would you like me to walk you through activating it?",
        "category": "Cancellation",
        "response_time_ms": 1187,
    },

    # General Inquiry (5)
    {
        "user_message": "Does BillFlow integrate with QuickBooks?",
        "bot_response": "Yes! BillFlow has a native QuickBooks Online integration. You can connect it from Settings → Integrations → Accounting → QuickBooks. Once connected, all invoices, payments, and refunds sync automatically in real-time. We also support QuickBooks Desktop via our CSV export feature if you're on the legacy version. The integration is available on Pro and Business plans. Would you like a step-by-step setup guide?",
        "category": "General Inquiry",
        "response_time_ms": 1345,
    },
    {
        "user_message": "How many team members can I add on the Pro plan?",
        "bot_response": "The Pro plan supports up to 10 team members. Each member can be assigned one of three roles: Admin (full access), Manager (billing and reporting access), or Viewer (read-only). You can add team members from Settings → Team → Invite Member. If you need more than 10 seats, our Business plan supports unlimited team members. Would you like more details on the Business plan?",
        "category": "General Inquiry",
        "response_time_ms": 1123,
    },
    {
        "user_message": "Can I export my invoice data to a CSV file?",
        "bot_response": "Absolutely! You can export all invoice data as a CSV from Reports → Invoices → Export. You can filter by date range, status (paid, pending, overdue), and customer before exporting. The CSV includes invoice ID, customer name, amount, currency, issue date, due date, and payment status. Exports are available on all plans including Free. Is there a specific date range or data set you need?",
        "category": "General Inquiry",
        "response_time_ms": 987,
    },
    {
        "user_message": "What currencies does BillFlow support?",
        "bot_response": "BillFlow supports 135+ currencies including USD, EUR, GBP, CAD, AUD, JPY, INR, and many more. You can set a default currency for your account in Settings → Billing → Currency, and invoices can be issued in any supported currency regardless of your default. Exchange rates are updated daily. Multi-currency reporting is available on the Business plan, which shows revenue consolidated in your base currency.",
        "category": "General Inquiry",
        "response_time_ms": 1056,
    },
    {
        "user_message": "Is there a mobile app for BillFlow?",
        "bot_response": "Yes! BillFlow has mobile apps for both iOS and Android. You can download them from the App Store or Google Play Store by searching 'BillFlow'. The mobile app lets you view invoices, send payment reminders, check your dashboard stats, and receive push notifications for new payments. Some advanced configuration features are desktop-only for now, but core functionality is fully available on mobile.",
        "category": "General Inquiry",
        "response_time_ms": 1211,
    },
]


def get_seed_data():
    now = datetime.utcnow()
    traces = []
    for i, t in enumerate(SEED_TRACES):
        # Spread traces over the last 30 days
        days_ago = random.randint(0, 29)
        hours_ago = random.randint(0, 23)
        trace_time = now - timedelta(days=days_ago, hours=hours_ago)
        traces.append({
            "id": str(uuid.uuid4()),
            "user_message": t["user_message"],
            "bot_response": t["bot_response"],
            "category": t["category"],
            "timestamp": trace_time,
            "response_time_ms": t["response_time_ms"],
        })
    # Sort by timestamp descending
    traces.sort(key=lambda x: x["timestamp"], reverse=True)
    return traces