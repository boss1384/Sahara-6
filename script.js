const API_KEY = "da01d7158a60be461c607c6d31470b4e";
const BASE_URL = "https://v3.football.api-sports.io";

// =======================
// SAFE API CALL
// =======================
async function apiCall(endpoint, params = {}) {

    try {

        const url = new URL(BASE_URL + endpoint);

        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "x-apisports-key": API_KEY
            }
        });

        if (!res.ok) {
            console.log("API Error");
            return null;
        }

        const data = await res.json();
        return data.response;

    } catch (err) {
        console.log("Network Error:", err);
        return null;
    }
}

// =======================
// SHOW SECTIONS
// =======================
function showSection(section) {

    document.querySelectorAll(".section").forEach(s => {
        s.classList.remove("active");
    });

    const target = document.getElementById(section + "-section");
    if (target) target.classList.add("active");

    if (section === "live") loadLiveMatches();
    if (section === "fixtures") loadFixtures();
    if (section === "standings") loadLeagues();
}

// =======================
// LIVE MATCHES (FIXED)
// =======================
async function loadLiveMatches() {

    const container = document.getElementById("live-matches");

    if (!container) return;

    container.innerHTML = "<p>Loading live matches...</p>";

    const data = await apiCall("/fixtures", { live: "all" });

    container.innerHTML = "";

    if (!data || data.length === 0) {
        container.innerHTML = "<p>No live matches right now ⚽</p>";
        return;
    }

    data.forEach(match => {
        container.appendChild(createCard(match, true));
    });
}

// =======================
// FIXTURES
// =======================
async function loadFixtures() {

    const container = document.getElementById("fixtures");

    container.innerHTML = "Loading fixtures...";

    const data = await apiCall("/fixtures", { next: 20 });

    container.innerHTML = "";

    if (!data) {
        container.innerHTML = "<p>No fixtures found</p>";
        return;
    }

    data.forEach(match => {
        container.appendChild(createCard(match, false));
    });
}

// =======================
// CREATE MATCH CARD
// =======================
function createCard(match, live = false) {

    const card = document.createElement("div");
    card.className = "match-card";

    const status = live
        ? `🔴 LIVE ${match.fixture.status.elapsed || 0}'`
        : new Date(match.fixture.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    card.innerHTML = `
        <div class="match-header">
            <div>${match.league.name}</div>
            <div>${status}</div>
        </div>

        <div class="teams">

            <div class="team">
                <img src="${match.teams.home.logo}" class="team-logo">
                <div class="team-name">${match.teams.home.name}</div>
            </div>

            <div class="score">
                ${match.goals.home ?? "-"} : ${match.goals.away ?? "-"}
            </div>

            <div class="team">
                <img src="${match.teams.away.logo}" class="team-logo">
                <div class="team-name">${match.teams.away.name}</div>
            </div>

        </div>
    `;

    card.onclick = () => openMatch(match);

    return card;
}

// =======================
// OPEN MATCH
// =======================
function openMatch(match) {

    document.getElementById("team-modal").style.display = "block";

    document.getElementById("modal-team-header").innerHTML = `
        <h2 style="text-align:center;">
            ${match.teams.home.name} VS ${match.teams.away.name}
        </h2>
    `;

    document.getElementById("live-video").src =
        "https://www.youtube.com/embed/dQw4w9WgXcQ";
}

// =======================
// STANDINGS (SAFE)
// =======================
async function loadLeagues() {

    const select = document.getElementById("league-select");

    if (!select) return;

    const data = await apiCall("/leagues");

    select.innerHTML = "<option>Select League</option>";

    if (!data) return;

    data.slice(0, 20).forEach(l => {

        const opt = document.createElement("option");
        opt.value = l.league.id;
        opt.textContent = `${l.league.name} (${l.country.name})`;

        select.appendChild(opt);
    });
}

// =======================
// LOAD STANDINGS
// =======================
async function loadStandings() {

    const id = document.getElementById("league-select").value;

    if (!id) return;

    const data = await apiCall("/standings", {
        league: id,
        season: "2025"
    });

    const tbody = document.getElementById("standings-body");

    tbody.innerHTML = "";

    if (!data || !data[0]) {
        tbody.innerHTML = "<tr><td colspan='10'>No standings</td></tr>";
        return;
    }

    data[0].league.standings[0].forEach(team => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${team.rank}</td>
            <td>${team.team.name}</td>
            <td>${team.all.played}</td>
            <td>${team.all.win}</td>
            <td>${team.all.draw}</td>
            <td>${team.all.lose}</td>
            <td>${team.all.goals.for}</td>
            <td>${team.all.goals.against}</td>
            <td>${team.goalsDiff}</td>
            <td><b>${team.points}</b></td>
        `;

        tbody.appendChild(tr);
    });
}

// =======================
// SEARCH
// =======================
function searchTeams() {

    const val = document.getElementById("searchInput").value.toLowerCase();

    document.querySelectorAll(".match-card").forEach(card => {

        const text = card.innerText.toLowerCase();

        card.style.display = text.includes(val) ? "block" : "none";
    });
}

// =======================
// TABS
// =======================
function switchTab(i) {

    document.querySelectorAll(".tab-content")
        .forEach(t => t.classList.remove("active"));

    document.querySelectorAll(".tab-btn")
        .forEach(b => b.classList.remove("active"));

    const tabs = [
        "tab-video",
        "tab-lineup",
        "tab-stats",
        "tab-events",
        "tab-odds",
        "tab-preview"
    ];

    document.getElementById(tabs[i]).classList.add("active");
    document.querySelectorAll(".tab-btn")[i].classList.add("active");
}

// =======================
// CLOSE MODAL
// =======================
function closeModal() {
    document.getElementById("team-modal").style.display = "none";
}

// =======================
// INIT APP (FIXED)
// =======================
window.onload = () => {

    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) splash.remove();
    }, 2500);

    loadLiveMatches();

    setInterval(() => {
        loadLiveMatches();
    }, 15000);
};
