// ============================================================
// WHAT THIS FILE DOES
// YOUR MAIN SETTINGS FILE. Change her name, photos, and the prompts here.
// This is the first file you should edit.
// ============================================================

// ===== EDIT THIS FILE =====
export const CONFIG = {
  celebrantName: "Mercy",

  // Put her photos in the /public/photos folder, then list them here.
  // 3 photos swipe by themselves. The first one is also the small avatar.
  photos: [
    "/photos/IMG-20261003-WA0005.jpg",
     "/photos/IMG-20261003-WA0006.jpg",
     "/photos/IMG-20261003-WA0009.jpg",
    "/photos/IMG-20261007-WA0007.jpg",
    "/photos/IMG-20261007-WA0010.jpg"
  ],

  maxPhotos: 6,
};

export const PROMPTS = [
  "What's your funniest memory together?",
  "What do you appreciate about her?",
  "What do you hope she achieves?",
  "When did you first meet?",
  "Describe her in three words.",
];

export const SAMPLE_MEMORIES = [
  {
    name: "Ada",
    relationship: "Friend",
    message: "Happy birthday! Thank you for being the kind of friend who makes every ordinary day feel like a good one.",
    memory: "I still remember our first week on campus, when we got lost for an hour looking for the lecture hall and ended up laughing the whole way. That's when I knew we'd be close.",
    photos: [],
  },
  {
    name: "Tunde",
    relationship: "Family",
    message: "Another year, another reason to be proud of you. Keep going.",
    photos: [],
  },
  {
    name: "Chioma",
    relationship: "Classmate",
    story: "There was a night before exams when everyone was panicking and you stayed calm, made a plan, and somehow got all of us through it. I will never forget how steady you were.",
    photos: [],
  },
];