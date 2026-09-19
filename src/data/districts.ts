export interface District {
  name: string;
  division: string;
  isDhakaMetro?: boolean;
  deliveryFee: number;
}

export function getDistrictDeliveryFee(districtInput: string): number {
  if (!districtInput) return 130;
  const clean = districtInput.trim().toLowerCase();
  if (clean.includes('dhaka') || clean.includes('gazipur')) {
    return 80;
  }
  return 130;
}

export const BANGLADESH_DISTRICTS: District[] = [
  // Dhaka Division
  { name: "Dhaka (Metro & Greater)", division: "Dhaka", isDhakaMetro: true, deliveryFee: 80 },
  { name: "Gazipur", division: "Dhaka", isDhakaMetro: true, deliveryFee: 80 },
  { name: "Narayanganj", division: "Dhaka", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Tangail", division: "Dhaka", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Faridpur", division: "Dhaka", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Manikganj", division: "Dhaka", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Munshiganj", division: "Dhaka", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Narsingdi", division: "Dhaka", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Kishoreganj", division: "Dhaka", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Gopalganj", division: "Dhaka", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Madaripur", division: "Dhaka", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Rajbari", division: "Dhaka", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Shariatpur", division: "Dhaka", isDhakaMetro: false, deliveryFee: 130 },

  // Chittagong Division
  { name: "Chittagong (Chattogram)", division: "Chittagong", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Cox's Bazar", division: "Chittagong", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Cumilla (Comilla)", division: "Chittagong", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Feni", division: "Chittagong", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Brahmanbaria", division: "Chittagong", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Noakhali", division: "Chittagong", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Chandpur", division: "Chittagong", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Lakshmipur", division: "Chittagong", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Bandarban", division: "Chittagong", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Khagrachhari", division: "Chittagong", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Rangamati", division: "Chittagong", isDhakaMetro: false, deliveryFee: 130 },

  // Sylhet Division
  { name: "Sylhet", division: "Sylhet", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Moulvibazar", division: "Sylhet", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Habiganj", division: "Sylhet", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Sunamganj", division: "Sylhet", isDhakaMetro: false, deliveryFee: 130 },

  // Rajshahi Division
  { name: "Rajshahi", division: "Rajshahi", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Bogra (Bogura)", division: "Rajshahi", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Pabna", division: "Rajshahi", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Sirajganj", division: "Rajshahi", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Naogaon", division: "Rajshahi", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Natore", division: "Rajshahi", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Chapai Nawabganj", division: "Rajshahi", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Joypurhat", division: "Rajshahi", isDhakaMetro: false, deliveryFee: 130 },

  // Khulna Division
  { name: "Khulna", division: "Khulna", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Jessore (Jashore)", division: "Khulna", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Kushtia", division: "Khulna", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Satkhira", division: "Khulna", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Bagerhat", division: "Khulna", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Jhenaidah", division: "Khulna", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Chuadanga", division: "Khulna", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Magura", division: "Khulna", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Meherpur", division: "Khulna", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Narail", division: "Khulna", isDhakaMetro: false, deliveryFee: 130 },

  // Barisal Division
  { name: "Barisal (Barishal)", division: "Barisal", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Bhola", division: "Barisal", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Patuakhali", division: "Barisal", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Pirojpur", division: "Barisal", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Barguna", division: "Barisal", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Jhalokati", division: "Barisal", isDhakaMetro: false, deliveryFee: 130 },

  // Rangpur Division
  { name: "Rangpur", division: "Rangpur", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Dinajpur", division: "Rangpur", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Gaibandha", division: "Rangpur", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Kurigram", division: "Rangpur", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Lalmonirhat", division: "Rangpur", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Nilphamari", division: "Rangpur", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Panchagarh", division: "Rangpur", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Thakurgaon", division: "Rangpur", isDhakaMetro: false, deliveryFee: 130 },

  // Mymensingh Division
  { name: "Mymensingh", division: "Mymensingh", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Jamalpur", division: "Mymensingh", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Netrokona", division: "Mymensingh", isDhakaMetro: false, deliveryFee: 130 },
  { name: "Sherpur", division: "Mymensingh", isDhakaMetro: false, deliveryFee: 130 },
];
