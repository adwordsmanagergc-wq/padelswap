// PadelSwap — front-end prototype logic.
// State (wallet, owned cards, arena) is persisted to localStorage so a demo
// session survives a page reload. No real money or network calls are involved.

(function () {
  "use strict";

  var DATA = window.PADELSWAP_DATA;
  var STORAGE_KEY = "padelswap.state.v1";

  // ---------- State ----------
  var state = loadState();

  function defaultState() {
    return {
      balance: 0,
      // owned cards: [{ uid, tournamentId, teamId }]
      cards: [],
      // arena matches still open (clone of seed data, mutated as they resolve)
      arena: DATA.arenaMatches.map(function (m) { return Object.assign({}, m); })
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      if (!parsed.arena) parsed.arena = defaultState().arena;
      return parsed;
    } catch (e) {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ---------- Lookups ----------
  function tournamentById(id) {
    return DATA.tournaments.find(function (t) { return t.id === id; });
  }

  function teamById(tournamentId, teamId) {
    var t = tournamentById(tournamentId);
    if (!t) return null;
    return t.teams.find(function (tm) { return tm.id === teamId; });
  }

  function ownsTeam(tournamentId, teamId) {
    return state.cards.some(function (c) {
      return c.tournamentId === tournamentId && c.teamId === teamId;
    });
  }

  function sellBackValue(price) {
    return price - price * (DATA.sellBackFeePct / 100);
  }

  function playersLabel(tm) {
    return tm.players.map(function (p) { return p.name; }).join(" & ");
  }

  function tierClass(tier) {
    return "tier-" + tier.toLowerCase().replace(/\s+/g, "-");
  }

  function tierBadge(tier) {
    return '<span class="tier-badge ' + tierClass(tier) + '">' + tier + '</span>';
  }

  // ---------- Formatting ----------
  function money(n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function compactMoney(n) {
    if (n >= 1000) return "$" + (n / 1000).toFixed(0) + "k";
    return "$" + n;
  }

  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  }

  function uid() {
    return "c_" + Math.random().toString(36).slice(2, 10);
  }

  // ---------- Toast ----------
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2800);
  }

  // ---------- Render: wallet ----------
  function renderWallet() {
    document.getElementById("walletBalance").textContent = money(state.balance);
  }

  // ---------- Tier helpers ----------
  function teamsByTier(t) {
    return DATA.tiers.map(function (tier) {
      return {
        tier: tier,
        teams: t.teams.filter(function (tm) { return tm.tier === tier.id; })
      };
    }).filter(function (g) { return g.teams.length > 0; });
  }

  // ---------- Render: featured tournament ----------
  function renderFeatured() {
    var t = tournamentById(DATA.featuredTournamentId);
    var host = document.getElementById("featuredTournament");
    if (!t) { host.innerHTML = ""; return; }

    var floorPrice = Math.min.apply(null, t.teams.map(function (x) { return x.price; }));
    var groups = teamsByTier(t);

    var tierChips = groups.map(function (g) {
      return '<span class="tier-chip">' + tierBadge(g.tier.id) +
        '<strong>' + g.teams.length + '</strong> teams</span>';
    }).join("");

    host.innerHTML =
      '<div class="featured-banner clickable" data-action="open-tournament" data-tournament="' + t.id + '">' +
        '<div>' +
          '<span class="featured-tag">Next up</span>' +
          '<h3>' + t.name + '</h3>' +
          '<p class="featured-meta">' + t.location + " &middot; Starts " + formatDate(t.startDate) + '</p>' +
          '<p class="featured-meta">' + t.format + '</p>' +
        '</div>' +
        '<div class="featured-stats">' +
          '<div><div class="stat-val">' + compactMoney(t.prizePool) + '</div><div class="stat-label">Prize pool</div></div>' +
          '<div><div class="stat-val">' + t.teams.length + '</div><div class="stat-label">Team cards</div></div>' +
          '<div><div class="stat-val">' + money(floorPrice) + '</div><div class="stat-label">Floor price</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="featured-cards">' +
        '<h4>Tiers in this tournament</h4>' +
        '<div class="tier-summary">' + tierChips + '</div>' +
        '<button class="btn btn-primary" style="margin-top:18px" ' +
          'data-action="open-tournament" data-tournament="' + t.id + '">' +
          'View all ' + t.teams.length + ' team cards &rarr;' +
        '</button>' +
      '</div>';
  }

  // ---------- Render: other tournaments ----------
  function renderOthers() {
    var host = document.getElementById("otherTournaments");
    var others = DATA.tournaments.filter(function (t) { return t.id !== DATA.featuredTournamentId; });

    host.innerHTML = others.map(function (t) {
      return (
        '<div class="event">' +
          '<div class="event-top">' +
            '<div>' +
              '<h3>' + t.name + '</h3>' +
              '<p class="event-meta">' + t.location + " &middot; " + formatDate(t.startDate) + '</p>' +
            '</div>' +
            '<span class="event-badge">' + compactMoney(t.prizePool) + ' pool</span>' +
          '</div>' +
          '<div class="event-cards">' +
            t.teams.map(function (tm) { return teamRowHtml(t.id, tm); }).join("") +
          '</div>' +
          '<button class="link-btn" style="margin-top:14px" ' +
            'data-action="open-tournament" data-tournament="' + t.id + '">' +
            'View full tournament &rarr;' +
          '</button>' +
        '</div>'
      );
    }).join("");
  }

  // ---------- Render: a compact team row (event list) ----------
  function teamRowHtml(tournamentId, tm) {
    var owned = ownsTeam(tournamentId, tm.id);
    return (
      '<div class="card-row">' +
        '<div>' +
          '<div class="cr-team">' + tm.team + " " + tierBadge(tm.tier) + '</div>' +
          '<div class="cr-players">' + playersLabel(tm) + '</div>' +
        '</div>' +
        '<div class="cr-right">' +
          '<span class="cr-price">' + money(tm.price) + '</span>' +
          '<button class="btn btn-ghost btn-sm" data-action="buy" ' +
            'data-tournament="' + tournamentId + '" data-team="' + tm.id + '">' +
            (owned ? 'Buy another' : 'Buy') +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ---------- Render: detailed buyable team card ----------
  function detailTeamCardHtml(tournamentId, tm) {
    var owned = ownsTeam(tournamentId, tm.id);
    var playerRows = tm.players.map(function (p) {
      return (
        '<div class="tc-player">' +
          '<span class="tc-player-name">' + p.name + '</span>' +
          '<span><span class="tc-score-label">Playtomic</span>' +
            '<span class="tc-score">' + p.score.toFixed(1) + '</span></span>' +
        '</div>'
      );
    }).join("");

    return (
      '<div class="team-card">' +
        '<div class="tc-head">' +
          '<div class="tc-team">' + tm.team + '</div>' +
          tierBadge(tm.tier) +
        '</div>' +
        '<div class="tc-players-list">' + playerRows + '</div>' +
        '<div class="tc-row">' +
          '<span class="tc-price">' + money(tm.price) + ' <small>card</small></span>' +
          (owned ? '<span class="tc-owned">In your locker</span>' : '') +
        '</div>' +
        '<div class="tc-foot">' +
          '<button class="btn btn-primary btn-sm" data-action="buy" ' +
            'data-tournament="' + tournamentId + '" data-team="' + tm.id + '">' +
            (owned ? 'Buy another card' : 'Buy team card') +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ---------- Render: knockout bracket for one colour group ----------
  // Teams are paired in seed order; later rounds are TBD until the
  // tournament is played. Each colour group resolves to one champion.
  function bracketHtml(teams) {
    var rounds = [];
    var first = [];
    for (var i = 0; i < teams.length; i += 2) {
      first.push([teams[i], teams[i + 1]]);
    }
    rounds.push(first);

    var matchCount = first.length;
    while (matchCount > 1) {
      matchCount = matchCount / 2;
      var blanks = [];
      for (var j = 0; j < matchCount; j++) blanks.push([null, null]);
      rounds.push(blanks);
    }

    function slot(tm) {
      if (!tm) return '<div class="bk-team bk-tbd">TBD</div>';
      return '<div class="bk-team">' + tm.team + '</div>';
    }

    var cols = rounds.map(function (matches) {
      var teamsInRound = matches.length * 2;
      var label = teamsInRound === 2 ? "Final"
        : teamsInRound === 4 ? "Semi-finals"
        : "Round of " + teamsInRound;
      var matchHtml = matches.map(function (m) {
        return '<div class="bk-match">' + slot(m[0]) + slot(m[1]) + '</div>';
      }).join("");
      return '<div class="bk-col"><div class="bk-round">' + label + '</div>' + matchHtml + '</div>';
    });

    cols.push(
      '<div class="bk-col"><div class="bk-round">Champion</div>' +
        '<div class="bk-match bk-champ"><div class="bk-team bk-tbd">TBD</div></div>' +
      '</div>'
    );

    return '<div class="bracket">' + cols.join("") + '</div>';
  }

  // ---------- Render: tournament detail view ----------
  var LANDING_SECTIONS = [".hero", ".how", "#tournaments", "#my-cards", "#arena"];

  function openTournament(id) {
    var t = tournamentById(id);
    if (!t) return;

    var floorPrice = Math.min.apply(null, t.teams.map(function (x) { return x.price; }));
    var groups = teamsByTier(t);

    var tierBlocks = groups.map(function (g) {
      return (
        '<div class="tier-block">' +
          '<div class="tier-head">' +
            tierBadge(g.tier.id) +
            '<span class="tier-range">' + g.tier.range + '</span>' +
            '<span class="tier-count">' + g.teams.length + ' teams</span>' +
          '</div>' +
          '<p class="bracket-caption">Team vs team knockout &mdash; winners advance to one ' +
            g.tier.id + ' champion.</p>' +
          bracketHtml(g.teams) +
          '<div class="card-grid">' +
            g.teams.map(function (tm) { return detailTeamCardHtml(t.id, tm); }).join("") +
          '</div>' +
        '</div>'
      );
    }).join("");

    document.getElementById("detailContent").innerHTML =
      '<div class="detail-head">' +
        '<div>' +
          '<span class="featured-tag">' + t.format + '</span>' +
          '<h2>' + t.name + '</h2>' +
          '<p class="featured-meta">' + t.location + " &middot; Starts " + formatDate(t.startDate) + '</p>' +
        '</div>' +
        '<div class="featured-stats">' +
          '<div><div class="stat-val">' + compactMoney(t.prizePool) + '</div><div class="stat-label">Prize pool</div></div>' +
          '<div><div class="stat-val">' + t.teams.length + '</div><div class="stat-label">Team cards</div></div>' +
          '<div><div class="stat-val">' + money(floorPrice) + '</div><div class="stat-label">Floor price</div></div>' +
        '</div>' +
      '</div>' +
      tierBlocks;

    LANDING_SECTIONS.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) el.hidden = true;
    });
    document.getElementById("tournamentDetail").hidden = false;
    window.scrollTo(0, 0);
  }

  function closeDetail() {
    document.getElementById("tournamentDetail").hidden = true;
    LANDING_SECTIONS.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) el.hidden = false;
    });
    window.scrollTo(0, 0);
  }

  // ---------- Render: my cards ----------
  function renderMyCards() {
    var host = document.getElementById("myCards");
    if (!state.cards.length) {
      host.innerHTML = '<div class="empty">No cards yet. Buy a team card from a tournament above to get started.</div>';
      return;
    }

    host.innerHTML = state.cards.map(function (c) {
      var tm = teamById(c.tournamentId, c.teamId);
      var t = tournamentById(c.tournamentId);
      if (!tm || !t) return "";
      var back = sellBackValue(tm.price);
      return (
        '<div class="team-card">' +
          '<div class="tc-head">' +
            '<div>' +
              '<div class="tc-team">' + tm.team + '</div>' +
              '<div class="tc-players">' + t.name + '</div>' +
            '</div>' +
            tierBadge(tm.tier) +
          '</div>' +
          '<div class="tc-players">' + playersLabel(tm) + '</div>' +
          '<div class="tc-row">' +
            '<span class="muted">Sell back: <strong style="color:var(--text)">' + money(back) + '</strong> ' +
              '(after ' + DATA.sellBackFeePct + '% fee)</span>' +
          '</div>' +
          '<div class="tc-foot">' +
            '<button class="btn btn-ghost btn-sm" data-action="sell" data-uid="' + c.uid + '">Sell back</button>' +
          '</div>' +
        '</div>'
      );
    }).join("");
  }

  // ---------- Render: arena ----------
  function renderArena() {
    var host = document.getElementById("arena");
    if (!state.arena.length) {
      host.innerHTML = '<div class="empty">No open challenges right now. Check back once more cards are staked.</div>';
      return;
    }

    host.innerHTML = state.arena.map(function (m) {
      var t = tournamentById(m.tournamentId);
      var staked = teamById(m.tournamentId, m.stakedTeamId);
      if (!t || !staked) return "";

      var eligible = state.cards.filter(function (c) { return c.tournamentId === m.tournamentId; });
      var canPlay = eligible.length > 0;

      var rightControl;
      if (canPlay) {
        var options = eligible.map(function (c) {
          var ct = teamById(c.tournamentId, c.teamId);
          return '<option value="' + c.uid + '">' + ct.team + ' (' + money(ct.price) + ')</option>';
        }).join("");
        rightControl =
          '<select class="arena-select" data-match="' + m.id + '" ' +
            'style="background:var(--bg-elev);border:1px solid var(--border);color:var(--text);border-radius:9px;padding:8px;font-family:inherit">' +
            options +
          '</select>' +
          '<button class="btn btn-primary btn-sm" data-action="challenge" data-match="' + m.id + '">Stake &amp; play</button>';
      } else {
        rightControl = '<span class="arena-opponent">Buy a ' + t.name + ' card to challenge</span>';
      }

      return (
        '<div class="arena-match">' +
          '<div class="arena-side">' +
            '<div class="as-label">' + t.name + ' &middot; staked by @' + m.opponent + '</div>' +
            '<div class="as-team">' + staked.team + ' ' + tierBadge(staked.tier) + '</div>' +
            '<div class="as-players">' + playersLabel(staked) + '</div>' +
          '</div>' +
          '<span class="arena-vs">VS</span>' +
          '<div class="arena-side" style="text-align:right">' +
            '<div class="as-label">Your stake</div>' +
            '<div style="display:flex;gap:8px;justify-content:flex-end;align-items:center;flex-wrap:wrap;margin-top:4px">' +
              rightControl +
            '</div>' +
          '</div>' +
          '<div class="arena-pot">' +
            '<div class="ap-val">' + money(staked.price) + '</div>' +
            '<div class="ap-label">Card at stake</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");
  }

  function renderAll() {
    renderWallet();
    renderFeatured();
    renderOthers();
    renderMyCards();
    renderArena();
    saveState();
  }

  // ---------- Actions ----------
  function buyCard(tournamentId, teamId) {
    var tm = teamById(tournamentId, teamId);
    if (!tm) return;
    if (state.balance < tm.price) {
      toast("Not enough balance — add funds to buy this card.");
      openFundsModal();
      return;
    }
    state.balance -= tm.price;
    state.cards.push({ uid: uid(), tournamentId: tournamentId, teamId: teamId });
    toast("Bought " + tm.team + " card for " + money(tm.price) + ".");
    refresh();
  }

  function sellCard(cardUid) {
    var idx = state.cards.findIndex(function (c) { return c.uid === cardUid; });
    if (idx === -1) return;
    var c = state.cards[idx];
    var tm = teamById(c.tournamentId, c.teamId);
    var back = sellBackValue(tm.price);
    state.cards.splice(idx, 1);
    state.balance += back;
    toast("Sold " + tm.team + " back for " + money(back) + " (5% fee applied).");
    refresh();
  }

  function challenge(matchId, cardUid) {
    var match = state.arena.find(function (m) { return m.id === matchId; });
    var cardIdx = state.cards.findIndex(function (c) { return c.uid === cardUid; });
    if (!match || cardIdx === -1) return;

    var myCard = state.cards[cardIdx];
    var myTeam = teamById(myCard.tournamentId, myCard.teamId);
    var theirTeam = teamById(match.tournamentId, match.stakedTeamId);

    // Win probability is weighted by relative card value — pricier teams are
    // favoured, mirroring real seeding, but upsets are always possible.
    var winChance = myTeam.price / (myTeam.price + theirTeam.price);
    var won = Math.random() < winChance;

    state.arena = state.arena.filter(function (m) { return m.id !== matchId; });

    if (won) {
      state.cards.push({
        uid: uid(),
        tournamentId: match.tournamentId,
        teamId: match.stakedTeamId
      });
      toast("You won! " + theirTeam.team + " card moved to your locker.");
    } else {
      state.cards.splice(cardIdx, 1);
      toast("You lost the swap — " + myTeam.team + " card went to @" + match.opponent + ".");
    }
    refresh();
  }

  // Re-render everything, keeping the detail view in sync if it is open.
  function refresh() {
    renderAll();
    var detail = document.getElementById("tournamentDetail");
    if (!detail.hidden && currentDetailId) openTournament(currentDetailId);
  }

  var currentDetailId = null;

  // ---------- Add Funds modal ----------
  var modal = document.getElementById("fundsModal");

  function openFundsModal() { modal.hidden = false; }
  function closeFundsModal() { modal.hidden = true; }

  function depositFunds() {
    var activeMethod = document.querySelector(".tab.active").dataset.method;
    var amount, source;
    if (activeMethod === "bank") {
      amount = parseFloat(document.getElementById("bankAmount").value);
      source = "bank transfer from " + document.getElementById("bankCountry").value;
    } else {
      amount = parseFloat(document.getElementById("cryptoAmount").value);
      source = document.getElementById("cryptoAsset").value + " deposit";
    }
    if (!amount || amount <= 0) {
      toast("Enter a valid amount.");
      return;
    }
    state.balance += amount;
    closeFundsModal();
    toast("Added " + money(amount) + " via " + source + ".");
    refresh();
  }

  // ---------- Event wiring ----------
  document.getElementById("addFundsBtn").addEventListener("click", openFundsModal);
  document.getElementById("confirmFunds").addEventListener("click", depositFunds);
  document.getElementById("backToList").addEventListener("click", function () {
    currentDetailId = null;
    closeDetail();
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.closest("[data-close]")) closeFundsModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeFundsModal();
  });

  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var method = tab.dataset.method;
      document.querySelectorAll(".tab-panel").forEach(function (p) {
        p.hidden = p.dataset.panel !== method;
      });
    });
  });

  // Delegated clicks for buy / sell / challenge / open-tournament
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.dataset.action;

    if (action === "buy") {
      buyCard(btn.dataset.tournament, btn.dataset.team);
    } else if (action === "sell") {
      sellCard(btn.dataset.uid);
    } else if (action === "challenge") {
      var matchId = btn.dataset.match;
      var select = document.querySelector('.arena-select[data-match="' + matchId + '"]');
      if (select) challenge(matchId, select.value);
    } else if (action === "open-tournament") {
      currentDetailId = btn.dataset.tournament;
      openTournament(currentDetailId);
    }
  });

  // ---------- Boot ----------
  renderAll();
})();
