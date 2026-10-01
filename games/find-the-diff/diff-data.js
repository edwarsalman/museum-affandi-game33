// Data lukisan & titik perbedaan (bisa diedit manual jika ganti gambar)

const DIFF_DATA = [
  {
    id: 1,
    original: "assets/images/lukisan/lukisan1_original.jpeg",
    modified: "assets/images/lukisan/lukisan1_modified.jpeg",
    description:
      "Lukisan Affandi, Place du Tertre",
    width: 742,
    height: 895,
    points: [
      { x: 504, y: 201, r: 70 }, // lingkaran gerhana/bulan di tengah matahari
      { x: 85, y: 680, r: 90 }, // kanopi/tenda merah kiri bawah
      { x: 428, y: 625, r: 45 }, // lampu jalan oval dasar merah
      { x: 705, y: 745, r: 55 }, // jubah biru sosok kanan
      { x: 400, y: 840, r: 45 }, // OBJEK HILANG: dua bentuk/sosok gelap di bagian bawah-tengah
    ],
  },

  {
    id: 2,
    original: "assets/images/lukisan/lukisan2_original.jpeg",
    modified: "assets/images/lukisan/lukisan2_modified.jpeg",
    description:
      "Lukisan Karya Maryati, Ngaben",
    width: 2517,
    height: 1766,
    points: [
      { x: 1716, y: 314, r: 110 }, // batu putih atas
      { x: 2253, y: 490, r: 110 }, // pohon palem kanan
      { x: 1501, y: 1347, r: 110 }, // objek manusia merah bawah
      { x: 219, y: 1298, r: 110 }, // objek manusia kiri bawah
      { x: 2256, y: 1231, r: 110 }, // 

    ],
  },
  {
    id: 3,
    original: "assets/images/lukisan/lukisan3_original.jpeg",
    modified: "assets/images/lukisan/lukisan3_modified.jpeg",
    description:
      "Lukisan Kartika, Balinese Temple",
    width: 3577,
    height: 2844,
    points: [
      { x: 3203, y: 2199, r: 110 }, // batu putih atas
      { x: 2924, y: 2172, r: 110 }, // pohon palem kanan
      { x: 2009, y: 1994, r: 110 }, // objek manusia merah bawah
      { x:348, y: 1941, r: 110 }, // objek manusia kiri bawah
      { x:2530, y: 1494, r: 110 }, 

    ],
  },
  // ... (id: 3 sampai 5 tetap seperti sebelumnya)
  {
    id: 4,
    original: "assets/images/lukisan/lukisan4_original.jpeg",
    modified: "assets/images/lukisan/lukisan4_modified.jpeg",
    description:
      "Lukisan Kartika, A House in Austria Highlands ",
    width: 3809,
    height: 3083,
    markerRadius: 220,
    points: [
      { x: 2378, y: 2406, r: 110 }, // batu putih atas
      { x: 3443, y: 839, r: 110 }, // pohon palem kanan
      { x: 1466, y: 1551, r: 110 }, // objek manusia merah bawah
      { x: 2674, y: 767, r: 110 }, // objek manusia kiri bawah
      { x: 1876, y: 1591, r: 110 }, 

    ],
  },
  {
    id: 5,
    original: "assets/images/lukisan/lukisan5_original.jpeg",
    modified: "assets/images/lukisan/lukisan5_modified.jpeg",
    description:
      "Lukisan Affandi, Pasar Burung di Jogja.",
    width: 2192,
    height: 2796,
    markerRadius: 220,
    points: [
      { x: 1582, y: 428, r: 110 }, // batu putih atas
      { x: 734, y: 1028, r: 110 }, // pohon palem kanan
      { x: 1875, y: 2462, r: 110 }, // objek manusia merah bawah
      { x: 1802, y: 1635, r: 110 }, // objek manusia kiri bawah
      { x: 796, y: 516, r: 110 }, 
    ],
  },
  // ... (id: 3 sampai 5 tetap seperti sebelumnya)
];
// ... (id: 3 sampai 5 tetap seperti sebelumnya)
