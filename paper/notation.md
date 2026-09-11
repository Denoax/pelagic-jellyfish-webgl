# Notation and coordinate conventions

| Symbol | Meaning / units |
| --- | --- |
| `t` | Simulation time in seconds, unless explicitly a local surface parameter |
| `h` | Fixed integration interval in seconds |
| `s` | Bounded camera journey progress, dimensionless, 0–1 |
| `q` | Normalized pulse phase, dimensionless, periodic 0–1 |
| `τ, θ` | Mantle latitude parameter and azimuth angle (radians) |
| `u,v` | Texture/screen coordinates; each equation states its origin/convention |
| `x_i, x_i^-` | Current and previous local appendage point positions |
| `r_i` | Chain rest-segment length in animal-local units |
| `U(X,t)` | World-space current vector, authored world units per second |
| `R,H` | Bell radius/height in animal-local units after pulse scaling |
| `D` | Projected bell diameter in CSS pixels |
| `d` | Continuous LOD detail, 0 far through 2 near |
| `F(u,v)` | Implicit liquid thickness mask, dimensionless artistic field |
| `V,Δ` | Persistent idle field velocity/displacement in screen-UV coordinates |
| `C(u,v)` | Current clean ocean linear-RGB image |
| `η` | Authored relative refractive-index ratio |

World coordinates are Three.js right-handed coordinates, Y up. A jellyfish's
local +Y is bell-first; local X/Z span its rim. Camera view direction is −Z.
Screen UV in the output path is top-origin; clip Y is explicitly inverted when
projecting to it. Clock mask lookups invert Y separately. Sizes in liquid
choreography use viewport-height units; its X distances are aspect-corrected.
These artistic world units are not calibrated meters, seconds-to-muscle
measurements, or biological species dimensions.

Every numbered equation will be labeled **CODE-EQUIVALENT**, **CONTINUOUS
ABSTRACTION**, or **ART-DIRECTION HEURISTIC**. Code-equivalent means the stated
subexpression matches the source, not that an omitted surrounding algorithm is
also represented. A mathematically familiar term does not imply physical
validation.

