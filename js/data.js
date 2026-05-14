// PadelSwap seed data — tournaments, team cards and arena matches.
// In a real build this would come from an API; here it's a static catalogue.

window.PADELSWAP_DATA = {
  // Flat fee charged when a card is sold back to PadelSwap.
  sellBackFeePct: 5,

  featuredTournamentId: "nox-cup",

  tournaments: [
    {
      id: "nox-cup",
      name: "The Nox Cup",
      location: "Madrid, Spain",
      startDate: "2026-06-12",
      prizePool: 180000,
      featured: true,
      teams: [
        { id: "nox-1", team: "Galán / Chingotto", players: "A. Galán & F. Chingotto", seed: "Seed 1", price: 420 },
        { id: "nox-2", team: "Coello / Tapia", players: "A. Coello & A. Tapia", seed: "Seed 2", price: 405 },
        { id: "nox-3", team: "Stupaczuk / Di Nenno", players: "M. Stupaczuk & F. Di Nenno", seed: "Seed 3", price: 260 },
        { id: "nox-4", team: "Garrido / Yanguas", players: "J. Garrido & J. Yanguas", seed: "Seed 4", price: 190 },
        { id: "nox-5", team: "Momo / Ramirez", players: "M. González & A. Ramírez", seed: "Seed 6", price: 120 },
        { id: "nox-6", team: "Lebrón / Galán Jr.", players: "J. Lebrón & P. Galán", seed: "Seed 8", price: 95 },
        { id: "nox-7", team: "Sanz / Nieto", players: "P. Sanz & M. Nieto", seed: "Seed 11", price: 60 },
        { id: "nox-8", team: "Ruiz / Alfonso", players: "C. Ruiz & A. Alfonso", seed: "Seed 14", price: 35 }
      ]
    },
    {
      id: "super-padel-finals",
      name: "Super Padel Finals",
      location: "Barcelona, Spain",
      startDate: "2026-07-03",
      prizePool: 250000,
      featured: false,
      teams: [
        { id: "spf-1", team: "Coello / Tapia", players: "A. Coello & A. Tapia", seed: "Seed 1", price: 460 },
        { id: "spf-2", team: "Galán / Chingotto", players: "A. Galán & F. Chingotto", seed: "Seed 2", price: 430 },
        { id: "spf-3", team: "Lebrón / Stupaczuk", players: "J. Lebrón & M. Stupaczuk", seed: "Seed 3", price: 240 },
        { id: "spf-4", team: "Di Nenno / Sanyo", players: "F. Di Nenno & S. Gutiérrez", seed: "Seed 4", price: 175 },
        { id: "spf-5", team: "Garrido / Yanguas", players: "J. Garrido & J. Yanguas", seed: "Seed 5", price: 110 },
        { id: "spf-6", team: "Cardona / Leal", players: "L. Cardona & V. Leal", seed: "Seed 9", price: 55 }
      ]
    },
    {
      id: "jungle-padel-cup",
      name: "Jungle Padel Cup",
      location: "Tulum, Mexico",
      startDate: "2026-08-21",
      prizePool: 120000,
      featured: false,
      teams: [
        { id: "jpc-1", team: "Tapia / Coello", players: "A. Tapia & A. Coello", seed: "Seed 1", price: 380 },
        { id: "jpc-2", team: "Chingotto / Galán", players: "F. Chingotto & A. Galán", seed: "Seed 2", price: 365 },
        { id: "jpc-3", team: "Yanguas / Garrido", players: "J. Yanguas & J. Garrido", seed: "Seed 3", price: 150 },
        { id: "jpc-4", team: "Nieto / Sanz", players: "M. Nieto & P. Sanz", seed: "Seed 5", price: 80 },
        { id: "jpc-5", team: "Gil / Mena", players: "T. Gil & D. Mena", seed: "Seed 10", price: 40 }
      ]
    }
  ],

  // Open challenges sitting in the Swap Arena, posted by other players.
  // Each card is staked by its owner; whoever's team wins on court takes both.
  arenaMatches: [
    {
      id: "m1",
      tournamentId: "nox-cup",
      opponent: "padel_marco",
      stakedTeamId: "nox-3",
      stakedValue: 260
    },
    {
      id: "m2",
      tournamentId: "nox-cup",
      opponent: "smashqueen",
      stakedTeamId: "nox-5",
      stakedValue: 120
    },
    {
      id: "m3",
      tournamentId: "super-padel-finals",
      opponent: "bandeja_bob",
      stakedTeamId: "spf-4",
      stakedValue: 175
    }
  ]
};
