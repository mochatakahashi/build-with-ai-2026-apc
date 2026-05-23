/**
 * Mock Posts Data — CampusConnect
 * 15 realistic campus posts across news, projects, and gathering-spots categories.
 */

const now = Date.now();
const hours = (h) => now - h * 60 * 60 * 1000;
const days = (d) => now - d * 24 * 60 * 60 * 1000;

const mockPosts = [
  /* ─── NEWS (5 posts) ─── */
  {
    id: 'post-1',
    authorId: 'user-1',
    authorName: 'APC Admin',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AA&backgroundColor=3b82f6',
    authorType: 'admin',
    content:
      '📚 Exciting news! The APC Main Library renovation is officially complete. The new wing features 120 additional study pods, a dedicated silent zone on the 3rd floor, and upgraded high-speed Wi-Fi throughout. Open daily from 7 AM to 10 PM starting next Monday. Drop by and check it out!',
    category: 'news',
    imageUrl: 'https://picsum.photos/seed/library-reno/800/400',
    likes: ['user-2', 'user-3', 'user-5', 'user-7', 'user-8', 'user-9'],
    comments: [
      {
        id: 'comment-1',
        authorId: 'user-3',
        authorName: 'Mika Santos',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MS&backgroundColor=7c3aed',
        text: 'Finally! The old study pods were always packed. Can\'t wait to try the new ones! 🎉',
        createdAt: hours(1),
      },
      {
        id: 'comment-2',
        authorId: 'user-5',
        authorName: 'Jolo Reyes',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JR&backgroundColor=06b6d4',
        text: 'Do the new pods have power outlets? That was always a problem before.',
        createdAt: hours(0.5),
      },
    ],
    createdAt: hours(3),
  },
  {
    id: 'post-2',
    authorId: 'user-2',
    authorName: 'Dean Martinez',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DM&backgroundColor=10b981',
    authorType: 'faculty',
    content:
      '🏆 APC Hackathon 2026 is happening June 14-15! This year\'s theme is "AI for Campus Impact." Teams of 3-5 can register on the portal. Cash prizes, mentorship from industry leaders, and the winning project gets incubated by APC Innovation Hub. Don\'t miss it!',
    category: 'news',
    imageUrl: 'https://picsum.photos/seed/hackathon-2026/800/400',
    likes: ['user-1', 'user-3', 'user-4', 'user-6', 'user-7', 'user-10'],
    comments: [
      {
        id: 'comment-3',
        authorId: 'user-4',
        authorName: 'Bea Cruz',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BC&backgroundColor=f59e0b',
        text: 'Looking for 2 more teammates! DM me if you\'re interested — planning to build an AI tutor 🤖',
        createdAt: hours(6),
      },
    ],
    createdAt: hours(8),
  },
  {
    id: 'post-3',
    authorId: 'user-6',
    authorName: 'CSG Official',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CSG&backgroundColor=ef4444',
    authorType: 'org',
    content:
      '🗳️ Student Council elections are next week! Candidates for president: Ana Lim (BSCS), Marco Tan (BSIT), and Sarah Go (BSBA-MM). Candidate forums will be held this Friday at 2 PM in the Auditorium. Your vote matters — let\'s shape our campus together!',
    category: 'news',
    likes: ['user-1', 'user-3', 'user-8'],
    comments: [],
    createdAt: hours(12),
  },
  {
    id: 'post-4',
    authorId: 'user-7',
    authorName: 'Prof. Garcia',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PG&backgroundColor=7c3aed',
    authorType: 'faculty',
    content:
      '📢 Reminder: Final exam schedules are now posted on the student portal. Please check your slots and report any conflicts to the registrar before May 30. Also, the review sessions for CSMODEL and CSALGCM will be this Saturday — attendance is highly encouraged.',
    category: 'news',
    likes: ['user-2', 'user-4', 'user-5', 'user-9', 'user-10'],
    comments: [
      {
        id: 'comment-4',
        authorId: 'user-9',
        authorName: 'Carlo Mendoza',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CM&backgroundColor=3b82f6',
        text: 'Thank you for the review sessions, Prof! Really need the CSALGCM one 😅',
        createdAt: hours(5),
      },
      {
        id: 'comment-5',
        authorId: 'user-10',
        authorName: 'Ria Pascual',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RP&backgroundColor=06b6d4',
        text: 'Will there be a recording for students who can\'t attend?',
        createdAt: hours(4),
      },
    ],
    createdAt: days(1),
  },
  {
    id: 'post-5',
    authorId: 'user-1',
    authorName: 'APC Admin',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AA&backgroundColor=3b82f6',
    authorType: 'admin',
    content:
      '🌐 Campus Wi-Fi upgrade complete! We\'ve deployed new access points across all buildings. Expected speeds: 300+ Mbps in classrooms and 500+ Mbps in labs. If you experience issues, submit a ticket through the IT Help Desk portal.',
    category: 'news',
    likes: ['user-3', 'user-5', 'user-6'],
    comments: [],
    createdAt: days(2),
  },

  /* ─── PROJECTS (5 posts) ─── */
  {
    id: 'post-6',
    authorId: 'user-3',
    authorName: 'Mika Santos',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MS&backgroundColor=7c3aed',
    authorType: 'student',
    content:
      '🚀 Just deployed our capstone project — CampusConnect! It\'s a campus-exclusive social media app built with React and AWS. Features include RBAC, event management with QR attendance, and automated image watermarking. Check it out on GitHub!\n\nhttps://github.com/mika-santos/campusconnect',
    category: 'projects',
    imageUrl: 'https://picsum.photos/seed/campusconnect/800/400',
    likes: ['user-1', 'user-2', 'user-4', 'user-5', 'user-7', 'user-8', 'user-9', 'user-10'],
    comments: [
      {
        id: 'comment-6',
        authorId: 'user-2',
        authorName: 'Dean Martinez',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DM&backgroundColor=10b981',
        text: 'Impressive work, Mika! The watermarking feature is a great touch. Would love to see this go campus-wide.',
        createdAt: hours(2),
      },
      {
        id: 'comment-7',
        authorId: 'user-8',
        authorName: 'Kris Navarro',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=KN&backgroundColor=ef4444',
        text: 'The glass-morphism UI is 🔥 — what design system did you use?',
        createdAt: hours(1),
      },
    ],
    createdAt: hours(5),
  },
  {
    id: 'post-7',
    authorId: 'user-4',
    authorName: 'Bea Cruz',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BC&backgroundColor=f59e0b',
    authorType: 'student',
    content:
      '💡 Built a machine learning model that predicts student GPA based on study habits, attendance, and extracurricular activities. Achieved 87% accuracy using Random Forest. The Jupyter notebook and dataset are open-source!\n\nhttps://github.com/beacruz/gpa-predictor',
    category: 'projects',
    likes: ['user-1', 'user-3', 'user-7', 'user-9'],
    comments: [
      {
        id: 'comment-8',
        authorId: 'user-7',
        authorName: 'Prof. Garcia',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PG&backgroundColor=7c3aed',
        text: 'Great application of ML, Bea! Have you considered adding sleep patterns as a feature?',
        createdAt: hours(10),
      },
    ],
    createdAt: days(1),
  },
  {
    id: 'post-8',
    authorId: 'user-5',
    authorName: 'Jolo Reyes',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JR&backgroundColor=06b6d4',
    authorType: 'student',
    content:
      '🎮 Our game dev team just released "Pixel Campus" — a 2D platformer set in APC! Collect thesis pages, dodge deadlines, and reach graduation. Built with Unity. Play it in your browser:\n\nhttps://github.com/jolo-reyes/pixel-campus',
    category: 'projects',
    imageUrl: 'https://picsum.photos/seed/pixel-campus/800/400',
    likes: ['user-1', 'user-2', 'user-3', 'user-6', 'user-8', 'user-10'],
    comments: [],
    createdAt: days(2),
  },
  {
    id: 'post-9',
    authorId: 'user-9',
    authorName: 'Carlo Mendoza',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CM&backgroundColor=3b82f6',
    authorType: 'student',
    content:
      '🔒 Working on a blockchain-based transcript verification system for my thesis. Smart contracts ensure tamper-proof academic records that employers can verify instantly. Still in prototype stage — looking for feedback from anyone in crypto/web3!\n\nhttps://github.com/carlo-mendoza/verifi-chain',
    category: 'projects',
    likes: ['user-2', 'user-4'],
    comments: [],
    createdAt: days(3),
  },
  {
    id: 'post-10',
    authorId: 'user-10',
    authorName: 'Ria Pascual',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RP&backgroundColor=06b6d4',
    authorType: 'student',
    content:
      '📱 Just finished my mobile app project — "StudyBuddy" — an AI-powered study group matchmaker. It uses your enrolled subjects, free time, and learning style to find your perfect study partners. Built with React Native + Firebase.\n\nhttps://github.com/ria-pascual/studybuddy',
    category: 'projects',
    imageUrl: 'https://picsum.photos/seed/studybuddy/800/400',
    likes: ['user-1', 'user-3', 'user-5', 'user-6', 'user-7'],
    comments: [
      {
        id: 'comment-9',
        authorId: 'user-3',
        authorName: 'Mika Santos',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MS&backgroundColor=7c3aed',
        text: 'Love this concept! Would be amazing if it integrated with the school\'s class schedule API.',
        createdAt: days(1),
      },
    ],
    createdAt: days(3),
  },

  /* ─── GATHERING SPOTS (5 posts) ─── */
  {
    id: 'post-11',
    authorId: 'user-8',
    authorName: 'Kris Navarro',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=KN&backgroundColor=ef4444',
    authorType: 'student',
    content:
      '☕ Hidden gem alert! "Brewed Awakening" just opened on Arnaiz Ave, 5 mins from campus. They have unlimited coffee refills for ₱120, strong Wi-Fi, and tons of power outlets. Perfect study spot — went there twice this week and got so much done!',
    category: 'gathering-spots',
    imageUrl: 'https://picsum.photos/seed/cafe-brewed/800/400',
    likes: ['user-1', 'user-3', 'user-4', 'user-5', 'user-9'],
    comments: [
      {
        id: 'comment-10',
        authorId: 'user-4',
        authorName: 'Bea Cruz',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BC&backgroundColor=f59e0b',
        text: 'Just went today — can confirm, the matcha latte is amazing! Stayed for 4 hours 😂',
        createdAt: hours(3),
      },
      {
        id: 'comment-11',
        authorId: 'user-5',
        authorName: 'Jolo Reyes',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JR&backgroundColor=06b6d4',
        text: 'Is it noisy? I need complete silence when coding lol',
        createdAt: hours(2),
      },
      {
        id: 'comment-12',
        authorId: 'user-8',
        authorName: 'Kris Navarro',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=KN&backgroundColor=ef4444',
        text: '@Jolo there\'s a quiet zone upstairs! Super chill vibes.',
        createdAt: hours(1.5),
      },
    ],
    createdAt: hours(6),
  },
  {
    id: 'post-12',
    authorId: 'user-6',
    authorName: 'CSG Official',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CSG&backgroundColor=ef4444',
    authorType: 'org',
    content:
      '🏢 The rooftop garden on Building B is now open for students! Great views of the Makati skyline, benches for studying, and a mini herb garden maintained by the Botany Club. Open 8 AM - 6 PM weekdays. Bring your books and enjoy the fresh air!',
    category: 'gathering-spots',
    imageUrl: 'https://picsum.photos/seed/rooftop-garden/800/400',
    likes: ['user-2', 'user-3', 'user-5', 'user-7', 'user-8', 'user-10'],
    comments: [
      {
        id: 'comment-13',
        authorId: 'user-10',
        authorName: 'Ria Pascual',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RP&backgroundColor=06b6d4',
        text: 'This is such a peaceful spot! Studied there yesterday during golden hour — 10/10 vibes ✨',
        createdAt: days(1),
      },
    ],
    createdAt: days(2),
  },
  {
    id: 'post-13',
    authorId: 'user-4',
    authorName: 'Bea Cruz',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BC&backgroundColor=f59e0b',
    authorType: 'student',
    content:
      '🍜 Review of "Mang Larry\'s" near Gate 2: Affordable silog meals (₱75-95), fast service, and they now accept GCash! The place gets crowded during lunch so go before 11:30 AM. Pro tip: their longsilog + extra egg combo is chef\'s kiss 👨‍🍳',
    category: 'gathering-spots',
    likes: ['user-1', 'user-5', 'user-6', 'user-8', 'user-9', 'user-10'],
    comments: [],
    createdAt: days(3),
  },
  {
    id: 'post-14',
    authorId: 'user-3',
    authorName: 'Mika Santos',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MS&backgroundColor=7c3aed',
    authorType: 'student',
    content:
      '🎲 Board game nights at the Student Lounge every Friday 6-9 PM! We have Settlers of Catan, Codenames, Exploding Kittens, and more. No need to bring anything — just show up and have fun. Great way to de-stress before the weekend!',
    category: 'gathering-spots',
    imageUrl: 'https://picsum.photos/seed/board-games/800/400',
    likes: ['user-1', 'user-2', 'user-6', 'user-8'],
    comments: [
      {
        id: 'comment-14',
        authorId: 'user-6',
        authorName: 'CSG Official',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CSG&backgroundColor=ef4444',
        text: 'CSG is co-sponsoring this! We\'re adding new games next month including Wingspan and Ticket to Ride 🚂',
        createdAt: days(1),
      },
    ],
    createdAt: days(4),
  },
  {
    id: 'post-15',
    authorId: 'user-9',
    authorName: 'Carlo Mendoza',
    authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CM&backgroundColor=3b82f6',
    authorType: 'student',
    content:
      '🏀 Just discovered that the covered court behind Building D is almost always free after 5 PM on weekdays. Perfect for pickup basketball or badminton! They recently installed new LED lights so you can play till 8 PM. Who\'s down for a game this Thursday?',
    category: 'gathering-spots',
    likes: ['user-1', 'user-5', 'user-8'],
    comments: [
      {
        id: 'comment-15',
        authorId: 'user-5',
        authorName: 'Jolo Reyes',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JR&backgroundColor=06b6d4',
        text: 'I\'m in for Thursday! Can we do 3v3? I\'ll bring extra water bottles 💧',
        createdAt: hours(4),
      },
    ],
    createdAt: days(1),
  },
];

export default mockPosts;
