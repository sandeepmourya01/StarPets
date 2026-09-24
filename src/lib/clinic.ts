// =====================================================================
// EDIT THIS FILE to change anything about the clinic.
// Every page reads its text, phone numbers, hours and services from here.
// Items marked TODO are placeholders: replace them with the real details.
// =====================================================================

export const clinic = {
  name: "Star Pets",
  shortName: "Star Pets",
  city: "Chandigarh",
  tagline: "Veterinary clinic for dogs, cats and exotic pets",

  // TODO: replace with the real address
  addressLines: ["SCO 000, Sector 00", "Chandigarh 160000"],
  // Used by the Google Map on the page. Put the address or clinic name here.
  mapQuery: "Sector 17, Chandigarh",

  // TODO: replace with the real numbers (digits only in *Raw, used for tap-to-call)
  phone: "+91 00000 00000",
  phoneRaw: "+910000000000",
  emergencyPhone: "+91 00000 00000",
  emergencyPhoneRaw: "+910000000000",
  email: "hello@starpets.example",
  whatsappRaw: "910000000000",

  // Opening hours and appointment slots (24-hour format)
  openTime: "10:00",
  closeTime: "20:00",
  slotMinutes: 30,
  // How many appointments can happen at the same time. Must match supabase/schema.sql.
  slotCapacity: 2,
  // How far ahead people can book
  bookingWindowDays: 60,
  hoursText: "Monday to Sunday, 10:00 AM to 8:00 PM",

  headVet: {
    name: "Dr. Your Name", // TODO
    bio: "Leads the Star Pets team with a focus on preventive care, surgery support and calm, careful handling of every patient.",
  },

  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
  },
};

export const services = [
  { title: "Consultations & OPD", text: "Routine visits and expert consultations for everyday pet health." },
  { title: "Vaccination & preventive care", text: "Vaccines, deworming, wellness checks and prevention plans." },
  { title: "Dental care", text: "Scaling, polishing and oral health support for cleaner teeth and healthier gums." },
  { title: "Dermatology", text: "Care for skin, coat, allergies, infections and irritation." },
  { title: "Nutrition counselling", text: "Diet advice suited to your pet's age, breed and health needs." },
  { title: "In-house pathology lab", text: "On-site blood and lab tests for quicker diagnosis and treatment." },
  { title: "Pet pharmacy", text: "Prescribed medicines and care essentials, available at the clinic." },
  { title: "Surgery", text: "Planned procedures and complex cases, with pre- and post-operative care." },
  { title: "X-ray & ultrasound", text: "On-site imaging to speed up diagnosis and treatment planning." },
  { title: "Separate dog & cat wards", text: "In-patient spaces designed to keep dogs and cats calm." },
  { title: "Exotic pet care", text: "Veterinary support for birds, rabbits, small mammals and other exotic pets." },
];

export const appointmentTypes = [
  "Regular checkup",
  "Vaccination",
  "Surgery",
  "Dental cleaning",
  "Emergency care",
  "Other",
];

export const petTypes = ["Dog", "Cat", "Rabbit", "Bird", "Other"];

export const heardFromOptions = ["Google", "Instagram", "Facebook", "Saw an ad", "Referral"];

export const faqs = [
  {
    q: "What are your timings?",
    a: "We are open Monday to Sunday, from 10:00 AM to 8:00 PM.",
  },
  {
    q: "Do you treat both dogs and cats?",
    a: "Yes. We treat dogs and cats, and we also see rabbits, birds and other exotic pets. Tell us the pet type when you book.",
  },
  {
    q: "Do I need an appointment or can I walk in?",
    a: "Walk-ins are welcome. Booking a slot in advance reduces your waiting time, so we recommend it.",
  },
  {
    q: "Do you perform surgeries?",
    a: "Yes. Choose Surgery when you book and our team will call to discuss the procedure, preparation and timing.",
  },
  {
    q: "What if it is an emergency?",
    a: "Please call our emergency number right away instead of booking online. We will guide you on what to do next.",
  },
  {
    q: "How do I know my booking is confirmed?",
    a: "New bookings show as Pending. Our team reviews each one and calls you to confirm. If you have an account, the status updates on your My appointments page.",
  },
];
