(() => {
  const captions = {
    inbound: {
      0: "Press Play to watch data move through the purchase cycle.",
      1: "STC pushes AddPurchaseOrder → Zoho creates Issued PO. No stock yet.",
      2: "STC pushes AddASN → Purchase Receive Pending Approval. Locator per line. Still no stock.",
      3: "Mezzan approves in Zoho → stock posts to RECEIVING bin + batch created.",
      4: "Integration fires AddGRN back to STC. Callback complete.",
    },
    outbound: {
      0: "Press Play to watch the sales / dispatch cycle.",
      1: "STC pushes AddSalesOrder / RFD → Sales Order created (committed).",
      2: "Mezzan picks & packs → Package. Picker selects batch (serial OFF).",
      3: "Mezzan ships → Shipment Order shipped. Stock leaves warehouse.",
      4: "SendShippingConfirmation → STC with cf_batch_id of dispatched lot.",
    },
    approval: {
      0: "Waiting for ASN…",
      1: "ASN landed as Purchase Receive — Pending Approval.",
      2: "Warehouse confirms physical arrival (qty / condition).",
      3: "Approver clicks Approve → Received. Stock + batch post.",
      4: "AddGRN automatically sent to STC.",
    },
  };

  const timers = { inbound: null, outbound: null, approval: null };

  function setInboundPacket(step) {
    const packet = document.getElementById("inPacket");
    if (!packet) return;
    const x = 40 + (step <= 0 ? 0 : Math.min(step, 4) - 1) * 205 + (step > 0 ? 100 : 0);
    packet.style.transition = "cx 0.7s ease";
    packet.setAttribute("cx", String(Math.min(x, 860)));
  }

  function setOutboundPacket(step) {
    const packet = document.getElementById("outPacket");
    if (!packet) return;
    const x = 40 + (step <= 0 ? 0 : Math.min(step, 4) - 1) * 205 + (step > 0 ? 100 : 0);
    packet.setAttribute("cx", String(Math.min(x, 860)));
  }

  function highlightFlow(id, step) {
    const root = document.getElementById(`${id}-nodes`);
    if (!root) return;
    root.querySelectorAll(".flow-node").forEach((node) => {
      const n = Number(node.dataset.step);
      node.classList.toggle("active", n === step);
      node.classList.toggle("done", n < step && step > 0);
    });
    root.querySelectorAll(".flow-arrow").forEach((arrow) => {
      const n = Number(arrow.dataset.step);
      arrow.classList.toggle("active", n === step || n === step - 1);
    });

    const details = document.getElementById(`${id}-details`);
    if (details) {
      details.querySelectorAll(".detail").forEach((d) => {
        d.classList.toggle("active", Number(d.dataset.for) === step);
      });
    }

    const label = document.getElementById(`${id}-label`);
    const caption = document.getElementById(`${id}-caption`);
    if (label) {
      label.textContent = step === 0 ? "Step 0 · Idle" : `Step ${step} of 4 · Running`;
    }
    if (caption && captions[id]) {
      caption.textContent = captions[id][step] || captions[id][0];
    }

    if (id === "inbound") setInboundPacket(step);
    if (id === "outbound") setOutboundPacket(step);
  }

  function highlightApproval(step) {
    const board = document.getElementById("approval-board");
    if (!board) return;
    board.querySelectorAll(".ap-col").forEach((col) => {
      const n = Number(col.dataset.ap);
      col.classList.toggle("active", n === step || (step > 0 && n < step));
      if (n === step) col.classList.add("active");
    });
    board.querySelectorAll(".ap-pipe").forEach((pipe, i) => {
      pipe.classList.toggle("live", step > 0 && i < step);
    });
    const label = document.getElementById("approval-label");
    if (label) label.textContent = captions.approval[step] || captions.approval[0];
  }

  function playSequence(id) {
    stopSequence(id);
    let step = 0;
    const max = 4;
    const tick = () => {
      step += 1;
      if (id === "approval") highlightApproval(step);
      else highlightFlow(id, step);
      if (step >= max) {
        stopSequence(id);
        const label = document.getElementById(`${id}-label`);
        if (label && id !== "approval") label.textContent = "Complete · Press Reset or Play again";
        if (label && id === "approval") label.textContent = "Approval cycle complete";
        return;
      }
      timers[id] = setTimeout(tick, 2200);
    };
    if (id === "approval") highlightApproval(0);
    else highlightFlow(id, 0);
    timers[id] = setTimeout(tick, 400);
  }

  function stopSequence(id) {
    if (timers[id]) {
      clearTimeout(timers[id]);
      timers[id] = null;
    }
  }

  function resetSequence(id) {
    stopSequence(id);
    if (id === "approval") highlightApproval(0);
    else highlightFlow(id, 0);
  }

  document.querySelectorAll("[data-play]").forEach((btn) => {
    btn.addEventListener("click", () => playSequence(btn.dataset.play));
  });
  document.querySelectorAll("[data-pause]").forEach((btn) => {
    btn.addEventListener("click", () => stopSequence(btn.dataset.pause));
  });
  document.querySelectorAll("[data-reset]").forEach((btn) => {
    btn.addEventListener("click", () => resetSequence(btn.dataset.reset));
  });

  // Init idle states
  highlightFlow("inbound", 0);
  highlightFlow("outbound", 0);
  highlightApproval(0);
})();
