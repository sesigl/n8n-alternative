# DR-001: Decision Record Process for Transparent Governance

**Status**: Proposed
**Date**: 2025-11-01
**Author(s)**: Sebastian Sigl
**Supersedes**: N/A
**Superseded by**: N/A

## Context

This project is building an open source alternative to n8n with a commitment to true open governance and transparency (as outlined in our Openness principle). Unlike projects where governance remains centralized under a private company, we need a clear, public process for making and documenting significant decisions.

Currently, we lack a standardized way to:
- Propose and discuss architectural or process changes
- Document the rationale behind major decisions
- Allow community members to understand why choices were made
- Track the evolution of technical and organizational decisions over time

We are in the early stages of the project, establishing foundational patterns that will scale as the community grows. Now is the right time to establish a lightweight but effective decision-making process that embodies our principles of Openness and Builders First.

## Decision

We will use Decision Records (DRs) as our primary mechanism for proposing, discussing, documenting, and tracking significant decisions in this project.

Decision Records will:
1. Be stored in the `/docs` directory of the main repository
2. Follow a standardized template (see `decision-record-template.md`)
3. Be numbered sequentially (DR-001, DR-002, etc.)
4. Go through distinct lifecycle phases: Proposed → Discussing → Accepted/Rejected
5. Be submitted as pull requests for review and discussion
6. Require consensus or maintainer approval before being merged

## Rationale

This approach aligns with our core principles:

**Openness**
- All proposals, discussions, and decisions are public and version-controlled
- Anyone can propose a DR or comment on existing ones
- The entire history of decision-making is transparent and auditable
- This mirrors the Python Enhancement Proposal (PEP) model we aspire to

**Builders First**
- DRs encourage bias for action: proposals should be specific and actionable
- Small, focused decisions can be made quickly
- The process is lightweight enough not to slow down building
- Builders lead: those implementing features can propose and own decisions

**Community Ownership**
- DRs democratize decision-making beyond core maintainers
- Contributors gain context about why things are built the way they are
- New contributors can catch up by reading DR history
- Prevents institutional knowledge from being locked in private channels

**Independence**
- Using markdown files in git ensures we're not dependent on external platforms
- The process is portable and forkable, just like our code
- No vendor lock-in for our decision-making infrastructure

## Alternatives Considered

### Alternative 1: GitHub Issues Only
- Description: Use GitHub Issues for all proposals and discussions without formal DR documents
- Pros:
  - No additional process or documentation overhead
  - Familiar workflow for most contributors
  - Good for small decisions and bugs
- Cons:
  - Issues are harder to find and reference long-term
  - No standardized format leads to inconsistent documentation
  - Difficult to distinguish proposals from bug reports and feature requests
  - Limited ability to show decision status and evolution
- Why not chosen: While GitHub Issues remain valuable for day-to-day work, they lack the permanence and structure needed for architectural decisions

### Alternative 2: RFC (Request for Comments) Process
- Description: Heavy-weight RFC process similar to Rust or IETF
- Pros:
  - Well-established in large open source projects
  - Very thorough and structured
  - Forces deep thinking about proposals
- Cons:
  - Too heavyweight for a small, fast-moving team
  - Can slow down progress and create bureaucracy
  - Better suited for mature projects with large contributor bases
- Why not chosen: Conflicts with our Builders First principle and bias for action. We need something lighter weight for our current stage.

### Alternative 3: Wiki or Notion Pages
- Description: Document decisions in a wiki or Notion workspace
- Pros:
  - Easy to edit and update
  - Good for collaborative editing
  - Rich formatting options
- Cons:
  - Not version-controlled with the code
  - Creates dependency on external platform
  - Harder to review changes through PR process
  - Less transparent revision history
  - Not forkable with the codebase
- Why not chosen: Violates our independence principle and reduces transparency

### Alternative 4: No Formal Process
- Description: Make decisions informally in discussions and document in commit messages
- Pros:
  - Maximum speed and flexibility
  - No overhead
  - Pure bias for action
- Cons:
  - Loses institutional knowledge over time
  - Makes it hard for new contributors to understand decisions
  - Risks inconsistent or conflicting choices
  - Reduces transparency and community participation
- Why not chosen: While we value speed, we also value openness and community ownership. Some structure is necessary.

## Consequences

### Positive
- Clear, public record of all major decisions
- New contributors can understand the "why" behind architectural choices
- Decisions are made transparently, increasing community trust
- Reduces repeated debates about already-decided topics
- Creates accountability for decision-makers
- Scales naturally as the project grows
- Enables better async collaboration across time zones

### Negative
- Adds slight overhead for proposing and documenting decisions
- Requires discipline to keep DRs up to date
- Risk of process becoming too heavy if not monitored
- May feel formal for very small decisions

### Neutral
- Shifts some discussions from chat/issues to pull requests
- Creates a new category of documentation to maintain
- Contributors need to learn when to write a DR vs. just ship code

## Implementation

### Scope: When to Write a DR

Write a DR for decisions that:
- Affect system architecture or major technical choices
- Impact how contributors work (process, tooling, governance)
- Have long-term consequences that are hard to reverse
- Require community input or consensus
- Establish patterns others will follow

Do NOT write a DR for:
- Bug fixes
- Minor refactoring
- Small feature additions that follow existing patterns
- Trivial tooling updates
- Day-to-day implementation details

When in doubt, ask: "Will others need to understand why we made this choice 6 months from now?" If yes, write a DR.

### Process

1. **Draft**: Author creates a DR using `decision-record-template.md` with status "Proposed"
2. **Submit**: Submit as pull request to the main repository
3. **Request Comments**: Share PR link in relevant channels, tag stakeholders
4. **Discuss**: Status changes to "Discussing" once active conversation begins
5. **Iterate**: Author updates DR based on feedback
6. **Decide**: Seek consensus; if consensus cannot be reached, maintainers vote
7. **Merge**: Once accepted, update status to "Accepted" and merge PR
   - If rejected, update status to "Rejected" with explanation and merge for historical record
8. **Implement**: If the DR requires code changes, create issues or PRs referencing the DR

### File Naming

- `DR-XXX-short-title.md`
- Numbers are sequential: 001, 002, 003, etc.
- Use lowercase with hyphens for the title portion

### Initial Responsible Parties

- Any contributor can propose a DR
- Core maintainers are responsible for reviewing and facilitating consensus
- The author of a DR is responsible for updates during discussion

### Timeline

- This process takes effect immediately upon acceptance of this DR
- Template is available at `/docs/decision-record-template.md`
- This DR itself will be the first test of the process

### Success Criteria

After 3 months, evaluate:
- Are DRs being used for appropriate decisions?
- Is the process helping or hindering velocity?
- Are community members participating in discussions?
- Do new contributors find DRs useful?
- Should we adjust the process based on learnings?

## References

- Inspiration: [Python PEP Process](https://peps.python.org/pep-0001/)
- Inspiration: [Architectural Decision Records (ADRs)](https://adr.github.io/)
- Template: `/docs/decision-record-template.md`