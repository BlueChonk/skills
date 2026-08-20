---
name: skill-creator
description: "Create or update a DeepSeek Harness (DSH) skill with appropriately scoped instructions and any needed supporting resources. A skill is a folder containing a required SKILL.md file plus optional scripts, references, and assets. Use when the user wants to build a new skill from scratch, refine an existing one, or add supporting resources."
---

# Skill Creator

Create skills that give DSH useful, non-obvious guidance without constraining unrelated work.

## Core Principles

**Assume DSH is already capable.** Include only information that changes its decisions or improves its work. Remove generic advice, repeated instructions, speculative edge cases, and examples that do not materially clarify the task.

**Preserve user intent and scope.** A skill should support the requested task, not replace the user's chosen product, expand the assignment, modify unrelated configuration, or imply permission for additional external actions.

**Match specificity to the risk.** Give the model room to choose an appropriate approach when multiple approaches are reasonable. Use detailed steps, deterministic scripts, or absolute language only when correctness, safety, permissions, or a genuinely fragile workflow requires them.

**Keep discovery cheap and precise.** Skill names and descriptions are available before a skill is loaded. Describe the actual capability and when it applies, adding exclusions only when they prevent likely misrouting. Keep skill names under 64 characters, using lowercase letters, digits, and hyphens.

**Disclose detail progressively.** Keep shared purpose, essential constraints, and useful routing in `SKILL.md`. Put substantial mode-specific guidance, schemas, examples, or procedures in supporting references and read only the references relevant to the current task.

## Anatomy of a DSH Skill

Every skill is a folder containing a required `SKILL.md` file and any optional resources:

```text
skill-name/
|-- SKILL.md                 Required skill instructions
|   |-- YAML frontmatter     Required name and description
|   `-- Markdown body        Instructions loaded when the skill is used
|-- scripts/                 Optional executable helpers (Python, PowerShell, Node.js)
|-- references/              Optional documentation loaded as needed
`-- assets/                 Optional files used in generated output
```

### SKILL.md

The YAML frontmatter identifies the skill and determines when it should be considered:

```yaml
---
name: my-skill
description: "One sentence explaining what the skill does and when to apply it. Keep concise and discriminating."
---
```

The description is the primary routing signal. It should briefly explain what the skill does and when it applies. Include a meaningful boundary when similar requests should not activate the skill.

### Scripts

Use `scripts/` for executable code when the same logic would otherwise be rewritten repeatedly:

- **Example:** `scripts/rotate_pdf.py` for a PDF operation that would otherwise require recreating the same code.
- **Useful for:** Repeated transformations, reliable API operations, data processing, and concrete automation.
- **Validation:** Run new or changed scripts to verify their behavior before delivering.

### References

Use `references/` for documentation needed only in particular contexts:

- **Examples:** `references/schema.md` for database tables, `references/api_docs.md` for an API.
- **Routing:** Link each reference from `SKILL.md` and explain when it should be read.

### Assets

Use `assets/` for files that belong in generated output rather than in the model's instructions:

- **Examples:** `assets/logo.png`, `assets/frontend-template/`, `assets/font.ttf`.

## Create or Update a Skill

Adapt the work to the request. Creating a complex new skill may involve understanding realistic use cases, choosing supporting resources, writing instructions, and validating the result. A narrow update to an existing skill may require only a focused edit.

Ask clarifying questions only when the missing information matters and cannot be reasonably inferred. Respect a user-specified location; otherwise create discoverable skills in the DSH project skills directory (`D:\Projects\.dsh\skills` or the configured skills path).

### Validate and Iterate

After creating or updating a skill:
1. Verify the YAML frontmatter parses correctly (`name` and `description` are required).
2. Confirm the name uses only lowercase letters, digits, and hyphens (max 64 chars).
3. Check that descriptions remain discriminating (not overly broad).
4. Ensure references are discoverable from SKILL.md.
5. Run any added scripts to verify they actually work.
