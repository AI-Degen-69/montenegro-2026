// Pure trip helpers, shared between the page (classic script) and node tests.
// Bodies are verbatim copies of the functions formerly inline in index.html.
(function (root) {
  function calcEndTime(time, dur) {
    if (!time || !dur) return null;
    const open = /פתוח/.test(dur);
    if (open) return null;
    const [h, m] = time.split(":").map(Number);
    let addMin = 0;
    const hrs = dur.match(/([\d.]+)\s*שע/);
    const mins = dur.match(/(\d+)\s*דק/);
    if (hrs) addMin += parseFloat(hrs[1]) * 60;
    if (mins) addMin += parseInt(mins[1], 10);
    if (!addMin) return null;
    const total = h * 60 + m + addMin;
    const eh = Math.floor(total / 60) % 24;
    const em = total % 60;
    return String(eh).padStart(2, "0") + ":" + String(em).padStart(2, "0");
  }

  function weatherDescription(code) {
    if (code === 0) return "בהיר";
    if ([1, 2].includes(code)) return "מעונן חלקית";
    if (code === 3) return "מעונן";
    if ([45, 48].includes(code)) return "ערפל";
    if ([51, 53, 55, 56, 57].includes(code)) return "טפטוף";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "גשם";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "שלג";
    if ([95, 96, 99].includes(code)) return "סופות";
    return "מזג אוויר משתנה";
  }

  function calcLedgerSummary(expenses = [], eurRate = 4.0) {
    if (!Array.isArray(expenses) || expenses.length === 0) {
      return { totalEur: 0, totalIls: 0, perPersonEur: 0, perPersonIls: 0, payers: {}, balances: [] };
    }
    let totalEur = 0;
    const payers = {};
    for (const exp of expenses) {
      const amt = Number(exp.amountEur) || 0;
      totalEur += amt;
      const payer = (exp.payer || "כללי").trim();
      payers[payer] = (payers[payer] || 0) + amt;
    }
    const payerNames = Object.keys(payers);
    const count = Math.max(1, payerNames.length);
    const perPersonEur = Math.round((totalEur / count) * 100) / 100;
    const totalIls = Math.round(totalEur * eurRate);
    const perPersonIls = Math.round(perPersonEur * eurRate);

    const balances = payerNames.map(name => {
      const paid = payers[name];
      const net = Math.round((paid - perPersonEur) * 100) / 100;
      return {
        name,
        paidEur: paid,
        netEur: net,
        netIls: Math.round(net * eurRate)
      };
    });

    return { totalEur, totalIls, perPersonEur, perPersonIls, payers, balances };
  }

  function getKotorGoldenHour(dateStr = "2026-09-24") {
    return {
      goldenStart: "18:10",
      sunset: "18:42",
      goldenEnd: "18:55",
      seaTemp: "23°C",
      wind: "7 קשר (אידיאלי לשייט)",
      uvIndex: "5 (בינוני)"
    };
  }

  root.TripUtils = { calcEndTime, weatherDescription, calcLedgerSummary, getKotorGoldenHour };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.TripUtils;
  }
})(typeof window !== "undefined" ? window : globalThis);
