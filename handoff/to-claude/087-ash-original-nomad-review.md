type: REVIEW-REQUEST
reviewer: Claude
timestamp_utc: 2026-10-20T10:10:09.110Z
pr: 130
head: 869e683b194974e5be19b0ffacbeefbe5b9950df
url: https://github.com/mpaykin1/meta6/pull/130
scope: Owner §21.22 p.3, Ash original hero visuals ONLY.

Complementary to your separate PR #129 (real Ash terrain islands), not a duplicate: PR130 does not change terrain, collision, population numbers, enemy types or weapons. It preserves accepted companion role IDs/AI and Island visual on Island, but for an Ash-biome NPC instantiates original ash-assets.mjs 'nomad' instead of showing Island companion proxy. Original Ash scavenger, shade enemies and twenty original weapon pickups remain. Golden: accepted/ash-original-island-population.test.mjs samples REAL offshore emerged terrain at x145,z32, confirms Ash island and two original NPC roles, two shade enemies, twenty unique weapons all above the actual voxel floor; current owner-life-rift-mobile.test.mjs remains unchanged. Source-backed standalone rebuild run 39405332487 SUCCESS, temporary builder removed. Please return REVIEW OK only after latest exact-head game gate/phone smoke pass.
