(function () {
  const { useEffect, useMemo, useState } = React;
  const e = React.createElement;
  const KEYS = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"];

  function CalculatorApp() {
    const [display, setDisplay] = useState("0");
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState("Ready ✨");
    const title = useMemo(() => "Nebula Calculator", []);

    useEffect(() => {
      loadHistory();
    }, []);

    async function loadHistory() {
      try {
        const response = await fetch("/api/transactions");
        if (!response.ok) throw new Error();
        setHistory(await response.json());
      } catch {
        setStatus("Could not load saved transactions.");
      }
    }

    function addInput(key) {
      if (key === "=") return calculate();
      setDisplay((current) => (current === "0" && /\d/.test(key) ? key : current + key));
    }

    async function calculate() {
      try {
        const expression = display;
        const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, "");
        const value = Number(Function(`"use strict"; return (${sanitized})`)());
        if (!Number.isFinite(value)) throw new Error();

        const rounded = Math.round((value + Number.EPSILON) * 100000) / 100000;
        setDisplay(String(rounded));

        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expression, result: rounded })
        });

        if (response.ok) {
          setStatus("Transaction saved to database ✅");
          loadHistory();
        } else {
          setStatus("Calculation worked, but saving failed.");
        }
      } catch {
        setStatus("Oops! Invalid expression.");
      }
    }

    const keyButtons = KEYS.map((key) =>
      e("button", {
        key,
        className: `key-btn ${/[+\-*/=]/.test(key) ? "operator" : ""}`,
        onClick: function () { addInput(key); }
      }, key)
    );

    const historyItems = history.length === 0
      ? [e("li", { key: "empty" }, "No transactions yet.")]
      : history.map((item) =>
          e("li", { key: item.id },
            e("span", null, item.expression),
            e("strong", null, `= ${item.result}`)
          ));

    return e("div", { className: "calculator-shell" },
      e("h1", null, title),
      e("p", { className: "status-text" }, status),
      e("div", { className: "display-panel" }, display),
      e("div", { className: "keys-grid" },
        e("button", { className: "key-btn action", onClick: function () { setDisplay("0"); setStatus("Display cleared 🧼"); } }, "C"),
        e("button", { className: "key-btn action", onClick: function () { setDisplay((p) => p.slice(0, -1) || "0"); } }, "⌫"),
        e("button", { className: "key-btn action", onClick: function () { addInput("("); } }, "("),
        e("button", { className: "key-btn action", onClick: function () { addInput(")"); } }, ")"),
        ...keyButtons
      ),
      e("div", { className: "history-wrap" },
        e("h2", null, "Saved transactions"),
        e("ul", null, ...historyItems)
      )
    );
  }

  const root = document.getElementById("calculator-root");
  if (root) {
    ReactDOM.createRoot(root).render(e(CalculatorApp));
  }
})();
