export function initControls() {

    // HISTORY

    const historyBtn =
        document.getElementById("historyToggleBtn");

    const historyBox =
        document.getElementById("historyBox");

    if (historyBtn && historyBox) {

        historyBtn.addEventListener("click", () => {

            historyBox.classList.toggle("hidden");

        });
    }

    // QUIT MODAL

    const quitBtn =
        document.getElementById("quitBtn");

    const quitModal =
        document.getElementById("quitModal");

    const confirmQuit =
        document.getElementById("confirmQuit");

    const cancelQuit =
        document.getElementById("cancelQuit");

    if (quitBtn && quitModal) {

        quitBtn.addEventListener("click", () => {

            quitModal.classList.remove("hidden");

        });
    }

    if (cancelQuit && quitModal) {

        cancelQuit.addEventListener("click", () => {

            quitModal.classList.add("hidden");

        });
    }

    if (confirmQuit) {

        confirmQuit.addEventListener("click", () => {

            window.location.href = "/";

        });
    }

    // SHARE BUTTON

    const shareBtn =
        document.getElementById("shareBtn");

    if (shareBtn) {

        shareBtn.addEventListener("click", async () => {

            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );

                alert("Invite link copied!");

            } catch (err) {

                console.error(err);

            }
        });
    }

    // VOTE BUTTON

    const voteBtn =
        document.getElementById("voteBtn");

    const voteInput =
        document.getElementById("voteMoveInput");

    if (voteBtn && voteInput) {

        voteBtn.addEventListener("click", () => {

            const move =
                voteInput.value.trim();

            if (!move) return;

            alert(`Vote submitted: ${move}`);

            voteInput.value = "";

        });
    }
}