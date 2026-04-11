export interface BookingEmailData {
  id: string;
  type: "training" | "private" | "camp-stay" | "fighter";
  price_id: string;
  price_amount: number;
  start_date: string;
  end_date: string | null;
  time_slot: string | null;
  camp: "bo-phut" | "plai-laem" | "both" | null;
  num_participants: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_nationality: string | null;
  notes: string | null;
}
