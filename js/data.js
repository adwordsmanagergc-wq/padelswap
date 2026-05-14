// PadelSwap seed data — tournaments, tiers, team cards and arena matches.
// Each tournament fields 32 two-player teams in EVERY colour category
// (Platinum, High Gold, Gold, Silver, Bronze), and each category runs its
// own 32-team World Cup style single-elimination knockout to one champion.
//
// Team data is generated deterministically (no randomness) so card IDs,
// prices and Playtomic scores stay stable across page reloads.

(function () {
  "use strict";

  // ---- Tier definitions (Playtomic skill bands) ----
  var TIERS = [
    { id: "Platinum",  label: "Platinum",  range: "Playtomic 6.0 – 7.5", band: [6.0, 7.5] },
    { id: "High Gold", label: "High Gold", range: "Playtomic 4.5 – 6.0", band: [4.5, 6.0] },
    { id: "Gold",      label: "Gold",      range: "Playtomic 3.5 – 4.5", band: [3.5, 4.5] },
    { id: "Silver",    label: "Silver",    range: "Playtomic 2.5 – 3.5", band: [2.5, 3.5] },
    { id: "Bronze",    label: "Bronze",    range: "Playtomic below 2.5", band: [1.5, 2.5] }
  ];

  // ---- Name pools: a deliberate mix of origins ----
  var ORIGINS = {
    spanish: {
      first: ["Diego", "Javier", "Carlos", "Mateo", "Pablo", "Hugo", "Álvaro", "Andrés",
              "Felipe", "Juan", "Rafael", "Sergio", "Marcos", "Iván", "Bruno", "Lucas"],
      last: ["García", "Martínez", "Fernández", "López", "Sánchez", "Romero", "Torres", "Navarro",
             "Gómez", "Ruiz", "Díaz", "Morales", "Ortega", "Castro", "Vega", "Reyes"]
    },
    russian: {
      first: ["Dmitri", "Sergei", "Mikhail", "Andrei", "Nikolai", "Ivan", "Alexei", "Pavel",
              "Roman", "Anton", "Yuri", "Maxim", "Vadim", "Igor", "Oleg", "Artem"],
      last: ["Volkov", "Petrov", "Ivanov", "Smirnov", "Sokolov", "Popov", "Kuznetsov", "Morozov",
             "Lebedev", "Novikov", "Fedorov", "Orlov", "Pavlov", "Makarov", "Sergeev", "Belov"]
    },
    chinese: {
      first: ["Wei", "Hao", "Jun", "Lei", "Ming", "Feng", "Tao", "Bo",
              "Gang", "Kai", "Hui", "Jie", "Ning", "Cheng", "Tian", "Liang"],
      last: ["Wang", "Li", "Zhang", "Chen", "Liu", "Yang", "Huang", "Zhao",
             "Wu", "Zhou", "Sun", "Lin", "Guo", "He", "Xu", "Ma"]
    },
    english: {
      first: ["James", "Oliver", "Harry", "George", "Jack", "Thomas", "Charlie", "William",
              "Henry", "Daniel", "Samuel", "Edward", "Oscar", "Lewis", "Toby", "Max"],
      last: ["Carter", "Bennett", "Hughes", "Walker", "Turner", "Cooper", "Mitchell", "Ward",
             "Foster", "Brooks", "Hayes", "Coleman", "Reed", "Spencer", "Bell", "Gray"]
    }
  };
  var ORIGIN_KEYS = ["spanish", "russian", "chinese", "english"];

  function round1(n) { return Math.round(n * 10) / 10; }

  function mkPlayer(originKey, seed) {
    var o = ORIGINS[originKey];
    return o.first[seed % 16] + " " + o.last[(seed * 7 + 5) % 16];
  }

  function surname(name) {
    return name.split(" ").slice(-1)[0];
  }

  // ---- Team builder: derives team name + card price from the two players ----
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

  // ---- Build 32 teams for one colour category ----
  function buildTier(prefix, tierIndex, tier) {
    var band = tier.band;
    var steps = Math.round((band[1] - band[0]) * 10);
    var teams = [];
    for (var t = 0; t < 32; t++) {
      var originA = ORIGIN_KEYS[(tierIndex * 2 + t) % 4];
      var originB = ORIGIN_KEYS[(tierIndex * 2 + t + 1 + (t % 3)) % 4];
      var scoreA = round1(band[0] + ((t * 7 + tierIndex * 3) % steps) * 0.1);
      var scoreB = round1(band[0] + ((t * 13 + tierIndex * 5 + 4) % steps) * 0.1);
      var nameA = mkPlayer(originA, t * 3 + tierIndex);
      var nameB = mkPlayer(originB, t * 5 + tierIndex + 7);
      teams.push(mkTeam(prefix + "-t" + tierIndex + "-" + (t + 1), tier.id, nameA, scoreA, nameB, scoreB));
    }
    return teams;
  }

  // ---- A full tournament: 32 teams in each of the 5 colour categories ----
  function buildTournamentTeams(prefix) {
    var all = [];
    TIERS.forEach(function (tier, tierIndex) {
      all = all.concat(buildTier(prefix, tierIndex, tier));
    });
    return all;
  }

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
        format: "World Cup format · 32 teams per colour category · single-elimination knockout",
        featured: true,
        teams: buildTournamentTeams("nox")
      },
      {
        id: "super-padel-finals",
        name: "Super Padel Finals",
        location: "Barcelona, Spain",
        startDate: "2026-07-03",
        prizePool: 250000,
        format: "Season-ending finals · 32 teams per colour category · knockout bracket",
        featured: false,
        teams: buildTournamentTeams("spf")
      },
      {
        id: "jungle-padel-cup",
        name: "Jungle Padel Cup",
        location: "Tulum, Mexico",
        startDate: "2026-08-21",
        prizePool: 120000,
        format: "Open draw · 32 teams per colour category · knockout bracket",
        featured: false,
        teams: buildTournamentTeams("jpc")
      }
    ],

    // Open challenges sitting in the Swap Arena, posted by other players.
    // Each card is staked by its owner; whoever's team wins on court takes both.
    arenaMatches: [
      { id: "m1", tournamentId: "nox-cup", opponent: "padel_marco", stakedTeamId: "nox-t0-3" },
      { id: "m2", tournamentId: "nox-cup", opponent: "smashqueen", stakedTeamId: "nox-t1-7" },
      { id: "m3", tournamentId: "super-padel-finals", opponent: "bandeja_bob", stakedTeamId: "spf-t1-4" }
    ]
  };
})();
