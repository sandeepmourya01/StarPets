export type Appointment = {
  id: string;
  created_at: string;
  user_id: string | null;
  owner_name: string;
  pet_name: string;
  pet_type: string;
  email: string;
  phone: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  notes: string | null;
  heard_from: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};
