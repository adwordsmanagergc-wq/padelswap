// PadelSwap seed data — tournaments, tiers, team cards and arena matches.
// In a real build this would come from an API; here it's a static catalogue.
// Team data is generated deterministically (no randomness) so card IDs,
// prices and Playtomic scores stay stable across page reloads.

(function () {
  "use strict";

  // ---- Tier definitions (Playtomic skill bands) ----
  var TIERS = [
    { id: "Platinum",  label: "Platinum",  range: "Playtomic 6.0 – 7.5" },
    { id: "High Gold", label: "High Gold", range: "Playtomic 4.5 – 6.0" },
    { id: "Gold",      label: "Gold",      range: "Playtomic 3.5 – 4.5" },
    { id: "Silver",    label: "Silver",    range: "Playtomic 2.5 – 3.5" },
    { id: "Bronze",    label: "Bronze",    range: "Playtomic below 2.5" }
  ];

  // ---- Team builder: derives team name + card price from the two players ----
  function surname(name) {
    return name.split(" ").slice(-1)[0];
  }

  function mkTeam(id, tier, p1, s1, p2, s2) {
    var avg = (s1 + s2) / 2;
    return {
      id: id,
      tier: tier,
      team: surname(p1) + " / " + surname(p2),
      players: [
        { name: p1, score: s1 },
        { name: p2, score: s2 }
      ],
      // Card price scales with the square of average skill — top teams
      // command a steep premium over the field.
      price: Math.round(avg * avg * 9)
    };
  }

  // ---- The Nox Cup: 32 teams of 2, World Cup style knockout bracket ----
  // Names are a deliberate mix of Spanish, Russian, Chinese and English.
  var NOX_TEAMS = [
    // Platinum (6.0 – 7.5)
    mkTeam("nox-1",  "Platinum", "Diego García", 7.3, "Dmitri Volkov", 7.1),
    mkTeam("nox-2",  "Platinum", "Wei Chen", 7.0, "James Carter", 6.8),
    mkTeam("nox-3",  "Platinum", "Javier Martínez", 6.6, "Sergei Petrov", 6.9),
    mkTeam("nox-4",  "Platinum", "Hao Li", 6.2, "Oliver Bennett", 6.4),

    // High Gold (4.5 – 6.0)
    mkTeam("nox-5",  "High Gold", "Carlos Fernández", 5.9, "Mikhail Ivanov", 5.7),
    mkTeam("nox-6",  "High Gold", "Jun Zhang", 5.5, "Harry Hughes", 5.8),
    mkTeam("nox-7",  "High Gold", "Pablo López", 5.6, "Andrei Smirnov", 5.3),
    mkTeam("nox-8",  "High Gold", "Lei Wang", 5.0, "George Walker", 5.2),
    mkTeam("nox-9",  "High Gold", "Hugo Sánchez", 4.8, "Nikolai Sokolov", 5.1),
    mkTeam("nox-10", "High Gold", "Ming Liu", 4.9, "Jack Turner", 4.7),
    mkTeam("nox-11", "High Gold", "Álvaro Romero", 4.6, "Ivan Popov", 4.9),
    mkTeam("nox-12", "High Gold", "Feng Yang", 4.7, "Thomas Cooper", 4.5),

    // Gold (3.5 – 4.5)
    mkTeam("nox-13", "Gold", "Mateo Torres", 4.4, "Alexei Kuznetsov", 4.2),
    mkTeam("nox-14", "Gold", "Tao Huang", 4.0, "Charlie Mitchell", 4.3),
    mkTeam("nox-15", "Gold", "Diego Navarro", 4.1, "Pavel Morozov", 3.9),
    mkTeam("nox-16", "Gold", "Bo Zhao", 3.8, "William Ward", 4.0),
    mkTeam("nox-17", "Gold", "Javier Gómez", 3.9, "Roman Lebedev", 3.7),
    mkTeam("nox-18", "Gold", "Gang Wu", 3.6, "Henry Foster", 3.9),
    mkTeam("nox-19", "Gold", "Carlos Ruiz", 3.7, "Anton Novikov", 3.5),
    mkTeam("nox-20", "Gold", "Kai Zhou", 3.6, "Daniel Brooks", 3.8),

    // Silver (2.5 – 3.5)
    mkTeam("nox-21", "Silver", "Pablo Díaz", 3.4, "Igor Fedorov", 3.2),
    mkTeam("nox-22", "Silver", "Lin Sun", 3.0, "Samuel Hayes", 3.3),
    mkTeam("nox-23", "Silver", "Hugo Morales", 3.1, "Yuri Orlov", 2.9),
    mkTeam("nox-24", "Silver", "Hui Lin", 2.8, "Edward Coleman", 3.0),
    mkTeam("nox-25", "Silver", "Álvaro Ortega", 2.9, "Maxim Pavlov", 2.7),
    mkTeam("nox-26", "Silver", "Jie Guo", 2.6, "Oscar Reed", 2.9),
    mkTeam("nox-27", "Silver", "Mateo Castro", 2.7, "Vadim Makarov", 2.5),
    mkTeam("nox-28", "Silver", "Ning He", 2.6, "Lewis Spencer", 2.8),

    // Bronze (below 2.5)
    mkTeam("nox-29", "Bronze", "Hugo Vega", 2.4, "Pyotr Sergeev", 2.2),
    mkTeam("nox-30", "Bronze", "Diego Reyes", 2.1, "Toby Bell", 2.3),
    mkTeam("nox-31", "Bronze", "Cheng Xu", 1.9, "Max Gray", 2.2),
    mkTeam("nox-32", "Bronze", "Pablo Ramos", 1.8, "Artem Volkov", 2.0)
  ];

  var SUPER_PADEL_TEAMS = [
    mkTeam("spf-1", "Platinum",  "Alexei Romanov", 7.4, "Bruno Costa", 7.0),
    mkTeam("spf-2", "Platinum",  "Marco Bianchi", 6.9, "Liang Chen", 6.7),
    mkTeam("spf-3", "High Gold", "Diego Salas", 5.8, "Tom Harding", 5.5),
    mkTeam("spf-4", "High Gold", "Wei Lu", 5.0, "Pavel Sorokin", 4.8),
    mkTeam("spf-5", "Gold",      "Juan Mora", 4.2, "Oleg Titov", 3.9),
    mkTeam("spf-6", "Silver",    "Hong Ma", 3.0, "Ben Clarke", 2.8)
  ];

  var JUNGLE_PADEL_TEAMS = [
    mkTeam("jpc-1", "Platinum",  "Andrés Vidal", 7.1, "Sergei Belov", 6.8),
    mkTeam("jpc-2", "High Gold", "Felipe Cruz", 5.6, "Jon Adams", 5.2),
    mkTeam("jpc-3", "Gold",      "Tian Zhao", 4.1, "Rafael Luna", 3.8),
    mkTeam("jpc-4", "Silver",    "Dmitri Sysoev", 3.1, "Owen Price", 2.9),
    mkTeam("jpc-5", "Bronze",    "Lu Feng", 2.2, "Sam Webb", 2.0)
  ];

  window.PADELSWAP_DATA = {
    // Flat fee charged when a card is sold back to PadelSwap.
    sellBackFeePct: 5,

    featuredTournamentId: "nox-cup",

    tiers: TIERS,

    tournaments: [
      {
        id: "nox-cup",
        name: "The Nox Cup",
        location: "Madrid, Spain",
        startDate: "2026-06-12",
        prizePool: 180000,
        format: "World Cup format · 32 teams · single-elimination knockout bracket",
        featured: true,
        teams: NOX_TEAMS
      },
      {
        id: "super-padel-finals",
        name: "Super Padel Finals",
        location: "Barcelona, Spain",
        startDate: "2026-07-03",
        prizePool: 250000,
        format: "Season-ending finals · invitational bracket",
        featured: false,
        teams: SUPER_PADEL_TEAMS
      },
      {
        id: "jungle-padel-cup",
        name: "Jungle Padel Cup",
        location: "Tulum, Mexico",
        startDate: "2026-08-21",
        prizePool: 120000,
        format: "Open draw · knockout bracket",
        featured: false,
        teams: JUNGLE_PADEL_TEAMS
      }
    ],

    // Open challenges sitting in the Swap Arena, posted by other players.
    // Each card is staked by its owner; whoever's team wins on court takes both.
    arenaMatches: [
      { id: "m1", tournamentId: "nox-cup", opponent: "padel_marco", stakedTeamId: "nox-3" },
      { id: "m2", tournamentId: "nox-cup", opponent: "smashqueen", stakedTeamId: "nox-9" },
      { id: "m3", tournamentId: "super-padel-finals", opponent: "bandeja_bob", stakedTeamId: "spf-4" }
    ]
  };
})();
