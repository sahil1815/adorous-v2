export interface District {
  name: string;
  division: string;
  isDhakaMetro: boolean;
}

export const BANGLADESH_DISTRICTS: District[] = [
  // Dhaka Division
  { name: "Dhaka (Metro & Greater)", division: "Dhaka", isDhakaMetro: true },
  { name: "Gazipur", division: "Dhaka", isDhakaMetro: false },
  { name: "Narayanganj", division: "Dhaka", isDhakaMetro: false },
  { name: "Tangail", division: "Dhaka", isDhakaMetro: false },
  { name: "Faridpur", division: "Dhaka", isDhakaMetro: false },
  { name: "Manikganj", division: "Dhaka", isDhakaMetro: false },
  { name: "Munshiganj", division: "Dhaka", isDhakaMetro: false },
  { name: "Narsingdi", division: "Dhaka", isDhakaMetro: false },
  { name: "Kishoreganj", division: "Dhaka", isDhakaMetro: false },
  { name: "Gopalganj", division: "Dhaka", isDhakaMetro: false },
  { name: "Madaripur", division: "Dhaka", isDhakaMetro: false },
  { name: "Rajbari", division: "Dhaka", isDhakaMetro: false },
  { name: "Shariatpur", division: "Dhaka", isDhakaMetro: false },

  // Chittagong Division
  { name: "Chittagong (Chattogram)", division: "Chittagong", isDhakaMetro: false },
  { name: "Cox's Bazar", division: "Chittagong", isDhakaMetro: false },
  { name: "Cumilla (Comilla)", division: "Chittagong", isDhakaMetro: false },
  { name: "Feni", division: "Chittagong", isDhakaMetro: false },
  { name: "Brahmanbaria", division: "Chittagong", isDhakaMetro: false },
  { name: "Noakhali", division: "Chittagong", isDhakaMetro: false },
  { name: "Chandpur", division: "Chittagong", isDhakaMetro: false },
  { name: "Lakshmipur", division: "Chittagong", isDhakaMetro: false },
  { name: "Bandarban", division: "Chittagong", isDhakaMetro: false },
  { name: "Khagrachhari", division: "Chittagong", isDhakaMetro: false },
  { name: "Rangamati", division: "Chittagong", isDhakaMetro: false },

  // Sylhet Division
  { name: "Sylhet", division: "Sylhet", isDhakaMetro: false },
  { name: "Moulvibazar", division: "Sylhet", isDhakaMetro: false },
  { name: "Habiganj", division: "Sylhet", isDhakaMetro: false },
  { name: "Sunamganj", division: "Sylhet", isDhakaMetro: false },

  // Rajshahi Division
  { name: "Rajshahi", division: "Rajshahi", isDhakaMetro: false },
  { name: "Bogra (Bogura)", division: "Rajshahi", isDhakaMetro: false },
  { name: "Pabna", division: "Rajshahi", isDhakaMetro: false },
  { name: "Sirajganj", division: "Rajshahi", isDhakaMetro: false },
  { name: "Naogaon", division: "Rajshahi", isDhakaMetro: false },
  { name: "Natore", division: "Rajshahi", isDhakaMetro: false },
  { name: "Chapai Nawabganj", division: "Rajshahi", isDhakaMetro: false },
  { name: "Joypurhat", division: "Rajshahi", isDhakaMetro: false },

  // Khulna Division
  { name: "Khulna", division: "Khulna", isDhakaMetro: false },
  { name: "Jessore (Jashore)", division: "Khulna", isDhakaMetro: false },
  { name: "Kushtia", division: "Khulna", isDhakaMetro: false },
  { name: "Satkhira", division: "Khulna", isDhakaMetro: false },
  { name: "Bagerhat", division: "Khulna", isDhakaMetro: false },
  { name: "Jhenaidah", division: "Khulna", isDhakaMetro: false },
  { name: "Chuadanga", division: "Khulna", isDhakaMetro: false },
  { name: "Magura", division: "Khulna", isDhakaMetro: false },
  { name: "Meherpur", division: "Khulna", isDhakaMetro: false },
  { name: "Narail", division: "Khulna", isDhakaMetro: false },

  // Barisal Division
  { name: "Barisal (Barishal)", division: "Barisal", isDhakaMetro: false },
  { name: "Bhola", division: "Barisal", isDhakaMetro: false },
  { name: "Patuakhali", division: "Barisal", isDhakaMetro: false },
  { name: "Pirojpur", division: "Barisal", isDhakaMetro: false },
  { name: "Barguna", division: "Barisal", isDhakaMetro: false },
  { name: "Jhalokati", division: "Barisal", isDhakaMetro: false },

  // Rangpur Division
  { name: "Rangpur", division: "Rangpur", isDhakaMetro: false },
  { name: "Dinajpur", division: "Rangpur", isDhakaMetro: false },
  { name: "Gaibandha", division: "Rangpur", isDhakaMetro: false },
  { name: "Kurigram", division: "Rangpur", isDhakaMetro: false },
  { name: "Lalmonirhat", division: "Rangpur", isDhakaMetro: false },
  { name: "Nilphamari", division: "Rangpur", isDhakaMetro: false },
  { name: "Panchagarh", division: "Rangpur", isDhakaMetro: false },
  { name: "Thakurgaon", division: "Rangpur", isDhakaMetro: false },

  // Mymensingh Division
  { name: "Mymensingh", division: "Mymensingh", isDhakaMetro: false },
  { name: "Jamalpur", division: "Mymensingh", isDhakaMetro: false },
  { name: "Netrokona", division: "Mymensingh", isDhakaMetro: false },
  { name: "Sherpur", division: "Mymensingh", isDhakaMetro: false },
];
