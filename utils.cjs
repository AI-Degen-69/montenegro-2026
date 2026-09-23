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

  root.TripUtils = { calcEndTime, weatherDescription };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.TripUtils;
  }
})(typeof window !== "undefined" ? window : globalThis);
