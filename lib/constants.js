export const SERVICES = [
  { id: "s1", name: "🌾 कश्या निकालना & जमा करना", normal: 820, subscription: 410 },
  { id: "s2", name: "🌱 पंजी मारना", normal: 820, subscription: 410 },
  { id: "s3", name: "🌿 फास मारना", normal: 820, subscription: 410 },
  { id: "s4", name: "🚜 नांगर्णी", normal: 1620, subscription: 810 },
  { id: "s5", name: "🌱 कल्टीवेटर", normal: 820, subscription: 410 },
  { id: "s6", name: "🌾 बेड मेकर", normal: 1220, subscription: 610 },
  { id: "s7", name: "🚜 रोटावेटर", normal: 1420, subscription: 710 },
];

export const VILLAGES = ["रामपुर", "शिवपुर", "गणेशपुर", "कृष्णानगर"];

export const SUBSCRIPTION_RATE_PER_ACRE = 550; // per acre, per year
export const DRIVER_INCENTIVE_PER_JOB = 150; // flat incentive shown to drivers per accepted job
export const DRIVER_INCENTIVE_BUDGET_LABEL = "₹2.5 करोड़";

export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin@123";
export const MOCK_OTP = process.env.NEXT_PUBLIC_MOCK_OTP || "1234";

export const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export const generateOtp4 = () => String(Math.floor(1000 + Math.random() * 9000));

export const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);
