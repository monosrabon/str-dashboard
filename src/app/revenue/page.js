"use client";

import { useState, useEffect } from "react";
import { IconRevenue, IconPlus } from "@/components/icons";

export default function RevenuePage() {
  const [data, setData] = useState({ revenueEntries: [], expenses: [] });
  const [loading, setLoading] = useState(true);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    category: "Maintenance",
    amount: "",
    description: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  async function fetchFinancials() {
    try {
      setLoading(true);
      const res = await fetch("/api/revenue");
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("Failed to load financials:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount) return;

    try {
      await fetch("/api/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseForm),
      });
      setIsExpenseOpen(false);
      setExpenseForm({
        category: "Maintenance",
        amount: "",
        description: "",
        expenseDate: new Date().toISOString().split("T")[0],
      });
      fetchFinancials();
    } catch (err) {
      console.error("Failed to add expense:", err);
    }
  };

  const totalGross = (data.revenueEntries || []).reduce((s, r) => s + (r.grossAmount || 0), 0);
  const totalFees = (data.revenueEntries || []).reduce((s, r) => s + (r.platformFee || 0), 0);
  const totalExpenses = (data.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const netEarnings = totalGross - totalFees - totalExpenses;

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Financial Yield &amp; P&amp;L</h1>
          <p className="page-subtitle">Gross booking revenue, OTA channel take-rates, operational expenditure, and net margin.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setIsExpenseOpen(true)}>
            <IconPlus size={14} />
            Post Expense Voucher
          </button>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-5)" }}>
        <div className="stat-card">
          <div className="stat-card-label">Gross Contract Value</div>
          <div className="stat-card-value">${totalGross.toLocaleString()}</div>
          <div className="stat-card-meta">Total booking receipts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">OTA Channel Fees</div>
          <div className="stat-card-value" style={{ color: "var(--accent-amber)" }}>
            ${totalFees.toLocaleString()}
          </div>
          <div className="stat-card-meta">Commission deductions</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Operating Expenses</div>
          <div className="stat-card-value" style={{ color: "var(--accent-red)" }}>
            ${totalExpenses.toLocaleString()}
          </div>
          <div className="stat-card-meta">Supplies &amp; contractors</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Net Operating Margin</div>
          <div className="stat-card-value" style={{ color: "var(--accent-green)" }}>
            ${netEarnings.toLocaleString()}
          </div>
          <div className="stat-card-meta">Realized net cash flow</div>
        </div>
      </div>

      {/* Expense Modal */}
      {isExpenseOpen && (
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">
                <IconRevenue size={16} />
              </div>
              Post Operational Expenditure
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsExpenseOpen(false)}>
              Cancel
            </button>
          </div>
          <form onSubmit={handleAddExpense} style={{ padding: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Cost Center / Category
                </label>
                <select
                  className="input"
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                >
                  <option value="Maintenance">Facilities &amp; Maintenance</option>
                  <option value="Supplies">Housekeeping Linens &amp; Toiletries</option>
                  <option value="Utilities">Utilities &amp; Telecom</option>
                  <option value="Insurance">Insurance &amp; Property Taxes</option>
                  <option value="Marketing">Listing Promotion &amp; Photography</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Disbursement Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="150"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Transaction Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                Voucher Memo / Narrative
              </label>
              <input
                className="input"
                placeholder="e.g. Bulk organic shampoo replenishment for Units 101-105"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsExpenseOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Commit Disbursement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Breakdown Grids */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        {/* Income Entries */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">
                <IconRevenue size={16} />
              </div>
              Realized Booking Inflows ({data.revenueEntries?.length || 0})
            </div>
          </div>
          <div className="card-body-flush">
            {loading ? (
              <div style={{ padding: "var(--space-4)" }}>
                <div className="skeleton" style={{ width: "100%", height: 40 }} />
              </div>
            ) : data.revenueEntries?.length === 0 ? (
              <div className="empty-state" style={{ padding: "var(--space-6)" }}>
                <div className="empty-state-title">No Inflows Recorded</div>
                <div className="empty-state-text">Booking revenue entries will post as reservations are registered.</div>
              </div>
            ) : (
              data.revenueEntries.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    padding: "12px 18px",
                    borderBottom: "1px solid var(--border-light)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--text-primary)" }}>
                      Gross: ${Number(rev.grossAmount).toLocaleString()}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      {formatDate(rev.entryDate)} &middot; Channel Take: ${Number(rev.platformFee).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: "var(--font-size-sm)", fontVariantNumeric: "tabular-nums" }}>
                    Net: ${Number(rev.netAmount).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses List */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">
                <IconRevenue size={16} />
              </div>
              Operating Disbursements ({data.expenses?.length || 0})
            </div>
          </div>
          <div className="card-body-flush">
            {loading ? (
              <div style={{ padding: "var(--space-4)" }}>
                <div className="skeleton" style={{ width: "100%", height: 40 }} />
              </div>
            ) : data.expenses?.length === 0 ? (
              <div className="empty-state" style={{ padding: "var(--space-6)" }}>
                <div className="empty-state-title">No Operating Expenses</div>
                <div className="empty-state-text">Click &quot;Post Expense Voucher&quot; to log vendor invoices or supplies.</div>
              </div>
            ) : (
              data.expenses.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    padding: "12px 18px",
                    borderBottom: "1px solid var(--border-light)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--text-primary)" }}>
                      {exp.category}: {exp.description || "General disbursement"}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      {formatDate(exp.expenseDate)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--accent-red)", fontSize: "var(--font-size-sm)", fontVariantNumeric: "tabular-nums" }}>
                    -${Number(exp.amount).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
