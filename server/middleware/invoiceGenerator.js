// ── Drop-in replacement for generateInvoice in OrderDetailPage (Next.js) ─────
// The backend now streams the PDF directly, so we receive a blob — not JSON.

const generateInvoice = async () => {
    if (!invoiceEnabled || invoiceLoading) return;
    setInvoiceLoading(true);
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER}/api/invoice/generate`,
            {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ orderId: id }),
            }
        );

        if (!response.ok) {
            // Error responses are still JSON
            const data = await response.json();
            alert(data.reason || "Invoice generation failed.");
            return;
        }

        // ✅ Backend streams the PDF directly — read as blob and open in new tab
        const blob = await response.blob();
        const url  = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);

    } catch (err) {
        console.error("Error generating invoice:", err);
        alert("Could not connect to server. Please try again.");
    } finally {
        setInvoiceLoading(false);
    }
};