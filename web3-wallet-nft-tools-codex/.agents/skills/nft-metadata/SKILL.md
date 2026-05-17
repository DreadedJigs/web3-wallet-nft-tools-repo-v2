# NFT Metadata Skill

Use this skill when changing metadata generation, validation, reveal logic, or collection trait handling.

## Required behavior

- Preserve deterministic generation unless the task explicitly requests randomness.
- Validate required fields: `name`, `description`, `image`, `attributes`.
- Include a manifest or provenance artifact when generating batches.
- Treat file paths, JSON, and URIs as untrusted input.
- Keep upload/pinning behind an explicit command and environment variable.
- Do not overwrite generated output without clear user intent.
