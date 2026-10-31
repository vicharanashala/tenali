# Tenali Central Repository Archive (`archive/`)

Welcome to the central archive of the Tenali repository.

This directory serves as the **authoritative, centralized location** for files, prototypes, scripts, documentation, and snapshots that are no longer part of active development, routing, or testing, but possess historical, diagnostic, educational, or recovery value.

---

## 1. Archive Policy & Operating Rules

1. **Centralized Over Scattered**: All archived repository material resides in or is registered by `archive/`. Do not introduce ad-hoc, undocumented local archive folders.
2. **Version Controlled & Traceable**: The archive is fully tracked in Git. It is **never** ignored in `.gitignore`.
3. **No Secrets or Credentials**: Never place environment secrets, API keys, private keys, or personal credentials into the archive.
4. **Git-Aware Preservation**: Files are relocated to `archive/` using Git moves (`git mv`) to maintain full commit provenance, authorship, and blame history.
5. **Canonical Registration**: Every item residing in or moved to `archive/` is documented in the canonical inventory:
   👉 [`archive/inventory.md`](inventory.md)

---

## 2. Directory Layout

The archive is organized into structured categories preserving original subsystem context:

```text
archive/
├── README.md                     # This policy explanation
├── inventory.md                  # Canonical registry and maintainer decision aid
│
├── application-snapshots/        # Historical full-application snapshots & conflict copies
├── generated-artifacts/          # One-time generated JSON conflict dictionaries and logs
├── scripts/                      # Historical scratch tools and one-time migration scripts
│   ├── scratch/                  # July 2026 hint-injection experiments
│   ├── migrations/               # Batch content loaders (fix_batch_*, update_batch_*)
│   └── linearalgebra/            # Explanation injection scripts (rewrite_m1q*.py)
├── docs/                         # Superseded SRS specifications, plans, and session logs
└── prototypes/                   # Historical standalone micro-apps (addition, squareroot)
```

---

## 3. Maintainer Lifecycle & Deletion Guide

Material in `archive/` is retained for historical context and recovery. **No archived item may be permanently deleted without explicit human maintainer approval.**

When reviewing an archived item for potential permanent deletion, maintainers must perform the 6-step verification detailed in [`archive/inventory.md`](inventory.md#archive-lifecycle--permanent-deletion-protocol).
