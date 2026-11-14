<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- The product uses TanStack Start server functions with Lovable Cloud authentication and PostgreSQL RLS, because customer/merchant permissions and multi-store reservation transactions must be enforced server-side.
- Keep domain modules under src/features with pure models, client components, and authenticated functions; server-only AI helpers stay in *.server.ts files so secrets and prompts never reach browser bundles.
- Gemini calls use the Lovable AI Gateway through AI SDK, explicit user actions, stored consent for personal-interest processing, validated catalog facets and a persisted provider-denial circuit breaker; this limits disclosure, hallucinated inventory and accidental billed fan-out.
- Merchant demand uses a membership-scoped aggregate PostgreSQL function, never direct access to customers' search rows, because behavioral identities must remain private.
- Visit routing uses a labeled fictional gallery and active reservation stops; missions use atomic idempotent demonstrative rewards, because neither official indoor maps nor physical visit validation are integrated.
