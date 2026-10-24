# WDC Formatt — Revamp Changelog & Engineering Dossier

**Branch:** `revamp`  
**Maintainers:** Olu & WebDev Construct Engineering  
**Status:** In Progress (Living Document)

---

## Overview & Purpose
This document tracks every architectural diagnosis, bug fix, and structural modification made during the Formatt revamp. For every item, we document:
1. **What we saw** (the initial diagnosis / existing implementation / root cause)
2. **What we changed it to** (the technical solution and engineering rationale)
3. **What it now affects** (user experience, system reliability, and downstream contracts)

---

## Phase 1: Critical Runtime & Logic Hardening (Completed)

### 1. iPhone / Mobile Safari PDF Download Failure & Corrupted Error Files
* **Files Modified:** 
  * `app/dashboard/Files/quick_assessment/assignment/page.tsx`
  * `app/dashboard/Files/quick_assessment/letter/page.tsx`

* **What we saw:**
  * **Synchronous Object Revocation:** The download handlers immediately called `window.URL.revokeObjectURL(url)` on the line right after `a.click()`. Desktop Chrome buffers downloads synchronously, but iOS Safari (WebKit) handles file downloads and navigation asynchronously on the next event loop tick. By the time Safari attempted to resolve the blob bytes from memory, the object URL had already been destroyed, causing downloads to silently fail or display blank pages on iPhones.
  * **WebKit User Activation Expiry:** In iOS Safari, programmatic clicks on `<a download>` are strictly blocked after asynchronous operations (`await fetch()`). When `a.click()` fired after the network request completed, Safari treated it as an untrusted popup and ignored the action.
  * **Header Inversion:** The client was sending `JSON.stringify(body)` but declaring `headers: { "Content-Type": "application/pdf" }`.
  * **Missing Response Validation:** Neither page checked `if (!response.ok)`. When the server returned a 404 or 500 status (e.g. `"Error: Missing data"`), the browser converted the raw text string into a `.pdf` blob. The user received a broken file named `assignment.pdf` that Apple Preview and Acrobat rejected as corrupted.

* **What we changed it to:**
  * **Device-Aware Delivery:** Added an `isIOS` detection check. On iPhone/iPad, the app now uses `window.open(url, "_blank")` to launch the native Safari PDF viewer. This surfaces iOS's native Share Sheet (**Save to Files**, AirDrop, Print) without running into `<a download>` browser restrictions.
  * **Delayed Revocation:** Replaced immediate revocation with a 60-second delayed cleanup (`setTimeout(() => window.URL.revokeObjectURL(url), 60000)`), guaranteeing background download managers and mobile browsers have sufficient time to finish streaming the buffer.
  * **Strict HTTP Status Validation:** Added `if (!response.ok)` checking. If the backend fails, the client extracts the JSON error message (or text fallback) and surfaces a readable alert rather than generating a corrupted file.
  * **Corrected Headers:** Changed request headers to `"Content-Type": "application/json"`.

* **What it now affects:**
  * Students can now generate and download PDFs directly on iPhones, iPads, and mobile browsers without failed downloads.
  * Server-side errors surface readable error alerts rather than silently downloading corrupted 0-byte or error-text files.

---

### 2. Inverted Plan Tier Lockout Bug
* **File Modified:** `app/api/quickassessment/route.ts`

* **What we saw:**
  * Lines 88–93 contained an inverted condition:
    ```ts
    if (user?.planTier !== "free") {
      return new Response(JSON.stringify({ error: "Trial expired" }), { status: 403 });
    }
    ```
  * Upgrading any user in the database to a paid tier (`pro`, `enterprise`) immediately returned an HTTP 403 "Trial expired" error, locking paying users out of document generation.

* **What we changed it to:**
  * Inverted the condition to properly allow all non-free plan tiers access.
  * Implemented an explicit free-tier policy:
    ```ts
    const isFree = !user?.planTier || user?.planTier === "free";
    const FREE_GENERATION_LIMIT = 10;

    if (isFree && (user?.generationsUsed ?? 0) >= FREE_GENERATION_LIMIT) {
      return new Response(JSON.stringify({ 
        error: "Generation limit reached", 
        message: "You have reached your limit of free generations. Upgrade to continue." 
      }), { status: 403 });
    }

    if (isFree && user?.expiresAt && new Date() > new Date(user.expiresAt)) {
      return new Response(JSON.stringify({ 
        error: "Trial expired", 
        message: "Your free access period has expired." 
      }), { status: 403 });
    }
    ```

* **What it now affects:**
  * Paid accounts are no longer locked out of the platform.
  * Free-tier users receive a structured 10-document quota during beta, with clear notifications when their quota is reached.

---

### 3. Premature Quota Deductions
* **File Modified:** `app/api/quickassessment/route.ts`

* **What we saw:**
  * The database generation counter increment was executed synchronously right when the `streamText` object was created:
    ```ts
    if (result) {
      await db.user.update({
        where: { clerkId: userId },
        data: { generationsUsed: { increment: 1 } },
      });
    }
    return result?.toTextStreamResponse();
    ```
  * If a student's mobile internet dropped midway through generation, or if the model gateway aborted early, the student's generation quota was deducted without them receiving their document.

* **What we changed it to:**
  * Moved the database increment into the Vercel AI SDK `onFinish` lifecycle hook inside `streamText`.
  * Quota is only decremented after the LLM successfully streams all tokens and closes the connection.

* **What it now affects:**
  * Failed or interrupted streams no longer penalize the student's generation quota.

---

### 4. Prisma Client Connection Leaks
* **File Modified:** `lib/prisma.ts`

* **What we saw:**
  * `new PrismaClient({ adapter })` was instantiated directly on the root module scope.
  * The standard Next.js development singleton pattern (`globalThis.prisma`) was commented out.
  * On every hot-reload in development or serverless concurrency spike, a fresh Prisma client instance was spawned, opening multiple TCP connections and threatening to exhaust Neon PostgreSQL connection limits.

* **What we changed it to:**
  * Restored and activated the global singleton pattern:
    ```ts
    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined
    };

    export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = db;
    }
    ```

* **What it now affects:**
  * Connection reuse is preserved across Next.js fast-refreshes and serverless lambdas.
  * Prevents "too many clients already" connection pool exhaustion on Neon Postgres.

---

## Phase 2: Generation Persistence & Dashboard Vault (Queued)
* **Objective:** Ensure generated documents are saved to the Postgres `Generation` table and replace the hardcoded mock items in the dashboard "Majestic Vault" with real user history.

## Phase 3: Architectural Decoupling (Queued)
* **Objective:** Extract shared types (`DocumentSegment`, `studentDataType`) out of frontend page components into a dedicated `lib/types/` module, resolving the inverted dependency where the server PDF engine imports from the UI.

## Phase 4: Product & UI Streamlining (Queued)
* **Objective:** Remove fake/dead dashboard links ("Critical Assessment", "Image Assessment", and broken "Slides" stubs) and update copy to reflect clean, student-centric value.
